"""
Unit test suite for UrbanLens forecasting modules.
Covers metrics, baselines, data check, engine, and demo engine.
"""
import unittest
from datetime import datetime
from forecasting.metrics import mae, rmse, mape, compare_to_baseline
from forecasting.baselines import naive_last_value, seasonal_naive, linear_trend
from forecasting.data_check import check_data_sufficiency, MIN_OBS
from forecasting.engine import run_forecast
from forecasting.demo_engine import run_demo_forecast, DEMO_SERIES


class TestMetrics(unittest.TestCase):
    def test_mae_basic(self):
        actual = [10.0, 20.0, 30.0]
        predicted = [12.0, 19.0, 33.0]
        # |10-12| + |20-19| + |30-33| = 2 + 1 + 3 = 6 / 3 = 2.0
        self.assertAlmostEqual(mae(actual, predicted), 2.0, places=4)

    def test_rmse_basic(self):
        actual = [10.0, 20.0]
        predicted = [13.0, 16.0]
        # (3^2 + (-4)^2) / 2 = 25 / 2 = 12.5; sqrt(12.5) ≈ 3.53553
        self.assertAlmostEqual(rmse(actual, predicted), 3.53553, places=4)

    def test_mape_returns_none_when_actual_is_zero(self):
        actual = [0.0, 100.0]
        predicted = [10.0, 100.0]
        self.assertIsNone(mape(actual, predicted))

    def test_mape_computed_correctly(self):
        actual = [100.0, 200.0]
        predicted = [110.0, 190.0]
        # |10/100| = 10%, |10/200| = 5% -> avg = 7.5%
        val = mape(actual, predicted)
        self.assertIsNotNone(val)
        self.assertAlmostEqual(val, 7.5, places=4)

    def test_compare_to_baseline(self):
        model_m = {"MAE": 6.0, "RMSE": 8.0}
        base_m = {"MAE": 10.0, "RMSE": 10.0}
        comp = compare_to_baseline(model_m, base_m)
        self.assertEqual(comp["MAE_reduction_pct"], 40.0)
        self.assertEqual(comp["RMSE_reduction_pct"], 20.0)


class TestBaselines(unittest.TestCase):
    def test_naive_last_value_forecast(self):
        series = [100.0, 102.0, 105.0]
        res = naive_last_value(series, horizon=3)
        self.assertEqual(res["model_name"], "naive_last_value")
        self.assertEqual(res["point_forecasts"], [105.0, 105.0, 105.0])
        self.assertIsNone(res["lower_bounds"])
        self.assertIsNone(res["upper_bounds"])
        self.assertEqual(len(res["residuals"]), 2)

    def test_naive_last_value_single_obs(self):
        series = [100.0]
        res = naive_last_value(series, horizon=2)
        self.assertEqual(res["point_forecasts"], [100.0, 100.0])
        self.assertEqual(res["residuals"], [])
        self.assertEqual(res["metrics"]["MAE"], 0.0)

    def test_seasonal_naive_basic(self):
        series = [10.0, 20.0, 30.0, 40.0, 12.0, 22.0, 32.0, 42.0]
        res = seasonal_naive(series, horizon=4, period=4)
        self.assertEqual(res["model_name"], "seasonal_naive")
        self.assertEqual(res["point_forecasts"], [12.0, 22.0, 32.0, 42.0])
        self.assertIsNotNone(res["lower_bounds"])
        self.assertIsNotNone(res["upper_bounds"])
        self.assertEqual(len(res["lower_bounds"]), 4)

    def test_seasonal_naive_insufficient_obs_raises(self):
        series = [10.0, 20.0]
        with self.assertRaises(ValueError):
            seasonal_naive(series, horizon=2, period=4)

    def test_linear_trend_basic(self):
        series = [10.0, 20.0, 30.0, 40.0]
        res = linear_trend(series, horizon=2)
        self.assertEqual(res["model_name"], "linear_trend")
        self.assertAlmostEqual(res["point_forecasts"][0], 50.0, places=2)
        self.assertAlmostEqual(res["point_forecasts"][1], 60.0, places=2)
        self.assertIn("slope", res["metadata"])

    def test_linear_trend_returns_prediction_intervals(self):
        series = [10.0, 21.0, 29.0, 40.0]
        res = linear_trend(series, horizon=2)
        self.assertIsNotNone(res["lower_bounds"])
        self.assertIsNotNone(res["upper_bounds"])
        self.assertTrue(res["lower_bounds"][0] < res["point_forecasts"][0] < res["upper_bounds"][0])


class TestDataCheck(unittest.TestCase):
    def test_sufficient_for_naive(self):
        obs = [
            {"observation_date": "2020-01-01", "geography_name": "Mumbai", "metric_name": "hpi_assessment", "metric_value": 100.0},
            {"observation_date": "2020-04-01", "geography_name": "Mumbai", "metric_name": "hpi_assessment", "metric_value": 102.0},
        ]
        res = check_data_sufficiency(obs, "Mumbai", "hpi_assessment")
        self.assertIn("naive_last", res["eligible_models"])
        self.assertEqual(res["n_observations"], 2)

    def test_insufficient_for_sarima(self):
        obs = [
            {"observation_date": f"2020-{i:02d}-01", "geography_name": "Mumbai", "metric_name": "hpi_assessment", "metric_value": 100.0 + i}
            for i in range(1, 9)
        ]
        res = check_data_sufficiency(obs, "Mumbai", "hpi_assessment")
        self.assertIn("sarima", res["ineligible_models"])
        self.assertEqual(res["n_observations"], 8)

    def test_no_real_data_detected(self):
        obs = [
            {"observation_date": "2020-01-01", "geography_name": "Mumbai", "metric_name": "hpi_assessment", "data_status": "synthetic_test"}
        ]
        res = check_data_sufficiency(obs, "Mumbai", "hpi_assessment")
        self.assertFalse(res["has_real_data"])

    def test_real_data_detected(self):
        obs = [
            {"observation_date": "2020-01-01", "geography_name": "Mumbai", "metric_name": "hpi_assessment", "data_status": "real"}
        ]
        res = check_data_sufficiency(obs, "Mumbai", "hpi_assessment")
        self.assertTrue(res["has_real_data"])

    def test_empty_series(self):
        res = check_data_sufficiency([], "Mumbai", "hpi_assessment")
        self.assertEqual(res["n_observations"], 0)
        self.assertIsNone(res["date_range"])
        self.assertIsNotNone(res["blocker"])


class TestEngine(unittest.TestCase):
    def test_run_forecast_unavailable_when_real_required_but_only_synthetic(self):
        obs = [
            {"observation_date": "2020-01-01", "geography_name": "Mumbai", "metric_name": "hpi_assessment", "metric_value": 100.0, "data_status": "synthetic_test"},
            {"observation_date": "2020-04-01", "geography_name": "Mumbai", "metric_name": "hpi_assessment", "metric_value": 102.0, "data_status": "synthetic_test"},
        ]
        res = run_forecast(obs, "Mumbai", "hpi_assessment", horizon=4, data_status_required="real")
        self.assertEqual(res["status"], "unavailable")
        self.assertIn("No real-data", res["reason"])

    def test_run_forecast_insufficient_data(self):
        res = run_forecast([], "Mumbai", "hpi_assessment", horizon=4)
        self.assertEqual(res["status"], "insufficient_data")

    def test_run_forecast_valid_series(self):
        # 20 quarterly synthetic observations
        obs = []
        for year in range(2020, 2025):
            for q, month in enumerate(["01", "04", "07", "10"], start=1):
                obs.append({
                    "observation_date": f"{year}-{month}-01",
                    "geography_name": "Mumbai",
                    "geography_level": "city",
                    "metric_name": "hpi_assessment",
                    "metric_value": 100.0 + (year - 2020) * 4.0 + q * 1.0,
                    "unit": "index_points",
                    "source_name": "SYNTHETIC_TEST_DATA",
                    "data_status": "synthetic_test",
                })
        res = run_forecast(obs, "Mumbai", "hpi_assessment", horizon=4)
        self.assertEqual(res["status"], "ok")
        self.assertEqual(res["n_training"], 16)
        self.assertEqual(res["n_validation"], 4)
        self.assertEqual(len(res["point_forecasts"]), 4)
        self.assertEqual(len(res["forecast_dates"]), 4)
        self.assertIsNotNone(res["evaluation"])

    def test_chronological_split_no_leakage(self):
        obs = []
        for year in range(2020, 2025):
            for month in ["01", "04", "07", "10"]:
                obs.append({
                    "observation_date": f"{year}-{month}-01",
                    "geography_name": "Mumbai",
                    "metric_name": "hpi_assessment",
                    "metric_value": 100.0,
                    "data_status": "synthetic_test",
                })
        res = run_forecast(obs, "Mumbai", "hpi_assessment", horizon=4)
        train_end = res["training_period"]["end"]
        val_start = res["validation_period"]["start"]
        self.assertTrue(train_end < val_start)

    def test_forecast_dates_are_sequential(self):
        obs = [
            {"observation_date": f"2020-{m:02d}-01", "geography_name": "Mumbai", "metric_name": "hpi_assessment", "metric_value": 100.0 + m, "data_status": "synthetic_test"}
            for m in [1, 4, 7, 10]
        ]
        res = run_forecast(obs, "Mumbai", "hpi_assessment", horizon=4)
        dates = res["forecast_dates"]
        for i in range(len(dates) - 1):
            self.assertTrue(dates[i] < dates[i + 1])

    def test_invalid_horizon_raises(self):
        obs = [{"observation_date": "2020-01-01", "geography_name": "Mumbai", "metric_name": "hpi_assessment", "metric_value": 100.0}]
        with self.assertRaises(ValueError):
            run_forecast(obs, "Mumbai", "hpi_assessment", horizon=0)
        with self.assertRaises(ValueError):
            run_forecast(obs, "Mumbai", "hpi_assessment", horizon=-5)


class TestDemoEngine(unittest.TestCase):
    def test_demo_series_has_60_months(self):
        self.assertIn("mumbai-central", DEMO_SERIES)
        self.assertEqual(len(DEMO_SERIES["mumbai-central"]["months"]), 60)
        self.assertEqual(len(DEMO_SERIES["mumbai-central"]["values"]), 60)

    def test_demo_forecast_labeled_synthetic_demo(self):
        res = run_demo_forecast(sector_id="mumbai-central", horizon=12)
        self.assertEqual(res["data_status"], "synthetic_demo")

    def test_demo_forecast_not_real(self):
        res = run_demo_forecast(sector_id="bandra-west", horizon=6)
        self.assertNotEqual(res["data_status"], "real")

    def test_demo_forecast_has_warnings(self):
        res = run_demo_forecast(sector_id="andheri-east", horizon=12)
        self.assertTrue(len(res["warnings"]) > 0)
        self.assertIn("SYNTHETIC", res["warnings"][0])


if __name__ == "__main__":
    unittest.main()
