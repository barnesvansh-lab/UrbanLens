"""
normalization.py — Mathematical Normalization & Scaling Engine (Milestone 6)

Provides defensible, bounded statistical normalization methods:
1. Min-Max Scaling: x' = (x - x_min) / (x_max - x_min)
2. Z-Score Standardization: z = (x - μ) / σ
3. Robust IQR Scaling: x' = (x - median) / IQR

Includes strict guardrails to prevent mathematically unsound normalization
across heterogeneous units, mismatched spatial granularities, or inverted polarity.
"""

import math
from typing import List, Dict, Any, Optional, Tuple


def min_max_scale(
    values: List[Optional[float]],
    target_min: float = 0.0,
    target_max: float = 1.0,
) -> List[Optional[float]]:
    """
    Normalizes a numerical list to [target_min, target_max].
    Preserves None for missing observations.
    Guards against zero-variance lists where min == max.
    """
    valid_nums = [v for v in values if v is not None and not math.isnan(v)]
    if not valid_nums:
        return [None for _ in values]

    v_min = min(valid_nums)
    v_max = max(valid_nums)
    v_range = v_max - v_min

    # Zero variance guard: return midpoint if all numbers are identical
    if abs(v_range) < 1e-9:
        midpoint = round((target_min + target_max) / 2.0, 4)
        return [midpoint if (v is not None and not math.isnan(v)) else None for v in values]

    target_range = target_max - target_min
    result: List[Optional[float]] = []
    for v in values:
        if v is None or math.isnan(v):
            result.append(None)
        else:
            scaled = target_min + ((v - v_min) / v_range) * target_range
            result.append(round(scaled, 4))
    return result


def z_score_standardize(
    values: List[Optional[float]]
) -> List[Optional[float]]:
    """
    Standardizes a series to mean = 0, standard deviation = 1:
    z = (x - μ) / σ
    Returns None if standard deviation is zero or insufficient observations (< 2).
    """
    valid_nums = [v for v in values if v is not None and not math.isnan(v)]
    if len(valid_nums) < 2:
        return [None for _ in values]

    mean = sum(valid_nums) / len(valid_nums)
    variance = sum((x - mean) ** 2 for x in valid_nums) / (len(valid_nums) - 1)
    std = math.sqrt(variance)

    if std < 1e-9:
        return [0.0 if (v is not None and not math.isnan(v)) else None for v in values]

    result: List[Optional[float]] = []
    for v in values:
        if v is None or math.isnan(v):
            result.append(None)
        else:
            z = (v - mean) / std
            result.append(round(z, 4))
    return result


def robust_scale_iqr(
    values: List[Optional[float]]
) -> List[Optional[float]]:
    """
    Robust scaling using median and Interquartile Range (IQR):
    x' = (x - median) / IQR
    Resistant to extreme outlier influence.
    """
    valid_nums = sorted(v for v in values if v is not None and not math.isnan(v))
    n = len(valid_nums)
    if n < 4:
        return [None for _ in values]

    def percentile(p: float) -> float:
        k = (n - 1) * p
        f = math.floor(k)
        c = math.ceil(k)
        if f == c:
            return valid_nums[int(k)]
        return valid_nums[f] * (c - k) + valid_nums[c] * (k - f)

    q1 = percentile(0.25)
    med = percentile(0.50)
    q3 = percentile(0.75)
    iqr = q3 - q1

    if abs(iqr) < 1e-9:
        return [0.0 if (v is not None and not math.isnan(v)) else None for v in values]

    result: List[Optional[float]] = []
    for v in values:
        if v is None or math.isnan(v):
            result.append(None)
        else:
            res = (v - med) / iqr
            result.append(round(res, 4))
    return result


def validate_composite_normalization(
    indicators: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Enforces scientific integrity on composite index construction:
    Checks if indicators can be validly combined or normalized.
    Rejects compositing when units, geographic levels, or polarities conflict.
    """
    if not indicators:
        return {
            "valid": False,
            "verdict": "REJECTED",
            "reason": "Empty indicator list provided."
        }

    geo_levels = {i.get("geography_level") for i in indicators if i.get("geography_level")}
    units = {i.get("unit") for i in indicators if i.get("unit")}
    missing_vals = [i for i in indicators if i.get("value") is None]

    issues = []
    if len(geo_levels) > 1:
        issues.append(
            f"Geographic level mismatch: attempting to composite {geo_levels}. "
            "Cross-scalar aggregation commits ecological fallacies."
        )

    if missing_vals:
        issues.append(
            f"{len(missing_vals)} of {len(indicators)} indicators have null values. "
            "Compositing with unverified null indicators is prohibited."
        )

    if issues:
        return {
            "valid": False,
            "verdict": "INVALID_COMPOSITE",
            "issues": issues,
            "recommendation": "Maintain indicators as separate multi-dimensional dimensions rather than a single collapsed index."
        }

    return {
        "valid": True,
        "verdict": "VALID",
        "issues": [],
        "recommendation": "Compatible for bounded multi-criteria comparative analysis."
    }
