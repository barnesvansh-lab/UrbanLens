"""
UrbanLens — Milestone 4 Real Data Integration & Real-Market Forecasting Tests

Verifies:
1. Provenance and integrity of normalized RBI HPI data.
2. Ingestion of real RBI HPI and OSM amenities into processed files.
3. Separation of real data from synthetic fixtures.
4. Correctness of index base consistency checker.
5. Forecasting engine evaluation and execution on genuine market series (All India, Mumbai).
6. Strict enforcement of index_points unit and city-level geography.
"""

import os
import unittest
import pandas as pd
from pathlib import Path

from pipeline.validators import check_index_base_consistency
from forecasting.engine import run_forecast


CURRENT_DIR = Path(__file__).resolve().parent
PYTHON_ROOT = CURRENT_DIR.parent
RAW_RBI = PYTHON_ROOT / "data" / "raw" / "rbi" / "rbi_hpi_normalized.csv"
PROCESSED_HPI = PYTHON_ROOT / "data" / "processed" / "processed_hpi.csv"
PROCESSED_AMENITIES = PYTHON_ROOT / "data" / "processed" / "processed_amenities.csv"


class TestMilestone4RealData(unittest.TestCase):

    def test_01_rbi_hpi_normalized_csv_exists(self):
        """Normalized RBI HPI CSV exists and has data."""
        self.assertTrue(RAW_RBI.exists(), f"Normalized RBI CSV not found: {RAW_RBI}")
        df = pd.read_csv(RAW_RBI)
        self.assertGreaterEqual(len(df), 500, "Expected at least 500 rows in normalized RBI dataset")

    def test_02_rbi_hpi_data_status_real(self):
        """All rows in normalized RBI HPI have data_status == 'real'."""
        df = pd.read_csv(RAW_RBI)
        self.assertIn("data_status", df.columns)
        self.assertTrue((df["data_status"] == "real").all())

    def test_03_rbi_hpi_deduplication(self):
        """No duplicate (geography_name, observation_date) pairs in normalized RBI CSV."""
        df = pd.read_csv(RAW_RBI)
        dups = df.duplicated(subset=["geography_name", "observation_date"]).sum()
        self.assertEqual(dups, 0, f"Found {dups} duplicate date-geography entries")

    def test_04_rbi_hpi_excludes_pre_2010(self):
        """Observations prior to 2010-06-01 (retired 2008-09 base) are excluded."""
        df = pd.read_csv(RAW_RBI)
        min_date = df["observation_date"].min()
        self.assertGreaterEqual(min_date, "2010-06-01", f"Found dates prior to 2010-06-01: {min_date}")

    def test_05_rbi_hpi_unit_index_points(self):
        """All rows have unit == 'index_points'."""
        df = pd.read_csv(RAW_RBI)
        self.assertTrue((df["unit"] == "index_points").all())

    def test_06_rbi_hpi_geography_level_city(self):
        """All rows have geography_level == 'city'."""
        df = pd.read_csv(RAW_RBI)
        self.assertTrue((df["geography_level"] == "city").all())

    def test_07_rbi_hpi_cities_present(self):
        """Expected key Indian metropolitan cities and All India are present."""
        df = pd.read_csv(RAW_RBI)
        cities = set(df["geography_name"].unique())
        expected = {"All India", "Mumbai", "Delhi", "Bengaluru", "Chennai", "Kolkata"}
        self.assertTrue(expected.issubset(cities), f"Missing expected cities. Present: {cities}")

    def test_08_rbi_hpi_date_range(self):
        """Dates span from at least 2010-06-30 up to 2025."""
        df = pd.read_csv(RAW_RBI)
        min_date = df["observation_date"].min()
        max_date = df["observation_date"].max()
        self.assertEqual(min_date, "2010-06-30")
        self.assertGreaterEqual(max_date, "2024-01-01")

    def test_09_processed_hpi_contains_real_data(self):
        """Processed HPI CSV contains rows with data_status == 'real'."""
        self.assertTrue(PROCESSED_HPI.exists())
        df = pd.read_csv(PROCESSED_HPI)
        real_count = (df["data_status"] == "real").sum()
        self.assertGreater(real_count, 0, "No real observations found in processed_hpi.csv")

    def test_10_osm_amenities_processed_exists(self):
        """Processed OSM amenities CSV exists and is populated."""
        self.assertTrue(PROCESSED_AMENITIES.exists())
        df = pd.read_csv(PROCESSED_AMENITIES)
        self.assertGreaterEqual(len(df), 100)

    def test_11_osm_amenities_data_status_real(self):
        """Processed OSM amenities are labeled data_status == 'real'."""
        df = pd.read_csv(PROCESSED_AMENITIES)
        self.assertTrue((df["data_status"] == "real").all())

    def test_12_index_base_consistency_checker(self):
        """check_index_base_consistency returns warnings on mixed bases and none on single base."""
        # Single base -> no warning
        df_single = pd.DataFrame({
            "index_base": ["2010-11=100", "2010-11=100", "2010-11=100"]
        })
        warns = check_index_base_consistency(df_single)
        self.assertEqual(len(warns), 0)

        # Mixed bases -> warning
        df_mixed = pd.DataFrame({
            "index_base": ["2010-11=100", "2008-09=100"]
        })
        warns_mixed = check_index_base_consistency(df_mixed)
        self.assertEqual(len(warns_mixed), 1)
        self.assertIn("Multiple index bases detected", warns_mixed[0])

    def test_13_forecast_real_mode_all_india(self):
        """Forecasting engine runs successfully on real All India HPI series."""
        df = pd.read_csv(PROCESSED_HPI)
        obs = df[df["geography_name"] == "All India"].to_dict(orient="records")
        res = run_forecast(
            observations=obs,
            geography="All India",
            metric="hpi_assessment",
            horizon=4,
            data_status_required="real",
        )
        self.assertEqual(res["status"], "ok")
        self.assertEqual(res["data_status"], "real")
        self.assertEqual(res["unit"], "index_points")
        self.assertEqual(res["geography_level"], "city")
        self.assertEqual(len(res["point_forecasts"]), 4)
        self.assertIsNotNone(res["evaluation"])
        self.assertIn("MAE", res["evaluation"]["model"])
        self.assertIn("RMSE", res["evaluation"]["model"])

    def test_14_forecast_real_mode_mumbai(self):
        """Forecasting engine runs successfully on real Mumbai HPI series."""
        df = pd.read_csv(PROCESSED_HPI)
        obs = df[df["geography_name"] == "Mumbai"].to_dict(orient="records")
        res = run_forecast(
            observations=obs,
            geography="Mumbai",
            metric="hpi_assessment",
            horizon=4,
            data_status_required="real",
        )
        self.assertEqual(res["status"], "ok")
        self.assertEqual(res["data_status"], "real")
        self.assertEqual(res["unit"], "index_points")
        self.assertGreater(res["point_forecasts"][0], 350.0)

    def test_15_forecast_no_synthetic_fallback_in_real_mode(self):
        """When data_status_required='real', synthetic data is rejected and never used."""
        synthetic_obs = [
            {
                "observation_date": f"2020-0{i}-01",
                "geography_name": "TestCity",
                "metric_name": "hpi_assessment",
                "metric_value": 100.0 + i,
                "unit": "index_points",
                "source_name": "SYNTHETIC_TEST",
                "data_status": "synthetic_test",
            }
            for i in range(1, 10)
        ]
        res = run_forecast(
            observations=synthetic_obs,
            geography="TestCity",
            metric="hpi_assessment",
            horizon=4,
            data_status_required="real",
        )
        self.assertEqual(res["status"], "unavailable")
        self.assertEqual(res["data_status"], "unavailable")

    def test_16_unit_preserved_as_index_points(self):
        """Forecast output unit is always 'index_points' for HPI."""
        df = pd.read_csv(PROCESSED_HPI)
        obs = df[df["geography_name"] == "Delhi"].to_dict(orient="records")
        res = run_forecast(
            observations=obs,
            geography="Delhi",
            metric="hpi_assessment",
            horizon=4,
            data_status_required="real",
        )
        self.assertEqual(res["unit"], "index_points")
        self.assertNotIn("rupee", res["unit"].lower())
        self.assertNotIn("sqft", res["unit"].lower())

    def test_17_geography_level_preserved_as_city(self):
        """City-level HPI preserves geography_level == 'city' in output."""
        df = pd.read_csv(PROCESSED_HPI)
        obs = df[df["geography_name"] == "Bengaluru"].to_dict(orient="records")
        res = run_forecast(
            observations=obs,
            geography="Bengaluru",
            metric="hpi_assessment",
            horizon=4,
            data_status_required="real",
        )
        self.assertEqual(res["geography_level"], "city")
        self.assertNotEqual(res["geography_level"], "neighborhood")


if __name__ == "__main__":
    unittest.main()
