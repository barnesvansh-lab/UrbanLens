"""
Quality report generator for UrbanLens datasets.
"""

from typing import Any, Optional
import pandas as pd
from datetime import datetime, timezone

def generate_quality_report(
    dataset_name: str,
    raw_df: pd.DataFrame,
    valid_df: pd.DataFrame,
    warnings: list[str],
    duplicates_removed: int,
    data_status: Optional[str] = None,
) -> dict[str, Any]:
    """
    Generates a structured quality report summarizing dataset ingestion integrity,
    validation metrics, missing values, duplicates, and warnings.
    """
    raw_row_count = len(raw_df)
    valid_row_count = len(valid_df)
    rejected_count = max(0, raw_row_count - valid_row_count - duplicates_removed)

    missing_counts = {str(col): int(raw_df[col].isna().sum()) for col in raw_df.columns}

    # Date range analysis
    date_range: Optional[dict[str, str]] = None
    date_col = None
    for candidate in ["observation_date", "retrieved_at", "date"]:
        if candidate in valid_df.columns and not valid_df[candidate].dropna().empty:
            date_col = candidate
            break

    if date_col:
        valid_dates = pd.to_datetime(valid_df[date_col], errors="coerce").dropna()
        if not valid_dates.empty:
            date_range = {
                "min": valid_dates.min().strftime("%Y-%m-%d"),
                "max": valid_dates.max().strftime("%Y-%m-%d"),
            }

    # Geography unique values
    geographies: list[str] = []
    if "geography_name" in valid_df.columns:
        geographies = sorted([str(g) for g in valid_df["geography_name"].dropna().unique() if str(g).strip()])

    # Metric names
    metric_names: list[str] = []
    if "metric_name" in valid_df.columns:
        metric_names = sorted([str(m) for m in valid_df["metric_name"].dropna().unique() if str(m).strip()])
    elif "amenity_type" in valid_df.columns:
        metric_names = sorted([str(m) for m in valid_df["amenity_type"].dropna().unique() if str(m).strip()])

    # Determine data status
    status = data_status
    if not status:
        if "data_status" in valid_df.columns and not valid_df["data_status"].empty:
            status = str(valid_df["data_status"].iloc[0])
        elif "data_status" in raw_df.columns and not raw_df["data_status"].empty:
            status = str(raw_df["data_status"].iloc[0])
        else:
            status = "synthetic_test"

    return {
        "dataset_name": dataset_name,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "raw_row_count": raw_row_count,
        "valid_row_count": valid_row_count,
        "rejected_row_count": rejected_count,
        "duplicate_count": duplicates_removed,
        "missing_value_counts": missing_counts,
        "date_range": date_range,
        "geographies": geographies,
        "metric_names": metric_names,
        "warnings": sorted(list(set(warnings))),
        "data_status": status,
    }
