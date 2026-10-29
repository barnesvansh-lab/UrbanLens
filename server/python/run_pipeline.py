#!/usr/bin/env python3
"""
UrbanLens Data Ingestion Pipeline — CLI Entry Point

Usage:
    python run_pipeline.py --dataset hpi --file data/raw/rbi_hpi.csv --source-name RBI-HPI --source-url https://data.rbi.org.in --status real
    python run_pipeline.py --dataset amenities --file data/raw/osm_mumbai.csv --source-name OSM --source-url https://www.openstreetmap.org --status real
    python run_pipeline.py --test   # Run with synthetic fixture data
"""

import sys
import os
import argparse
import json
from pathlib import Path

# Add current directory to path so pipeline package can be imported
CURRENT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(CURRENT_DIR))

from pipeline.ingest import ingest_dataset


def run_test_suite() -> int:
    """Runs ingestion on synthetic test fixtures and displays results."""
    print("=" * 70)
    print("URBANLENS DATA PIPELINE — RUNNING WITH SYNTHETIC TEST FIXTURES")
    print("=" * 70)

    fixtures_dir = CURRENT_DIR / "data" / "fixtures"
    processed_dir = CURRENT_DIR / "data" / "processed"

    hpi_fixture = fixtures_dir / "test_hpi_fixture.csv"
    amenities_fixture = fixtures_dir / "test_amenities_fixture.csv"

    if not hpi_fixture.exists():
        print(f"Error: Fixture file not found: {hpi_fixture}")
        return 1

    if not amenities_fixture.exists():
        print(f"Error: Fixture file not found: {amenities_fixture}")
        return 1

    print("\n[1/2] Ingesting HPI synthetic fixture...")
    hpi_report = ingest_dataset(
        csv_path=str(hpi_fixture),
        dataset_type="hpi",
        source_name="SYNTHETIC_TEST_DATA",
        source_url="https://example.com/test",
        data_status="synthetic_test",
        output_dir=str(processed_dir),
    )
    print(f"  -> Valid records: {hpi_report['valid_row_count']}")
    print(f"  -> Duplicates removed: {hpi_report['duplicate_count']}")
    print(f"  -> Geographies: {', '.join(hpi_report['geographies'])}")
    print(f"  -> Date range: {hpi_report['date_range']}")
    if hpi_report["warnings"]:
        print(f"  -> Warnings: {len(hpi_report['warnings'])}")
        for w in hpi_report["warnings"]:
            print(f"     * {w}")

    print("\n[2/2] Ingesting Amenities synthetic fixture...")
    amenities_report = ingest_dataset(
        csv_path=str(amenities_fixture),
        dataset_type="amenities",
        source_name="SYNTHETIC_TEST_DATA",
        source_url="https://example.com/test",
        data_status="synthetic_test",
        output_dir=str(processed_dir),
    )
    print(f"  -> Valid records: {amenities_report['valid_row_count']}")
    print(f"  -> Duplicates removed: {amenities_report['duplicate_count']}")
    print(f"  -> Facility types: {', '.join(amenities_report['metric_names'])}")
    if amenities_report["warnings"]:
        print(f"  -> Warnings: {len(amenities_report['warnings'])}")
        for w in amenities_report["warnings"]:
            print(f"     * {w}")

    print("\n" + "=" * 70)
    print("SYNTHETIC TEST INGESTION COMPLETED SUCCESSFULLY")
    print(f"Output files saved to: {processed_dir}")
    print("=" * 70)
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="UrbanLens Data Ingestion Pipeline CLI")
    parser.add_argument("--test", action="store_true", help="Run with synthetic fixture data")
    parser.add_argument("--dataset", choices=["hpi", "amenities"], help="Type of dataset (hpi or amenities)")
    parser.add_argument("--file", help="Path to input CSV file")
    parser.add_argument("--source-name", help="Identifier for data source (e.g. RBI-HPI, NHB-RESIDEX, OSM)")
    parser.add_argument("--source-url", default="", help="Origin URL of the source dataset")
    parser.add_argument("--status", choices=["real", "synthetic_test"], default="real", help="Data status label")
    parser.add_argument("--output-dir", default=str(CURRENT_DIR / "data" / "processed"), help="Output directory")

    args = parser.parse_args()

    if args.test:
        return run_test_suite()

    if not args.dataset or not args.file or not args.source_name:
        parser.print_help()
        print("\nError: --dataset, --file, and --source-name are required when not running --test.")
        return 1

    try:
        print(f"Ingesting {args.dataset} dataset from {args.file}...")
        report = ingest_dataset(
            csv_path=args.file,
            dataset_type=args.dataset,
            source_name=args.source_name,
            source_url=args.source_url,
            data_status=args.status,
            output_dir=args.output_dir,
        )
        print("\nIngestion Quality Report:")
        print(json.dumps(report, indent=2))
        return 0
    except Exception as e:
        print(f"\nPipeline Ingestion Error: {e}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
