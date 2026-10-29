"""
Baseline forecasting models for UrbanLens.
Uses only numpy and math from the Python standard library.
"""
from typing import List, Dict, Optional, Any
import numpy as np
from forecasting.metrics import mae, rmse


def naive_last_value(series: List[float], horizon: int) -> Dict[str, Any]:
    """
    Naive last-observation forecast.
    Prediction = last observed value, repeated horizon times.
    No prediction interval (lower_bounds=None, upper_bounds=None).
    """
    if not series:
        raise ValueError("series must not be empty")
    if horizon < 1:
        raise ValueError("horizon must be at least 1")

    last_val = float(series[-1])
    point_forecasts = [last_val] * horizon

    if len(series) < 2:
        residuals = []
        metrics = {"MAE": 0.0, "RMSE": 0.0}
    else:
        actuals = [float(x) for x in series[1:]]
        preds = [float(x) for x in series[:-1]]
        residuals = [float(a - p) for a, p in zip(actuals, preds)]
        metrics = {
            "MAE": round(mae(actuals, preds), 4),
            "RMSE": round(rmse(actuals, preds), 4),
        }

    return {
        "model_name": "naive_last_value",
        "model_version": "1.0",
        "point_forecasts": point_forecasts,
        "lower_bounds": None,
        "upper_bounds": None,
        "residuals": residuals,
        "metrics": metrics,
    }


def seasonal_naive(series: List[float], horizon: int, period: int = 4) -> Dict[str, Any]:
    """
    Seasonal naive forecast:
    forecast[h] = series[-period + (h % period)]
    Valid only when len(series) >= period.
    Prediction intervals computed as ±1.96 * std(residuals).
    """
    if not series:
        raise ValueError("series must not be empty")
    if len(series) < period:
        raise ValueError(
            f"Series length ({len(series)}) must be at least seasonal period ({period})"
        )
    if horizon < 1:
        raise ValueError("horizon must be at least 1")

    point_forecasts = [
        float(series[-period + (h % period)]) for h in range(horizon)
    ]

    if len(series) > period:
        actuals = [float(series[t]) for t in range(period, len(series))]
        preds = [float(series[t - period]) for t in range(period, len(series))]
        residuals = [float(a - p) for a, p in zip(actuals, preds)]
        metrics = {
            "MAE": round(mae(actuals, preds), 4),
            "RMSE": round(rmse(actuals, preds), 4),
        }
        res_std = float(np.std(residuals, ddof=1)) if len(residuals) > 1 else float(np.std(residuals))
    else:
        residuals = []
        metrics = {"MAE": 0.0, "RMSE": 0.0}
        res_std = 0.0

    lower_bounds = [round(p - 1.96 * res_std, 4) for p in point_forecasts]
    upper_bounds = [round(p + 1.96 * res_std, 4) for p in point_forecasts]

    return {
        "model_name": "seasonal_naive",
        "model_version": "1.0",
        "point_forecasts": point_forecasts,
        "lower_bounds": lower_bounds,
        "upper_bounds": upper_bounds,
        "residuals": residuals,
        "metrics": metrics,
    }


def linear_trend(series: List[float], horizon: int) -> Dict[str, Any]:
    """
    Fit OLS linear regression on index vs value.
    Extrapolate for horizon steps.
    Include prediction interval from regression residual std (±1.96 * std(residuals)).
    """
    if not series:
        raise ValueError("series must not be empty")
    if len(series) < 2:
        raise ValueError(
            f"Series length ({len(series)}) must be at least 2 for linear trend"
        )
    if horizon < 1:
        raise ValueError("horizon must be at least 1")

    x = np.arange(len(series), dtype=float)
    y = np.array(series, dtype=float)

    slope, intercept = np.polyfit(x, y, 1)
    fitted = slope * x + intercept
    residuals = [float(r) for r in (y - fitted).tolist()]

    metrics = {
        "MAE": round(mae(y.tolist(), fitted.tolist()), 4),
        "RMSE": round(rmse(y.tolist(), fitted.tolist()), 4),
    }

    res_std = float(np.std(residuals, ddof=2)) if len(residuals) > 2 else float(np.std(residuals))

    future_x = np.arange(len(series), len(series) + horizon, dtype=float)
    point_forecasts = [
        round(float(p), 4) for p in (slope * future_x + intercept).tolist()
    ]
    lower_bounds = [round(float(p - 1.96 * res_std), 4) for p in point_forecasts]
    upper_bounds = [round(float(p + 1.96 * res_std), 4) for p in point_forecasts]

    return {
        "model_name": "linear_trend",
        "model_version": "1.0",
        "point_forecasts": point_forecasts,
        "lower_bounds": lower_bounds,
        "upper_bounds": upper_bounds,
        "residuals": residuals,
        "metrics": metrics,
        "metadata": {
            "slope": float(slope),
            "intercept": float(intercept),
        },
    }
