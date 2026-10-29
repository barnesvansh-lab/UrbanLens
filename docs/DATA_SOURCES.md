# UrbanLens Data Sources — Provenance & Licensing

This document outlines the official datasets evaluated and integrated for UrbanLens, including their institutional origins, licensing terms, update cadence, access mechanics, and analytical boundaries.

---

## 1. Reserve Bank of India (RBI) House Price Index (HPI)

- **Source Authority:** Reserve Bank of India (RBI), Department of Statistics and Information Management
- **Status:** Investigated Only (Workflow ready for manual ingestion)
- **Portal URL:** [https://data.rbi.org.in](https://data.rbi.org.in)
- **Geographic Coverage:** 10–18 major Indian metropolitan agglomerations (Ahmedabad, Bengaluru, Chennai, Delhi, Jaipur, Kanpur, Kochi, Kolkata, Lucknow, Mumbai, etc.)
- **Temporal Coverage:** Quarterly observations from 2010 to present
- **Base Year Series:** 2010-11 = 100 and newer 2022-23 = 100
- **Measurement Unit:** `index_points` (dimensionless index points relative to base period = 100)
- **Data Collection Basis:** Official property tax / registration authority records collected across state registries
- **License / Terms:** Government of India Open Data License (non-commercial research and analysis; attribution mandatory)
- **Access Method:** Manual browser export from the DBIE (Database on Indian Economy) portal due to interactive session tokens preventing unauthenticated HTTP scraping

### Critical Schema Principle
The RBI HPI represents relative temporal index movement. **It does NOT represent property capital valuation in ₹/sq.ft.** Index points and ₹/sq.ft rates are strictly partitioned in the UrbanLens schema (`unit: index_points` vs `unit: inr_per_sqft`) to prevent fraudulent price conflation.

---

## 2. National Housing Bank (NHB) RESIDEX

- **Source Authority:** National Housing Bank (wholly owned by the Government of India)
- **Status:** Investigated Only (Workflow ready for manual ingestion)
- **Portal URL:** [https://residex.nhbonline.org.in](https://residex.nhbonline.org.in)
- **Geographic Coverage:** 50+ tier-1 and tier-2 Indian metropolitan cities
- **Temporal Coverage:** Quarterly series from 2013 to present
- **Metrics Tracked:**
  - `hpi_assessment`: Housing Price Index at Assessment Prices (based on valuation data from primary lending institutions during loan disbursements)
  - `hpi_market`: Housing Price Index at Market Prices for Under-Construction Properties
- **Measurement Unit:** `index_points`
- **License / Terms:** National Housing Bank public terms of use (attribution mandatory)
- **Access Method:** Browser-driven query export from the interactive RESIDEX portal into `server/python/data/raw/nhb_residex_raw.csv`

---

## 3. OpenStreetMap (OSM) Civic Amenities

- **Source Authority:** OpenStreetMap Foundation & Global Volunteer Community
- **Status:** Investigated — Automated standalone fetcher provided (`server/python/osm_fetch.py`)
- **Portal URL:** [https://www.openstreetmap.org](https://www.openstreetmap.org)
- **Geographic Coverage:** Worldwide; default bounding box configured for Mumbai Metropolitan Region (`18.89,72.77,19.27,72.99`)
- **Metrics Tracked:** Point-of-interest coordinates for civic walkability: schools, hospitals, clinics, parks, public transit stops
- **Measurement Unit:** `count` (integer density of features)
- **License:** Open Data Commons Open Database License (ODbL)
- **Attribution Notice:** © OpenStreetMap contributors. Any map visualizations or derived spatial scores require clear attribution to OpenStreetMap.
- **Access Method:** Direct Overpass QL query via HTTP API or export through Overpass Turbo

---

## 4. Synthetic Verification Fixtures

- **Status:** Integrated (`server/python/data/fixtures/`)
- **Coverage:** Synthetic quarterly indices for Mumbai and Delhi (2020-01-01 to 2021-10-01)
- **Purpose:** Continuous integration, pipeline regression tests, and schema verification without reliance on live external networks
- **Label:** `data_status: synthetic_test`

---

## Methodological Boundaries & Limitations

1. **No Neighborhood-Level Price Registries in Official Indian Statistics:**
   Both RBI and NHB publish indices aggregated strictly at the municipal or metropolitan statistical level. Neither agency provides micro-market or ward-level capital rates.
2. **Dimensionless Index vs. Currency Capital Values:**
   HPI numbers cannot be converted to ₹/sq.ft without an audited baseline price anchor from localized registrar transaction deeds.
3. **No Direct Spatial Extrapolation:**
   City-level macroeconomic growth rates cannot be assumed to apply uniformly across heterogeneous sub-neighborhoods.
