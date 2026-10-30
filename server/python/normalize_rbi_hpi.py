#!/usr/bin/env python3
"""
UrbanLens — RBI HPI Raw Data Normalization Script

Reads the raw RBI HPI CSV downloaded from sharanya-singh/HPI-Analysis (derived from RBI DBIE),
filters out pre-2010 observations from the retired 2008-09=100 base series,
deduplicates overlapping quarters by selecting the 2010-11=100 base series (smaller value),
normalizes city names (Bangalore -> Bengaluru), and emits the standardized schema.
"""

from datetime import datetime, timezone
from pathlib import Path
import pandas as pd

CURRENT_DIR = Path(__file__).resolve().parent
RAW_DIR = CURRENT_DIR / "data" / "raw" / "rbi"
RAW_FILE = RAW_DIR / "rbi_hpi_raw.csv"
OUTPUT_FILE = RAW_DIR / "rbi_hpi_normalized.csv"


def normalize_rbi_hpi() -> pd.DataFrame:
    if not RAW_FILE.exists():
        raise FileNotFoundError(f"Raw RBI HPI file not found at {RAW_FILE}")

    # Read raw CSV
    df = pd.read_csv(RAW_FILE).dropna(subset=["date", "hpi"])

    # Filter out pre-2010 observations (older 2008-09=100 base series)
    df = df[df["date"] >= "2010-06-01"].copy()

    # Sort by (city, date, hpi ascending). For overlapping dates (2010 to 2013),
    # the 2010-11 base series has lower values (starts at ~100 in FY11 vs >140 for 2008-09 base).
    # Keeping the first occurrence after ascending sort selects the consistent 2010-11 base series.
    df = df.sort_values(["city", "date", "hpi"]).drop_duplicates(
        subset=["city", "date"], keep="first"
    )

    # Standardize city names
    df["city"] = df["city"].replace({"Bangalore": "Bengaluru"})

    # Map to UrbanLens Observation Schema
    now_iso = datetime.now(timezone.utc).isoformat()
    norm_df = pd.DataFrame(
        {
            "observation_date": df["date"].astype(str),
            "geography_name": df["city"].astype(str),
            "geography_level": "city",
            "metric_name": "hpi_assessment",
            "metric_value": df["hpi"].astype(float).round(4),
            "unit": "index_points",
            "source_name": "RBI-HPI",
            "source_url": "https://github.com/sharanya-singh/HPI-Analysis",
            "retrieved_at": now_iso,
            "data_status": "real",
            "index_base": "2010-11=100",
            "frequency": "quarterly",
        }
    )

    norm_df = norm_df.sort_values(["geography_name", "observation_date"]).reset_index(
        drop=True
    )

    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    norm_df.to_csv(OUTPUT_FILE, index=False)

    print("=" * 60)
    print("RBI HPI Normalization Complete")
    print("=" * 60)
    print(f"Total rows: {len(norm_df)}")
    print(f"Total cities: {norm_df['geography_name'].nunique()}")
    for geo, grp in norm_df.groupby("geography_name"):
        print(f"  - {geo:12s}: {len(grp)} obs ({grp['observation_date'].min()} to {grp['observation_date'].max()})")
    print(f"Saved normalized CSV to: {OUTPUT_FILE}")
    print("=" * 60)
    return norm_df


if __name__ == "__main__":
    normalize_rbi_hpi()
