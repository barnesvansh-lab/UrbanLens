"""
Evaluation metric calculations for UrbanLens forecasting models.
"""
import math
from typing import Union, List, Dict, Optional


def mae(actual: List[float], predicted: List[float]) -> float:
    """
    Mean Absolute Error.
    Raises ValueError if lengths differ or series are empty.
    """
    if not actual or not predicted:
        raise ValueError("actual and predicted series must be non-empty")
    if len(actual) != len(predicted):
        raise ValueError(
            f"Series length mismatch: actual has {len(actual)}, predicted has {len(predicted)}"
        )
    return float(sum(abs(a - p) for a, p in zip(actual, predicted)) / len(actual))


def rmse(actual: List[float], predicted: Union[float, List[float]]) -> float:
    """
    Root Mean Squared Error.
    Supports a list of predictions or a scalar float (broadcast to length of actual).
    Raises ValueError if lengths differ or series are empty.
    """
    if not actual:
        raise ValueError("actual series must be non-empty")

    if isinstance(predicted, (int, float)):
        pred_list = [float(predicted)] * len(actual)
    else:
        pred_list = list(predicted)

    if len(actual) != len(pred_list):
        raise ValueError(
            f"Series length mismatch: actual has {len(actual)}, predicted has {len(pred_list)}"
        )
    if len(actual) == 0:
        raise ValueError("actual and predicted series must be non-empty")

    mse = sum((a - p) ** 2 for a, p in zip(actual, pred_list)) / len(actual)
    return float(math.sqrt(mse))


def mape(actual: List[float], predicted: List[float]) -> Optional[float]:
    """
    Mean Absolute Percentage Error.
    Returns None (not a float) when any actual value is 0 (undefined division by zero).
    Document: MAPE is only meaningful for ratio-scale data, not index offsets or values near zero.
    Raises ValueError if lengths differ or series are empty.
    """
    if not actual or not predicted:
        raise ValueError("actual and predicted series must be non-empty")
    if len(actual) != len(predicted):
        raise ValueError(
            f"Series length mismatch: actual has {len(actual)}, predicted has {len(predicted)}"
        )

    # Check for division by zero
    for a in actual:
        if abs(a) < 1e-12:
            return None

    pct_errors = [abs((a - p) / a) for a, p in zip(actual, predicted)]
    return float((100.0 / len(actual)) * sum(pct_errors))


def compare_to_baseline(
    model_metrics: Dict[str, float],
    baseline_metrics: Dict[str, float],
) -> Dict[str, float]:
    """
    Computes percentage reduction in error metrics relative to a baseline model.
    Positive percentage indicates the candidate model beats the baseline.
    Returns:
        {"MAE_reduction_pct": float, "RMSE_reduction_pct": float}
    """
    base_mae = baseline_metrics.get("MAE", 0.0)
    model_mae = model_metrics.get("MAE", 0.0)
    base_rmse = baseline_metrics.get("RMSE", 0.0)
    model_rmse = model_metrics.get("RMSE", 0.0)

    if base_mae > 0:
        mae_red = ((base_mae - model_mae) / base_mae) * 100.0
    else:
        mae_red = 0.0

    if base_rmse > 0:
        rmse_red = ((base_rmse - model_rmse) / base_rmse) * 100.0
    else:
        rmse_red = 0.0

    return {
        "MAE_reduction_pct": round(float(mae_red), 2),
        "RMSE_reduction_pct": round(float(rmse_red), 2),
    }
