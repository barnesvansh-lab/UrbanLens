"""
compatibility.py — Missing-Data & Compatibility Validation Engine (Milestone 6)

Implements rigorous checks for:
1. Missing-data quantification, completeness ratios, and sufficiency thresholds.
2. Temporal continuity and cadence checks (e.g., quarterly sequence vs gaps).
3. Geographic and temporal cross-dataset compatibility validation (preventing ecological fallacies).
"""

from datetime import datetime
from typing import List, Dict, Any, Optional


def evaluate_series_completeness(
    observations: List[Dict[str, Any]],
    expected_field: str = "value",
    sufficiency_threshold: float = 0.85,
) -> Dict[str, Any]:
    """
    Computes completeness ratio and flags missing values.
    Verifies if series meets the minimum empirical threshold for statistical analysis.
    """
    if not observations:
        return {
            "total_records": 0,
            "valid_records": 0,
            "missing_records": 0,
            "completeness_ratio": 0.0,
            "is_sufficient": False,
            "verdict": "EMPTY_SERIES",
            "message": "Dataset contains zero observations.",
        }

    total = len(observations)
    valid = sum(
        1 for obs in observations
        if obs.get(expected_field) is not None
        and str(obs.get(expected_field)).strip() != ""
    )
    missing = total - valid
    ratio = round(valid / total, 4)
    is_sufficient = ratio >= sufficiency_threshold and valid >= 8

    return {
        "total_records": total,
        "valid_records": valid,
        "missing_records": missing,
        "completeness_ratio": ratio,
        "completeness_pct": round(ratio * 100.0, 2),
        "is_sufficient": is_sufficient,
        "sufficiency_threshold_pct": round(sufficiency_threshold * 100.0, 1),
        "verdict": "SUFFICIENT" if is_sufficient else "INSUFFICIENT",
        "message": (
            f"Series has {valid}/{total} valid observations ({round(ratio*100.0, 1)}% complete)."
            if is_sufficient else
            f"Series has {valid}/{total} valid observations, falling short of the required {sufficiency_threshold*100}% threshold."
        ),
    }


def check_quarterly_continuity(
    dates: List[str]
) -> Dict[str, Any]:
    """
    Validates chronological quarterly continuity (e.g. YYYY-MM-DD representing quarters).
    Identifies gaps in quarterly sequences.
    """
    if not dates or len(dates) < 2:
        return {
            "is_continuous": True,
            "gaps_detected": [],
            "total_gaps": 0,
            "observation_count": len(dates),
            "status": "trivial_series",
        }

    parsed_dates = []
    for d_str in dates:
        try:
            # Handle YYYY-MM-DD
            dt = datetime.strptime(d_str[:10], "%Y-%m-%d")
            parsed_dates.append(dt)
        except (ValueError, TypeError):
            continue

    if len(parsed_dates) < 2:
        return {
            "is_continuous": False,
            "gaps_detected": ["Invalid date formats encountered."],
            "total_gaps": 1,
            "status": "format_error",
        }

    gaps = []
    for i in range(1, len(parsed_dates)):
        prev = parsed_dates[i - 1]
        curr = parsed_dates[i]
        diff_days = (curr - prev).days
        # Normal quarter is 89-93 days. Gap if > 120 days
        if diff_days > 120:
            gaps.append({
                "from_date": prev.strftime("%Y-%m-%d"),
                "to_date": curr.strftime("%Y-%m-%d"),
                "interval_days": diff_days,
                "missing_estimated_quarters": round(diff_days / 91.25) - 1,
            })

    return {
        "is_continuous": len(gaps) == 0,
        "gaps_detected": gaps,
        "total_gaps": len(gaps),
        "observation_count": len(parsed_dates),
        "status": "continuous" if len(gaps) == 0 else "discontinuous",
    }


def validate_cross_dataset_compatibility(
    source_a: Dict[str, Any],
    source_b: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Audits two datasets for methodological compatibility:
    1. Geographic resolution check (preventing ecological fallacies)
    2. Temporal alignment & frequency check
    3. Measurement unit compatibility

    Returns structured verdict with academic warnings where applicable.
    """
    geo_a = source_a.get("geographic_level", "").lower().strip()
    geo_b = source_b.get("geographic_level", "").lower().strip()

    name_a = source_a.get("name", "Dataset A")
    name_b = source_b.get("name", "Dataset B")

    incompatibilities = []
    caveats = []

    # 1. Geographic compatibility check
    if geo_a and geo_b and geo_a != geo_b:
        incompatibilities.append(
            f"Geographic resolution mismatch: '{name_a}' is at {geo_a} level, while '{name_b}' is at {geo_b} level. "
            "Direct statistical regression or spatial subtraction introduces severe ecological fallacy."
        )
    elif not geo_a or not geo_b:
        caveats.append("One or both datasets lack documented geographic resolution metadata.")

    # 2. Temporal coverage & frequency check
    freq_a = source_a.get("cadence", source_a.get("update_frequency", "")).lower()
    freq_b = source_b.get("cadence", source_b.get("update_frequency", "")).lower()

    if "snapshot" in freq_a and "quarterly" in freq_b:
        incompatibilities.append(
            f"Temporal frequency mismatch: '{name_a}' is a single static snapshot, whereas '{name_b}' is a dynamic quarterly time series. "
            "Historical growth rates cannot be imputed to static snapshot data."
        )
    elif "snapshot" in freq_b and "quarterly" in freq_a:
        incompatibilities.append(
            f"Temporal frequency mismatch: '{name_b}' is a single static snapshot, whereas '{name_a}' is a dynamic quarterly time series. "
            "Historical growth rates cannot be imputed to static snapshot data."
        )

    # 3. Unit compatibility check
    unit_a = source_a.get("unit", "")
    unit_b = source_b.get("unit", "")
    if unit_a and unit_b and unit_a != unit_b:
        caveats.append(
            f"Unit divergence: '{name_a}' uses {unit_a}, while '{name_b}' uses {unit_b}. "
            "Normalized comparison requires mathematical rescaling or independent dimensional display."
        )

    if incompatibilities:
        verdict = "INCOMPATIBLE"
        recommendation = (
            "Do NOT merge or regress these datasets directly. "
            "Analyze and display them as contextual multi-scalar perspectives with transparent boundaries."
        )
    elif caveats:
        verdict = "COMPATIBLE_WITH_CAVEATS"
        recommendation = "Can be analyzed side-by-side with explicit academic caveats."
    else:
        verdict = "COMPATIBLE"
        recommendation = "Datasets exhibit aligned spatial and temporal properties for joint comparative analysis."

    return {
        "verdict": verdict,
        "is_compatible": len(incompatibilities) == 0,
        "dataset_a": name_a,
        "dataset_b": name_b,
        "incompatibilities": incompatibilities,
        "caveats": caveats,
        "recommendation": recommendation,
    }
