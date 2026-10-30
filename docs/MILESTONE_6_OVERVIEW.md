# UrbanLens — Milestone 6 Architecture & System Overview
## Advanced Urban Transformation & Gentrification Analysis Engine

### 1. Executive Summary
Milestone 6 delivers an empirical, explainable urban transformation analysis engine for UrbanLens. Rather than relying on black-box predictions or fabricating socioeconomic data, the engine establishes a disciplined, multi-domain framework across:
- **Macroeconomic Housing Market Trajectories**: Real quarterly RBI House Price Index observations (2010–2025).
- **Statistical Growth Rate & Volatility Modeling**: Moving-window growth, acceleration, and rolling volatility.
- **Explainable Anomaly Detection**: Transparent rolling Z-score and Interquartile Range (IQR) fence outlier detection.
- **Multi-Pillar Evidence Sufficiency**: Cross-domain validation evaluating whether empirical data supports or refutes transformation hypotheses, returning `INSUFFICIENT EVIDENCE` where data is lacking.
- **Structured Data Audit Matrix**: Documenting 9 distinct Indian urban datasets across 4 clear status classifications.

---

### 2. Architectural Blueprint

```
UrbanLens Root
├── client/
│   └── src/
│       ├── api/
│       │   ├── client.ts              # apiClient endpoints for 10 transformation routes
│       │   ├── hooks.ts               # Custom React hooks (useTransformationTrends, etc.)
│       │   └── types.ts               # Strict TypeScript interfaces
│       └── pages/
│           └── UrbanTransformation.tsx # 7-tabbed academic analytics dashboard
│
├── server/
│   ├── src/
│   │   ├── routes/
│   │   │   └── transformation.ts      # 10 Express REST endpoints
│   │   ├── services/
│   │   │   └── transformationAnalysisService.ts # In-memory caching & safe JSON I/O
│   │   └── __tests__/
│   │       └── api.test.ts            # 36 Express integration tests
│   │
│   └── python/
│       ├── transformation/
│       │   ├── __init__.py
│       │   ├── data_sources.py        # 9-source data audit & provenance catalog
│       │   ├── temporal_analysis.py   # QoQ, YoY, CAGR, rolling volatility math
│       │   ├── anomaly_detection.py   # Rolling Z-score & IQR outlier algorithms
│       │   ├── indicator_analysis.py  # 16-indicator multi-domain framework
│       │   ├── evidence_engine.py     # 5-pillar sufficiency evaluation engine
│       │   └── run_transformation.py  # Pipeline runner generating cached JSON
│       ├── tests/
│       │   └── test_m6_transformation.py # 31 dedicated Python unit tests
│       └── data/processed/
│           ├── transformation_overview.json
│           ├── transformation_trends.json
│           ├── transformation_anomalies.json
│           ├── transformation_evidence.json
│           ├── transformation_quality.json
│           └── transformation_indicators.json
```

---

### 3. REST API Specifications (10 Endpoints)

| Endpoint | Method | Response Payload | Description |
|---|---|---|---|
| `/api/transformation/overview` | GET | `TransformationOverviewPayload` | High-level KPI summary, evidence verdict, data quality counts. |
| `/api/transformation/indicators` | GET | `TransformationIndicatorsResponse` | Full indicator catalog filterable by `category` and `data_status`. |
| `/api/transformation/trends` | GET | `TransformationTrendsPayload` | 60 quarterly chronological points with QoQ, YoY, and 8Q rolling volatility. |
| `/api/transformation/areas` | GET | `TransformationAreasResponse` | 4 South Mumbai sub-regions with amenity density metrics. |
| `/api/transformation/areas/:id` | GET | `TransformationAreaDetailResponse` | Detailed profile for an individual sub-region with boundary caveats. |
| `/api/transformation/comparison` | GET | `TransformationComparisonResponse` | Side-by-side benchmarking of 1 to 10 sub-regions. |
| `/api/transformation/anomalies` | GET | `TransformationAnomaliesPayload` | 6 historical growth anomalies with Z-scores, IQR bounds, and caveats. |
| `/api/transformation/evidence` | GET | `TransformationEvidencePayload` | 5-pillar evaluation returning `INSUFFICIENT EVIDENCE` verdict. |
| `/api/transformation/data-sources`| GET | `TransformationDataSourcesResponse`| Catalog of 9 audited Indian urban datasets with licenses. |
| `/api/transformation/quality` | GET | `TransformationQualityPayload` | Data audit summary, provenance metrics, and integrity rules. |
| `/api/transformation/summary` | GET | `TransformationSummaryResponse` | Backward-compatible Milestone 5 aggregate summary. |
