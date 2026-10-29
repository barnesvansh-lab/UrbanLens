"""
Main ingestion orchestrator for UrbanLens data pipeline.
"""

import os
import json
from pathlib import Path
from datetime import datetime, timezone
from typing import Any
import pandas as pd

from .validators import (
    validate_hpi_csv,
    validate_amenities_csv,
    check_duplicates,
)
from .quality import generate_quality_report


def ingest_dataset(
    csv_path: str,
    dataset_type: str,  # "hpi" | "amenities"
    source_name: str,
    source_url: str,
    data_status: str,   # "real" | "synthetic_test"
    output_dir: str,
) -> dict[str, Any]:
    """
    Ingests, validates, normalizes, deduplicates, and persists a dataset.
    Generates and saves the processed CSV and JSON manifest/quality report.
    
    Returns:
        Quality report dictionary.
    """
    csv_file = Path(csv_path)
    if not csv_file.exists():
        raise FileNotFoundError(f"Input CSV file not found: {csv_path}")

    # Read CSV (ignoring comments)
    try:
        raw_df = pd.read_csv(csv_path, comment="#", skipinitialspace=True)
    except pd.errors.EmptyDataError:
        raw_df = pd.DataFrame()

    warnings: list[str] = []

    # Ensure source_name, source_url, data_status are set in raw_df if not present
    if "source_name" not in raw_df.columns:
        raw_df["source_name"] = source_name
    if "source_url" not in raw_df.columns:
        raw_df["source_url"] = source_url
    if "data_status" not in raw_df.columns:
        raw_df["data_status"] = data_status
    if "retrieved_at" not in raw_df.columns:
        raw_df["retrieved_at"] = datetime.now(timezone.utc).isoformat()

    # Step 2: Validate & Normalize
    clean_type = dataset_type.strip().lower()
    if clean_type == "hpi":
        validated_df, val_warnings = validate_hpi_csv(raw_df)
        warnings.extend(val_warnings)
        key_cols = ["observation_date", "geography_name", "metric_name", "source_name"]
    elif clean_type == "amenities":
        validated_df, val_warnings = validate_amenities_csv(raw_df)
        warnings.extend(val_warnings)
        key_cols = ["lat", "lon", "amenity_type", "name", "geography_name"]
    else:
        raise ValueError(f"Unsupported dataset_type: '{dataset_type}'. Must be 'hpi' or 'amenities'.")

    # Step 3: Enforce metadata columns
    validated_df["source_name"] = source_name
    validated_df["source_url"] = source_url
    validated_df["data_status"] = data_status
    if "retrieved_at" not in validated_df.columns or validated_df["retrieved_at"].isna().all():
        validated_df["retrieved_at"] = datetime.now(timezone.utc).isoformat()

    # Step 4: Deduplicate
    dedup_df, duplicates_removed = check_duplicates(validated_df, key_cols)

    # Step 5: Save processed output
    out_path = Path(output_dir)
    out_path.mkdir(parents=True, exist_ok=True)

    dataset_name = f"{source_name.lower().replace(' ', '_').replace('-', '_')}_{clean_type}"
    processed_filename = f"processed_{dataset_name}.csv"
    processed_file_path = out_path / processed_filename
    dedup_df.to_csv(processed_file_path, index=False)

    # Also save standard name for the data service convenience
    standard_file_path = out_path / f"processed_{clean_type}.csv"
    dedup_df.to_csv(standard_file_path, index=False)

    # Step 6: Generate Quality Report
    report = generate_quality_report(
        dataset_name=dataset_name,
        raw_df=raw_df,
        valid_df=dedup_df,
        warnings=warnings,
        duplicates_removed=duplicates_removed,
        data_status=data_status,
    )

    # Step 7: Save Manifests and Quality Reports
    # Find manifests directory
    manifests_dir = out_path.parent / "manifests"
    manifests_dir.mkdir(parents=True, exist_ok=True)

    manifest_data = {
        "dataset_name": dataset_name,
        "dataset_type": clean_type,
        "source_name": source_name,
        "source_url": source_url,
        "data_status": data_status,
        "processed_file": str(processed_filename),
        "processed_at": datetime.now(timezone.utc).isoformat(),
        "record_count": len(dedup_df),
        "quality_report": report,
    }

    manifest_path = manifests_dir / f"{dataset_name}_manifest.json"
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest_data, f, indent=2)

    quality_path = manifests_dir / f"quality_{dataset_name}.json"
    with open(quality_path, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    return report
