"""
test_m6_transformation.py — Milestone 6 Transformation Engine Tests

Validates:
- Temporal rate calculations (QoQ, YoY, CAGR, Rolling Volatility)
- Anomaly detection (Rolling Z-score, IQR fences)
- Data sources audit and provenance matrix
- Indicator framework across 8 domains
- Evidence synthesis engine (INSUFFICIENT EVIDENCE verdict)
- Processed JSON artifact structure and integrity
"""

import json
import math
import os
import sys
import unittest

SRC_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if SRC_DIR not in sys.path:
    sys.path.insert(0, SRC_DIR)

from transformation.temporal_analysis import (
    compute_percentage_change,
    compute_cagr,
    compute_rolling_std,
    analyze_hpi_series,
)
from transformation.anomaly_detection import (
    compute_zscore,
    compute_iqr_thresholds,
    detect_anomalies,
)
from transformation.data_sources import (
    DATA_SOURCES_CATALOG,
    get_data_sources_summary,
)
from transformation.indicator_analysis import (
    build_comprehensive_indicator_framework,
)
from transformation.evidence_engine import (
    evaluate_transformation_evidence,
)
from transformation.normalization import (
    min_max_scale,
    z_score_standardize,
    robust_scale_iqr,
    validate_composite_normalization,
)
from transformation.compatibility import (
    evaluate_series_completeness,
    check_quarterly_continuity,
    validate_cross_dataset_compatibility,
)

DATA_DIR = os.path.join(SRC_DIR, "data", "processed")


class TestTemporalAnalysisMath(unittest.TestCase):
    """Unit tests for temporal percentage change, CAGR, and volatility formulas."""

    def test_percentage_change_positive(self):
        pct = compute_percentage_change(150.0, 100.0)
        self.assertEqual(pct, 50.0)

    def test_percentage_change_negative(self):
        pct = compute_percentage_change(80.0, 100.0)
        self.assertEqual(pct, -20.0)

    def test_percentage_change_zero_base(self):
        pct = compute_percentage_change(100.0, 0.0)
        self.assertIsNone(pct)

    def test_percentage_change_none_input(self):
        self.assertIsNone(compute_percentage_change(None, 100.0))
        self.assertIsNone(compute_percentage_change(100.0, None))

    def test_cagr_calculation(self):
        # 100 to 200 in 5 years: (2)**(0.2) - 1 ≈ 14.87%
        cagr = compute_cagr(100.0, 200.0, 5.0)
        self.assertAlmostEqual(cagr, 14.87, places=1)

    def test_cagr_zero_or_negative_years(self):
        self.assertIsNone(compute_cagr(100.0, 200.0, 0.0))
        self.assertIsNone(compute_cagr(100.0, 200.0, -2.0))

    def test_rolling_std_window(self):
        series = [2.0, 4.0, 4.0, 4.0, 5.0, 5.0, 7.0, 9.0]
        std = compute_rolling_std(series, window=4)
        self.assertEqual(len(std), 8)
        self.assertIsNone(std[0])
        self.assertIsNone(std[1])
        self.assertIsNone(std[2])
        self.assertIsNotNone(std[3])
        self.assertGreater(std[3], 0)

    def test_analyze_hpi_insufficient_data(self):
        res = analyze_hpi_series([{"date": "2020-01-01", "value": 100.0}])
        self.assertEqual(res["status"], "insufficient_data")

    def test_analyze_hpi_full_series(self):
        sample = [
            {"date": f"2020-0{q}-01", "value": 100.0 + (q * 5), "geography": "Mumbai"}
            for q in range(1, 9)
        ]
        res = analyze_hpi_series(sample)
        self.assertEqual(res["status"], "ok")
        self.assertIn("summary", res)
        self.assertEqual(res["summary"]["observation_count"], 8)
        self.assertGreater(res["summary"]["total_cumulative_change_pct"], 0)


class TestAnomalyDetectionMath(unittest.TestCase):
    """Unit tests for statistical anomaly detection methods."""

    def test_zscore_calculation(self):
        z = compute_zscore(15.0, 10.0, 2.5)
        self.assertEqual(z, 2.0)

    def test_zscore_zero_std(self):
        z = compute_zscore(10.0, 10.0, 0.0)
        self.assertIsNone(z)

    def test_iqr_thresholds(self):
        values = [1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0]
        res = compute_iqr_thresholds(values, multiplier=1.5)
        self.assertIn("q1", res)
        self.assertIn("median", res)
        self.assertIn("q3", res)
        self.assertIn("lower_bound", res)
        self.assertIn("upper_bound", res)
        self.assertLess(res["lower_bound"], res["q1"])
        self.assertGreater(res["upper_bound"], res["q3"])

    def test_detect_anomalies_insufficient_data(self):
        points = [{"date": "2020-01-01", "value": 100.0, "qoq_change_pct": 1.0}]
        res = detect_anomalies(points, window=8)
        self.assertEqual(res["status"], "insufficient_data")

    def test_detect_anomalies_with_spike(self):
        points = []
        for i in range(15):
            qoq = 1.5 if i != 12 else 12.0  # Spike at index 12
            points.append({
                "date": f"2020-Q{i+1}",
                "value": 100.0 + (i * 2),
                "qoq_change_pct": qoq,
            })
        res = detect_anomalies(points, z_threshold=2.0, window=8)
        self.assertEqual(res["status"], "ok")
        self.assertGreater(res["summary"]["total_anomalies_detected"], 0)
        # Verify caveat exists
        first_anom = res["anomalies"][0]
        self.assertIn("caveat", first_anom)
        self.assertIn("gentrification", first_anom["caveat"].lower())


class TestDataSourcesCatalog(unittest.TestCase):
    """Tests for the data source inventory and audit matrix."""

    def test_catalog_has_at_least_eight_sources(self):
        self.assertGreaterEqual(len(DATA_SOURCES_CATALOG), 8)

    def test_required_metadata_fields(self):
        required = {
            "id", "name", "publishing_organization", "source_url",
            "geographic_coverage", "geographic_level", "license",
            "status", "reliability_limitations", "suitable_for_historical_analysis"
        }
        for ds in DATA_SOURCES_CATALOG:
            for field in required:
                self.assertIn(field, ds, f"Source '{ds.get('id')}' missing '{field}'")

    def test_valid_statuses(self):
        valid = {"VERIFIED REAL DATA", "DOCUMENTED PROXY", "DATA UNAVAILABLE", "REQUIRES MANUAL VALIDATION"}
        for ds in DATA_SOURCES_CATALOG:
            self.assertIn(ds["status"], valid)

    def test_summary_counts_match(self):
        summary = get_data_sources_summary()
        self.assertEqual(summary["total_sources_investigated"], len(DATA_SOURCES_CATALOG))
        self.assertGreater(summary["status_breakdown"]["VERIFIED REAL DATA"], 0)
        self.assertGreater(summary["status_breakdown"]["DATA UNAVAILABLE"], 0)


class TestIndicatorFramework(unittest.TestCase):
    """Tests for the 16 multi-domain transformation indicators."""

    def setUp(self):
        sample_hpi = {
            "start_date": "2010-06-30",
            "end_date": "2025-03-31",
            "total_cumulative_change_pct": 370.39,
            "five_year_cagr_pct": 1.10,
            "annualized_cagr_pct": 10.87,
            "mean_quarterly_volatility": 2.45,
            "observation_count": 60,
        }
        self.indicators = build_comprehensive_indicator_framework(sample_hpi, None)

    def test_total_indicators_count(self):
        self.assertGreaterEqual(len(self.indicators), 12)

    def test_eight_domains_covered(self):
        categories = {i["category"] for i in self.indicators}
        expected = {"housing_market", "demographics", "infrastructure", "land_use_construction",
                    "affordability_displacement", "accessibility", "socioeconomic", "environment"}
        for exp in expected:
            self.assertIn(exp, categories, f"Missing category '{exp}' in framework")

    def test_real_indicators_have_values(self):
        real = [i for i in self.indicators if i.get("data_status") == "real" or i.get("status_label") == "VERIFIED REAL DATA"]
        self.assertGreater(len(real), 0)
        for ind in real:
            self.assertIsNotNone(ind["value"])
            self.assertIn("confidence", ind)

    def test_unavailable_indicators_have_reasons(self):
        unavail = [i for i in self.indicators if i.get("data_status") == "unavailable" or i.get("status_label") == "DATA UNAVAILABLE"]
        self.assertGreater(len(unavail), 0)
        for ind in unavail:
            self.assertIsNone(ind["value"])
            self.assertIn("unavailability_reason", ind)
            self.assertTrue(len(ind["unavailability_reason"]) > 10)


class TestEvidenceEngine(unittest.TestCase):
    """Tests for multi-indicator evidence sufficiency evaluation."""

    def setUp(self):
        sample_hpi = {
            "start_date": "2010-06-30",
            "end_date": "2025-03-31",
            "total_cumulative_change_pct": 370.39,
            "five_year_cagr_pct": 1.10,
            "mean_quarterly_volatility": 2.45,
            "regime_label": "Steady Market Growth",
        }
        indicators = build_comprehensive_indicator_framework(sample_hpi, None)
        self.evidence = evaluate_transformation_evidence(indicators, sample_hpi, None)

    def test_verdict_is_insufficient_evidence(self):
        self.assertEqual(self.evidence["overall_verdict"], "INSUFFICIENT EVIDENCE")

    def test_five_core_pillars_present(self):
        self.assertEqual(len(self.evidence["pillars"]), 5)

    def test_academic_mandate_included(self):
        self.assertIn("academic_mandate", self.evidence)
        self.assertIn("gentrification", self.evidence["academic_mandate"].lower())

    def test_demographics_pillar_marked_insufficient(self):
        demo_pillar = next(p for p in self.evidence["pillars"] if p["pillar_id"] == "demographics_socioeconomic")
        self.assertEqual(demo_pillar["sufficiency_status"], "INSUFFICIENT_EVIDENCE")


class TestProcessedJsonArtifacts(unittest.TestCase):
    """Validates on-disk JSON processed artifacts generated by run_transformation.py."""

    def test_trends_json_exists_and_valid(self):
        p = os.path.join(DATA_DIR, "transformation_trends.json")
        self.assertTrue(os.path.exists(p))
        with open(p, "r", encoding="utf-8") as f:
            d = json.load(f)
            self.assertEqual(d["status"], "ok")
            self.assertIn("summary", d)
            self.assertIn("points", d)

    def test_anomalies_json_exists_and_valid(self):
        p = os.path.join(DATA_DIR, "transformation_anomalies.json")
        self.assertTrue(os.path.exists(p))
        with open(p, "r", encoding="utf-8") as f:
            d = json.load(f)
            self.assertEqual(d["status"], "ok")
            self.assertIn("anomalies", d)

    def test_evidence_json_exists_and_valid(self):
        p = os.path.join(DATA_DIR, "transformation_evidence.json")
        self.assertTrue(os.path.exists(p))
        with open(p, "r", encoding="utf-8") as f:
            d = json.load(f)
            self.assertEqual(d["overall_verdict"], "INSUFFICIENT EVIDENCE")

    def test_quality_json_exists_and_valid(self):
        p = os.path.join(DATA_DIR, "transformation_quality.json")
        self.assertTrue(os.path.exists(p))
        with open(p, "r", encoding="utf-8") as f:
            d = json.load(f)
            self.assertIn("data_integrity_rules", d)

    def test_overview_json_exists_and_valid(self):
        p = os.path.join(DATA_DIR, "transformation_overview.json")
        self.assertTrue(os.path.exists(p))
        with open(p, "r", encoding="utf-8") as f:
            d = json.load(f)
            self.assertIn("hpi_summary", d)


class TestNormalization(unittest.TestCase):
    """Unit tests for mathematical normalization and compositing guards."""

    def test_min_max_scale_basic(self):
        vals = [10.0, 20.0, 30.0]
        scaled = min_max_scale(vals, 0.0, 1.0)
        self.assertEqual(scaled, [0.0, 0.5, 1.0])

    def test_min_max_scale_preserves_none(self):
        vals = [10.0, None, 30.0]
        scaled = min_max_scale(vals)
        self.assertEqual(scaled[0], 0.0)
        self.assertIsNone(scaled[1])
        self.assertEqual(scaled[2], 1.0)

    def test_min_max_scale_zero_variance(self):
        vals = [5.0, 5.0, 5.0]
        scaled = min_max_scale(vals, 0.0, 1.0)
        self.assertEqual(scaled, [0.5, 0.5, 0.5])

    def test_z_score_standardize(self):
        vals = [10.0, 20.0, 30.0]
        stdized = z_score_standardize(vals)
        self.assertAlmostEqual(stdized[1], 0.0, places=2)
        self.assertLess(stdized[0], 0.0)
        self.assertGreater(stdized[2], 0.0)

    def test_robust_scale_iqr(self):
        vals = [1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0]
        scaled = robust_scale_iqr(vals)
        self.assertEqual(len(scaled), 8)
        self.assertIsNotNone(scaled[0])

    def test_validate_composite_normalization_rejects_geo_mismatch(self):
        indicators = [
            {"id": "a", "geography_level": "city", "unit": "index_points", "value": 100},
            {"id": "b", "geography_level": "ward", "unit": "index_points", "value": 120},
        ]
        res = validate_composite_normalization(indicators)
        self.assertFalse(res["valid"])
        self.assertEqual(res["verdict"], "INVALID_COMPOSITE")

    def test_validate_composite_normalization_rejects_missing_values(self):
        indicators = [
            {"id": "a", "geography_level": "ward", "unit": "count", "value": 15},
            {"id": "b", "geography_level": "ward", "unit": "count", "value": None},
        ]
        res = validate_composite_normalization(indicators)
        self.assertFalse(res["valid"])
        self.assertEqual(res["verdict"], "INVALID_COMPOSITE")


class TestCompatibility(unittest.TestCase):
    """Unit tests for completeness, continuity, and cross-dataset compatibility."""

    def test_evaluate_series_completeness_sufficient(self):
        obs = [{"value": 10.0 + i} for i in range(12)]
        res = evaluate_series_completeness(obs)
        self.assertTrue(res["is_sufficient"])
        self.assertEqual(res["completeness_pct"], 100.0)

    def test_evaluate_series_completeness_insufficient(self):
        obs = [{"value": 10.0 if i < 3 else None} for i in range(10)]
        res = evaluate_series_completeness(obs)
        self.assertFalse(res["is_sufficient"])
        self.assertEqual(res["verdict"], "INSUFFICIENT")

    def test_check_quarterly_continuity_continuous(self):
        dates = ["2022-03-31", "2022-06-30", "2022-09-30", "2022-12-31"]
        res = check_quarterly_continuity(dates)
        self.assertTrue(res["is_continuous"])
        self.assertEqual(res["total_gaps"], 0)

    def test_check_quarterly_continuity_detects_gap(self):
        # Missing Q3 2022 (gap of ~183 days)
        dates = ["2022-03-31", "2022-06-30", "2022-12-31"]
        res = check_quarterly_continuity(dates)
        self.assertFalse(res["is_continuous"])
        self.assertEqual(res["total_gaps"], 1)

    def test_cross_dataset_compatibility_incompatible_spatial_scale(self):
        src_a = {"name": "City HPI", "geographic_level": "city", "cadence": "quarterly"}
        src_b = {"name": "Ward Amenity Density", "geographic_level": "ward", "cadence": "quarterly"}
        res = validate_cross_dataset_compatibility(src_a, src_b)
        self.assertFalse(res["is_compatible"])
        self.assertEqual(res["verdict"], "INCOMPATIBLE")
        self.assertTrue(any("ecological fallacy" in r.lower() for r in res["incompatibilities"]))

    def test_cross_dataset_compatibility_snapshot_vs_quarterly(self):
        src_a = {"name": "City HPI", "geographic_level": "city", "cadence": "quarterly"}
        src_b = {"name": "OSM Snapshot", "geographic_level": "city", "cadence": "static_snapshot"}
        res = validate_cross_dataset_compatibility(src_a, src_b)
        self.assertFalse(res["is_compatible"])
        self.assertEqual(res["verdict"], "INCOMPATIBLE")
        self.assertTrue(any("static snapshot" in r.lower() for r in res["incompatibilities"]))

    def test_cross_dataset_compatibility_aligned_series(self):
        src_a = {"name": "RBI HPI", "geographic_level": "city", "cadence": "quarterly", "unit": "index_points"}
        src_b = {"name": "NHB RESIDEX", "geographic_level": "city", "cadence": "quarterly", "unit": "index_points"}
        res = validate_cross_dataset_compatibility(src_a, src_b)
        self.assertTrue(res["is_compatible"])
        self.assertEqual(res["verdict"], "COMPATIBLE")


if __name__ == "__main__":
    unittest.main(verbosity=2)
