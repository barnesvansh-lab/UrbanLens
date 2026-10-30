# UrbanLens — Real Data Integration Guide

This guide details the acquisition, provenance, deduplication, schema normalization, and programmatic serving of genuine Indian property-market and geospatial datasets in UrbanLens.

---

## 1. Reserve Bank of India (RBI) House Price Index (HPI)

### 1.1 Provenance and Official Source
- **Originating Authority**: Reserve Bank of India (RBI) Database on Indian Economy (DBIE).
- **Public Mirror / Reproducible Extraction**: `https://github.com/sharanya-singh/HPI-Analysis` (`cleaned_hpi.csv`).
- **Attribution**: *"Data sourced from Reserve Bank of India DBIE via sharanya-singh/HPI-Analysis (GitHub)"*.
- **Temporal Coverage**: 2010-06-30 (Q1 FY 2010-11) to 2025-03-31 (Q4 FY 2024-25).
- **Observation Frequency**: Quarterly (end-of-quarter timestamps: `06-30`, `09-30`, `12-31`, `03-31`).
- **Geographic Coverage**: 10 Tier-1 Metropolitan Regions & Aggregates:
  1. All India
  2. Ahmedabad
  3. Bengaluru (normalized from *Bangalore*)
  4. Chennai
  5. Delhi
  6. Jaipur
  7. Kanpur
  8. Kolkata
  9. Lucknow
  10. Mumbai
- **Total Valid Observations**: Exactly 60 clean quarterly observations per geography (600 total observations).

### 1.2 Data Characteristics & Metric Units
- **Metric Name**: `hpi_assessment`
- **Unit**: `index_points` (Base: 2010-11 = 100.0)
- **Geographic Level**: `city`
- **Data Status**: `real`

> [!IMPORTANT]
> **Dimensionless Index vs. Currency Valuation**:
> HPI values are dimensionless index points relative to the base year FY 2010-11 (100.0). They measure macroeconomic price inflation and **must never be conflated with or plotted on the same axis as ₹/sq.ft property valuation rates**.

### 1.3 Deduplication & Base Year Overlap Resolution
The raw public series contains duplicate timestamps between `2010-06-30` and `2013-03-31` because two overlapping base years were published during the transition from Base 2008-09=100 to Base 2010-11=100:
1. **Pre-2010 Exclusion**: Observations before `2010-06-01` (2009 quarters) belong exclusively to the retired 2008-09=100 base series and were filtered out.
2. **Overlap Resolution**: During the 2010–2013 overlap, the 2010-11=100 base series starts at ~100.0, whereas the old 2008-09=100 base series was valued at 140–210. Sorting ascending by HPI value and retaining the minimum observation for each `(city, date)` pair consistently isolates the active 2010-11=100 official series.

### 1.4 Ingestion & Normalization Commands
```bash
# 1. Download raw RBI CSV
curl -sL "https://raw.githubusercontent.com/sharanya-singh/HPI-Analysis/main/cleaned_hpi.csv" \
  -o "server/python/data/raw/rbi/rbi_hpi_raw.csv"

# 2. Normalize and deduplicate
python3 server/python/normalize_rbi_hpi.py

# 3. Ingest into UrbanLens pipeline
python3 server/python/run_pipeline.py --dataset hpi \
  --file server/python/data/raw/rbi/rbi_hpi_normalized.csv \
  --source-name RBI-HPI \
  --source-url "https://github.com/sharanya-singh/HPI-Analysis" \
  --status real
```

---

## 2. OpenStreetMap (OSM) Civic Amenities

### 2.1 Provenance & License
- **Originating Authority**: OpenStreetMap contributors.
- **Extraction Protocol**: Overpass API (`server/python/osm_fetch.py`).
- **Attribution**: *"Data © OpenStreetMap contributors, ODbL license"*.
- **Geography**: South Mumbai urban core (bounding box: `[18.92, 72.80, 18.98, 72.85]`).
- **Feature Count**: 232 civic infrastructure features (schools, hospitals, transit, clinics, parking facilities).
- **Data Status**: `real`

### 2.2 Ingestion Command
```bash
python3 server/python/run_pipeline.py --dataset amenities \
  --file server/python/data/raw/osm/osm_mumbai_amenities.csv \
  --source-name OSM \
  --source-url "https://www.openstreetmap.org" \
  --status real
```

---

## 3. National Housing Bank (NHB) RESIDEX

### 3.1 Portal Status: Investigated Only
- **URL**: `https://residex.nhbonline.org.in/`
- **Scope**: Tracks 50+ Indian metropolitan regions for under-construction and ready properties.
- **Access Protocol**: Browser-based session export only; programmatic REST endpoints require captcha authentication.
- **Integration Status**: Documented and audited. When official CSV exports are retrieved manually, they can be processed through `run_pipeline.py --dataset hpi --file <path> --source-name NHB-RESIDEX --status real`.

---

## 4. Methodological Boundaries & Limitations

1. **City-Level vs. Neighborhood Granularity**: Official RBI HPI series are published at the city level only. UrbanLens explicitly disallows extrapolating city-level index trends into neighborhood-level (e.g. Bandra West or Andheri East) price forecasts.
2. **Index vs. Price**: Real-mode forecasts output index points only.
3. **Macroeconomic Shocks**: Statistical baselines assume structural continuity; external shocks (Demonetization 2016, COVID-19 2020) cause structural breaks that require cautious interpretation of persistence and trend models.
