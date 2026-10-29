"""
Illustrative demo forecasting engine for UrbanLens.
Uses synthetic monthly series (Jan 2020 - Dec 2024) aligned with syntheticData.ts.
Explicitly for frontend demo mode only.
Labeled as data_status: "synthetic_demo".
Never claims real-market validity.
"""
from datetime import datetime, timezone
from typing import Dict, List, Any
from forecasting.baselines import naive_last_value, seasonal_naive, linear_trend
from forecasting.metrics import mae, rmse, compare_to_baseline


def generate_demo_series() -> Dict[str, Dict[str, Any]]:
    """
    Deterministically computes 60 monthly price observations per sector (Jan 2020 - Dec 2024).
    Replicates the exact mathematical formula from client/src/data/syntheticData.ts.
    """
    months_labels = []
    dates_iso = []
    mc_vals, bw_vals, ae_vals, tw_vals, nm_vals = [], [], [], [], []

    month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    mc = 24200
    bw = 25600
    ae = 14500
    tw = 9200
    nm = 7850

    for year in range(2020, 2025):
        for m in range(12):
            label = f"{month_names[m]} {year}"
            iso_date = f"{year}-{m + 1:02d}-01"

            # Seasonality factor
            seasonal = 1.0
            if m == 2:
                seasonal = 1.008  # March fiscal surge
            elif m in (6, 7):
                seasonal = 0.985  # Monsoon slowdown
            elif m in (9, 10):
                seasonal = 1.025  # Festive bump

            # COVID-19 shock in Q2 2020
            if year == 2020 and 3 <= m <= 5:
                seasonal *= 0.94

            growth = 1.0 + (0.0055 + (m % 3) * 0.0008)

            mc = int(round(mc * growth * seasonal))
            bw = int(round(bw * growth * (seasonal * 1.002)))
            ae = int(round(ae * growth * seasonal))
            tw = int(round(tw * (growth * 1.001) * seasonal))
            nm = int(round(nm * (growth * 1.0015) * seasonal))

            # Clamp boundaries
            mc = max(23000, min(33500, mc))
            bw = max(25000, min(37000, bw))
            ae = max(14000, min(20500, ae))
            tw = max(8800, min(14200, tw))
            nm = max(7500, min(12500, nm))

            months_labels.append(label)
            dates_iso.append(iso_date)
            mc_vals.append(float(mc))
            bw_vals.append(float(bw))
            ae_vals.append(float(ae))
            tw_vals.append(float(tw))
            nm_vals.append(float(nm))

    return {
        "mumbai-central": {"months": months_labels, "dates": dates_iso, "values": mc_vals},
        "bandra-west": {"months": months_labels, "dates": dates_iso, "values": bw_vals},
        "andheri-east": {"months": months_labels, "dates": dates_iso, "values": ae_vals},
        "thane-west": {"months": months_labels, "dates": dates_iso, "values": tw_vals},
        "navi-mumbai": {"months": months_labels, "dates": dates_iso, "values": nm_vals},
    }


DEMO_SERIES = generate_demo_series()


def next_month_dates(horizon: int, start_year: int = 2025, start_month: int = 1) -> List[str]:
    """Generates ISO date strings (YYYY-MM-DD) for horizon forward monthly periods."""
    dates = []
    y = start_year
    m = start_month
    for _ in range(horizon):
        dates.append(f"{y}-{m:02d}-01")
        m += 1
        if m > 12:
            m = 1
            y += 1
    return dates


def run_demo_forecast(sector_id: str = "mumbai-central", horizon: int = 12) -> Dict[str, Any]:
    """
    Runs baseline and linear trend models on DEMO_SERIES for the specified sector.
    Returns standard forecast response dict with data_status='synthetic_demo'.
    """
    if horizon <= 0:
        raise ValueError("horizon must be a positive integer")

    # Normalize sector key
    norm_id = sector_id.strip().lower().replace("_", "-").replace(" ", "-") if sector_id else "mumbai-central"
    if norm_id not in DEMO_SERIES:
        norm_id = "mumbai-central"

    series_info = DEMO_SERIES[norm_id]
    values = series_info["values"]
    dates = series_info["dates"]
    n_total = len(values)

    # 80% train / 20% validation split (chronological, no leakage)
    n_train = int(n_total * 0.8)  # 48 points (2020-01 to 2023-12)
    n_val = n_total - n_train     # 12 points (2024-01 to 2024-12)

    train_vals = values[:n_train]
    val_vals = values[n_train:]

    train_dates = dates[:n_train]
    val_dates = dates[n_train:]

    # 1. Baseline: naive last value on validation
    base_pred = [train_vals[-1]] * n_val
    base_mae = mae(val_vals, base_pred)
    base_rmse = rmse(val_vals, base_pred)

    # 2. Linear trend on train split
    trend_val_res = linear_trend(train_vals, horizon=n_val)
    trend_mae = mae(val_vals, trend_val_res["point_forecasts"])
    trend_rmse = rmse(val_vals, trend_val_res["point_forecasts"])

    # 3. Seasonal naive on train split (period = 12 for monthly data)
    sn_val_res = seasonal_naive(train_vals, horizon=n_val, period=12)
    sn_mae = mae(val_vals, sn_val_res["point_forecasts"])
    sn_rmse = rmse(val_vals, sn_val_res["point_forecasts"])

    # Model selection: pick candidate between linear_trend and seasonal_naive
    candidates = [
        ("linear_trend", trend_mae, trend_rmse),
        ("seasonal_naive", sn_mae, sn_rmse),
    ]
    chosen_model_name, best_mae, best_rmse = min(candidates, key=lambda c: c[1])

    if chosen_model_name == "linear_trend":
        full_forecast_res = linear_trend(values, horizon=horizon)
    else:
        full_forecast_res = seasonal_naive(values, horizon=horizon, period=12)

    point_forecasts = full_forecast_res["point_forecasts"]
    lower_bounds = full_forecast_res["lower_bounds"]
    upper_bounds = full_forecast_res["upper_bounds"]

    future_dates = next_month_dates(horizon=horizon, start_year=2025, start_month=1)

    # Format observations array for API
    observations = [
        {
            "date": d,
            "point_forecast": round(v, 2),
            "lower_bound": None,
            "upper_bound": None,
        }
        for d, v in zip(dates, values)
    ]

    # Format forecast array for API
    forecast = [
        {
            "date": d,
            "point_forecast": round(p, 2),
            "lower_bound": round(lb, 2) if lb is not None else None,
            "upper_bound": round(ub, 2) if ub is not None else None,
        }
        for d, p, lb, ub in zip(
            future_dates,
            point_forecasts,
            lower_bounds or [None] * horizon,
            upper_bounds or [None] * horizon,
        )
    ]

    evaluation = {
        "model": {"MAE": round(best_mae, 2), "RMSE": round(best_rmse, 2)},
        "baseline_naive_last": {"MAE": round(base_mae, 2), "RMSE": round(base_rmse, 2)},
        "vs_baseline": compare_to_baseline(
            {"MAE": best_mae, "RMSE": best_rmse},
            {"MAE": base_mae, "RMSE": base_rmse},
        ),
    }

    return {
        "status": "ok",
        "geography": norm_id,
        "metric": "price_per_sqft",
        "unit": "INR_per_sqft",
        "geography_level": "neighborhood",
        "data_status": "synthetic_demo",
        "source_names": ["SYNTHETIC_DEMO"],
        "training_period": {"start": train_dates[0], "end": train_dates[-1]},
        "validation_period": {"start": val_dates[0], "end": val_dates[-1]},
        "n_training": n_train,
        "n_validation": n_val,
        "model_name": chosen_model_name,
        "model_version": "1.0",
        "horizon": horizon,
        "forecast_dates": future_dates,
        "point_forecasts": point_forecasts,
        "lower_bounds": lower_bounds,
        "upper_bounds": upper_bounds,
        "observations": observations,
        "forecast": forecast,
        "evaluation": evaluation,
        "warnings": [
            "THIS IS A SYNTHETIC DEMO. Output does not represent real market data.",
        ],
        "limitations": [
            "Model fitted on synthetic mathematical series for interface illustration.",
            "Under no circumstances should this be used for actual capital allocation, appraisal, or lending decisions.",
        ],
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }
