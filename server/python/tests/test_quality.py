"""
Unit tests for quality report generation.
"""

import unittest
import pandas as pd
from pipeline.quality import generate_quality_report


class TestQualityReport(unittest.TestCase):
    def test_quality_report_structure(self):
        raw_df = pd.DataFrame({
            "observation_date": ["2020-01-01", "2020-04-01", "invalid_date", None],
            "geography_name": ["Mumbai", "Delhi", "Mumbai", "Mumbai"],
            "metric_name": ["hpi_assessment", "hpi_assessment", "hpi_assessment", "hpi_assessment"],
            "metric_value": [100.0, 102.0, 103.0, None],
        })

        valid_df = pd.DataFrame({
            "observation_date": ["2020-01-01", "2020-04-01"],
            "geography_name": ["Mumbai", "Delhi"],
            "metric_name": ["hpi_assessment", "hpi_assessment"],
            "metric_value": [100.0, 102.0],
            "data_status": ["synthetic_test", "synthetic_test"],
        })

        report = generate_quality_report(
            dataset_name="test_dataset",
            raw_df=raw_df,
            valid_df=valid_df,
            warnings=["Test warning 1", "Test warning 2"],
            duplicates_removed=1,
            data_status="synthetic_test",
        )

        expected_keys = [
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

        for k in expected_keys:
            self.assertIn(k, report)

        self.assertEqual(report["raw_row_count"], 4)
        self.assertEqual(report["valid_row_count"], 2)
        self.assertEqual(report["duplicate_count"], 1)
        self.assertEqual(report["rejected_row_count"], 1)
        self.assertEqual(report["geographies"], ["Delhi", "Mumbai"])
        self.assertEqual(report["date_range"], {"min": "2020-01-01", "max": "2020-04-01"})
        self.assertEqual(report["data_status"], "synthetic_test")
        self.assertEqual(len(report["warnings"]), 2)


if __name__ == "__main__":
    unittest.main()
