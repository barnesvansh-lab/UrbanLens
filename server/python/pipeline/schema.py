"""
Schema definitions and constants for UrbanLens data ingestion pipeline.

IMPORTANT SCHEMA PRINCIPLE:
Housing Price Index (HPI) values are dimensionless index points (normalized to a base year, e.g. 100),
and must NEVER be mixed or conflated with currency-denominated prices (e.g. ₹/sqft).
HPI values must always have unit='index_points' and metric_name in ('hpi_assessment', 'hpi_market').
"""

from typing import TypedDict, Literal, Optional

DataStatus = Literal["real", "synthetic_test", "unavailable"]
GeographyLevel = Literal["city", "district", "neighborhood"]

OBSERVATION_SCHEMA = {
    "observation_date": "YYYY-MM-DD (first day of quarter/month)",
    "geography_name": "City or neighborhood name",
    "geography_level": "city | district | neighborhood",
    "metric_name": "hpi_assessment | hpi_market | amenity_count",
    "metric_value": "float",
    "unit": "index_points | count | percentage",
    "source_name": "RBI-HPI | NHB-RESIDEX | OSM | SYNTHETIC_TEST_DATA",
    "source_url": "URL string",
    "retrieved_at": "ISO timestamp of data retrieval",
    "data_status": "real | synthetic_test | unavailable",
    "index_base": "optional string (e.g. 2010-11=100)",
    "frequency": "optional string (e.g. quarterly, monthly, annual)",
}

AMENITIES_SCHEMA = {
    "lat": "float (-90.0 to 90.0)",
    "lon": "float (-180.0 to 180.0)",
    "amenity_type": "string (school | hospital | park | clinic | public_transport)",
    "name": "string (name of amenity / POI)",
    "geography_name": "string (city or neighborhood name)",
    "retrieved_at": "ISO timestamp of data retrieval",
    "source_name": "string (OSM | SYNTHETIC_TEST_DATA)",
    "data_status": "real | synthetic_test | unavailable",
}

HPI_REQUIRED_COLUMNS = [
    "observation_date",
    "geography_name",
    "geography_level",
    "metric_name",
    "metric_value",
    "unit",
    "source_name",
]

HPI_OPTIONAL_COLUMNS = [
    "index_base",
    "frequency",
]

AMENITIES_REQUIRED_COLUMNS = [
    "lat",
    "lon",
    "amenity_type",
    "name",
    "geography_name",
    "retrieved_at",
]

# Prohibited combinations: index_points with currency metrics or vice-versa
INDEX_METRICS = {"hpi_assessment", "hpi_market", "housing_price_index"}
CURRENCY_METRICS = {"rupees_per_sqft", "avg_price", "price_per_sqft", "avg_price_inr", "inr_per_sqft"}

class ObservationRecord(TypedDict, total=False):
    observation_date: str
    geography_name: str
    geography_level: str
    metric_name: str
    metric_value: float
    unit: str
    source_name: str
    source_url: str
    retrieved_at: str
    data_status: str
    index_base: Optional[str]
    frequency: Optional[str]

class AmenityRecord(TypedDict):
    lat: float
    lon: float
    amenity_type: str
    name: str
    geography_name: str
    retrieved_at: str
    source_name: str
    data_status: str
