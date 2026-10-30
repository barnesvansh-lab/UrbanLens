"""
geo_pipeline.py — Neighborhood Geospatial Analytics Pipeline (Milestone 5)

Since GeoPandas/Shapely are not installed, this module implements:
- Haversine distance calculation
- Bounding-box based region definitions for South Mumbai
- Point-in-region assignment for OSM amenities
- Amenity density calculations (per km²)
- Area summary JSON generation

Output: server/python/data/processed/neighborhood_analytics.json

Geographic scope: South Mumbai OSM bounding box [18.92, 72.80, 18.98, 72.85]
We define sub-regions within this box based on documented landmark boundaries.

IMPORTANT DATA INTEGRITY NOTES:
- All regions are approximate bounding boxes, NOT official ward boundaries.
- Densities are estimates, not official figures.
- No RBI city-level HPI is applied at region level.
- data_status for all computed analytics is 'real' (derived from real OSM data).
- The OSM snapshot is a single point in time (retrieved_at from raw data).
"""

import csv
import json
import math
import os
from datetime import datetime, timezone
from typing import Dict, List, Tuple, Any

# ── Paths ────────────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OSM_CSV = os.path.join(BASE_DIR, "data", "raw", "osm", "osm_mumbai_amenities.csv")
OUT_JSON = os.path.join(BASE_DIR, "data", "processed", "neighborhood_analytics.json")


# ── Haversine distance (km) ──────────────────────────────────────────────────
def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Great-circle distance between two geographic coordinates in kilometres."""
    R = 6371.0
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def bbox_area_km2(lat_min: float, lat_max: float, lon_min: float, lon_max: float) -> float:
    """
    Approximate area of a bounding box in km².
    Uses equirectangular approximation (acceptable for small extents < 1°).
    """
    mid_lat = (lat_min + lat_max) / 2
    height_km = haversine_km(lat_min, lon_min, lat_max, lon_min)
    width_km = haversine_km(mid_lat, lon_min, mid_lat, lon_max)
    return height_km * width_km


def point_in_bbox(lat: float, lon: float,
                  lat_min: float, lat_max: float,
                  lon_min: float, lon_max: float) -> bool:
    """Return True if (lat, lon) is strictly within the bounding box."""
    return lat_min <= lat <= lat_max and lon_min <= lon <= lon_max


# ── Sub-region definitions ────────────────────────────────────────────────────
# We divide the South Mumbai OSM bounding box [18.92, 72.80] → [18.98, 72.85]
# into 4 approximate sub-regions based on well-known landmark references.
# These are APPROXIMATE bounding boxes, NOT official MCGM ward boundaries.
# Documented provenance: manually derived from OSM + Google Maps landmark positions.
REGIONS = [
    {
        "id": "south-mumbai-colaba",
        "name": "Colaba & Cuffe Parade",
        "lat_min": 18.9000,
        "lat_max": 18.9350,
        "lon_min": 72.8050,
        "lon_max": 72.8400,
        "description": (
            "Southernmost tip of Mumbai peninsula. Historic district with Gateway of India, "
            "Colaba Causeway, and Cuffe Parade residential towers. "
            "Approximate bounding box; NOT an official ward boundary."
        ),
        "known_landmarks": ["Gateway of India", "Taj Hotel", "Cuffe Parade"],
    },
    {
        "id": "south-mumbai-fort",
        "name": "Fort & Marine Lines",
        "lat_min": 18.9350,
        "lat_max": 18.9600,
        "lon_min": 72.8200,
        "lon_max": 72.8450,
        "description": (
            "Fort business district and Marine Lines residential corridor. "
            "Home to stock exchange, courts, and colonial-era architecture. "
            "Approximate bounding box; NOT an official ward boundary."
        ),
        "known_landmarks": ["BSE", "Bombay High Court", "Marine Drive"],
    },
    {
        "id": "south-mumbai-malabar-hill",
        "name": "Malabar Hill & Walkeshwar",
        "lat_min": 18.9500,
        "lat_max": 18.9800,
        "lon_min": 72.8000,
        "lon_max": 72.8250,
        "description": (
            "Elevated residential enclave with some of Mumbai's highest-value properties. "
            "Includes Hanging Gardens and Banganga Tank. "
            "Approximate bounding box; NOT an official ward boundary."
        ),
        "known_landmarks": ["Hanging Gardens", "Banganga Tank", "Raj Bhavan"],
    },
    {
        "id": "south-mumbai-grant-road",
        "name": "Grant Road & Girgaon",
        "lat_min": 18.9550,
        "lat_max": 18.9800,
        "lon_min": 72.8250,
        "lon_max": 72.8500,
        "description": (
            "Mixed residential and commercial area with Grant Road station and Girgaon neighbourhoods. "
            "Dense lower-middle-income housing with active street markets. "
            "Approximate bounding box; NOT an official ward boundary."
        ),
        "known_landmarks": ["Grant Road Station", "Girgaon Chowpatty"],
    },
]


# ── Load OSM data ─────────────────────────────────────────────────────────────
def load_amenities(csv_path: str) -> List[Dict[str, Any]]:
    """Load and validate the OSM amenities CSV."""
    amenities = []
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"OSM amenities CSV not found: {csv_path}")

    with open(csv_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for i, row in enumerate(reader, start=2):  # line 2 is first data row
            try:
                lat = float(row["lat"])
                lon = float(row["lon"])
            except (ValueError, KeyError):
                continue  # skip malformed rows
            amenities.append({
                "lat": lat,
                "lon": lon,
                "amenity_type": row.get("amenity_type", "").strip(),
                "name": row.get("name", "").strip(),
                "geography_name": row.get("geography_name", "").strip(),
                "retrieved_at": row.get("retrieved_at", "").strip(),
                "source_name": row.get("source_name", "OSM").strip(),
                "data_status": row.get("data_status", "real").strip(),
            })
    return amenities


# ── Assignment and analytics ──────────────────────────────────────────────────
def assign_regions(amenities: List[Dict], regions: List[Dict]) -> Dict[str, List[Dict]]:
    """Assign each amenity to a sub-region. An amenity may belong to at most one region."""
    assignments: Dict[str, List[Dict]] = {r["id"]: [] for r in regions}
    unassigned: List[Dict] = []

    for am in amenities:
        assigned = False
        for region in regions:
            if point_in_bbox(
                am["lat"], am["lon"],
                region["lat_min"], region["lat_max"],
                region["lon_min"], region["lon_max"],
            ):
                assignments[region["id"]].append(am)
                assigned = True
                break  # first match wins (regions should be non-overlapping)
        if not assigned:
            unassigned.append(am)

    return assignments, unassigned


def category_summary(amenities: List[Dict]) -> Dict[str, int]:
    """Return per-category counts for a list of amenities."""
    counts: Dict[str, int] = {}
    for am in amenities:
        atype = am["amenity_type"] or "unknown"
        counts[atype] = counts.get(atype, 0) + 1
    return dict(sorted(counts.items()))


def nearest_per_category(
    center_lat: float,
    center_lon: float,
    amenities: List[Dict],
) -> Dict[str, float]:
    """
    For each amenity category present in the list, compute the distance (km)
    from the region centroid to the nearest facility of that type.
    """
    by_type: Dict[str, List[float]] = {}
    for am in amenities:
        atype = am["amenity_type"] or "unknown"
        dist = haversine_km(center_lat, center_lon, am["lat"], am["lon"])
        if atype not in by_type:
            by_type[atype] = []
        by_type[atype].append(dist)

    return {atype: round(min(dists), 4) for atype, dists in by_type.items()}


def count_within_radius(
    center_lat: float,
    center_lon: float,
    amenities: List[Dict],
    radius_km: float,
) -> int:
    """Count amenities within radius_km of the centroid."""
    return sum(
        1 for am in amenities
        if haversine_km(center_lat, center_lon, am["lat"], am["lon"]) <= radius_km
    )


# ── Main pipeline ─────────────────────────────────────────────────────────────
def run_pipeline() -> Dict[str, Any]:
    amenities = load_amenities(OSM_CSV)
    assignments, unassigned = assign_regions(amenities, REGIONS)

    # Determine OSM snapshot date from the data
    retrieved_dates = [a["retrieved_at"] for a in amenities if a["retrieved_at"]]
    osm_snapshot_date = retrieved_dates[0][:10] if retrieved_dates else "unknown"

    region_outputs = []
    for region in REGIONS:
        rid = region["id"]
        region_amenities = assignments[rid]
        area_km2 = round(
            bbox_area_km2(
                region["lat_min"], region["lat_max"],
                region["lon_min"], region["lon_max"],
            ),
            4,
        )
        centroid_lat = (region["lat_min"] + region["lat_max"]) / 2
        centroid_lon = (region["lon_min"] + region["lon_max"]) / 2
        n = len(region_amenities)
        density = round(n / area_km2, 2) if area_km2 > 0 else 0

        # All amenities for nearest distance calculation (region scope)
        nearest = nearest_per_category(centroid_lat, centroid_lon, region_amenities)
        within_500m = count_within_radius(centroid_lat, centroid_lon, region_amenities, 0.5)
        within_1km = count_within_radius(centroid_lat, centroid_lon, region_amenities, 1.0)

        region_outputs.append({
            "id": rid,
            "name": region["name"],
            "description": region["description"],
            "known_landmarks": region["known_landmarks"],
            "boundary_type": "approximate_bounding_box",
            "boundary_note": (
                "NOT an official MCGM ward boundary. Approximate bounding box "
                "derived from landmark references for research purposes only."
            ),
            "bbox": {
                "lat_min": region["lat_min"],
                "lat_max": region["lat_max"],
                "lon_min": region["lon_min"],
                "lon_max": region["lon_max"],
            },
            "centroid": {"lat": round(centroid_lat, 6), "lon": round(centroid_lon, 6)},
            "area_km2": area_km2,
            "total_amenities": n,
            "amenity_density_per_km2": density,
            "amenity_categories": category_summary(region_amenities),
            "nearest_facility_km": nearest,
            "within_500m_count": within_500m,
            "within_1km_count": within_1km,
            "data_status": "real",
            "data_source": "OpenStreetMap (Overpass API)",
            "osm_snapshot_date": osm_snapshot_date,
            "limitations": [
                "Single OSM snapshot; does not represent historical amenity growth.",
                "OSM amenity coverage is community-maintained and may be incomplete.",
                "Bounding box regions are NOT official administrative boundaries.",
                "City-level RBI HPI data is not applicable at this geographic level.",
            ],
        })

    total_assigned = sum(len(v) for v in assignments.values())
    output = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "pipeline_version": "1.0.0",
        "source": "OpenStreetMap via Overpass API",
        "osm_snapshot_date": osm_snapshot_date,
        "geographic_scope": "South Mumbai",
        "total_amenities_loaded": len(amenities),
        "total_amenities_assigned": total_assigned,
        "total_amenities_unassigned": len(unassigned),
        "boundary_methodology": "approximate_bounding_box",
        "boundary_warning": (
            "No official MCGM ward boundary GeoJSON is available programmatically. "
            "Approximate bounding boxes are used for research and demonstration purposes only."
        ),
        "data_status": "real",
        "regions": region_outputs,
        "limitations": [
            "OSM amenity data is a single-point-in-time snapshot; historical trends cannot be inferred.",
            "Bounding box approximations do NOT represent official Mumbai ward/ward-committee boundaries.",
            "Amenity density may be underestimated where OSM coverage is incomplete.",
            "No socioeconomic, demographic, or property-price data is included at neighborhood level.",
            "City-level RBI HPI must NOT be disaggregated to these sub-regions.",
        ],
    }
    return output


def main():
    print("[geo_pipeline] Starting neighborhood analytics pipeline...")
    result = run_pipeline()
    os.makedirs(os.path.dirname(OUT_JSON), exist_ok=True)
    with open(OUT_JSON, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2)
    print(f"[geo_pipeline] Written: {OUT_JSON}")
    print(f"  Regions: {len(result['regions'])}")
    for r in result["regions"]:
        print(f"  {r['name']}: {r['total_amenities']} amenities, {r['amenity_density_per_km2']} /km²")
    print(f"  Unassigned amenities: {result['total_amenities_unassigned']}")
    return result


if __name__ == "__main__":
    main()
