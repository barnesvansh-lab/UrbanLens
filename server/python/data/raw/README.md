# Manual Data Import Workflow

## RBI House Price Index (HPI)

1. Open https://data.rbi.org.in in your browser
2. Navigate: Statistics → Real Sector → Prices & Wages → House Price Index
3. Select the date range and cities you want
4. Click "Download CSV"
5. Rename the file to `rbi_hpi_raw.csv`
6. Place it in this directory (`server/python/data/raw/`)
7. Run: `cd server/python && python run_pipeline.py --dataset hpi --file data/raw/rbi_hpi_raw.csv --source-name RBI-HPI --source-url https://data.rbi.org.in --status real`

IMPORTANT: The RBI HPI is an INDEX (base year = 100), not a price in ₹/sqft.
The pipeline will label it as `unit: index_points` and `metric_name: hpi_assessment`.
Do NOT interpret it as a property transaction price.

## NHB RESIDEX

1. Open https://residex.nhbonline.org.in in your browser
2. Select city, base year, and date range
3. Export/Download the data table
4. Normalize column names to match the schema (see Schema section below)
5. Place as `nhb_residex_raw.csv` in this directory
6. Run: `cd server/python && python run_pipeline.py --dataset hpi --file data/raw/nhb_residex_raw.csv --source-name NHB-RESIDEX --source-url https://residex.nhbonline.org.in --status real`

## OpenStreetMap Amenities

### Option A: Use the fetcher script
```bash
cd server/python
python osm_fetch.py --city Mumbai --bbox "18.89,72.77,19.27,72.99" --output data/raw/osm_mumbai_amenities.csv
python run_pipeline.py --dataset amenities --file data/raw/osm_mumbai_amenities.csv --source-name OSM --source-url https://www.openstreetmap.org --status real
```

### Option B: Export from Overpass Turbo
1. Open https://overpass-turbo.eu
2. Run the query in docs/osm_query.overpassql
3. Export as GeoJSON, convert to CSV
4. Place as `osm_mumbai_amenities.csv`

## Expected CSV Schema

### HPI Schema
| Column | Type | Example | Notes |
|--------|------|---------|-------|
| observation_date | YYYY-MM-DD | 2020-04-01 | First day of quarter |
| geography_name | string | Mumbai | City name |
| geography_level | string | city | city/district/neighborhood |
| metric_name | string | hpi_assessment | hpi_assessment or hpi_market |
| metric_value | float | 103.4 | Index value, NOT ₹/sqft |
| unit | string | index_points | Always index_points for HPI |
| source_name | string | RBI-HPI | Data source identifier |
| source_url | string | https://... | Source URL |
| retrieved_at | ISO datetime | 2025-01-01T00:00:00Z | When you downloaded it |
| data_status | string | real | real or synthetic_test |

### Amenities Schema
| Column | Type | Example | Notes |
|--------|------|---------|-------|
| lat | float | 19.0760 | Latitude (-90 to 90) |
| lon | float | 72.8777 | Longitude (-180 to 180) |
| amenity_type | string | school | school, hospital, park, clinic, etc. |
| name | string | St. Xavier's | Name of amenity / POI |
| geography_name | string | Mumbai | City or neighborhood name |
| retrieved_at | ISO datetime | 2025-01-01T00:00:00Z | Retrieval timestamp |
| source_name | string | OSM | OpenStreetMap |
| data_status | string | real | real or synthetic_test |
