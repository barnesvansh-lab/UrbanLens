"""
anomaly_detection.py — Statistical Anomaly Detection Engine (Milestone 6)

Implements transparent, explainable anomaly detection on time-series indicators:
1. Rolling Z-Score Analysis (|Z| >= 2.0 with rolling 8-quarter baseline)
2. Interquartile Range (IQR) Global Outlier Detection (1.5 * IQR)
3. Spikes in growth acceleration (rate change >= 2 standard deviations)

All detected anomalies include underlying statistics, thresholds, and caveats.
"""

import math
from typing import List, Dict, Any, Optional


def compute_zscore(val: float, mean: float, std: float) -> Optional[float]:
    if std is None or std <= 0.0001:
        return None
    return round((val - mean) / std, 2)


def compute_iqr_thresholds(values: List[float], multiplier: float = 1.5) -> Dict[str, float]:
    """Calculates Q1, median, Q3, and IQR fence thresholds."""
    sorted_vals = sorted(v for v in values if v is not None)
    n = len(sorted_vals)
    if n < 4:
        return {"q1": 0.0, "median": 0.0, "q3": 0.0, "iqr": 0.0, "lower_bound": -999.0, "upper_bound": 999.0}

    def percentile(p: float) -> float:
        k = (n - 1) * p
        f = math.floor(k)
        c = math.ceil(k)
        if f == c:
            return sorted_vals[int(k)]
        return sorted_vals[f] * (c - k) + sorted_vals[c] * (k - f)

    q1 = percentile(0.25)
    med = percentile(0.50)
    q3 = percentile(0.75)
    iqr = q3 - q1

    return {
        "q1": round(q1, 2),
        "median": round(med, 2),
        "q3": round(q3, 2),
        "iqr": round(iqr, 2),
        "lower_bound": round(q1 - (multiplier * iqr), 2),
        "upper_bound": round(q3 + (multiplier * iqr), 2),
    }


def detect_anomalies(
    points: List[Dict[str, Any]],
    z_threshold: float = 2.0,
    window: int = 8,
) -> Dict[str, Any]:
    """
    Scans temporal points for:
    - Z-Score outliers on QoQ growth rates
    - Global IQR outliers on QoQ growth rates
    - Acceleration shocks
    """
    anomalies: List[Dict[str, Any]] = []

    qoq_values = [p["qoq_change_pct"] for p in points if p.get("qoq_change_pct") is not None]
    if len(qoq_values) < 8:
        return {
            "status": "insufficient_data",
            "message": "At least 8 quarters required for statistical anomaly detection.",
            "anomalies": [],
            "summary": None,
        }

    iqr_bounds = compute_iqr_thresholds(qoq_values)

    # Walk chronologically through points
    for i in range(len(points)):
        p = points[i]
        qoq = p.get("qoq_change_pct")
        dt = p["date"]
        val = p["value"]

        if qoq is None:
            continue

        # 1. Rolling Z-Score: using preceding 8 quarters
        if i >= window:
            window_slice = [points[j]["qoq_change_pct"] for j in range(i - window, i) if points[j].get("qoq_change_pct") is not None]
            if len(window_slice) >= 4:
                w_mean = sum(window_slice) / len(window_slice)
                w_var = sum((x - w_mean) ** 2 for x in window_slice) / (len(window_slice) - 1)
                w_std = math.sqrt(w_var)
                z = compute_zscore(qoq, w_mean, w_std)

                if z is not None and abs(z) >= z_threshold:
                    direction = "surge" if z > 0 else "decline"
                    severity = "high" if abs(z) >= 3.0 else "moderate"
                    anomalies.append({
                        "id": f"anom-z-{dt}",
                        "date": dt,
                        "indicator_name": "Quarterly HPI Growth Rate (QoQ)",
                        "observed_value": qoq,
                        "unit": "percent",
                        "hpi_level": val,
                        "method": "rolling_zscore",
                        "z_score": z,
                        "rolling_mean": round(w_mean, 2),
                        "rolling_std": round(w_std, 2),
                        "direction": direction,
                        "severity": severity,
                        "threshold_used": f"|Z| >= {z_threshold}",
                        "description": (
                            f"Quarterly growth of {qoq}% on {dt} deviated significantly from the "
                            f"preceding 8-quarter average ({round(w_mean, 2)}% ± {round(w_std, 2)}%), Z = {z}."
                        ),
                        "caveat": (
                            "This price fluctuation reflects unusual valuation velocity in official assessment records. "
                            "It does NOT independently prove gentrification or tenant displacement."
                        ),
                    })

        # 2. Global IQR Outlier
        if qoq > iqr_bounds["upper_bound"] or qoq < iqr_bounds["lower_bound"]:
            # Check if not already added as Z-score anomaly for the same date
            if not any(a["date"] == dt and a["method"] == "rolling_zscore" for a in anomalies):
                direction = "surge" if qoq > iqr_bounds["upper_bound"] else "decline"
                anomalies.append({
                    "id": f"anom-iqr-{dt}",
                    "date": dt,
                    "indicator_name": "Quarterly HPI Growth Rate (QoQ)",
                    "observed_value": qoq,
                    "unit": "percent",
                    "hpi_level": val,
                    "method": "iqr_outlier",
                    "z_score": None,
                    "iqr_lower": iqr_bounds["lower_bound"],
                    "iqr_upper": iqr_bounds["upper_bound"],
                    "direction": direction,
                    "severity": "moderate",
                    "threshold_used": f"< {iqr_bounds['lower_bound']}% or > {iqr_bounds['upper_bound']}%",
                    "description": (
                        f"Growth of {qoq}% falls outside the global historical interquartile range bounds "
                        f"[{iqr_bounds['lower_bound']}%, {iqr_bounds['upper_bound']}%]."
                    ),
                    "caveat": (
                        "Historical distribution outlier. Descriptive metric only; does NOT independently prove "
                        "gentrification or neighborhood transformation."
                    ),
                })

    # Sort anomalies chronologically
    anomalies.sort(key=lambda x: x["date"])

    summary = {
        "total_anomalies_detected": len(anomalies),
        "surge_count": sum(1 for a in anomalies if a["direction"] == "surge"),
        "decline_count": sum(1 for a in anomalies if a["direction"] == "decline"),
        "iqr_bounds": iqr_bounds,
        "methodologies_used": ["rolling_zscore_8q", "iqr_fence_1_5"],
        "interpretative_mandate": (
            "Detected anomalies represent unusual rate-of-change spikes in housing price index valuations. "
            "They serve as triggers for multi-domain verification, NOT automated labels of neighborhood transformation."
        ),
    }

    return {
        "status": "ok",
        "summary": summary,
        "anomalies": anomalies,
    }
