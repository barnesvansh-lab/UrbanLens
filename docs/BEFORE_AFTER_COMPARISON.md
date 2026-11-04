# URBANLENS BEFORE-AND-AFTER VISUAL & UX COMPARISON
## Architectural Transformation: From Generic SaaS to Urban Intelligence Atlas
**Document Version:** 2.0.0  
**Date:** November 2026  

---

## 1. High-Level Paradigm Shift

| Dimension | Before Redesign (Generic SaaS Blueprint) | After Redesign (The Urban Intelligence Atlas) |
| :--- | :--- | :--- |
| **Brand Statement** | None; generic admin title | *"See the city differently."* |
| **Color Scheme** | Generic Slate-50 background, Indigo-600 buttons, gray borders | Warm Ivory (`#F4F1E9`), Deep Forest (`#183D35`), Terracotta (`#C56C4B`), Stone (`#D9D5CA`), Charcoal (`#252B29`) |
| **Typography** | Generic system sans-serif everywhere | Editorial serif headlines (`Playfair Display`), geometric body (`Inter`), tabular numerals (`font-mono`) |
| **Navigation** | 9 scattered sidebar links creating cognitive overload | Simplified 5 core destinations with grouped dropdowns and secondary links |
| **Homepage (Overview)** | 4 isolated KPI cards, developer ingestion counters | Editorial hero introduction, 4 distinct dimensional inquiry portals, grounded data coverage dossier |
| **Terminology** | Exposed raw terms: `SARIMA(1,1,1)`, `CAGR %`, `Haversine`, `Z-score > 2.0` | Plain-language human answers: *"Average annual price growth"*, *"Distance to nearest facility"* |
| **Information Disclosure** | Flat: all technical details dumped onto every screen | Progressive 3-Level model: Level 1 (Summary), Level 2 (Assumptions), Level 3 (Methodology) |
| **Housing Market** | Split across two separate routes; dense multi-line toggles | Dominant centerpiece chart, city selector (10 RBI cities), clear annualized pace |
| **Cartographic Map** | Constrained inside a small card beside a dense table | Large 7-column cartographic centerpiece with elegant floating dossier and category filters |
| **Affordability** | 8 disjointed horizontal tabs; confusing start point | Guided 3-step workflow (Property → Household → Verdict) with instant multi-scenario simulation |
| **Transformation** | Anomaly detection presented without clear bottom-line verdict | Executive 4-question synthesis, honest `INSUFFICIENT EVIDENCE FOR GENTRIFICATION` verdict |

---

## 2. Page-by-Page Visual Comparison

### 2.1 Overview Homepage (`/`)
* **Before:**
  * Dominated by a blue demo alert banner, 4 generic rounded KPI metric cards, and technical database ingestion counters.
  * Looked like a database admin console.
* **After:**
  * Editorial hero section with the headline: *"Understand your city. Discover what is changing."*
  * Grounded institutional data foundation badge highlighting official RBI HPI (2010–2025 across 10 cities) and OpenStreetMap South Mumbai integration.
  * Four curated exploration portals answering the core questions of housing markets, neighbourhoods, transformation, and affordability.
  * Restrained metropolitan benchmark table with walk scores and transformation indicators.

### 2.2 Housing Market (`/market-trends`)
* **Before:**
  * Generic line charts surrounded by gray pill selectors and multi-line toggles.
  * Technical terminology such as "RBI HPI CAGR" displayed without context.
* **After:**
  * Dominant centerpiece chart displaying 15 years of official RBI HPI quarterly index points.
  * Plain-language summary bar: *"Average Annual Price Growth: +X.X% / year"*, current index level, and verified quarterly coverage.
  * Sector capital rates (₹/sq.ft) and monthly transaction volume seasonality clearly distinguished from macroeconomic indices.

### 2.3 Price Forecasting (`/forecasting`)
* **Before:**
  * Displayed model architecture names and statistical parameter grids in the default view.
* **After:**
  * Clean, dominant ComposedChart showing historical observations (solid green line), projected path (dashed terracotta line), and 95% confidence interval range (shaded terracotta fill).
  * Plain-language KPI strip: Baseline Level, Projected 6-Period Level, Projected 12-Period Trajectory, and Uncertainty Range.
  * Out-of-sample MAE/RMSE baseline error comparisons neatly contained within Level 3 methodology accordions.

### 2.4 Explore Neighbourhoods (`/neighborhood`)
* **Before:**
  * Leaflet map was squished into a card beside a dense amenities list.
* **After:**
  * Wide 7-column cartographic centerpiece with custom styled GeoJSON polygon boundaries.
  * Category filter toggles (Education, Healthcare, Transit, Parking).
  * Interactive architectural dossier on the right displaying mapped amenities, density per km², 500m walkshed count, and 1.0km catchment buffer.

### 2.5 Urban Transformation (`/transformation`)
* **Before:**
  * 8 cluttered tabs with statistical anomaly plots confusing statistical outlier events with causal gentrification conclusions.
* **After:**
  * Prominent academic verdict dossier: `INSUFFICIENT EVIDENCE FOR GENTRIFICATION` in Deep Forest and Terracotta.
  * The Four Central Questions answered upfront:
    1. *What changes have been observed?*
    2. *Which indicators are unusual?*
    3. *What evidence is available?*
    4. *What remains unknown?*
  * 5-Pillar Evidence Framework cleanly displayed with explicit confidence levels and data limitation notices.

### 2.6 Housing Affordability (`/affordability`)
* **Before:**
  * 8 horizontal tabs; users did not know which tab to open first or how property price connected to borrowing limits.
* **After:**
  * Guided 3-Step Financial Workflow prominently placed at the top:
    * **Step 1:** Property Details (Price, Down Payment, Interest Rate, Tenure)
    * **Step 2:** Household Finances (Monthly Income, Existing Debt, Savings)
    * **Step 3:** Affordability Evaluation (Monthly EMI, Upfront Cash Needed, FOIR Ratio Verdict)
  * Seamless tab switching between detailed EMI amortization, itemized upfront statutory fees, true monthly ownership, 10-year rent vs. buy wealth comparison, and conservative/moderate/aggressive scenarios.
