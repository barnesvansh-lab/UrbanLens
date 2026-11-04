# UrbanLens — Milestone 6 System Overview & Architectural Specification

**Milestone Title**: Advanced Urban Transformation & Gentrification Analysis Engine  
**Project**: UrbanLens — Urban Market Intelligence & Housing Affordability Analytics  
**Version**: Milestone 6.0 (Production Release)  
**Verification Date**: 2026-10-30  

---

## 1. Milestone 6 Objective & Scope

Milestone 6 enhances UrbanLens with an empirical, multi-domain analytical framework investigating whether urban neighborhoods exhibit measurable characteristics associated with urban transformation and gentrification.

Rather than relying on speculative labels or collapsing complex indicators into an arbitrary "gentrification score," UrbanLens implements a **defensible, multi-pillar evidence sufficiency engine**. It synthesizes:
1. Long-term housing price acceleration and volatility.
2. Intercensal demographic shifts and historical census baselines.
3. OpenStreetMap civic infrastructure density and walking accessibility.
4. Municipal building permits and redevelopment scheme transparency.
5. Housing affordability stress and displacement pressures.

---

## 2. System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        React + Vite Client UI                          │
│                                                                        │
│  [1. Overview]  [2. Housing Trends]  [3. Demographics]  [4. Infra]    │
│  [5. Evidence]  [6. Anomalies]       [7. Comparison]    [8. Sources]  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / JSON
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     Express + TypeScript API                           │
│                                                                        │
│  /api/transformation/overview       /api/transformation/indicators     │
│  /api/transformation/trends         /api/transformation/anomalies      │
│  /api/transformation/evidence       /api/transformation/areas          │
│  /api/transformation/areas/:id      /api/transformation/comparison     │
│  /api/transformation/data-sources   /api/transformation/quality        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ File Cache & Ingestion Read
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   Python Analytical & Evidence Engine                  │
│                                                                        │
│  • temporal_analysis.py    (CAGR, QoQ, YoY, Rolling Volatility)        │
│  • anomaly_detection.py    (Rolling Z-Score, IQR Fences)               │
│  • normalization.py        (Min-Max, Z-score, Robust Scale)            │
│  • compatibility.py        (Scale Guard, Continuity, Completeness)     │
│  • indicator_analysis.py   (16 Multi-Domain Indicators)                │
│  • evidence_engine.py      (5-Pillar Evidence Sufficiency & Verdict)   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Data Loading & Provenance
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   Empirical Data Layer (No Fiction)                    │
│                                                                        │
│  • RBI HPI (60 quarters, 2010–2025, Base 100) → VERIFIED REAL          │
│  • OSM Amenities (232 South Mumbai nodes)     → VERIFIED REAL          │
│  • Census 2001 & 2011 (Intercensal + PCA)     → VERIFIED REAL          │
│  • Census 2021 Tables (Postponed)             → DATA UNAVAILABLE       │
│  • Ward Transaction Prices (INR/sqft)         → DATA UNAVAILABLE       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Core Engine Components & Mathematical Formulation

### 3.1 Temporal Rate Engine (`temporal_analysis.py`)
- **Quarter-over-Quarter (QoQ)**: $\Delta_{\text{QoQ}, t} = \frac{V_t - V_{t-1}}{V_{t-1}} \times 100$
- **Compound Annual Growth Rate (CAGR)**: $\text{CAGR} = \left[ \left(\frac{V_{\text{end}}}{V_{\text{start}}}\right)^{1/Y} - 1 \right] \times 100$
  - *Full 15-year Horizon*: $+10.87\% / \text{year}$
  - *5-year Medium Term*: $+1.10\% / \text{year}$
- **Rolling Volatility**: 8-quarter moving window sample standard deviation on quarterly growth rates.
- **Market Regime Classification**: Categorizes trajectories into Strong Acceleration ($> 8\%$), Steady Growth ($3\text{--}8\%$), Plateau/Consolidation ($-2\text{--}3\%$), or Contraction ($< -2\%$).

### 3.2 Statistical Anomaly Detection (`anomaly_detection.py`)
- **Rolling Z-Score Outlier Model**:
  $$Z_t = \frac{\Delta_t - \bar{\Delta}_{t, W}}{\sigma_{t, W}}, \quad \text{Anomaly Flag if } |Z_t| \ge 2.0$$
- **Global Interquartile Range (IQR) Model**:
  $$\text{IQR} = Q_3 - Q_1, \quad \text{Fences} = [Q_1 - 1.5 \cdot \text{IQR}, \; Q_3 + 1.5 \cdot \text{IQR}]$$
- **Detected Shocks**: Six historical quarters exhibited valuation spikes/declines (e.g. Q4 2014, Q2 2016, Q1 2020), each tagged with statistical parameters and contextual caveats.

### 3.3 Normalization & Scale Compatibility (`normalization.py` & `compatibility.py`)
- **Mathematical Scaling**: Min-Max feature scaling, Z-score standardization, and rank-based robust scaling with boundary and zero-variance guards.
- **Scale Invariance Guard**: Prohibits composite mathematical indexing across mismatched geographic scales (e.g., combining city-level HPI with ward-level amenity density) to prevent **ecological fallacies**.
- **Continuity & Completeness**: Automated testing confirming 100% series completeness (60/60 quarterly records) and continuous calendar quarterly sequencing (0 gaps).

### 3.4 Multi-Pillar Evidence Sufficiency Engine (`evidence_engine.py`)
Synthesizes observations across five canonical transformation dimensions:
1. **Housing Market Dynamics**: `SUFFICIENT_MACRO_EVIDENCE` (High confidence). Sustained long-term appreciation (+370.39%) across official transaction assessment records.
2. **Demographic & Socioeconomic Composition Shifts**: `INSUFFICIENT_EVIDENCE` (None confidence). Census 2021 municipal tables remain unreleased.
3. **Infrastructure & Civic Accessibility**: `PARTIAL_STATIC_EVIDENCE` (Medium confidence). 232 verified OSM features, but single-snapshot non-velocity limits temporal attribution.
4. **Land-Use, Redevelopment & Construction**: `INSUFFICIENT_EVIDENCE` (None confidence). Municipal building permits lack open APIs; SRA maps are non-georeferenced.
5. **Housing Affordability & Displacement Pressure**: `INSUFFICIENT_EVIDENCE` (None confidence). Residential rental indices and eviction court registries are nonexistent in open data.

**Synthesized Verdict**:
$$\textbf{Overall Verdict} = \textbf{"INSUFFICIENT EVIDENCE"}$$
This transparent verdict adheres to rigorous academic standards: gentrification cannot be diagnosed from property price appreciation alone.

---

## 4. REST API Endpoint Catalog

All endpoints are mounted under `/api/transformation/`:

| Endpoint | Method | Description |
|---|:---:|---|
| `/overview` | `GET` | Macroeconomic summary, evidence verdict, anomaly count, indicator tally. |
| `/trends` | `GET` | 60 quarterly chronological observations with QoQ, YoY, and rolling volatility. |
| `/anomalies` | `GET` | Detected historical valuation shocks with Z-scores, IQR bounds, and caveats. |
| `/evidence` | `GET` | 5-pillar evaluation results, confidence tiers, and academic mandate statement. |
| `/indicators` | `GET` | 16 multi-domain indicators filterable by `category` and `data_status`. |
| `/areas` | `GET` | 4 South Mumbai research sub-regions with civic feature counts and density. |
| `/areas/:id` | `GET` | Detailed sub-region metrics with path traversal protection. |
| `/comparison` | `GET` | Multi-area comparative benchmarking (`ids=colaba,fort`). |
| `/data-sources` | `GET` | Complete 14-dataset provenance matrix. |
| `/quality` | `GET` | Pipeline quality report, series completeness, continuity, and integrity rules. |
| `/summary` | `GET` | Backward compatibility endpoint preserved from Milestone 5. |

---

## 5. Frontend Dashboard Architecture

The upgraded `UrbanTransformation.tsx` dashboard delivers eight responsive analytical panels:
1. **Transformation Overview**: Verdict banner, macroeconomic anchor KPIs, data integrity principles, quick-jump links.
2. **Housing Market Trends**: Dual-axis Recharts ComposedChart of 60 quarterly points, growth horizons grid, spatial aggregation disclosures.
3. **Demographic Analysis**: Decennial population shift chart (Census 2001 vs 2011), Census 2011 PCA baselines, Census 2021 data void explanation.
4. **Infrastructure Analysis**: Stacked bar chart of civic categories across sub-regions, spatial density benchmarks, single-snapshot non-velocity disclosure.
5. **Evidence Panel**: Detailed pillar evaluation cards, observed findings, analytical interpretations, and the academic mandate.
6. **Anomaly Detection**: Outlier model specification, IQR threshold summary, chronological shock event cards with statistical parameters.
7. **Area Comparison**: Side-by-side comparative benchmarking of Fort, Colaba, Malabar Hill, and Grant Road with dual-axis comparative charts and research boundary disclosures.
8. **Data Sources & Quality**: Filterable tabular inventory of all 14 datasets, pipeline completeness KPIs, and data integrity statements.

---

## 6. Verification Status

- **Python Test Suite**: 161 / 161 passed (0.608s).
- **Express Backend Test Suite**: 40 / 40 passed (253ms).
- **Client Production Build**: Vite production build passed in 19.25s with 0 errors.
- **Full-Stack Regression**: Milestones 1–5 regression suites 100% green.
