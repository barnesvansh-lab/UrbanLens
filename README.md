# UrbanLens 🏙️
> **Urban Market Intelligence & Affordability Analytics Dashboard**

⚠️ **DEMO MODE NOTICE**: All numerical data served in default demo configurations is synthetically generated for demonstration and architectural prototyping purposes. Verified real-data feeds (e.g. RBI-HPI, NHB-RESIDEX, OpenStreetMap) are strictly segregated and labeled via explicit status indicators (`data_status: real` vs `data_status: synthetic_test`). It does NOT represent actual market transactions, real-world appraisals, or financial advice.

---

## 🌟 Overview
UrbanLens is an enterprise-grade urban analytics dashboard designed to monitor housing market dynamics, spatial price evolution, mortgage affordability metrics, and neighborhood intelligence across Indian metropolitan markets.

### Key Capabilities
- **Market Dynamics**: Macro indicator cards, multi-area time-series analysis (2020–2024), transaction volume tracking, and seasonality heatmaps.
- **Predictive Forecasting**: Illustrative 12-month forward-looking projections with confidence intervals and anomaly detection indicators.
- **Neighborhood Intelligence**: Spatial geospatial visualization via Leaflet maps, amenity accessibility density scores, and gentrification vulnerability indices.
- **Mortgage & Affordability Analytics**: Real-time EMI amortization calculator, interactive 10-year Rent vs. Buy financial models, and income-to-price ratios.
- **Data Transparency & Auditability**: Real data ingestion pipeline, automated validation and data quality audit reports, and source provenance catalog.

---

## 🏗️ Architecture & Tech Stack

### Frontend (`client/`)
- **Framework**: React 18 + TypeScript + Vite 6
- **Styling**: Tailwind CSS v4
- **Charts**: Recharts (Line, Area, Bar, Radar, Composed)
- **Maps**: Leaflet + React-Leaflet
- **Icons**: Lucide React
- **Routing**: React Router DOM v6
- **API Client**: Strongly typed Fetch client with React hooks (`useDataSources`, `useDataSeries`, `useDataQuality`, `useApiSummary`, `useAmenities`)

### Backend (`server/`)
- **Runtime**: Node.js v26 + Express
- **Language**: TypeScript
- **Services**: Controlled `dataService` reading exclusively from cleaned output paths
- **Middleware**: Query validation (`validateSeriesQuery`, `validateAmenityQuery`) protecting against path traversal and malformed dates
- **Endpoints**: `/api/health`, `/api/data/*`, `/api/neighborhoods/*`

### Python Ingestion Pipeline (`server/python/`)
- **Runtime**: Python 3.13+ (`pandas`, `numpy`)
- **Modules**:
  - `pipeline/schema.py`: Canonical observation schema, TypedDicts, and forbidden metric mixing rules
  - `pipeline/validators.py`: Strict schema validation, duplicate detection, date checks, and metric consistency validation
  - `pipeline/normalizers.py`: Indian FY quarter parsing (`Q1 2020-21` → `2020-04-01`), canonical geography aliases, metric sanitization
  - `pipeline/quality.py`: Automated quality reports (raw vs valid rows, duplicates, missing values, date spans, warnings)
  - `pipeline/ingest.py`: End-to-end ingestion orchestrator writing cleaned CSVs and JSON manifests
  - `run_pipeline.py`: CLI entry point supporting `--test` and production arguments
  - `osm_fetch.py`: Standalone Overpass QL fetcher for OpenStreetMap civic amenities

---

## 📦 Directory Structure

```
UrbanLens Project/
├── client/
│   ├── src/
│   │   ├── api/             # API client, types, React hooks
│   │   ├── components/      # UI, layout, and charts
│   │   │   └── ui/          # DataStatusBadge, ApiErrorState, DataSourceCard
│   │   ├── pages/           # DataSources, Overview, Affordability, etc.
│   │   └── data/            # syntheticData.ts (intact demo data)
├── server/
│   ├── src/
│   │   ├── middleware/      # validateQuery.ts
│   │   ├── routes/          # health.ts, data.ts, neighborhoods.ts
│   │   ├── services/        # dataService.ts
│   │   ├── types/           # api.ts
│   │   ├── __tests__/       # api.test.ts (10 automated API tests)
│   │   └── index.ts         # Main server entry point
│   ├── python/
│   │   ├── pipeline/        # ingest.py, validators.py, normalizers.py, quality.py, schema.py
│   │   ├── data/
│   │   │   ├── raw/         # User manual CSV imports (README.md instructions)
│   │   │   ├── processed/   # Cleaned, deduplicated CSV outputs
│   │   │   ├── fixtures/    # Synthetic test fixtures for automated testing
│   │   │   └── manifests/   # Dataset metadata & quality audit JSON files
│   │   ├── tests/           # 25 Python unit tests (unittest)
│   │   ├── run_pipeline.py  # Pipeline CLI entry point
│   │   └── osm_fetch.py     # Standalone OSM Overpass fetcher
└── docs/
    └── DATA_SOURCES.md      # Detailed provenance, licenses, and limitations
```

---

## 🚀 Quick Start

### 1. Installation
```bash
# Install frontend dependencies
cd client && npm install

# Install backend dependencies
cd ../server && npm install

# Install Python requirements
cd python && pip3 install -r requirements.txt
```

### 2. Running Pipeline with Synthetic Test Fixture
```bash
cd server/python
python3 run_pipeline.py --test
```
Output:
- Ingests `data/fixtures/test_hpi_fixture.csv` (13 valid records, 1 duplicate removed)
- Ingests `data/fixtures/test_amenities_fixture.csv` (4 valid facilities, 1 duplicate removed)
- Emits cleaned CSVs to `server/python/data/processed/`
- Emits JSON manifests & quality audit logs to `server/python/data/manifests/`

### 3. Running Automated Tests

#### Python Pipeline Test Suite (25 unit tests)
```bash
cd server/python
python3 -m unittest discover tests -v
```

#### Express API Test Suite (10 endpoint tests)
```bash
cd server
npm test
```

### 4. Running Development Servers
```bash
# In the project root:
# Run frontend dev server (port 5173)
npm run dev:client

# Run backend API server (port 3001)
npm run dev:server
```

### 5. Production Build
```bash
# Build both frontend and backend
npm run build
```

---

## 📥 Manual Data Import Workflow

Due to portal session mechanics and security tokens, the official RBI DBIE and NHB RESIDEX portals do not permit direct unauthenticated scraping. A documented manual workflow is provided:

### RBI House Price Index (HPI)
1. Navigate to **https://data.rbi.org.in**
2. Go to: **Statistics → Real Sector → Prices & Wages → House Price Index**
3. Select your desired date span (e.g. 2010–present) and cities
4. Click **Download CSV**
5. Save as `server/python/data/raw/rbi_hpi_raw.csv`
6. Run ingestion:
   ```bash
   cd server/python
   python3 run_pipeline.py --dataset hpi --file data/raw/rbi_hpi_raw.csv --source-name RBI-HPI --source-url https://data.rbi.org.in --status real
   ```

### NHB RESIDEX
1. Navigate to **https://residex.nhbonline.org.in**
2. Select city, base year, and date range
3. Export data table as CSV
4. Save as `server/python/data/raw/nhb_residex_raw.csv`
5. Run ingestion:
   ```bash
   cd server/python
   python3 run_pipeline.py --dataset hpi --file data/raw/nhb_residex_raw.csv --source-name NHB-RESIDEX --source-url https://residex.nhbonline.org.in --status real
   ```

### OpenStreetMap (OSM) Amenities
Run the standalone Overpass API script:
```bash
cd server/python
python3 osm_fetch.py --city Mumbai --bbox "18.89,72.77,19.27,72.99" --output data/raw/osm_mumbai_amenities.csv
python3 run_pipeline.py --dataset amenities --file data/raw/osm_mumbai_amenities.csv --source-name OSM --source-url https://www.openstreetmap.org --status real
```

---

## 📊 Canonical Observation Schema

### HPI Observation Record
| Field | Type | Description |
|---|---|---|
| `observation_date` | `YYYY-MM-DD` | First calendar day of quarter (e.g. `2020-04-01`) |
| `geography_name` | `string` | Canonical metropolitan city (e.g. `Mumbai`, `Delhi`) |
| `geography_level` | `string` | `city` \| `district` \| `neighborhood` |
| `metric_name` | `string` | `hpi_assessment` \| `hpi_market` |
| `metric_value` | `float` | Dimensionless index points (relative to base year = 100) |
| `unit` | `string` | Always `index_points` for HPI |
| `source_name` | `string` | e.g. `RBI-HPI`, `NHB-RESIDEX`, `SYNTHETIC_TEST_DATA` |
| `source_url` | `string` | Origin URL |
| `retrieved_at` | `ISO 8601` | Timestamp of ingestion |
| `data_status` | `string` | `real` \| `synthetic_test` \| `unavailable` |

> [!IMPORTANT]
> **CRITICAL RULE**: Dimensionless HPI index numbers (base year = 100) must **NEVER** be mixed or conflated with currency-denominated capital rates (`₹/sq.ft`). Attempting to combine them triggers a pipeline validation warning and strict schema segregation.

---

## 🌐 Express API Endpoints

### 1. Health Status
`GET /api/health`
```json
{
  "status": "ok",
  "service": "UrbanLens API",
  "version": "0.2.0",
  "mode": "data",
  "data_available": true,
  "timestamp": "2026-10-29T08:00:00.000Z"
}
```

### 2. Registered Data Sources
`GET /api/data/sources`
```json
[
  {
    "id": "rbi-hpi",
    "name": "Reserve Bank of India House Price Index (HPI)",
    "url": "https://data.rbi.org.in",
    "status": "investigated_only",
    "frequency": "Quarterly",
    "unit": "index_points",
    "geographic_coverage": ["Mumbai", "Delhi", "Bengaluru", "..."],
    "limitations": [
      "Dimensionless index points, NOT ₹/sqft transaction values",
      "Metropolitan aggregate only; no neighborhood disaggregation"
    ]
  }
]
```

### 3. Filtered Observation Time-Series
`GET /api/data/series?geography=Mumbai&start_date=2020-01-01&end_date=2021-12-31&limit=5`
```json
[
  {
    "observation_date": "2020-01-01",
    "geography_name": "Mumbai",
    "geography_level": "city",
    "metric_name": "hpi_assessment",
    "metric_value": 100.0,
    "unit": "index_points",
    "source_name": "SYNTHETIC_TEST_DATA",
    "data_status": "synthetic_test"
  }
]
```

### 4. Automated Quality Reports
`GET /api/data/quality`
```json
[
  {
    "dataset_name": "synthetic_test_data_hpi",
    "generated_at": "2026-10-29T08:00:00.000Z",
    "raw_row_count": 14,
    "valid_row_count": 13,
    "rejected_row_count": 0,
    "duplicate_count": 1,
    "missing_value_counts": { "observation_date": 0, "metric_value": 0 },
    "date_range": { "min": "2020-01-01", "max": "2021-10-01" },
    "geographies": ["Delhi", "Mumbai"],
    "warnings": [],
    "data_status": "synthetic_test"
  }
]
```

### 5. Ingestion Summary
`GET /api/data/summary`
```json
{
  "total_observations": 13,
  "total_datasets": 2,
  "geographies": ["Delhi", "Mumbai"],
  "metric_types": ["hpi_assessment"],
  "date_coverage": { "min": "2020-01-01", "max": "2021-10-01" },
  "data_status_breakdown": { "real": 0, "synthetic_test": 13, "unavailable": 0 },
  "last_ingestion_at": "2026-10-29T08:00:00.000Z"
}
```

### 6. Neighborhood Amenities
`GET /api/neighborhoods/amenities?geography=Mumbai&amenity_type=school`
```json
[
  {
    "lat": 19.0760,
    "lon": 72.8777,
    "amenity_type": "school",
    "name": "Test School A",
    "geography_name": "Mumbai",
    "source_name": "SYNTHETIC_TEST_DATA",
    "data_status": "synthetic_test"
  }
]
```

---

## 🚀 Milestone 4: Real Indian Data Acquisition, Validation & Real-Market Forecasting

In Milestone 4, UrbanLens transitioned from purely synthetic test fixtures to genuine, validated Indian housing and geospatial data with zero data contamination:

- **RBI House Price Index (HPI)**:
  - 600 genuine quarterly observations spanning 2010-06-30 to 2025-03-31 (15 years) across 10 geographies: All India, Ahmedabad, Bengaluru, Chennai, Delhi, Jaipur, Kanpur, Kolkata, Lucknow, Mumbai.
  - Dimensionless index standard: `unit: "index_points"`, Base: FY 2010-11 = 100.0.
  - Normalization and deduplication pipeline (`normalize_rbi_hpi.py`) systematically resolved overlapping base years (2008-09 vs 2010-11) and pre-2010 series.
- **OpenStreetMap Civic Amenities**:
  - 232 real geospatial points of interest (schools, hospitals, transit, clinics, parking) across South Mumbai extracted via Overpass API and labeled with `data_status: "real"`.
- **Real-Market Forecasting Engine**:
  - Evaluated on hold-out validation sets (first 80% train, last 20% hold-out).
  - Out-of-sample MAE/RMSE benchmarked: All India MAE = 16.20 pts (RMSE 17.62 pts); Mumbai MAE = 17.63 pts (RMSE 19.20 pts).
  - Naive last-value persistence selected as optimal empirical baseline on post-COVID stabilization window.
- **Full-Stack Integration & Strict Separation**:
  - Express endpoints `/api/data/series`, `/api/data/sources`, `/api/data/summary`, and `/api/forecasting/predict?mode=real` serve real data.
  - Frontend charts strictly separate city-level HPI index points (Base: 2010-11=100) from neighborhood ₹/sq.ft estimates on independent axes with clear disclaimers.
- **Verification**: 68/68 Python tests passing; 20/20 Express API tests passing; Vite production build passing.

---

## ⚖️ Ethics, Provenance & Methodological Limitations

1. **No Real Estate Marketplace Features**: UrbanLens contains no transactional property listings, buyer lead generation, broker advertisements, or commercial booking mechanisms.
2. **Dimensionless Index vs. ₹/sq.ft**: The official RBI DBIE and NHB RESIDEX datasets provide dimensionless index points relative to a base period (100). They reflect temporal percentage price changes, **NOT** ₹/sq.ft capital values.
3. **No Ward-Level Price Registries**: Official Indian housing indices are aggregated strictly at the municipal or metropolitan statistical level. Micro-neighborhood variations are modeled separately using geospatial accessibility indicators (walk score, transit proximity) and labeled accordingly.
4. **Attribution**:
   - OpenStreetMap data © OpenStreetMap contributors, licensed under the ODbL.
   - RBI data courtesy of the Reserve Bank of India DBIE under Government of India open data norms.
   - NHB data courtesy of National Housing Bank RESIDEX.
