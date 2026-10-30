"""
data_sources.py — Data Source Audit and Provenance Matrix (Milestone 6)

Documents every investigated Indian urban dataset, including publisher, URL,
geographic resolution, temporal coverage, license, format, and reliability limitations.
"""

from typing import Dict, List, Any


DATA_SOURCES_CATALOG: List[Dict[str, Any]] = [
    {
        "id": "rbi-hpi-mumbai",
        "name": "Reserve Bank of India House Price Index (Mumbai)",
        "publishing_organization": "Reserve Bank of India (RBI)",
        "source_url": "https://dbie.rbihub.in",
        "geographic_coverage": "Mumbai Metropolitan Area (City level)",
        "geographic_level": "city",
        "temporal_coverage": {
            "start": "2010-06-30",
            "end": "2025-03-31"
        },
        "observation_count": 60,
        "frequency": "Quarterly",
        "unit": "index_points (Base FY2010-11 = 100)",
        "data_format": "CSV (Normalized from DBIE export)",
        "license": "Government of India Open Data License (OGDL-India)",
        "reuse_restrictions": "Attribution to RBI required; non-commercial / commercial reuse permitted with attribution.",
        "status": "VERIFIED REAL DATA",
        "missing_values_count": 0,
        "reliability_limitations": [
            "Official transaction registration assessment values; not real-time listing prices.",
            "Metropolitan city-level aggregate only; sub-district and ward disaggregation is unavailable.",
            "Dimensionless index tracking relative price trajectory, not absolute INR/sqft valuation."
        ],
        "suitable_for_historical_analysis": True,
        "integrated_in_pipeline": True,
    },
    {
        "id": "rbi-hpi-all-india",
        "name": "Reserve Bank of India House Price Index (All India + 9 Cities)",
        "publishing_organization": "Reserve Bank of India (RBI)",
        "source_url": "https://dbie.rbihub.in",
        "geographic_coverage": "All India, Delhi, Bengaluru, Chennai, Kolkata, Ahmedabad, Jaipur, Kanpur, Lucknow",
        "geographic_level": "city",
        "temporal_coverage": {
            "start": "2010-06-30",
            "end": "2025-03-31"
        },
        "observation_count": 540,
        "frequency": "Quarterly",
        "unit": "index_points (Base FY2010-11 = 100)",
        "data_format": "CSV",
        "license": "Government of India Open Data License (OGDL-India)",
        "reuse_restrictions": "Attribution required.",
        "status": "VERIFIED REAL DATA",
        "missing_values_count": 0,
        "reliability_limitations": [
            "City-level aggregate only.",
            "Captures registered sales; under-construction properties have lag."
        ],
        "suitable_for_historical_analysis": True,
        "integrated_in_pipeline": True,
    },
    {
        "id": "osm-south-mumbai",
        "name": "OpenStreetMap Civic Infrastructure (South Mumbai)",
        "publishing_organization": "OpenStreetMap Foundation (Contributors)",
        "source_url": "https://www.openstreetmap.org",
        "geographic_coverage": "South Mumbai Peninsula Bounding Box [18.92, 72.80] to [18.98, 72.85]",
        "geographic_level": "neighborhood",
        "temporal_coverage": {
            "start": "2026-10-30",
            "end": "2026-10-30"
        },
        "observation_count": 232,
        "frequency": "Point-in-time Snapshot",
        "unit": "geospatial_point_nodes",
        "data_format": "CSV / GeoJSON via Overpass API",
        "license": "Open Data Commons Open Database License (ODbL)",
        "reuse_restrictions": "Attribution '© OpenStreetMap contributors' required; Share-Alike provisions apply.",
        "status": "VERIFIED REAL DATA",
        "missing_values_count": 0,
        "reliability_limitations": [
            "Single point-in-time snapshot; CANNOT be used to measure historical civic growth.",
            "Crowdsourced coverage density varies across commercial vs residential enclaves.",
            "Parking features dominate contributor mappings in Fort and commercial strips."
        ],
        "suitable_for_historical_analysis": False,
        "integrated_in_pipeline": True,
    },
    {
        "id": "south-mumbai-bounding-boxes",
        "name": "South Mumbai Research Sub-Region Extents",
        "publishing_organization": "UrbanLens Research Project",
        "source_url": "https://urbanlens.local/research/boundaries",
        "geographic_coverage": "Colaba, Fort, Malabar Hill, Grant Road",
        "geographic_level": "neighborhood",
        "temporal_coverage": None,
        "observation_count": 4,
        "frequency": "Static Definition",
        "unit": "geojson_polygon_extents",
        "data_format": "GeoJSON FeatureCollection",
        "license": "MIT (Project Research Definition)",
        "reuse_restrictions": "Academic and educational use only.",
        "status": "DOCUMENTED PROXY",
        "missing_values_count": 0,
        "reliability_limitations": [
            "Approximate bounding boxes derived from landmark references for research.",
            "NOT official MCGM administrative ward boundaries (A Ward, D Ward, etc.).",
            "Serves solely to anchor spatial density calculations within South Mumbai."
        ],
        "suitable_for_historical_analysis": False,
        "integrated_in_pipeline": True,
    },
    {
        "id": "census-2021-mumbai-wards",
        "name": "Census of India 2021 — Municipal Ward Socioeconomics",
        "publishing_organization": "Office of the Registrar General & Census Commissioner, India",
        "source_url": "https://censusindia.gov.in",
        "geographic_coverage": "Greater Mumbai Municipal Wards",
        "geographic_level": "ward",
        "temporal_coverage": None,
        "observation_count": 0,
        "frequency": "Decennial",
        "unit": "population_households_literacy",
        "data_format": "Unreleased",
        "license": "Official Statistics",
        "reuse_restrictions": "N/A",
        "status": "DATA UNAVAILABLE",
        "missing_values_count": 0,
        "reliability_limitations": [
            "2021 Census of India field enumeration was postponed and ward-level data remains unreleased.",
            "2011 Census tables are 15 years old and do not reflect current demographics.",
            "Simulating ward-level demographics would violate ethical research standards."
        ],
        "suitable_for_historical_analysis": False,
        "integrated_in_pipeline": False,
    },
    {
        "id": "mcgm-building-permits",
        "name": "MCGM AutoDCR Building Permits (IOD / CC Approvals)",
        "publishing_organization": "Municipal Corporation of Greater Mumbai (MCGM)",
        "source_url": "https://autodcr.mcgm.gov.in",
        "geographic_coverage": "Mumbai Municipal Wards",
        "geographic_level": "ward",
        "temporal_coverage": None,
        "observation_count": 0,
        "frequency": "Continuous",
        "unit": "permit_counts_built_up_area",
        "data_format": "Proprietary Portal / PDF",
        "license": "Restricted Municipal Access",
        "reuse_restrictions": "No open programmatic API license.",
        "status": "DATA UNAVAILABLE",
        "missing_values_count": 0,
        "reliability_limitations": [
            "No public REST API exists; data is behind authenticated architect portals.",
            "Scraping without formal institutional agreement presents legal and reliability barriers."
        ],
        "suitable_for_historical_analysis": False,
        "integrated_in_pipeline": False,
    },
    {
        "id": "sra-redevelopment-gis",
        "name": "Slum Redevelopment Authority (SRA) GIS Project Footprints",
        "publishing_organization": "Slum Redevelopment Authority, Maharashtra",
        "source_url": "https://sra.gov.in",
        "geographic_coverage": "Mumbai Metropolitan Region",
        "geographic_level": "project_cluster",
        "temporal_coverage": None,
        "observation_count": 0,
        "frequency": "Irregular",
        "unit": "redevelopment_polygons",
        "data_format": "PDF / Scanned Schematics",
        "license": "Government of Maharashtra Public Notices",
        "reuse_restrictions": "Non-georeferenced documents.",
        "status": "DATA UNAVAILABLE",
        "missing_values_count": 0,
        "reliability_limitations": [
            "Maps are published as non-vector PDF scans without spatial projection coordinates.",
            "Georeferencing requires manual boundary digitization and validation."
        ],
        "suitable_for_historical_analysis": False,
        "integrated_in_pipeline": False,
    },
    {
        "id": "official-rental-index",
        "name": "National / Municipal Residential Rental Price Index",
        "publishing_organization": "Ministry of Housing and Urban Affairs (MoHUA) / NHB",
        "source_url": "https://mohua.gov.in",
        "geographic_coverage": "Indian Tier-1 Cities",
        "geographic_level": "city",
        "temporal_coverage": None,
        "observation_count": 0,
        "frequency": "None",
        "unit": "rental_index_points",
        "data_format": "Non-existent",
        "license": "N/A",
        "reuse_restrictions": "N/A",
        "status": "DATA UNAVAILABLE",
        "missing_values_count": 0,
        "reliability_limitations": [
            "Neither RBI nor National Housing Bank (NHB) publishes an official residential rental index.",
            "Private commercial portals (Magicbricks, 99acres) feature unverified listings with heavy self-selection bias."
        ],
        "suitable_for_historical_analysis": False,
        "integrated_in_pipeline": False,
    },
    {
        "id": "satellite-ndvi-canopy",
        "name": "Satellite Multispectral Urban Canopy (Sentinel-2 / Landsat)",
        "publishing_organization": "European Space Agency (ESA) / USGS",
        "source_url": "https://sentinels.copernicus.eu",
        "geographic_coverage": "South Mumbai Peninsula",
        "geographic_level": "raster_10m",
        "temporal_coverage": {
            "start": "2018-01-01",
            "end": "2025-01-01"
        },
        "observation_count": 0,
        "frequency": "5-day revisit (raw)",
        "unit": "ndvi_ratio (-1.0 to +1.0)",
        "data_format": "GeoTIFF",
        "license": "Copernicus Open Access / Public Domain",
        "reuse_restrictions": "Open access with attribution.",
        "status": "REQUIRES MANUAL VALIDATION",
        "missing_values_count": 0,
        "reliability_limitations": [
            "Heavy monsoon cloud cover (June–September) causes severe data voids.",
            "Multi-gigabyte raster image processing exceeds local 8 GB RAM offline constraints."
        ],
        "suitable_for_historical_analysis": True,
        "integrated_in_pipeline": False,
    }
]


def get_data_sources_summary() -> Dict[str, Any]:
    """Return summary statistics of all investigated data sources."""
    status_counts = {}
    for ds in DATA_SOURCES_CATALOG:
        st = ds["status"]
        status_counts[st] = status_counts.get(st, 0) + 1

    return {
        "total_sources_investigated": len(DATA_SOURCES_CATALOG),
        "status_breakdown": status_counts,
        "sources": DATA_SOURCES_CATALOG,
    }
