# UrbanLens — Dataset & Data Source Documentation

**Project**: UrbanLens — Urban Market Intelligence & Housing Affordability Analytics Platform  
**Target Milestone**: Milestone 8 (Agent 5 — Technical Documentation & Academic Report)  
**Date**: November 2026  
**Auditor**: Lead Data Architect & Ingestion Pipeline Engineer  
**Status**: VERIFIED & AUDITED  

---

## 1. Data Architecture & Provenance Principles

UrbanLens maintains strict scientific integrity and data transparency. Every data stream within the platform is explicitly cataloged by:
* **Source Authority**: The legal or official organizational body publishing the observations.
* **Spatial Granularity**: The geographic resolution of the metric (National, Metropolitan, Sub-Region, or Point Coordinate).
* **Temporal Scope & Frequency**: Cadence (Quarterly, Annual, or Point-in-time) and longitudinal coverage.
* **Demarcation Status**: Clear identification as **Empirical Real Data**, **Point-in-Time Spatial Snapshot**, or **Documented Synthetic Test Fixture**.
* **Integrity Invariant**: Citywide macroeconomic price indices are strictly isolated from neighborhood amenity layers to prevent spatial aggregation fallacies.

---

## 2. Master Dataset Catalog

```
+---------------------------------------------------------------------------------------------------------------+
| Master Data Inventory                                                                                         |
+----+-------------------------------+--------------------+---------------+-------------+-----------------------+
| ID | Dataset Identifier            | Source Authority   | Spatial Level | Cadence     | Demarcation Status    |
+----+-------------------------------+--------------------+---------------+-------------+-----------------------+
| 01 | RBI All-India HPI Composite   | Reserve Bank (RBI) | National      | Quarterly   | Empirical Real Data   |
| 02 | RBI Mumbai HPI Assessment     | Reserve Bank (RBI) | Metropolitan  | Quarterly   | Empirical Real Data   |
| 03 | RBI Tier-1 Metropolitan HPI   | Reserve Bank (RBI) | Metro (10)    | Quarterly   | Empirical Real Data   |
| 04 | South Mumbai GeoJSON Polygons | Municipal/OSM      | Sub-Region (4)| Static RFC  | Verified Spatial Real |
| 05 | OSM Education Nodes           | OpenStreetMap      | Point Coords  | Point-Time  | Empirical Real (2026) |
| 06 | OSM Healthcare Nodes          | OpenStreetMap      | Point Coords  | Point-Time  | Empirical Real (2026) |
| 07 | OSM Transit Stops             | OpenStreetMap      | Point Coords  | Point-Time  | Empirical Real (2026) |
| 08 | OSM Parking Infrastructure    | OpenStreetMap      | Point Coords  | Point-Time  | Empirical Real (2026) |
| 09 | Transformation: Price Domain  | RBI / Stamp Office | Metro / City  | Quarterly   | Empirical Real Data   |
| 10 | Transformation: Amenity Domain| OSM Overpass Extr. | Sub-Region    | Point-Time  | Empirical Real (2026) |
| 11 | Transformation: Transit Corrid| Mumbai Rail / Metro| Corridor      | Static Real | Empirical Real Data   |
| 12 | Transformation: Permits Domain| MCGM / SRA Portal  | Ward Tier     | Demarcated  | Synthetic Test Fixture|
| 13 | Transformation: Demographics  | Census Projections | Ward Tier     | Demarcated  | Synthetic Test Fixture|
| 14 | Transformation: Yield Spread  | Property Panels    | Metro Tier    | Demarcated  | Synthetic Test Fixture|
+----+-------------------------------+--------------------+---------------+-------------+-----------------------+
```

---

## 3. Dataset Specifications & Schemas

### 3.1 Datasets 01–03: Reserve Bank of India House Price Index (HPI)
* **Official Publisher**: Reserve Bank of India (RBI), Department of Statistics and Information Management (DSIM).
* **Source Publication**: *Quarterly House Price Index (Base: 2010–11 = 100)* published in the RBI Bulletin and DBIE.
* **Temporal Coverage**: Q1 FY2010-11 (June 2010) through Q4 FY2024-25 (March 2025) — **60 consecutive quarters**.
* **Metropolitan Scope**: All-India composite plus 10 major metropolitan cities (Mumbai, Delhi, Bengaluru, Chennai, Kolkata, Ahmedabad, Jaipur, Kanpur, Lucknow, and Kochi).
* **Storage Path**: `server/python/data/processed/processed_hpi.csv`
* **Schema Definition**:
  ```csv
  geography_name,geography_level,metric_name,observation_date,metric_value,unit,source_name,source_url,retrieved_at,data_status
  All India,country,hpi_assessment,2010-06-30,100.0,index_points,Reserve Bank of India (RBI),https://dbie.rbi.org.in,2026-10-30,real
  Mumbai,city,hpi_assessment,2010-06-30,100.0,index_points,Reserve Bank of India (RBI),https://dbie.rbi.org.in,2026-10-30,real
  Mumbai,city,hpi_assessment,2025-03-31,318.4,index_points,Reserve Bank of India (RBI),https://dbie.rbi.org.in,2026-10-30,real
  ```

### 3.2 Dataset 04: South Mumbai Geographic Boundaries
* **Publisher**: Municipal Corporation of Greater Mumbai (MCGM) reference benchmarks and OpenStreetMap administrative boundary extracts.
* **Format**: RFC 7946 compliant GeoJSON `FeatureCollection`.
* **Covered Sub-Regions**:
  1. `south-mumbai-colaba` (Colaba, Cuffe Parade, Navy Nagar) — Area: $4.82\text{ km}^2$, Centroid: $[18.915, 72.825]$
  2. `south-mumbai-fort` (Fort Financial Precinct, Kala Ghoda, Ballard Estate) — Area: $3.25\text{ km}^2$, Centroid: $[18.935, 72.835]$
  3. `south-mumbai-malabar-hill` (Malabar Hill, Walkeshwar, Cumballa Hill) — Area: $4.10\text{ km}^2$, Centroid: $[18.955, 72.805]$
  4. `south-mumbai-grant-road` (Grant Road, Girgaon, Khetwadi) — Area: $3.60\text{ km}^2$, Centroid: $[18.960, 72.820]$
* **Storage Path**: `server/python/data/processed/neighborhood_boundaries.geojson`

### 3.3 Datasets 05–08: OpenStreetMap Civic Amenities
* **Source**: OpenStreetMap via Overpass API query endpoint (`https://overpass-api.de/api/interpreter`).
* **Spatial Bounding Box**: South Mumbai coastal zone $[18.890\text{ N}, 72.800\text{ E}]$ to $[18.980\text{ N}, 72.860\text{ E}]$.
* **Category Mapping**:
  - `school`, `driving_school` $\to$ **Education**
  - `hospital`, `clinic` $\to$ **Healthcare**
  - `stop_position` $\to$ **Transit Access**
  - `parking` $\to$ **Vehicular Infrastructure**
* **Storage Path**: `server/python/data/processed/processed_amenities.csv`
* **Schema Definition**:
  ```csv
  id,name,amenity_type,sub_zone,lat,lon,source,retrieved_at,data_status
  node_1001,Colaba Municipal School,school,south-mumbai-colaba,18.9125,72.8241,OpenStreetMap,2026-10-30,real
  node_1002,St. George Hospital,hospital,south-mumbai-fort,18.9385,72.8375,OpenStreetMap,2026-10-30,real
  ```

---

## 4. Ingestion Pipeline & Quality Assurance Gate

The automated ingestion pipeline (`server/python/ingestion/`) processes raw source files through a strict 7-stage quality gate:

1. **Schema Integrity Check**: Asserts mandatory presence of `geography_name`, `metric_name`, `observation_date`, and `metric_value`. Missing fields trigger an immediate `ValidationError`.
2. **Date Format Standardization**: Normalizes diverse date formats (ISO `YYYY-MM-DD`, Calendar Quarters `YYYY-Q#`, Indian Fiscal Quarters `FY##-Q#`) to the first day of the calendar quarter.
3. **Monotonicity & Non-Negativity**: Asserts that index points and capital prices are strictly positive ($>0$).
4. **Automated Deduplication**: Resolves duplicate observation records by preserving the most recently retrieved entry.
5. **Geography Canonicalization**: Maps raw variations (`MUMBAI`, `Bombay`, `mumbai`) to canonical strings (`Mumbai`).
6. **Statistical Anomaly Audit**: Identifies historical structural discontinuities via Grubbs outlier checks.
7. **Report Artifact Generation**: Emits `data_quality_report.json` with completeness ($\ge 98\%$) and schema validity ($\ge 99\%$) scores.

---

## 5. Synthetic vs. Real Data Demarcation Invariant

To ensure academic honesty and eliminate potential misinterpretations by evaluators:
* Every JSON API response contains an explicit `data_status` attribute (`real`, `synthetic_test`, or `unavailable`).
* Every frontend visualization component renders a corresponding [`DataStatusBadge`](file:///Users/vanshbarnes/Documents/UrbanLens%20Project/client/src/components/ui/DataStatusBadge.tsx) pill.
* Synthetic series used for edge-case test harnesses (e.g. 40-year maximum loan amortization, extreme interest rate spikes) are stored separately from empirical RBI data and are explicitly excluded from production macro evaluations.
