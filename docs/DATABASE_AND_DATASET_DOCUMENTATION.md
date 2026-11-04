# UrbanLens — Database & Dataset Provenance Documentation

**Project**: UrbanLens — Urban Market Intelligence & Housing Affordability Analytics Platform  
**Target Milestone**: Milestone 8 (Final Engineering & Submission)  
**Date**: November 2026  
**Status**: VERIFIED & AUDITED  

---

## 1. Data Architecture Philosophy

UrbanLens rejects opaque data practices. Every data element within the system is strictly cataloged by:
- **Source Authority**: The legal or organizational entity generating the observation.
- **Geographic Applicability**: The spatial boundary to which the data applies (e.g., National, City, Ward, or Neighborhood).
- **Temporal Frequency & Range**: Cadence of publication and longitudinal extent.
- **Integration Status**: Explicit demarcation as **Empirical Real Data**, **Static Geospatial Snapshot**, or **Documented Synthetic Test Fixture**.

---

## 2. Master Dataset Catalog

```
+----------------------------------------------------------------------------------------------------+
| Master Data Inventory                                                                              |
+----+-----------------------------+-------------------+---------------+-------------+---------------+
| ID | Dataset Name                | Source Authority  | Spatial Level | Cadence     | Status        |
+----+-----------------------------+-------------------+---------------+-------------+---------------+
| 01 | RBI All-India HPI           | Reserve Bank      | National      | Quarterly   | Empirical Real|
| 02 | RBI Mumbai HPI              | Reserve Bank      | Metropolitan  | Quarterly   | Empirical Real|
| 03 | RBI Delhi & Tier-1 HPI      | Reserve Bank      | Metropolitan  | Quarterly   | Empirical Real|
| 04 | South Mumbai Boundaries     | Municipal/OSM     | Sub-Ward (4)  | Static RFC  | Verified Real |
| 05 | OSM Education Nodes         | OpenStreetMap     | Coordinates   | Point-Time  | Empirical Real|
| 06 | OSM Healthcare Nodes        | OpenStreetMap     | Coordinates   | Point-Time  | Empirical Real|
| 07 | OSM Transit Nodes           | OpenStreetMap     | Coordinates   | Point-Time  | Empirical Real|
| 08 | OSM Commercial & Retail     | OpenStreetMap     | Coordinates   | Point-Time  | Empirical Real|
| 09 | Transformation: Price Index | RBI / Reg Office  | Metro / Ward  | Quarterly   | Empirical Real|
| 10 | Transformation: Amenities   | OSM Extraction    | Sub-Ward      | Point-Time  | Empirical Real|
| 11 | Transformation: Transit     | Mumbai Metro/Rail | Corridor      | Static Real | Empirical Real|
| 12 | Transformation: Permits     | MCGM SRA Portal   | Ward-level    | Demo-Demarc | Synthetic Demo|
| 13 | Transformation: Demographics| Census / Proj     | Ward-level    | Demo-Demarc | Synthetic Demo|
| 14 | Transformation: Yield Div   | Property Panels   | Metro-level   | Demo-Demarc | Synthetic Demo|
+----+-----------------------------+-------------------+---------------+-------------+---------------+
```

---

## 3. Dataset Specifications & Schemas

### 3.1 Dataset 01 & 02: Reserve Bank of India House Price Index (HPI)
- **Primary Source**: Reserve Bank of India (RBI) Database on Indian Economy (DBIE).
- **Official Citation**: *Quarterly House Price Index (Base: 2010–11 = 100)*.
- **Data Period**: Q1 FY2010-11 (June 2010) through Q4 FY2024-25 (March 2025) — 60 consecutive quarters.
- **Data Granularity**: All-India composite index and 10 major metropolitan cities (Mumbai, Delhi, Bengaluru, Chennai, Kolkata, Hyderabad, Ahmedabad, Pune, Jaipur, Lucknow).
- **Methodology**: Computed using official property registration and transaction appraisal data collected from state revenue and registration departments.
- **Storage Location**: `server/python/data/real_data/rbi_hpi_timeseries.csv`
- **Schema**:
  ```csv
  geography,metric_name,observation_date,metric_value,unit,data_status,source
  All India,hpi_composite,2010-06-30,100.0,index_points,real,rbi_dbie
  Mumbai,hpi_assessment,2010-06-30,100.0,index_points,real,rbi_dbie
  ...
  Mumbai,hpi_assessment,2025-03-31,318.4,index_points,real,rbi_dbie
  ```

---

### 3.2 Dataset 04: South Mumbai Neighborhood Polygon Boundaries
- **Primary Source**: OpenStreetMap Administrative Boundaries & Municipal Corporation of Greater Mumbai (MCGM) Ward Maps.
- **Format**: RFC 7946 compliant GeoJSON `FeatureCollection`.
- **Covered Sub-Regions**:
  1. `south-mumbai-colaba` (Colaba, Navy Nagar, Cuffe Parade)
  2. `south-mumbai-fort` (Fort Financial District, Kala Ghoda, Ballard Estate)
  3. `south-mumbai-marine-lines` (Marine Drive, Churchgate, Marine Lines)
  4. `south-mumbai-malabar-hill` (Malabar Hill, Walkeshwar, Cumballa Hill)
- **Storage Location**: `server/data/neighborhoods/south_mumbai_boundaries.geojson`
- **Feature Properties Schema**:
  ```json
  {
    "type": "Feature",
    "properties": {
      "id": "south-mumbai-colaba",
      "name": "Colaba & Cuffe Parade",
      "zone": "South Mumbai Zone A",
      "area_km2": 4.82,
      "centroid": [18.915, 72.825]
    },
    "geometry": {
      "type": "Polygon",
      "coordinates": [[[72.815, 18.905], ...]]
    }
  }
  ```

---

### 3.3 Datasets 05–08: OpenStreetMap Amenity Extracts
- **Primary Source**: OpenStreetMap via Overpass API query endpoint (`https://overpass-api.de/api/interpreter`).
- **Query Bounding Box**: South Mumbai coastal corridor `[18.890, 72.800, 18.980, 72.860]`.
- **Classification Categories**:
  - `education`: `amenity=school`, `amenity=college`, `amenity=university`
  - `healthcare`: `amenity=hospital`, `amenity=clinic`, `amenity=pharmacy`
  - `transit`: `railway=station`, `highway=bus_stop`, `amenity=ferry_terminal`
  - `commercial_lifestyle`: `amenity=cafe`, `amenity=restaurant`, `shop=supermarket`
- **Storage Location**: `server/data/neighborhoods/osm_amenities_south_mumbai.json`
- **Schema**:
  ```json
  {
    "id": "osm_node_4829104",
    "name": "St. Xavier's College",
    "amenity_type": "education",
    "latitude": 18.9438,
    "longitude": 72.8315,
    "area_id": "south-mumbai-fort",
    "source": "OpenStreetMap Overpass Extract",
    "extracted_at": "2025-10-15T00:00:00Z"
  }
  ```

---

### 3.4 Datasets 09–14: Urban Transformation 14-Domain Framework
- **Primary Source**: Composite Framework across 8 transformation domains.
- **Storage Location**: `server/data/transformation/indicators.json`
- **Detailed Domain Inventory**:
  1. `price_movement`: Longitudinal RBI Mumbai HPI (Empirical Real).
  2. `amenity_composition`: Ratio of lifestyle amenities to basic civic services (Empirical Real).
  3. `transit_access`: Distance to Churchgate/CST rail terminals and Metro Line 3 stations (Empirical Real).
  4. `commercial_vibrancy`: Density of retail establishments per square kilometer (Empirical Real).
  5. `redevelopment_permits`: Building proposal approvals (Demarcated Synthetic Demo for test coverage).
  6. `demographic_shifts`: Household income and tenure distributions (Demarcated Synthetic Demo).
  7. `public_space_access`: Proximity to Oval Maidan, Cross Maidan, and Marine Drive promenade (Empirical Real).
  8. `rental_yield_divergence`: Rental yield versus capital cost spread (Demarcated Synthetic Demo).

---

## 4. Strict Demarcation Rules & Anti-Deception Protocols

To maintain rigorous scientific and academic honesty:
1. **Never Present City HPI as Local Price**: The RBI Mumbai HPI measures the metropolitan city-wide index. The system never labels this as the per-square-foot transaction price of Colaba or Malabar Hill.
2. **Never Present Single-Snapshot OSM as Historical Growth**: Point-in-time OSM data proves current spatial presence, not historical amenity acceleration. The system rejects "amenity gentrification" claims without longitudinal OSM changeset archives.
3. **Explicit Synthetic Watermarking**: All test fixtures and proxy indicator series carry the unambiguous metadata tag:
   ```json
   {
     "data_status": "synthetic_demo",
     "disclaimer": "This indicator is a synthetic demonstration fixture for pipeline validation and must not be used for municipal policy or commercial investment."
   }
   ```
4. **Automated Quality Reports**: The Python quality pipeline automatically produces `data/data_quality_report.json` assessing record completeness, schema compliance, and outlier bounds for every ingested series.
