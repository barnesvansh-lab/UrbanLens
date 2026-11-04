"""
run_transformation.py — Master Transformation Pipeline Runner (Milestone 6)

Executes all transformation sub-modules and generates cached JSON outputs:
- transformation_trends.json
- transformation_anomalies.json
- transformation_evidence.json
- transformation_quality.json
- transformation_overview.json
"""

import csv
import json
import os
import sys
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional

# Ensure local imports work
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PYTHON_DIR = os.path.dirname(SCRIPT_DIR)
if PYTHON_DIR not in sys.path:
    sys.path.insert(0, PYTHON_DIR)
if SCRIPT_DIR not in sys.path:
    sys.path.insert(0, SCRIPT_DIR)

from transformation.data_sources import DATA_SOURCES_CATALOG, get_data_sources_summary
from transformation.temporal_analysis import analyze_hpi_series
from transformation.anomaly_detection import detect_anomalies
from transformation.indicator_analysis import build_comprehensive_indicator_framework
from transformation.evidence_engine import evaluate_transformation_evidence
from transformation.compatibility import (
    evaluate_series_completeness,
    check_quarterly_continuity,
    validate_cross_dataset_compatibility,
)

DATA_DIR = os.path.join(PYTHON_DIR, "data", "processed")
HPI_CSV = os.path.join(DATA_DIR, "processed_hpi.csv")
ANALYTICS_JSON = os.path.join(DATA_DIR, "neighborhood_analytics.json")


def load_mumbai_hpi_observations() -> List[Dict[str, Any]]:
    """Loads and sorts real Mumbai HPI observations from processed_hpi.csv."""
    observations = []
    if not os.path.exists(HPI_CSV):
        raise FileNotFoundError(f"processed_hpi.csv not found at {HPI_CSV}")

    with open(HPI_CSV, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            if (
                row.get("data_status") == "real"
                and row.get("geography_name", "").strip().lower() == "mumbai"
            ):
                try:
                    observations.append({
                        "date": row["observation_date"],
                        "value": float(row["metric_value"]),
                        "geography": row["geography_name"],
                        "geography_level": row.get("geography_level", "city"),
                        "unit": row.get("unit", "index_points"),
                    })
                except (ValueError, KeyError):
                    continue

    observations.sort(key=lambda x: x["date"])
    return observations


def load_neighborhood_analytics() -> Optional[Dict[str, Any]]:
    if not os.path.exists(ANALYTICS_JSON):
        return None
    try:
        with open(ANALYTICS_JSON, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"Warning: Failed to load neighborhood_analytics.json: {e}")
        return None


def run():
    print("[Milestone 6 Pipeline] Starting Urban Transformation Analysis Engine...")

    # 1. Load Data
    mumbai_hpi = load_mumbai_hpi_observations()
    print(f"  Loaded {len(mumbai_hpi)} real Mumbai HPI observations.")

    # 1b. Missing-Data & Cadence Validation
    hpi_completeness = evaluate_series_completeness(mumbai_hpi, expected_field="value")
    hpi_dates = [obs["date"] for obs in mumbai_hpi]
    hpi_continuity = check_quarterly_continuity(hpi_dates)
    print(f"  HPI Data Validation: {hpi_completeness['valid_records']}/{hpi_completeness['total_records']} valid "
          f"({hpi_completeness['completeness_pct']}%), continuous={hpi_continuity['is_continuous']}.")

    # Cross-dataset compatibility check (HPI vs OSM Amenities)
    hpi_meta = {"name": "RBI House Price Index", "geographic_level": "city", "cadence": "quarterly", "unit": "index_points"}
    osm_meta = {"name": "OpenStreetMap Amenities", "geographic_level": "sub-district", "cadence": "static_snapshot", "unit": "civic_feature_count"}
    hpi_osm_compat = validate_cross_dataset_compatibility(hpi_meta, osm_meta)

    neighborhood_data = load_neighborhood_analytics()
    if neighborhood_data:
        print(f"  Loaded neighborhood analytics ({len(neighborhood_data.get('regions', []))} sub-regions).")

    # 2. Temporal Analysis
    temporal_result = analyze_hpi_series(mumbai_hpi)
    temporal_summary = temporal_result.get("summary")
    print(f"  Temporal Analysis: 15-yr change: +{temporal_summary.get('total_cumulative_change_pct')}%, "
          f"5-yr CAGR: {temporal_summary.get('five_year_cagr_pct')}%.")

    # 3. Anomaly Detection
    anomalies_result = detect_anomalies(temporal_result.get("points", []))
    anom_summary = anomalies_result.get("summary")
    print(f"  Anomaly Detection: Detected {anom_summary.get('total_anomalies_detected')} unusual fluctuations.")

    # 4. Multi-Domain Indicators Framework
    indicators = build_comprehensive_indicator_framework(temporal_summary, neighborhood_data)
    verified_count = sum(1 for i in indicators if i.get("data_status") == "real" or i.get("status_label") == "VERIFIED REAL DATA")
    unavail_count = sum(1 for i in indicators if i.get("data_status") == "unavailable" or i.get("status_label") == "DATA UNAVAILABLE")
    proxy_count = sum(1 for i in indicators if i.get("data_status") == "proxy" or i.get("status_label") in ("DOCUMENTED PROXY", "REQUIRES MANUAL VALIDATION"))
    print(f"  Indicator Framework: Total {len(indicators)} indicators "
          f"({verified_count} verified, {unavail_count} unavailable, {proxy_count} proxy/manual).")

    # 5. Evidence Engine
    evidence_result = evaluate_transformation_evidence(indicators, temporal_summary, anom_summary)
    print(f"  Evidence Engine Verdict: {evidence_result.get('overall_verdict')}")

    # 6. Data Sources and Quality Summary
    sources_summary = get_data_sources_summary()

    quality_report = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "pipeline_version": "2.0.0",
        "data_audit": {
            "total_sources_evaluated": len(DATA_SOURCES_CATALOG),
            "verified_real_sources": sum(1 for s in DATA_SOURCES_CATALOG if s["status"] == "VERIFIED REAL DATA"),
            "data_unavailable_sources": sum(1 for s in DATA_SOURCES_CATALOG if s["status"] == "DATA UNAVAILABLE"),
            "documented_proxy_sources": sum(1 for s in DATA_SOURCES_CATALOG if s["status"] == "DOCUMENTED PROXY"),
            "requires_validation_sources": sum(1 for s in DATA_SOURCES_CATALOG if s["status"] == "REQUIRES MANUAL VALIDATION"),
        },
        "indicators_audit": {
            "total_indicators": len(indicators),
            "verified_real_count": verified_count,
            "data_unavailable_count": unavail_count,
            "proxy_count": proxy_count,
        },
        "series_validation": {
            "hpi_completeness": hpi_completeness,
            "hpi_continuity": hpi_continuity,
        },
        "compatibility_audit": {
            "hpi_vs_osm": hpi_osm_compat,
        },
        "data_integrity_rules": [
            "Never conflate city-level housing price rises with localized gentrification.",
            "Never convert city-level HPI into fictional ward-level prices.",
            "Never calculate historical civic expansion from a single-snapshot OpenStreetMap export.",
            "Never simulate demographic or socioeconomic shifts when Census 2021 is unreleased.",
            "Output INSUFFICIENT EVIDENCE when data fails rigorous sufficiency thresholds."
        ],
    }

    overview_payload = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "geographic_scope": "Mumbai Metropolitan Area & South Mumbai Sub-Regions",
        "hpi_summary": temporal_summary,
        "indicators_summary": quality_report["indicators_audit"],
        "sources_summary": quality_report["data_audit"],
        "evidence_summary": {
            "overall_verdict": evidence_result["overall_verdict"],
            "verdict_badge": evidence_result["verdict_badge"],
            "verdict_explanation": evidence_result["verdict_explanation"],
            "pillars_count": len(evidence_result["pillars"]),
        },
        "anomalies_summary": anom_summary,
    }

    # 7. Write Processed Artifacts
    artifacts = {
        "transformation_trends.json": temporal_result,
        "transformation_anomalies.json": anomalies_result,
        "transformation_evidence.json": evidence_result,
        "transformation_quality.json": quality_report,
        "transformation_overview.json": overview_payload,
        "transformation_indicators.json": {
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "pipeline_version": "2.0.0",
            "geographic_scope": "South Mumbai (city-level for RBI HPI; South Mumbai bounding box for OSM)",
            "summary": {
                "total_indicators": len(indicators),
                "real_indicators": verified_count,
                "unavailable_indicators": unavail_count,
                "notes": "Milestone 6 Enhanced Multi-Domain Transformation Framework.",
            },
            "data_integrity_statement": (
                "Urban transformation is a complex socio-economic process. UrbanLens does NOT label any area as "
                "'gentrifying' based solely on housing price index or amenity count data. The indicators presented are "
                "descriptive only. All data limitations are documented transparently."
            ),
            "hpi_city_trend": {
                "start_date": temporal_summary["start_date"],
                "end_date": temporal_summary["end_date"],
                "start_value": temporal_summary["start_value"],
                "end_value": temporal_summary["end_value"],
                "total_change_pct": temporal_summary["total_cumulative_change_pct"],
                "five_year_change_pct": temporal_summary["five_year_cagr_pct"],
                "annualized_change_pct": temporal_summary["annualized_cagr_pct"],
                "n_observations": temporal_summary["observation_count"],
                "unit": "index_points",
            },
            "indicators": indicators,
        },
    }

    for filename, payload in artifacts.items():
        out_path = os.path.join(DATA_DIR, filename)
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2)
        print(f"  Written: {out_path}")

    print("[Milestone 6 Pipeline] Execution completed successfully.")
    return artifacts


if __name__ == "__main__":
    run()
