"""
temporal_analysis.py — Temporal Trend Analysis Engine (Milestone 6)

Calculates:
- Quarter-over-Quarter (QoQ) percentage change
- Year-over-Year (YoY) percentage change
- Compound Annual Growth Rates (CAGR) for 3-year, 5-year, and full historical horizon
- Rolling volatility (standard deviation of quarterly growth over an 8-quarter window)
- Acceleration / Deceleration of growth rate
- Market cycle regimes and trend classification
"""

import math
from typing import List, Dict, Any, Optional


def compute_percentage_change(current: float, base: float) -> Optional[float]:
    """Safe percentage change calculation guarding against zero and negative bases."""
    if base is None or current is None or base <= 0:
        return None
    return round(((current - base) / base) * 100.0, 2)


def compute_cagr(start_val: float, end_val: float, periods_years: float) -> Optional[float]:
    """Safe CAGR calculation: (end / start)**(1 / years) - 1."""
    if start_val is None or end_val is None or start_val <= 0 or end_val <= 0 or periods_years <= 0:
        return None
    try:
        ratio = end_val / start_val
        cagr = (math.pow(ratio, 1.0 / periods_years) - 1.0) * 100.0
        return round(cagr, 2)
    except (ValueError, OverflowError, ZeroDivisionError):
        return None


def compute_rolling_std(series: List[float], window: int = 8) -> List[Optional[float]]:
    """Calculates rolling sample standard deviation over a sliding window."""
    result: List[Optional[float]] = []
    for i in range(len(series)):
        if i + 1 < window:
            result.append(None)
            continue
        sub = [v for v in series[i + 1 - window : i + 1] if v is not None]
        if len(sub) < 2:
            result.append(None)
            continue
        mean = sum(sub) / len(sub)
        var = sum((x - mean) ** 2 for x in sub) / (len(sub) - 1)
        result.append(round(math.sqrt(var), 2))
    return result


def analyze_hpi_series(observations: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Takes sorted chronological list of HPI observations:
    [{"date": "2010-06-30", "value": 100.0, "geography": "Mumbai"}, ...]
    """
    if not observations or len(observations) < 2:
        return {
            "status": "insufficient_data",
            "message": "At least 2 chronological observations are required for temporal analysis.",
            "points": [],
            "summary": None,
        }

    points = []
    values = [obs["value"] for obs in observations]
    qoq_list: List[Optional[float]] = []

    # 1. Compute basic point-by-point rates
    for i, obs in enumerate(observations):
        val = obs["value"]
        dt = obs["date"]

        # QoQ (1 quarter prior)
        qoq = compute_percentage_change(val, values[i - 1]) if i >= 1 else None
        qoq_list.append(qoq)

        # YoY (4 quarters prior)
        yoy = compute_percentage_change(val, values[i - 4]) if i >= 4 else None

        # Acceleration (change in QoQ rate)
        prev_qoq = qoq_list[i - 1] if i >= 1 else None
        acceleration = round(qoq - prev_qoq, 2) if qoq is not None and prev_qoq is not None else None

        points.append({
            "date": dt,
            "value": round(val, 2),
            "qoq_change_pct": qoq,
            "yoy_change_pct": yoy,
            "acceleration": acceleration,
            "rolling_volatility_8q": None,  # filled below
        })

    # 2. Compute rolling 8-quarter volatility on QoQ growth rates
    valid_qoq = [p["qoq_change_pct"] if p["qoq_change_pct"] is not None else 0.0 for p in points]
    volatilities = compute_rolling_std(valid_qoq, window=8)
    for p, vol in zip(points, volatilities):
        p["rolling_volatility_8q"] = vol

    # 3. Aggregate Macro Summary
    first = points[0]
    last = points[-1]
    n_points = len(points)
    total_years = max((n_points - 1) / 4.0, 0.25)

    # 3-year window (approx 12 quarters)
    three_yr_idx = max(0, n_points - 13)
    three_yr_start = points[three_yr_idx]
    three_yr_cagr = compute_cagr(three_yr_start["value"], last["value"], (n_points - 1 - three_yr_idx) / 4.0)

    # 5-year window (approx 20 quarters)
    five_yr_idx = max(0, n_points - 21)
    five_yr_start = points[five_yr_idx]
    five_yr_cagr = compute_cagr(five_yr_start["value"], last["value"], (n_points - 1 - five_yr_idx) / 4.0)

    total_change = compute_percentage_change(last["value"], first["value"])
    total_cagr = compute_cagr(first["value"], last["value"], total_years)

    # Trend direction assessment on recent 4 quarters
    recent_yoy = [p["yoy_change_pct"] for p in points[-4:] if p["yoy_change_pct"] is not None]
    avg_recent_yoy = sum(recent_yoy) / len(recent_yoy) if recent_yoy else 0.0

    if avg_recent_yoy > 8.0:
        regime = "strong_appreciation"
        regime_label = "Strong Housing Price Acceleration"
    elif avg_recent_yoy > 3.0:
        regime = "moderate_growth"
        regime_label = "Steady Market Growth"
    elif avg_recent_yoy >= -2.0:
        regime = "stagnation_consolidation"
        regime_label = "Plateau & Valuation Consolidation"
    else:
        regime = "contraction"
        regime_label = "Market Valuation Contraction"

    summary = {
        "geography": observations[0].get("geography", "Mumbai"),
        "geography_level": "city",
        "start_date": first["date"],
        "end_date": last["date"],
        "start_value": first["value"],
        "end_value": last["value"],
        "observation_count": n_points,
        "total_cumulative_change_pct": total_change,
        "annualized_cagr_pct": total_cagr,
        "three_year_cagr_pct": three_yr_cagr,
        "five_year_cagr_pct": five_yr_cagr,
        "recent_annual_growth_pct": round(avg_recent_yoy, 2),
        "recent_market_regime": regime,
        "regime_label": regime_label,
        "mean_quarterly_volatility": round(
            sum(v for v in volatilities if v is not None) / max(len([v for v in volatilities if v is not None]), 1),
            2
        ),
    }

    return {
        "status": "ok",
        "summary": summary,
        "points": points,
    }
