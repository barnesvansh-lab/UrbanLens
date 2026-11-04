# UrbanLens — System Architecture & Engineering Design

**Project**: UrbanLens — Urban Market Intelligence & Housing Affordability Analytics Platform  
**Target Milestone**: Milestone 8 (Final Engineering & Submission)  
**Date**: November 2026  
**Status**: APPROVED ARCHITECTURE  

---

## 1. High-Level Architectural Overview

UrbanLens is structured as a decoupled, four-tier web application designed to achieve high computational throughput, zero commercial bias, and an ultra-lightweight hardware footprint suitable for local developer execution (e.g., MacBook Air M2, 8 GB RAM, 256 GB SSD) or containerless cloud deployment.

```mermaid
graph TD
    subgraph Tier1["Tier 1: Presentation Layer (React + Vite + TypeScript)"]
        UI_Overview["Overview Dashboard"]
        UI_Trends["Market Trends (RBI HPI)"]
        UI_Forecast["Forecasting & Evaluation"]
        UI_Neighborhood["Neighborhood Intelligence (OSM)"]
        UI_Transformation["Urban Transformation & Anomalies"]
        UI_Affordability["Housing Affordability Engine"]
        UI_Data["Data Provenance & Methodology"]
    end

    subgraph Tier2["Tier 2: API Gateway Layer (Node.js + Express + TypeScript)"]
        GW_Router["Express Router (/api/*)"]
        GW_CORS["CORS Middleware (Whitelist Origin)"]
        GW_Limits["Body Parser (1 MB Ceiling)"]
        GW_Sanitize["Input Sanitization & Path Traversal Regex"]
        GW_Cache["In-Memory Static Cache"]
    end

    subgraph Tier3["Tier 3: Analytical Engine (Python 3 + TypeScript)"]
        ENG_HPI["HPI Ingestion & Validation Gate"]
        ENG_Forecasting["Time-Series Baselines (Naive/Linear)"]
        ENG_Anomaly["Rolling Z-Score & Tukey IQR Engine"]
        ENG_Sufficiency["5-Pillar Evidence Sufficiency Engine"]
        ENG_Financial["High-Precision Financial Math Core"]
    end

    subgraph Tier4["Tier 4: Data Repository Layer (Flat-File / Immutable)"]
        DATA_HPI["RBI All-India & City HPI (CSV)"]
        DATA_Geo["GeoJSON Boundaries (South Mumbai)"]
        DATA_Amenities["OSM Overpass Amenity Extracts (JSON)"]
        DATA_Transformation["14 Transformation Domain Series (JSON)"]
        DATA_Manifests["Quality Reports & Data Provenance (JSON)"]
    end

    Tier1 <-->|RESTful JSON / HTTP| Tier2
    Tier2 <-->|In-Memory Service Calls| ENG_Financial
    Tier2 <-->|File Read / Subprocess| Tier3
    Tier2 <-->|Direct File I/O| Tier4
    Tier3 <-->|File Ingestion & Output| Tier4
```

---

## 2. Detailed Tier Specifications

### 2.1 Tier 1: Presentation Layer
- **Framework**: React 18 with Vite build tooling and TypeScript.
- **Styling**: Tailwind CSS utilizing atomic utility classes for consistent typography, color tokens, and responsive grid layouts.
- **Data Visualization**: Recharts (SVG-based reactive line, bar, area, and composed charts) and React Leaflet (interactive OpenStreetMap vector tile rendering).
- **Optimization Strategy**:
  - Route-level code splitting using `React.lazy()` and React `<Suspense>` boundaries.
  - Dedicated Rollup vendor chunking:
    - `vendor.js`: Core runtime (`react`, `react-dom`, `react-router-dom`)
    - `charts.js`: Data visualization runtime (`recharts`)
    - `maps.js`: Geospatial rendering runtime (`leaflet`, `react-leaflet`)
  - All compiled page bundles are kept below 60 kB gzip.

### 2.2 Tier 2: API Gateway Layer
- **Server Runtime**: Node.js v20+ with Express v4 in strict TypeScript mode.
- **Security & Protection Stack**:
  - Strict Cross-Origin Resource Sharing (`cors`) locked to the designated frontend origin.
  - Strict payload ceiling: `express.json({ limit: '1mb' })`.
  - Comprehensive regex enforcement on route parameters (`/^[a-z0-9_-]{1,80}$/i`) preventing directory traversal attacks.
- **API Surface**: 28 structured REST endpoints grouped across 5 logical routers:
  1. `/api/health`
  2. `/api/data/*` (HPI observations, data sources, quality manifests)
  3. `/api/neighborhoods/*` (GeoJSON boundaries, OSM amenities, spatial analytics)
  4. `/api/forecasting/*` (Baseline models, metric evaluations, demo forecasts)
  5. `/api/transformation/*` (14-domain indicators, anomalies, evidence verdicts)
  6. `/api/affordability/*` (EMI, upfront costs, ownership, rent-vs-buy, FOIR)

### 2.3 Tier 3: Analytical & Financial Calculation Engine
- **Financial Calculation Core**:
  - Implemented in TypeScript (`server/src/services/affordabilityService.ts`) for sub-millisecond API response times.
  - Mirrored and verified by Python implementation (`server/python/affordability.py`) to guarantee multi-platform numerical equivalence.
  - Double-precision IEEE 754 floating-point mathematics without intermediate rounding truncation.
  - L'Hôpital boundary limit handling for zero-interest loan cases ($\lim_{r \to 0} \frac{P \cdot r}{1 - (1+r)^{-n}} = \frac{P}{n}$).
- **Transformation & Anomaly Engine**:
  - Python statistical modules (`server/python/transformation/`) computing rolling Z-scores and Tukey's interquartile range (IQR) anomalies across 60 quarters of data.
  - 5-Pillar Evidence Sufficiency Engine evaluating whether multi-indicator criteria are satisfied before rendering gentrification assessments.

### 2.4 Tier 4: Flat-File Data Repository Layer
- **Design Philosophy**: Completely eliminates dependencies on heavyweight database engines (PostgreSQL, MongoDB, or Redis) that would exhaust system RAM on 8 GB MacBook Air development hardware.
- **Storage Strategy**:
  - Time-series and index data stored as normalized CSVs (`data/real_data/`, `data/synthetic_data/`).
  - Spatial boundaries stored as RFC 7946 GeoJSON files (`data/neighborhoods/`).
  - Transformation indicators and quality metrics stored as structured JSON documents (`data/transformation/`).
  - Read-only during API execution; thread-safe, immutable, and version-controlled directly via Git.

---

## 3. Data Flow & Sequence Architecture

### 3.1 Affordability Simulation Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Homebuyer / Analyst
    participant Client as React Dashboard
    participant API as Express Gateway
    participant Engine as Affordability Engine
    participant Static as Market Context Store

    User->>Client: Enters Property Price, Tenure, Rates, Income
    Client->>API: POST /api/affordability/rent-vs-buy (JSON Body)
    API->>API: Validate Bounds (Price > 0, Horizon <= 40, Rates <= 30%)
    API->>Engine: computeRentVsBuy(params)
    Engine->>Engine: Compute Loan EMI & Amortization Schedule
    Engine->>Engine: Model Homeowner Asset Equity & Transaction Costs
    Engine->>Engine: Model Renter Invested Capital & Rent Escalation
    Engine->>Engine: Determine Break-Even Horizon & Terminal Wealth
    Engine-->>API: Return RentVsBuyResult Object
    API->>Static: Fetch RBI Mumbai HPI Benchmark
    API-->>Client: HTTP 200 OK (Trajectory, Equity, Disclaimers)
    Client->>User: Renders Comparison Curves & Wealth Delta
```

---

## 4. Error Handling & Fault Isolation

1. **Client-Side Fault Isolation**:
   - Every page component incorporates an `ApiErrorState` boundary with a user-friendly retry trigger, preventing network dropouts from crashing the entire application shell.
2. **Gateway-Level Error Handling**:
   - Centralized error handler catches unhandled exceptions, returning standard JSON error envelopes (`{ error: string, message: string }`) with appropriate HTTP status codes (400, 404, 500).
3. **Stateless Computation Isolation**:
   - User inputs for financial calculations are never written to disk or memory state caches, preventing state cross-contamination between concurrent requests.

---

## 5. Performance & Hardware Suitability

| System Component | Resource Footprint | Design Justification |
| :--- | :--- | :--- |
| Node.js API Server | ~45 MB RAM | Lightweight asynchronous event loop; zero background daemons |
| React Client Build | 850 kB Total JS (Split) | Gzip transfer weight ~260 kB; instantaneous page load |
| Data Storage | ~12 MB Disk | Flat-file CSV/JSON; zero database engine memory overhead |
| Total Execution Footprint | < 150 MB RAM | Leaves 7.85 GB RAM free on standard 8 GB M2 MacBook Air |
