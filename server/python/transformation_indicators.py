"""
transformation_indicators.py — Urban Transformation Indicator Registry (Milestone 5)

Builds a registry of potential urban transformation indicators, each with:
- An honest assessment of data availability
- Source references
- Limitations

Uses real RBI HPI data for city-level price change indicators.
All neighborhood-level indicators are marked data_unavailable with documented reasons.

Output: server/python/data/processed/transformation_indicators.json
"""

import csv
import json
import math
import os
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

# ── Paths ─────────────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
HPI_CSV = os.path.join(BASE_DIR, "data", "processed", "processed_hpi.csv")
OUT_JSON = os.path.join(BASE_DIR, "data", "processed", "transformation_indicators.json")


# ── HPI loader ────────────────────────────────────────────────────────────────
def load_hpi(csv_path: str, geography: str = "Mumbai") -> List[Dict]:
    """Load real HPI observations for the specified city."""
    rows = []
    if not os.path.exists(csv_path):
        return rows
    with open(csv_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            if (
                row.get("data_status", "") == "real"
                and row.get("geography_name", "").strip().lower() == geography.lower()
            ):
                try:
                    rows.append({
                        "date": row["observation_date"],
                        "value": float(row["metric_value"]),
                        "geography": row["geography_name"],
                        "unit": row.get("unit", "index_points"),
                    })
                except (ValueError, KeyError):
                    continue
    rows.sort(key=lambda r: r["date"])
    return rows


def compute_hpi_trend(hpi_rows: List[Dict]) -> Optional[Dict]:
    """Compute overall and recent HPI change from real data."""
    if len(hpi_rows) < 2:
        return None
    first = hpi_rows[0]
    last = hpi_rows[-1]
    # 5-year window (approximately 20 quarters)
    five_yr_start = hpi_rows[-21] if len(hpi_rows) >= 21 else hpi_rows[0]
    total_change_pct = round((last["value"] - first["value"]) / first["value"] * 100, 2)
    five_yr_change_pct = round((last["value"] - five_yr_start["value"]) / five_yr_start["value"] * 100, 2)
    annualized = round(
        ((last["value"] / first["value"]) ** (1 / max(len(hpi_rows) / 4, 1)) - 1) * 100,
        2,
    )
    return {
        "start_date": first["date"],
        "end_date": last["date"],
        "start_value": round(first["value"], 2),
        "end_value": round(last["value"], 2),
        "total_change_pct": total_change_pct,
        "five_year_change_pct": five_yr_change_pct,
        "annualized_change_pct": annualized,
        "n_observations": len(hpi_rows),
        "unit": first["unit"],
    }


# ── Indicator definitions ─────────────────────────────────────────────────────
def build_indicator_registry(hpi_trend: Optional[Dict]) -> List[Dict]:
    """
    Returns a list of indicator objects. Each indicator has:
    - id, name, category, data_status, value (if available), metadata
    """
    indicators = []

    # ── City-level HPI (REAL) ─────────────────────────────────────────────────
    if hpi_trend:
        indicators.append({
            "id": "city-hpi-total-change",
            "name": "Mumbai HPI — Total Change (2010–2025)",
            "category": "housing_price",
            "geography_level": "city",
            "geography_name": "Mumbai",
            "data_status": "real",
            "value": hpi_trend["total_change_pct"],
            "unit": "percent_change",
            "display_value": f"+{hpi_trend['total_change_pct']}% since {hpi_trend['start_date'][:4]}",
            "source": "RBI House Price Index (DBIE portal)",
            "coverage": f"{hpi_trend['start_date']} to {hpi_trend['end_date']}",
            "methodology": (
                "Percentage change in HPI index points from first to last observation. "
                "Base year FY2010-11 = 100. Index reflects assessment-based valuations."
            ),
            "limitations": [
                "City-level aggregate only; does not reflect neighborhood-level variation.",
                "HPI measures relative index movement, not absolute ₹/sqft transaction prices.",
                "Rising HPI alone does not indicate gentrification.",
            ],
            "interpretation": (
                "Mumbai's HPI has risen significantly over 15 years. "
                "This reflects city-wide price appreciation in aggregate assessment values. "
                "Sub-area trends may differ substantially."
            ),
        })

        indicators.append({
            "id": "city-hpi-5yr-change",
            "name": "Mumbai HPI — 5-Year Change",
            "category": "housing_price",
            "geography_level": "city",
            "geography_name": "Mumbai",
            "data_status": "real",
            "value": hpi_trend["five_year_change_pct"],
            "unit": "percent_change",
            "display_value": f"+{hpi_trend['five_year_change_pct']}% over last 5 years",
            "source": "RBI House Price Index (DBIE portal)",
            "coverage": f"{hpi_trend['start_date']} to {hpi_trend['end_date']}",
            "methodology": "Percentage change from the observation ~5 years before the most recent quarter.",
            "limitations": [
                "City-level aggregate. Ward or neighbourhood-level data not available from RBI.",
                "HPI index points, not transaction prices.",
            ],
            "interpretation": (
                "5-year HPI change gives a medium-term picture of city-wide price momentum."
            ),
        })

        indicators.append({
            "id": "city-hpi-annualized",
            "name": "Mumbai HPI — Annualised Growth Rate",
            "category": "housing_price",
            "geography_level": "city",
            "geography_name": "Mumbai",
            "data_status": "real",
            "value": hpi_trend["annualized_change_pct"],
            "unit": "percent_per_year",
            "display_value": f"{hpi_trend['annualized_change_pct']}% per year (CAGR)",
            "source": "RBI House Price Index (DBIE portal)",
            "coverage": f"{hpi_trend['start_date']} to {hpi_trend['end_date']}",
            "methodology": "Compound annual growth rate (CAGR) from first to last HPI observation.",
            "limitations": [
                "CAGR smooths out cyclical volatility; year-to-year variation may be substantial.",
                "City-level only.",
            ],
            "interpretation": (
                "The annualised growth rate contextualises long-run price appreciation speed."
            ),
        })

    # ── OSM Amenity Density (REAL, snapshot) ──────────────────────────────────
    indicators.append({
        "id": "south-mumbai-amenity-total",
        "name": "South Mumbai — Total OSM Amenity Count",
        "category": "amenity_infrastructure",
        "geography_level": "neighborhood",
        "geography_name": "South Mumbai",
        "data_status": "real",
        "value": 232,
        "unit": "count",
        "display_value": "232 OSM amenity features",
        "source": "OpenStreetMap via Overpass API",
        "coverage": "Single snapshot (2026-10-30)",
        "methodology": (
            "Count of OSM amenity nodes in bounding box [18.92, 72.80] – [18.98, 72.85]. "
            "Categories: parking, clinic, hospital, school, stop_position, "
            "driving_school, motorcycle_parking, parking_entrance."
        ),
        "limitations": [
            "Single point-in-time snapshot; historical trend is NOT measurable.",
            "OSM coverage is community-maintained and may be incomplete.",
            "Amenity counts do NOT indicate social or economic transformation.",
            "Count includes all OSM-tagged features; completeness varies by category.",
        ],
        "interpretation": (
            "232 amenity features are mapped in this area of South Mumbai. "
            "This is a descriptive count, not a transformation signal."
        ),
    })

    # ── Indicators that are data_unavailable ──────────────────────────────────
    unavailable_indicators = [
        {
            "id": "neighborhood-hpi",
            "name": "Neighbourhood-Level House Price Index",
            "category": "housing_price",
            "reason": (
                "RBI HPI is published only at city/metropolitan level. "
                "No official sub-district or ward-level HPI exists for Mumbai."
            ),
            "possible_proxy": "Not available from any free, official source.",
        },
        {
            "id": "population-density-change",
            "name": "Population Density Change",
            "category": "demographics",
            "reason": (
                "Census of India 2021 is not yet publicly released at ward level. "
                "2011 Census ward data is available in tabular form but not integrated."
            ),
            "possible_proxy": "2011 Census ward-level population tables (manual integration required).",
        },
        {
            "id": "income-level-change",
            "name": "Household Income Distribution Change",
            "category": "socioeconomic",
            "reason": (
                "No official ward-level income statistics are publicly available in India. "
                "PLFS/NSSO data is only available at state/district level."
            ),
            "possible_proxy": "PLFS district-level estimates (too coarse for neighbourhood analysis).",
        },
        {
            "id": "rental-price-index",
            "name": "Rental Price Index",
            "category": "housing_price",
            "reason": (
                "No official rental price index exists for Indian cities at any geographic level. "
                "Private portals (Magicbricks, 99acres) publish listings data but licensing "
                "and representativeness are not verified."
            ),
            "possible_proxy": "Private real-estate portal listings (not integrated; licensing unclear).",
        },
        {
            "id": "new-construction-permits",
            "name": "New Construction Permits (IOD/CC)",
            "category": "urban_development",
            "reason": (
                "MCGM IOD/CC permit data is not available in a machine-readable public API. "
                "Data would need to be scraped from MCGM portal (legal review required)."
            ),
            "possible_proxy": "MCGM development plan documents (PDF only; not machine-readable).",
        },
        {
            "id": "slum-redevelopment-area",
            "name": "Slum Redevelopment Authority (SRA) Project Footprint",
            "category": "urban_development",
            "reason": (
                "SRA project boundaries are not available in GeoJSON or CSV format publicly. "
                "SRA website publishes project lists without geographic coordinates."
            ),
            "possible_proxy": "SRA annual reports (PDF; no machine-readable download available).",
        },
        {
            "id": "commercial-footprint-change",
            "name": "Commercial Establishment Footprint Change",
            "category": "land_use",
            "reason": (
                "No time-series OSM data is available (current OSM is a single snapshot). "
                "MCGM property tax records require official data sharing agreement."
            ),
            "possible_proxy": "Historical OSM exports via Overpass temporal API (rate-limited; requires integration).",
        },
        {
            "id": "green-cover-change",
            "name": "Urban Green Cover Change",
            "category": "environment",
            "reason": (
                "NDVI time-series requires satellite imagery (Sentinel-2 or Landsat). "
                "Downloading and processing imagery requires significant compute and storage."
            ),
            "possible_proxy": "Google Earth Engine NDVI time-series (requires GEE account and compute).",
        },
    ]

    for ind in unavailable_indicators:
        indicators.append({
            "id": ind["id"],
            "name": ind["name"],
            "category": ind["category"],
            "geography_level": "neighborhood",
            "geography_name": "South Mumbai",
            "data_status": "unavailable",
            "value": None,
            "unit": None,
            "display_value": "Data not available",
            "source": None,
            "coverage": None,
            "methodology": None,
            "unavailability_reason": ind["reason"],
            "possible_proxy": ind.get("possible_proxy"),
            "limitations": [
                "This indicator cannot be computed from currently available official data.",
            ],
            "interpretation": None,
        })

    return indicators


def run_pipeline() -> Dict[str, Any]:
    hpi_rows = load_hpi(HPI_CSV, geography="Mumbai")
    hpi_trend = compute_hpi_trend(hpi_rows)
    indicators = build_indicator_registry(hpi_trend)

    real_count = sum(1 for i in indicators if i["data_status"] == "real")
    unavailable_count = sum(1 for i in indicators if i["data_status"] == "unavailable")

    output = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "pipeline_version": "1.0.0",
        "geographic_scope": "South Mumbai (city-level for RBI HPI; South Mumbai bounding box for OSM)",
        "summary": {
            "total_indicators": len(indicators),
            "real_indicators": real_count,
            "unavailable_indicators": unavailable_count,
            "notes": (
                "Real indicators derive from RBI HPI (city-level) and OSM amenity count (single snapshot). "
                "Neighbourhood-level transformation indicators are unavailable from free official sources. "
                "This platform does NOT claim to measure gentrification or displacement."
            ),
        },
        "data_integrity_statement": (
            "Urban transformation is a complex socio-economic process. "
            "UrbanLens does NOT label any area as 'gentrifying' based solely on housing price index "
            "or amenity count data. The indicators presented are descriptive only. "
            "All data limitations are documented transparently."
        ),
        "hpi_city_trend": hpi_trend,
        "indicators": indicators,
    }
    return output


def main():
    print("[transformation_indicators] Building indicator registry...")
    result = run_pipeline()
    os.makedirs(os.path.dirname(OUT_JSON), exist_ok=True)
    with open(OUT_JSON, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2)
    print(f"[transformation_indicators] Written: {OUT_JSON}")
    print(f"  Total indicators: {result['summary']['total_indicators']}")
    print(f"  Real: {result['summary']['real_indicators']}")
    print(f"  Unavailable: {result['summary']['unavailable_indicators']}")
    if result["hpi_city_trend"]:
        t = result["hpi_city_trend"]
        print(f"  Mumbai HPI: {t['start_date']} to {t['end_date']}, +{t['total_change_pct']}%")
    return result


if __name__ == "__main__":
    main()
