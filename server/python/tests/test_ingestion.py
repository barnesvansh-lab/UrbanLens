"""
Comprehensive ingestion test suite for UrbanLens data pipeline.
"""

import unittest
import tempfile
import os
import shutil
from pathlib import Path
import pandas as pd

from pipeline.ingest import ingest_dataset
from pipeline.validators import validate_hpi_csv, validate_amenities_csv, check_metric_type_consistency
from pipeline.normalizers import parse_observation_date, normalize_geography_name


class TestIngestionSuite(unittest.TestCase):
    def setUp(self):
        self.test_dir = tempfile.mkdtemp()
        self.fixtures_dir = Path(__file__).resolve().parent.parent / "data" / "fixtures"

    def tearDown(self):
        shutil.rmtree(self.test_dir, ignore_errors=True)

    def test_01_valid_hpi_fixture_ingestion(self):
        fixture_path = self.fixtures_dir / "test_hpi_fixture.csv"
        self.assertTrue(fixture_path.exists())

        report = ingest_dataset(
            csv_path=str(fixture_path),
            dataset_type="hpi",
            source_name="SYNTHETIC_TEST_DATA",
            source_url="https://example.com/test",
            data_status="synthetic_test",
            output_dir=self.test_dir,
        )

        self.assertIsInstance(report, dict)
        self.assertEqual(report["data_status"], "synthetic_test")
        self.assertGreater(report["valid_row_count"], 0)
        self.assertEqual(report["duplicate_count"], 1)  # intentional duplicate in fixture
        self.assertIn("Mumbai", report["geographies"])
        self.assertIn("Delhi", report["geographies"])

        # Check output files were written
        processed_files = list(Path(self.test_dir).glob("*.csv"))
        self.assertTrue(len(processed_files) > 0)

    def test_02_invalid_csv_missing_columns(self):
        invalid_csv = Path(self.test_dir) / "invalid_missing.csv"
        invalid_csv.write_text("observation_date,city_name\n2020-01-01,Mumbai\n")

        with self.assertRaises(ValueError) as ctx:
            ingest_dataset(
                csv_path=str(invalid_csv),
                dataset_type="hpi",
                source_name="TEST",
                source_url="https://test.com",
                data_status="synthetic_test",
                output_dir=self.test_dir,
            )
        self.assertIn("missing required columns", str(ctx.exception).lower())

    def test_03_invalid_date_format_warning_and_rejection(self):
        csv_file = Path(self.test_dir) / "invalid_date.csv"
        csv_file.write_text(
            "observation_date,geography_name,geography_level,metric_name,metric_value,unit,source_name\n"
            "2020-01-01,Mumbai,city,hpi_assessment,100.0,index_points,TEST\n"
            "invalid_date_string,Mumbai,city,hpi_assessment,102.0,index_points,TEST\n"
        )

        report = ingest_dataset(
            csv_path=str(csv_file),
            dataset_type="hpi",
            source_name="TEST",
            source_url="https://test.com",
            data_status="synthetic_test",
            output_dir=self.test_dir,
        )

        self.assertEqual(report["raw_row_count"], 2)
        self.assertEqual(report["valid_row_count"], 1)
        self.assertEqual(report["rejected_row_count"], 1)
        self.assertTrue(any("invalid date" in w.lower() for w in report["warnings"]))

    def test_04_invalid_metric_value_rejection(self):
        csv_file = Path(self.test_dir) / "invalid_metric.csv"
        csv_file.write_text(
            "observation_date,geography_name,geography_level,metric_name,metric_value,unit,source_name\n"
            "2020-01-01,Mumbai,city,hpi_assessment,100.0,index_points,TEST\n"
            "2020-04-01,Mumbai,city,hpi_assessment,NOT_A_NUMBER,index_points,TEST\n"
        )

        report = ingest_dataset(
            csv_path=str(csv_file),
            dataset_type="hpi",
            source_name="TEST",
            source_url="https://test.com",
            data_status="synthetic_test",
            output_dir=self.test_dir,
        )

        self.assertEqual(report["raw_row_count"], 2)
        self.assertEqual(report["valid_row_count"], 1)
        self.assertEqual(report["rejected_row_count"], 1)
        self.assertTrue(any("invalid metric value" in w.lower() for w in report["warnings"]))

    def test_05_duplicate_detection_and_removal(self):
        csv_file = Path(self.test_dir) / "duplicates.csv"
        csv_file.write_text(
            "observation_date,geography_name,geography_level,metric_name,metric_value,unit,source_name\n"
            "2020-01-01,Mumbai,city,hpi_assessment,100.0,index_points,TEST\n"
            "2020-01-01,Mumbai,city,hpi_assessment,100.0,index_points,TEST\n"
            "2020-04-01,Mumbai,city,hpi_assessment,102.0,index_points,TEST\n"
        )

        report = ingest_dataset(
            csv_path=str(csv_file),
            dataset_type="hpi",
            source_name="TEST",
            source_url="https://test.com",
            data_status="synthetic_test",
            output_dir=self.test_dir,
        )

        self.assertEqual(report["raw_row_count"], 3)
        self.assertEqual(report["duplicate_count"], 1)
        self.assertEqual(report["valid_row_count"], 2)

    def test_06_metric_type_consistency_warning(self):
        csv_file = Path(self.test_dir) / "mixed_metrics.csv"
        csv_file.write_text(
            "observation_date,geography_name,geography_level,metric_name,metric_value,unit,source_name\n"
            "2020-01-01,Mumbai,city,hpi_assessment,100.0,index_points,TEST\n"
            "2020-04-01,Mumbai,city,rupees_per_sqft,25000.0,inr_per_sqft,TEST\n"
        )

        report = ingest_dataset(
            csv_path=str(csv_file),
            dataset_type="hpi",
            source_name="TEST",
            source_url="https://test.com",
            data_status="synthetic_test",
            output_dir=self.test_dir,
        )

        self.assertTrue(any("never be mixed" in w.lower() or "conflated" in w.lower() for w in report["warnings"]))

    def test_07_quality_report_structure(self):
        fixture_path = self.fixtures_dir / "test_hpi_fixture.csv"
        report = ingest_dataset(
            csv_path=str(fixture_path),
            dataset_type="hpi",
            source_name="SYNTHETIC_TEST_DATA",
            source_url="https://example.com/test",
            data_status="synthetic_test",
            output_dir=self.test_dir,
        )

        keys = [
            "dataset_name",
            "generated_at",
            "raw_row_count",
            "valid_row_count",
            "rejected_row_count",
            "duplicate_count",
            "missing_value_counts",
            "date_range",
            "geographies",
            "metric_names",
            "warnings",
            "data_status",
        ]
        for k in keys:
            self.assertIn(k, report)

    def test_08_normalizer_indian_fy_quarter_to_iso(self):
        self.assertEqual(parse_observation_date("Q1 2021-22"), "2021-04-01")
        self.assertEqual(parse_observation_date("Q2 2021-22"), "2021-07-01")
        self.assertEqual(parse_observation_date("Q3 2021-22"), "2021-10-01")
        self.assertEqual(parse_observation_date("Q4 2021-22"), "2022-01-01")

    def test_09_geography_name_normalization(self):
        self.assertEqual(normalize_geography_name("bombay"), "Mumbai")
        self.assertEqual(normalize_geography_name("bangalore"), "Bengaluru")
        self.assertEqual(normalize_geography_name("poona"), "Pune")
        self.assertEqual(normalize_geography_name("new delhi"), "Delhi")

    def test_10_amenities_csv_validation(self):
        fixture_path = self.fixtures_dir / "test_amenities_fixture.csv"
        report = ingest_dataset(
            csv_path=str(fixture_path),
            dataset_type="amenities",
            source_name="SYNTHETIC_TEST_DATA",
            source_url="https://example.com/test",
            data_status="synthetic_test",
            output_dir=self.test_dir,
        )
        self.assertEqual(report["valid_row_count"], 4)
        self.assertEqual(report["duplicate_count"], 1)
        self.assertIn("school", report["metric_names"])
        self.assertIn("hospital", report["metric_names"])

    def test_11_empty_csv_handling(self):
        empty_csv = Path(self.test_dir) / "empty.csv"
        empty_csv.write_text("observation_date,geography_name,geography_level,metric_name,metric_value,unit,source_name\n")

        report = ingest_dataset(
            csv_path=str(empty_csv),
            dataset_type="hpi",
            source_name="TEST",
            source_url="https://test.com",
            data_status="synthetic_test",
            output_dir=self.test_dir,
        )
        self.assertEqual(report["raw_row_count"], 0)
        self.assertEqual(report["valid_row_count"], 0)
        self.assertTrue(any("0 rows" in w for w in report["warnings"]))


if __name__ == "__main__":
    unittest.main()
