"""
Unit tests for pipeline validators and normalizers.
"""

import unittest
import pandas as pd
from pipeline.validators import (
    validate_hpi_csv,
    validate_amenities_csv,
    check_duplicates,
    check_date_range,
    check_metric_type_consistency,
)
from pipeline.normalizers import (
    parse_observation_date,
    normalize_geography_name,
    normalize_metric_value,
)


class TestNormalizers(unittest.TestCase):
    def test_parse_observation_date_fy_quarter(self):
        # Indian FY starts in April:
        # Q1 (Apr-Jun) -> 2020-04-01
        self.assertEqual(parse_observation_date("Q1 2020-21"), "2020-04-01")
        self.assertEqual(parse_observation_date("Q2 2020-21"), "2020-07-01")
        self.assertEqual(parse_observation_date("Q3 2020-21"), "2020-10-01")
        self.assertEqual(parse_observation_date("Q4 2020-21"), "2021-01-01")

    def test_parse_observation_date_month_ranges(self):
        self.assertEqual(parse_observation_date("Apr-Jun 2020"), "2020-04-01")
        self.assertEqual(parse_observation_date("Jul-Sep 2020"), "2020-07-01")
        self.assertEqual(parse_observation_date("Oct-Dec 2020"), "2020-10-01")
        self.assertEqual(parse_observation_date("Jan-Mar 2020"), "2020-01-01")

    def test_parse_observation_date_calendar_quarter(self):
        self.assertEqual(parse_observation_date("2020-Q1"), "2020-01-01")
        self.assertEqual(parse_observation_date("2020-Q2"), "2020-04-01")

    def test_parse_observation_date_iso(self):
        self.assertEqual(parse_observation_date("2020-01-01"), "2020-01-01")
        self.assertEqual(parse_observation_date("2023-11-15T10:00:00Z"), "2023-11-15")

    def test_parse_observation_date_invalid(self):
        with self.assertRaises(ValueError):
            parse_observation_date("invalid-date-string")
        with self.assertRaises(ValueError):
            parse_observation_date("")
        with self.assertRaises(ValueError):
            parse_observation_date(None)

    def test_normalize_geography_name(self):
        self.assertEqual(normalize_geography_name("bombay"), "Mumbai")
        self.assertEqual(normalize_geography_name("MUMBAI"), "Mumbai")
        self.assertEqual(normalize_geography_name("bangalore"), "Bengaluru")
        self.assertEqual(normalize_geography_name("bengaluru"), "Bengaluru")
        self.assertEqual(normalize_geography_name("new delhi"), "Delhi")
        self.assertEqual(normalize_geography_name("calcutta"), "Kolkata")
        self.assertEqual(normalize_geography_name("madras"), "Chennai")
        self.assertEqual(normalize_geography_name("poona"), "Pune")
        self.assertEqual(normalize_geography_name("  andheri west  "), "Andheri West")

    def test_normalize_metric_value(self):
        self.assertEqual(normalize_metric_value(100), 100.0)
        self.assertEqual(normalize_metric_value("105.5"), 105.5)
        self.assertEqual(normalize_metric_value(" 1,234.50 "), 1234.5)
        with self.assertRaises(ValueError):
            normalize_metric_value("abc")
        with self.assertRaises(ValueError):
            normalize_metric_value(None)
        with self.assertRaises(ValueError):
            normalize_metric_value(float("nan"))


class TestValidators(unittest.TestCase):
    def test_validate_hpi_missing_columns(self):
        invalid_df = pd.DataFrame({
            "observation_date": ["2020-01-01"],
            "geography_name": ["Mumbai"],
        })
        with self.assertRaises(ValueError) as ctx:
            validate_hpi_csv(invalid_df)
        self.assertIn("missing required columns", str(ctx.exception).lower())

    def test_validate_hpi_invalid_date_rejected(self):
        df = pd.DataFrame({
            "observation_date": ["2020-01-01", "not_a_date"],
            "geography_name": ["Mumbai", "Mumbai"],
            "geography_level": ["city", "city"],
            "metric_name": ["hpi_assessment", "hpi_assessment"],
            "metric_value": [100.0, 102.0],
            "unit": ["index_points", "index_points"],
            "source_name": ["RBI-HPI", "RBI-HPI"],
        })
        valid_df, warnings = validate_hpi_csv(df)
        self.assertEqual(len(valid_df), 1)
        self.assertTrue(any("invalid date" in w.lower() for w in warnings))

    def test_validate_hpi_invalid_metric_value_rejected(self):
        df = pd.DataFrame({
            "observation_date": ["2020-01-01", "2020-04-01"],
            "geography_name": ["Mumbai", "Mumbai"],
            "geography_level": ["city", "city"],
            "metric_name": ["hpi_assessment", "hpi_assessment"],
            "metric_value": [100.0, "NOT_A_NUMBER"],
            "unit": ["index_points", "index_points"],
            "source_name": ["RBI-HPI", "RBI-HPI"],
        })
        valid_df, warnings = validate_hpi_csv(df)
        self.assertEqual(len(valid_df), 1)
        self.assertTrue(any("invalid metric value" in w.lower() for w in warnings))

    def test_metric_type_consistency_warning(self):
        # Mixing dimensionless index points with ₹/sqft prices
        mixed_df = pd.DataFrame({
            "observation_date": ["2020-01-01", "2020-04-01"],
            "geography_name": ["Mumbai", "Mumbai"],
            "geography_level": ["city", "city"],
            "metric_name": ["hpi_assessment", "rupees_per_sqft"],
            "metric_value": [100.0, 25000.0],
            "unit": ["index_points", "inr_per_sqft"],
            "source_name": ["TEST", "TEST"],
        })
        warnings = check_metric_type_consistency(mixed_df)
        self.assertTrue(any("never be mixed" in w.lower() or "conflated" in w.lower() for w in warnings))

    def test_check_duplicates(self):
        df = pd.DataFrame({
            "observation_date": ["2020-01-01", "2020-01-01", "2020-04-01"],
            "geography_name": ["Mumbai", "Mumbai", "Mumbai"],
            "metric_name": ["hpi_assessment", "hpi_assessment", "hpi_assessment"],
            "metric_value": [100.0, 100.0, 102.0],
        })
        dedup_df, removed = check_duplicates(df, ["observation_date", "geography_name", "metric_name"])
        self.assertEqual(removed, 1)
        self.assertEqual(len(dedup_df), 2)

    def test_validate_amenities_valid_and_invalid(self):
        df = pd.DataFrame({
            "lat": [19.0760, "invalid_lat", 19.0800],
            "lon": [72.8777, 72.8800, 250.0],  # 250 is > 180
            "amenity_type": ["school", "hospital", "park"],
            "name": ["School A", "Hospital B", "Park C"],
            "geography_name": ["Mumbai", "Mumbai", "Mumbai"],
            "retrieved_at": ["2025-01-01T00:00:00Z"] * 3,
        })
        valid_df, warnings = validate_amenities_csv(df)
        self.assertEqual(len(valid_df), 1)  # only row 0 is valid
        self.assertEqual(valid_df.iloc[0]["name"], "School A")


if __name__ == "__main__":
    unittest.main()
