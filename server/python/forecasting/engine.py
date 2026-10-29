"""
Main forecasting engine for UrbanLens.
Orchestrates data sufficiency check -> chronological train/val split ->
model selection -> baseline evaluation -> forward forecasting.
"""
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from forecasting.data_check import check_data_sufficiency, MIN_OBS
from forecasting.baselines import naive_last_value, seasonal_naive, linear_trend
from forecasting.metrics import mae, rmse, compare_to_baseline


def _compute_forecast_dates(last_date_str: str, horizon: int, frequency: str = "quarterly") -> List[str]:
    """
    Computes forward ISO date strings (YYYY-MM-DD) based on quarterly or monthly steps.
    """
    parts = last_date_str.split("-")
    last_year = int(parts[0])
    last_month = int(parts[1]) if len(parts) > 1 else 1
    step_months = 3 if frequency == "quarterly" else 1

    dates = []
    for h in range(1, horizon + 1):
        total_months = (last_month - 1) + h * step_months
        y = last_year + total_months // 12
        m = (total_months % 12) + 1
        dates.append(f"{y:04d}-{m:02d}-01")
    return dates


def run_forecast(
    observations: List[Dict[str, Any]],
    geography: str,
    metric: str,
    horizon: int,
    data_status_required: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Executes forecasting pipeline:
    1. Filter observations by geography + metric
    2. Run data_check.check_data_sufficiency()
    3. Reject if data_status_required == 'real' and has_real_data == False
    4. Reject if n_observations < MIN_OBS['naive_last']
    5. Chronological 80% train / 20% validation split
    6. Evaluate models on validation split vs naive baseline
    7. Select best model by validation MAE
    8. Generate horizon-step forecasts from full series
    """
    if horizon <= 0:
        raise ValueError("horizon must be a positive integer")

    # 1. Filter observations
    matching: List[Dict[str, Any]] = []
    for obs in observations:
        obs_geo = obs.get("geography_name") or obs.get("geography")
        if obs_geo is not None and str(obs_geo).strip().lower() != geography.strip().lower():
            continue
        obs_met = obs.get("metric_name") or obs.get("metric")
        if obs_met is not None and str(obs_met).strip().lower() != metric.strip().lower():
            continue
        matching.append(obs)

    # 2. Sufficiency check
    data_check_res = check_data_sufficiency(matching, geography, metric)

    # 3. Check data_status_required
    if data_status_required == "real" and not data_check_res["has_real_data"]:
        return {
            "status": "unavailable",
            "reason": (
                f"No real-data observations available for geography '{geography}' and metric '{metric}'. "
                "UrbanLens currently contains only synthetic test data."
            ),
            "geography": geography,
            "metric": metric,
            "unit": "index_points",
            "geography_level": "city",
            "data_status": "unavailable",
            "source_names": [],
            "training_period": None,
            "validation_period": None,
            "n_training": 0,
            "n_validation": 0,
            "model_name": "none",
            "model_version": "none",
            "horizon": horizon,
            "forecast_dates": [],
            "point_forecasts": [],
            "lower_bounds": None,
            "upper_bounds": None,
            "observations": [],
            "forecast": [],
            "evaluation": None,
            "warnings": [
                "Forecasting unavailable: Real data required but not found in ingested datasets."
            ],
            "limitations": [
                "Real RBI / NHB data pipeline pending live ingestion."
            ],
            "generated_at": datetime.now(timezone.utc).isoformat(),
        }

    # 4. Check minimum observations
    if data_check_res["n_observations"] < MIN_OBS["naive_last"]:
        return {
            "status": "insufficient_data",
            "reason": (
                f"Insufficient observations ({data_check_res['n_observations']}) "
                f"for geography '{geography}' and metric '{metric}'. Minimum required: {MIN_OBS['naive_last']}"
            ),
            "geography": geography,
            "metric": metric,
            "unit": "index_points",
            "geography_level": "city",
            "data_status": "unavailable",
            "source_names": [],
            "training_period": None,
            "validation_period": None,
            "n_training": 0,
            "n_validation": 0,
            "model_name": "none",
            "model_version": "none",
            "horizon": horizon,
            "forecast_dates": [],
            "point_forecasts": [],
            "lower_bounds": None,
            "upper_bounds": None,
            "observations": [],
            "forecast": [],
            "evaluation": None,
            "warnings": ["Insufficient observations for forecasting."],
            "limitations": [],
            "generated_at": datetime.now(timezone.utc).isoformat(),
        }

    # 5. Sort chronologically
    sorted_obs = sorted(
        matching,
        key=lambda o: str(o.get("observation_date") or o.get("date"))
    )

    source_names = sorted(list({
        str(o.get("source_name"))
        for o in sorted_obs
        if o.get("source_name")
    }))
    data_status = str(sorted_obs[0].get("data_status", "unknown"))
    unit = str(sorted_obs[0].get("unit", "index_points"))
    geography_level = str(sorted_obs[0].get("geography_level", "city"))

    # Determine frequency (quarterly vs monthly) from dates
    frequency = "quarterly"
    if len(sorted_obs) >= 2:
        d1_str = str(sorted_obs[0].get("observation_date") or sorted_obs[0].get("date"))
        d2_str = str(sorted_obs[1].get("observation_date") or sorted_obs[1].get("date"))
        try:
            d1 = datetime.strptime(d1_str[:10], "%Y-%m-%d")
            d2 = datetime.strptime(d2_str[:10], "%Y-%m-%d")
            diff_days = abs((d2 - d1).days)
            if diff_days <= 45:
                frequency = "monthly"
        except Exception:
            pass

    # 80% train / 20% validation chronological split
    n = len(sorted_obs)
    if n >= 4:
        n_train = max(1, int(n * 0.8))
        if n_train >= n:
            n_train = n - 1
        n_val = n - n_train
        train_obs = sorted_obs[:n_train]
        val_obs = sorted_obs[n_train:]
        train_vals = [float(o["metric_value"]) for o in train_obs]
        val_vals = [float(o["metric_value"]) for o in val_obs]

        d_train_start = str(train_obs[0].get("observation_date") or train_obs[0].get("date"))
        d_train_end = str(train_obs[-1].get("observation_date") or train_obs[-1].get("date"))
        d_val_start = str(val_obs[0].get("observation_date") or val_obs[0].get("date"))
        d_val_end = str(val_obs[-1].get("observation_date") or val_obs[-1].get("date"))

        training_period: Optional[Dict[str, str]] = {"start": d_train_start, "end": d_train_end}
        validation_period: Optional[Dict[str, str]] = {"start": d_val_start, "end": d_val_end}

        # 6. Evaluate candidate models on validation split
        base_val_pred = [train_vals[-1]] * n_val
        base_mae = mae(val_vals, base_val_pred)
        base_rmse = rmse(val_vals, base_val_pred)

        candidates = [("naive_last_value", base_mae, base_rmse)]

        # Linear trend if n_train >= 4
        if len(train_vals) >= 4:
            lt_val = linear_trend(train_vals, horizon=n_val)
            lt_mae = mae(val_vals, lt_val["point_forecasts"])
            lt_rmse = rmse(val_vals, lt_val["point_forecasts"])
            candidates.append(("linear_trend", lt_mae, lt_rmse))

        # Seasonal naive if n_train >= 4
        seasonal_period = 4 if frequency == "quarterly" else 12
        if len(train_vals) >= seasonal_period:
            try:
                sn_val = seasonal_naive(train_vals, horizon=n_val, period=seasonal_period)
                sn_mae = mae(val_vals, sn_val["point_forecasts"])
                sn_rmse = rmse(val_vals, sn_val["point_forecasts"])
                candidates.append(("seasonal_naive", sn_mae, sn_rmse))
            except Exception:
                pass

        # 7. Select best model by validation MAE
        best_model_name, best_mae, best_rmse = min(candidates, key=lambda c: c[1])

        evaluation: Optional[Dict[str, Any]] = {
            "model": {"MAE": round(best_mae, 4), "RMSE": round(best_rmse, 4)},
            "baseline_naive_last": {"MAE": round(base_mae, 4), "RMSE": round(base_rmse, 4)},
            "vs_baseline": compare_to_baseline(
                {"MAE": best_mae, "RMSE": best_rmse},
                {"MAE": base_mae, "RMSE": base_rmse},
            ),
        }
    else:
        n_train = n
        n_val = 0
        train_obs = sorted_obs
        val_obs = []
        d_train_start = str(train_obs[0].get("observation_date") or train_obs[0].get("date"))
        d_train_end = str(train_obs[-1].get("observation_date") or train_obs[-1].get("date"))
        training_period = {"start": d_train_start, "end": d_train_end}
        validation_period = None
        evaluation = None
        best_model_name = "naive_last_value"

    # 8. Fit best model on FULL series
    full_vals = [float(o["metric_value"]) for o in sorted_obs]
    seasonal_period = 4 if frequency == "quarterly" else 12

    if best_model_name == "linear_trend" and len(full_vals) >= 4:
        full_res = linear_trend(full_vals, horizon=horizon)
    elif best_model_name == "seasonal_naive" and len(full_vals) >= seasonal_period:
        full_res = seasonal_naive(full_vals, horizon=horizon, period=seasonal_period)
    else:
        best_model_name = "naive_last_value"
        full_res = naive_last_value(full_vals, horizon=horizon)

    point_forecasts = full_res["point_forecasts"]
    lower_bounds = full_res.get("lower_bounds")
    upper_bounds = full_res.get("upper_bounds")

    last_date_str = str(sorted_obs[-1].get("observation_date") or sorted_obs[-1].get("date"))
    forecast_dates = _compute_forecast_dates(last_date_str, horizon=horizon, frequency=frequency)

    # Observations array
    observations_arr = [
        {
            "date": str(o.get("observation_date") or o.get("date")),
            "point_forecast": round(float(o["metric_value"]), 4),
            "lower_bound": None,
            "upper_bound": None,
        }
        for o in sorted_obs
    ]

    # Forecast array
    forecast_arr = [
        {
            "date": d,
            "point_forecast": round(p, 4),
            "lower_bound": round(lb, 4) if lb is not None else None,
            "upper_bound": round(ub, 4) if ub is not None else None,
        }
        for d, p, lb, ub in zip(
            forecast_dates,
            point_forecasts,
            lower_bounds or [None] * horizon,
            upper_bounds or [None] * horizon,
        )
    ]

    warnings = []
    limitations = [
        "Prediction intervals derived under Gaussian residual assumptions.",
        "Model does not account for sudden macroeconomic regime shifts.",
    ]

    if data_status == "synthetic_test":
        warnings.append("THIS IS A SYNTHETIC TEST FIXTURE. Output does not represent real market data.")
        limitations.append("Small sample size (test fixture); results are illustrative only.")
    elif data_status == "synthetic_demo":
        warnings.append("THIS IS A SYNTHETIC DEMO. Output does not represent real market data.")

    return {
        "status": "ok",
        "geography": geography,
        "metric": metric,
        "unit": unit,
        "geography_level": geography_level,
        "data_status": data_status,
        "source_names": source_names,
        "training_period": training_period,
        "validation_period": validation_period,
        "n_training": n_train,
        "n_validation": n_val,
        "model_name": best_model_name,
        "model_version": "1.0",
        "horizon": horizon,
        "forecast_dates": forecast_dates,
        "point_forecasts": point_forecasts,
        "lower_bounds": lower_bounds,
        "upper_bounds": upper_bounds,
        "observations": observations_arr,
        "forecast": forecast_arr,
        "evaluation": evaluation,
        "warnings": warnings,
        "limitations": limitations,
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }
