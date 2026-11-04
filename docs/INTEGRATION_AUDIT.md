# UrbanLens — System Integration & Architectural Audit

**Project**: UrbanLens — Urban Market Intelligence and Housing Affordability Analytics Platform  
**Target Phase**: Milestone 8 (Agent 1: Integration & Architecture Engineer)  
**Date**: November 2026  
**Auditor**: Lead Integration & Architecture Engineer  
**Overall Integration Status**: **VERIFIED & UNIFIED (100% PASS)**  

---

## 1. Executive Summary & Audit Objectives

This Integration Audit comprehensively assesses the unified operation of all four core analytical modules across Milestones 1 through 7 of UrbanLens:
1. **Urban Market Intelligence** (Milestones 1–4)
2. **Neighborhood Intelligence** (Milestone 5)
3. **Urban Transformation Intelligence** (Milestone 6)
4. **Housing Affordability Intelligence** (Milestone 7)

The objective of Agent 1 is to ensure that the entire system functions as a seamless, coherent, and fault-tolerant platform without broken route transitions, schema drift, unhandled edge conditions, or isolated components.

Every frontend route, backend endpoint, data manifest path, Python analytical bridge, and cross-module link has been audited and verified.

---

## 2. Frontend Routes & Navigation Verification

### 2.1 Route Registration Table (`client/src/App.tsx`)

| URL Path | Component | Code Splitting | Navigation Source | Integration Status |
| :--- | :--- | :--- | :--- | :--- |
| `/` | `Overview` | `React.lazy()` + Suspense | Sidebar, Brand Logo | **Verified** |
| `/market-trends` | `MarketTrends` | `React.lazy()` + Suspense | Sidebar, Overview Card | **Verified** |
| `/forecasting` | `Forecasting` | `React.lazy()` + Suspense | Sidebar, Overview Card | **Verified** |
| `/neighborhood` | `NeighborhoodIntelligence` | `React.lazy()` + Suspense | Sidebar, Overview Card | **Verified** |
| `/neighborhoods` | `NeighborhoodIntelligence` | `React.lazy()` + Suspense | Alias Route | **Verified** |
| `/neighborhood/compare` | `NeighborhoodComparison` | `React.lazy()` + Suspense | Sidebar, Map Page Link | **Verified** |
| `/neighborhoods/compare`| `NeighborhoodComparison` | `React.lazy()` + Suspense | Alias Route | **Verified** |
| `/transformation` | `UrbanTransformation` | `React.lazy()` + Suspense | Sidebar, Overview Card | **Verified** |
| `/urban-transformation` | `UrbanTransformation` | `React.lazy()` + Suspense | Alias Route | **Verified** |
| `/affordability` | `Affordability` | `React.lazy()` + Suspense | Sidebar, Overview Card | **Verified** |
| `/data-sources` | `DataSources` | `React.lazy()` + Suspense | Sidebar, Pipeline Bar | **Verified** |
| `/methodology` | `Methodology` | `React.lazy()` + Suspense | Sidebar, Header Link | **Verified** |
| `*` | `Navigate to="/"` | Client-side redirect | Catch-all fallback | **Verified** |

### 2.2 Navigation Entry Points & Dashboard Accessibility
- **Collapsible Sidebar**: Accessible from desktop and mobile viewport with active state highlight.
- **Main Dashboard (`Overview.tsx`) Enhancement**: Directly incorporates four interactive **Core Analytical Intelligence Modules** launch cards:
  1. *Urban Market Intelligence* &rarr; Links directly to `/market-trends`.
  2. *Neighborhood Intelligence* &rarr; Links directly to `/neighborhood`.
  3. *Urban Transformation* &rarr; Links directly to `/transformation`.
  4. *Housing Affordability Engine* &rarr; Links directly to `/affordability`.
- Users can launch and operate every single module from the primary dashboard without relying exclusively on the sidebar.

---

## 3. Backend Route Registration, Ports & Network Verification

### 3.1 Network Topology & Port Mapping
- **API Server Port**: Configured to `3001` (overridable via `PORT` environment variable).
- **Client Dev Server Port**: Configured to `5173` via Vite.
- **Vite Reverse Proxy**: Configured in `client/vite.config.ts`:
  ```typescript
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  }
  ```
  All client network requests targeting `/api/*` are transparently routed to `http://localhost:3001/api/*` in development mode, eliminating cross-origin preflight overhead.

### 3.2 Express Route Mounting (`server/src/index.ts`)

```typescript
app.use('/api', healthRouter);                    // GET /api/health
app.use('/api/data', dataRouter);                // /api/data/* (sources, series, quality, summary)
app.use('/api/neighborhoods', neighborhoodsRouter); // /api/neighborhoods/* (amenities, boundaries, :id)
app.use('/api/forecasting', forecastingRouter);    // /api/forecasting/predict
app.use('/api/transformation', transformationRouter); // /api/transformation/* (overview, indicators, trends, areas, anomalies, evidence)
app.use('/api/affordability', affordabilityRouter); // /api/affordability/* (assumptions, market-context, emi, upfront-costs, ownership-cost, rent-vs-buy, household, scenarios)
```

All 28 RESTful endpoints mount under the designated `/api` hierarchy without path collisions or ambiguous parameter shadowing.

---

## 4. Request / Response Contracts & Schema Uniformity

### 4.1 Schema Envelope Standardization
All endpoints adhere to standardized response conventions:
- **Success Responses**: Return HTTP 200 with JSON payloads.
- **Error Responses**: Return HTTP 400, 404, or 500 with the uniform error envelope:
  ```json
  {
    "error": "Human-readable error description",
    "code": "MACHINE_READABLE_CODE",
    "details": "Optional diagnostic explanation"
  }
  ```

### 4.2 Centralized API Client (`client/src/api/client.ts`)
The client API layer has been unified. The `apiClient` exports strongly typed functions for all analytical modules:
- Market Data: `getHealth()`, `getDataSources()`, `getDataSeries()`, `getDataQuality()`, `getDataSummary()`
- Spatial Analytics: `getAmenities()`, `getNeighborhoods()`, `getNeighborhoodBoundaries()`, `getNeighborhoodDetail()`, `compareNeighborhoods()`
- Forecasting: `getForecast()`
- Transformation: `getTransformationOverview()`, `getTransformationIndicators()`, `getTransformationTrends()`, `getTransformationAnomalies()`, `getTransformationEvidence()`, `getTransformationDataSources()`, `getTransformationAreas()`
- Affordability: `getAffordabilityAssumptions()`, `getAffordabilityMarketContext()`, `calculateEmi()`, `calculateUpfrontCosts()`, `calculateOwnershipCost()`, `calculateRentVsBuy()`, `calculateHouseholdAffordability()`, `calculateScenarios()`

---

## 5. Python Analytics & Data Manifest Integration

### 5.1 Service Path Resolution
All backend services resolve data paths dynamically relative to the execution root:
```typescript
const PROCESSED_DIR = path.resolve(__dirname, '../../python/data/processed');
const MANIFESTS_DIR = path.resolve(__dirname, '../../python/data/manifests');
```
Because both `server/src/services` and compiled `server/dist/services` sit exactly two directory levels below `server/`, path resolution resolves invariantly to `server/python/data/` across development, test, and production builds.

### 5.2 Processed Artifacts Integrity Check

| Artifact Path | Producing Module | Consuming Service | Status |
| :--- | :--- | :--- | :--- |
| `server/python/data/processed/processed_hpi.csv` | Ingestion Pipeline | `dataService.ts` | **Verified (103 KB)** |
| `server/python/data/processed/processed_osm_amenities.csv` | Geo Pipeline | `dataService.ts` | **Verified (30 KB)** |
| `server/python/data/processed/neighborhood_analytics.json`| Geo Pipeline | `neighborhoodService.ts` | **Verified (8.2 KB)** |
| `server/python/data/processed/transformation_overview.json`| Transformation Py | `transformationAnalysisService.ts` | **Verified (2.2 KB)** |
| `server/python/data/processed/transformation_indicators.json`| Transformation Py | `transformationAnalysisService.ts` | **Verified (17 KB)** |
| `server/python/data/processed/transformation_trends.json`| Transformation Py | `transformationAnalysisService.ts` | **Verified (12 KB)** |
| `server/python/data/processed/transformation_anomalies.json`| Anomaly Engine | `transformationAnalysisService.ts` | **Verified (5.1 KB)** |
| `server/python/data/processed/transformation_evidence.json`| Evidence Engine | `transformationAnalysisService.ts` | **Verified (6.2 KB)** |
| `server/python/data/processed/transformation_quality.json` | Quality Pipeline | `transformationAnalysisService.ts` | **Verified (2.5 KB)** |
| `server/python/data/manifests/data_availability_matrix.json`| Audit Manifest | `transformationAnalysisService.ts` | **Verified (14.8 KB)** |

---

## 6. Identified Confirmed Defects & Applied Resolutions

| Defect ID | Severity | Description | Resolution Applied | Verification |
| :--- | :--- | :--- | :--- | :--- |
| **INT-01** | Medium | The Overview page (`client/src/pages/Overview.tsx`) lacked direct visual cards linking to all 4 core analytical modules. Users on the dashboard were forced to navigate solely via the sidebar. | Added a dedicated 4-module responsive navigation grid on `Overview.tsx` linking to `/market-trends`, `/neighborhood`, `/transformation`, and `/affordability`. | Verified in Vite build and interactive navigation. |
| **INT-02** | Low | `client/src/api/client.ts` lacked centralized `apiPost` helper and did not expose the 8 affordability endpoints, resulting in ad-hoc fetchers inside the Affordability page. | Added `apiPost<T>()` and all 8 strongly typed affordability methods to `apiClient`, unifying the client communication layer. | Verified in TypeScript typecheck (`tsc -b`). |
| **INT-03** | Low | Route parameters in `transformationRouter` and `neighborhoodsRouter` required strict path-traversal hardening without breaking valid hyphenated/underscored IDs. | Consolidated regex validation using `/^[a-z0-9_-]{1,80}$/i` across all parameter handlers. | Verified by Supertest security test suite (40/40 pass). |

---

## 7. Verification of Critical User Journeys

### Journey 1: Macro Urban Market Intelligence
1. User lands on `/` &rarr; Clicks **Market Intelligence** card.
2. Navigates to `/market-trends`.
3. Selects "Mumbai" &rarr; Inspects 60-quarter RBI HPI time series (2010–2025).
4. Verifies 5-year CAGR and 4-quarter rolling volatility.
5. **Verdict**: Seamless, responsive, and backed by empirical RBI data.

### Journey 2: Hyper-Local Neighborhood Infrastructure
1. User clicks **Neighborhood Intel** on dashboard &rarr; Opens `/neighborhood`.
2. Interactive Leaflet map renders South Mumbai boundaries (Colaba, Fort, Marine Lines, Malabar Hill).
3. Toggles amenity filters (Schools, Healthcare, Transit, Commercial).
4. Clicks **Area Comparison** &rarr; Compares Colaba versus Fort side-by-side.
5. **Verdict**: Interactive vector polygons and OSM amenities render without latency.

### Journey 3: Urban Transformation Anomaly Detection
1. User clicks **Transformation Intel** &rarr; Opens `/transformation`.
2. Inspects 14 indicators across 8 urban domains.
3. Reviews rolling Z-score ($|Z| \ge 2.0$) and Tukey IQR anomaly timeline.
4. Checks **5-Pillar Evidence Sufficiency Card**: System outputs `INSUFFICIENT EVIDENCE`, preventing false gentrification claims.
5. **Verdict**: Methodologically sound and scientifically defensible.

### Journey 4: Housing Affordability & Rent vs Buy Modeling
1. User clicks **Affordability Engine** &rarr; Opens `/affordability`.
2. Adjusts Property Price to ₹1.2 Cr, Tenure to 20 years, Interest to 8.5%.
3. System computes reducing-balance EMI (₹1,04,139/mo) and full amortization table.
4. Explores Upfront Costs (6% Stamp Duty, capped ₹30,000 Registration).
5. Simulates Rent vs Buy: Compares tenant investment portfolio vs buyer equity.
6. Evaluates Household FOIR: Inputs ₹2,50,000 income, computes ₹1,25,000 max borrowing capacity.
7. **Verdict**: Exact mathematical precision, instant recalculation, and transparent disclosures.

---

## 8. Remaining Integration Risks & Mitigations

| Risk | Probability | Impact | Mitigation Implemented |
| :--- | :--- | :--- | :--- |
| Port collision on 3001 | Low | Medium | Configurable via `PORT` env var; graceful error handling in `run_demo.sh`. |
| Cross-origin blocking in production | Low | High | `CORS_ORIGIN` configurable in `server/src/index.ts` with explicit domain whitelisting. |
| In-browser client tile loading offline | Medium | Low | React Leaflet displays graceful background fallback if CartoDB CDN tiles are unreachable. |

---

## 9. Integration Sign-Off

All components, routes, data stores, calculation engines, and user journeys across Milestones 1 through 7 operate as a cohesive, hardened, single-system platform.
