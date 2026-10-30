"""
Validation logic for UrbanLens data pipeline.
"""

from typing import Any
import pandas as pd
from datetime import datetime, timezone
from .schema import (
    HPI_REQUIRED_COLUMNS,
    HPI_OPTIONAL_COLUMNS,
    AMENITIES_REQUIRED_COLUMNS,
    INDEX_METRICS,
    CURRENCY_METRICS,
)
from .normalizers import (
    parse_observation_date,
    normalize_geography_name,
    normalize_metric_value,
)

def check_duplicates(df: pd.DataFrame, key_cols: list[str]) -> tuple[pd.DataFrame, int]:
    """
    Identifies and removes duplicate records based on specified key columns.
    Returns (deduplicated_df, num_duplicates_removed).
    """
    if df.empty:
        return df.copy(), 0

    existing_cols = [c for c in key_cols if c in df.columns]
    if not existing_cols:
        return df.copy(), 0

    dups_mask = df.duplicated(subset=existing_cols, keep="first")
    num_duplicates = int(dups_mask.sum())
    dedup_df = df[~dups_mask].copy().reset_index(drop=True)
    return dedup_df, num_duplicates


def check_date_range(df: pd.DataFrame, date_col: str) -> list[str]:
    """
    Returns a list of warnings for temporal gaps, future dates, or ancient dates (<1990).
    """
    warnings: list[str] = []
    if df.empty or date_col not in df.columns:
        return warnings

    dates = pd.to_datetime(df[date_col], errors="coerce").dropna()
    if dates.empty:
        warnings.append(f"No valid dates could be parsed in column '{date_col}'")
        return warnings

    min_date = dates.min()
    max_date = dates.max()

    if min_date < pd.Timestamp("1990-01-01"):
        warnings.append(f"Dataset contains ancient observation date(s) prior to 1990: {min_date.strftime('%Y-%m-%d')}")

    current_year = datetime.now(timezone.utc).year
    max_allowed = pd.Timestamp(f"{current_year + 1}-12-31")
    if max_date > max_allowed:
        warnings.append(f"Dataset contains future observation date(s): {max_date.strftime('%Y-%m-%d')}")

    # Check for quarter gaps per geography if multiple dates exist
    if "geography_name" in df.columns:
        for geo, group in df.groupby("geography_name"):
            geo_dates = pd.to_datetime(group[date_col], errors="coerce").dropna().sort_values()
            if len(geo_dates) > 1:
                diffs = geo_dates.diff().dt.days
                max_gap = diffs.max()
                if max_gap > 185:  # Over 6 months gap in quarterly series
                    warnings.append(f"Significant temporal gap of {max_gap} days detected for geography '{geo}'")

    return warnings


def check_metric_type_consistency(df: pd.DataFrame) -> list[str]:
    """
    Validates that dimensionless index metrics (HPI) are never mixed with
    currency-denominated prices (e.g. ₹/sqft).
    """
    warnings: list[str] = []
    if df.empty:
        return warnings

    metrics_present = set(df["metric_name"].dropna().astype(str).str.lower().unique()) if "metric_name" in df.columns else set()
    units_present = set(df["unit"].dropna().astype(str).str.lower().unique()) if "unit" in df.columns else set()

    has_index = bool(metrics_present.intersection(INDEX_METRICS)) or any("index" in u for u in units_present)
    has_currency = bool(metrics_present.intersection(CURRENCY_METRICS)) or any(
        c in u for u in units_present for c in ["sqft", "inr", "rupee", "₹", "rs"]
    )

    if has_index and has_currency:
        warnings.append(
            "CRITICAL: Dataset mixes dimensionless index points ('hpi_assessment'/'hpi_market') "
            "with currency-denominated prices ('rupees_per_sqft'). "
            "HPI index values (base year=100) must never be mixed with ₹/sqft prices. "
            "These metrics must not be conflated."
        )

    # Unit mismatch warning
    for metric in metrics_present:
        if metric in INDEX_METRICS and any(c in u for u in units_present for c in ["sqft", "inr", "rupee", "₹", "rs"]):
            warnings.append(f"Metric '{metric}' is an index but has currency-denominated unit in: {units_present}")

    return warnings


def check_index_base_consistency(df: pd.DataFrame) -> list[str]:
    """
    Checks if multiple index_base values are present in an HPI dataset.
    Emits a warning if mixed index bases are detected (e.g. 2008-09=100 and 2010-11=100).
    """
    warnings: list[str] = []
    if df.empty or "index_base" not in df.columns:
        return warnings

    distinct_bases = [
        str(b).strip()
        for b in df["index_base"].dropna().unique()
        if str(b).strip()
    ]
    if len(set(distinct_bases)) > 1:
        warnings.append(
            f"WARNING: Multiple index bases detected in dataset: {sorted(list(set(distinct_bases)))}. "
            "Mixing index bases without rebasing will cause misleading price trends."
        )
    return warnings


def validate_hpi_csv(df: pd.DataFrame) -> tuple[pd.DataFrame, list[str]]:
    """
    Validates a Housing Price Index DataFrame.
    Expected columns: observation_date, geography_name, geography_level,
                      metric_name, metric_value, unit, source_name
    Returns: (valid_df, list_of_warnings)
    Raises: ValueError if required columns are missing
    """
    warnings: list[str] = []

    # Check required columns
    missing_cols = [col for col in HPI_REQUIRED_COLUMNS if col not in df.columns]
    if missing_cols:
        raise ValueError(f"HPI CSV missing required columns: {missing_cols}. Expected: {HPI_REQUIRED_COLUMNS}")

    if df.empty:
        warnings.append("HPI DataFrame contains 0 rows")
        return df.copy(), warnings

    valid_rows = []
    for idx, row in df.iterrows():
        # Validate observation_date
        try:
            iso_date = parse_observation_date(row["observation_date"])
        except ValueError as e:
            warnings.append(f"Row {idx}: Rejected invalid date '{row['observation_date']}': {e}")
            continue

        # Validate metric_value
        try:
            norm_val = normalize_metric_value(row["metric_value"])
        except ValueError as e:
            warnings.append(f"Row {idx}: Rejected invalid metric value '{row['metric_value']}': {e}")
            continue

        norm_geo = normalize_geography_name(row["geography_name"])
        if not norm_geo:
            warnings.append(f"Row {idx}: Rejected empty geography_name")
            continue

        row_dict = row.to_dict()
        row_dict["observation_date"] = iso_date
        row_dict["geography_name"] = norm_geo
        row_dict["metric_value"] = norm_val
        valid_rows.append(row_dict)

    if not valid_rows:
        warnings.append("All rows were rejected during HPI validation")
        valid_df = pd.DataFrame(columns=df.columns)
    else:
        valid_df = pd.DataFrame(valid_rows).reset_index(drop=True)

    # Metric type consistency check
    warnings.extend(check_metric_type_consistency(valid_df))

    # Index base consistency check
    warnings.extend(check_index_base_consistency(valid_df))

    # Date range warnings
    warnings.extend(check_date_range(valid_df, "observation_date"))

    return valid_df, warnings


def validate_amenities_csv(df: pd.DataFrame) -> tuple[pd.DataFrame, list[str]]:
    """
    Validates an amenities DataFrame.
    Expected columns: lat, lon, amenity_type, name, geography_name, retrieved_at
    Returns: (valid_df, list_of_warnings)
    Raises: ValueError if required columns are missing
    """
    warnings: list[str] = []

    missing_cols = [col for col in AMENITIES_REQUIRED_COLUMNS if col not in df.columns]
    if missing_cols:
        raise ValueError(
            f"Amenities CSV missing required columns: {missing_cols}. Expected: {AMENITIES_REQUIRED_COLUMNS}"
        )

    if df.empty:
        warnings.append("Amenities DataFrame contains 0 rows")
        return df.copy(), warnings

    valid_rows = []
    for idx, row in df.iterrows():
        # Validate latitude
        try:
            lat = float(row["lat"])
            if not (-90.0 <= lat <= 90.0):
                warnings.append(f"Row {idx}: Latitude {lat} out of range [-90, 90]")
                continue
        except (ValueError, TypeError):
            warnings.append(f"Row {idx}: Non-numeric latitude '{row['lat']}'")
            continue

        # Validate longitude
        try:
            lon = float(row["lon"])
            if not (-180.0 <= lon <= 180.0):
                warnings.append(f"Row {idx}: Longitude {lon} out of range [-180, 180]")
                continue
        except (ValueError, TypeError):
            warnings.append(f"Row {idx}: Non-numeric longitude '{row['lon']}'")
            continue

        amenity_type = str(row.get("amenity_type", "")).strip().lower()
        if not amenity_type:
            warnings.append(f"Row {idx}: Empty amenity_type")
            continue

        geo_name = normalize_geography_name(row.get("geography_name", ""))
        if not geo_name:
            warnings.append(f"Row {idx}: Empty geography_name")
            continue

        name = str(row.get("name", "")).strip() or "Unnamed Facility"

        row_dict = row.to_dict()
        row_dict["lat"] = lat
        row_dict["lon"] = lon
        row_dict["amenity_type"] = amenity_type
        row_dict["name"] = name
        row_dict["geography_name"] = geo_name
        valid_rows.append(row_dict)

    if not valid_rows:
        warnings.append("All rows were rejected during Amenities validation")
        valid_df = pd.DataFrame(columns=df.columns)
    else:
        valid_df = pd.DataFrame(valid_rows).reset_index(drop=True)

    return valid_df, warnings
