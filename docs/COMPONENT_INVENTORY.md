# URBANLENS COMPONENT INVENTORY
## The Urban Intelligence Atlas Component Catalog
**Document Version:** 2.0.0  
**Framework:** React 18 / TypeScript / Tailwind CSS v4  

---

## 1. Layout & Navigation Components

### `Navigation.tsx`
* **Path:** `client/src/components/layout/Navigation.tsx`
* **Purpose:** Responsive top navigation bar adhering to the new 5-section Information Architecture.
* **Features:**
  * Editorial brand mark with terracotta square emblem.
  * Dropdown menus for grouped analytical workflows (Housing Market, Explore Neighbourhoods).
  * Direct links to Urban Transformation and Affordability.
  * Secondary discreet links to Methodology and About & Data.
  * Mobile drawer menu with full keyboard navigation and accessible toggle.

---

## 2. Shared UI Design Components

### `EditorialPageHeader.tsx`
* **Path:** `client/src/components/ui/EditorialPageHeader.tsx`
* **Purpose:** Standardized editorial header for all major analytical views.
* **Props:** `title`, `subtitle`, `badge`, `children`, `className`.
* **Features:** Large serif typography, bottom stone divider, optional action buttons and provenance pills.

### `SectionHeading.tsx`
* **Path:** `client/src/components/ui/SectionHeading.tsx`
* **Purpose:** Clean editorial subsection title with secondary description and optional action slot.

### `MethodologyAccordion.tsx`
* **Path:** `client/src/components/ui/MethodologyAccordion.tsx`
* **Purpose:** Progressive disclosure container for Level 2 (Assumptions) and Level 3 (Formulas) content.
* **Props:** `title`, `level` (2 | 3), `defaultOpen`, `children`.
* **Features:** Animated chevron, semantic level tag (`More detail` or `Technical methodology`).

### `MetricCard.tsx`
* **Path:** `client/src/components/ui/MetricCard.tsx`
* **Purpose:** Quiet, high-contrast numerical highlight card with optional inline sparkline.
* **Colors:** Deep Forest for positive growth, Terracotta for negative, Muted Sage for neutral.

### `DataStatusBadge.tsx`
* **Path:** `client/src/components/ui/DataStatusBadge.tsx`
* **Purpose:** Explicit visual demarcation of data provenance (`real`, `synthetic_demo`, `synthetic_test`, `unavailable`).

### `DemoNotice.tsx`
* **Path:** `client/src/components/ui/DemoNotice.tsx`
* **Purpose:** Restrained, dismissible terracotta alert communicating academic research status.

### `LoadingSpinner.tsx` & `ApiErrorState.tsx` & `EmptyState.tsx`
* **Path:** `client/src/components/ui/`
* **Purpose:** Semantic async lifecycle states styled with the Atlas palette.

---

## 3. Visualization & Chart Components

### `PriceTrendChart.tsx`
* **Path:** `client/src/components/charts/PriceTrendChart.tsx`
* **Purpose:** Recharts multi-line price dynamics (₹/sq.ft) across 60 months.
* **Palette:** Deep Forest, Terracotta, Soft Clay, Muted Sage, Warm Ochre, Charcoal.

### `MarketOverviewChart.tsx`
* **Path:** `client/src/components/charts/MarketOverviewChart.tsx`
* **Purpose:** Sector benchmark capital rate bar chart with custom rounded corners.

### Interactive Leaflet Geospatial View
* **Path:** `client/src/pages/NeighborhoodIntelligence.tsx`
* **Purpose:** Full-featured Leaflet cartographic map with custom GeoJSON boundary polygons, amenity markers, and live recenter hooks.

---

## 4. Analytical Page Modules

| Page Component | Route | Key Features |
| :--- | :--- | :--- |
| `Overview.tsx` | `/` | Editorial hero, 4 exploration portals, macro indicators, benchmark snapshot table. |
| `MarketTrends.tsx` | `/market-trends` | Official RBI HPI quarterly index chart, city selector, sector capital rates, seasonality index. |
| `Forecasting.tsx` | `/forecasting` | ComposedChart (historical + point projection + 95% CI), out-of-sample error metrics. |
| `NeighborhoodIntelligence.tsx` | `/neighborhood` | Interactive cartographic atlas, amenity category filters, walkshed density metrics. |
| `NeighborhoodComparison.tsx` | `/neighborhood/compare` | Multi-area side-by-side benchmarking matrix and category distribution bar charts. |
| `UrbanTransformation.tsx` | `/transformation` | 8-tab multi-domain engine, executive 4-question synthesis, 5-pillar evidence evaluation. |
| `Affordability.tsx` | `/affordability` | Guided 3-step decision workflow, reducing-balance EMI, upfront cash, rent vs buy simulation. |
| `DataSources.tsx` | `/data-sources` | Data source provenance cards, ingestion quality reports, normalized data dictionary. |
| `Methodology.tsx` | `/methodology` | 4-stage pipeline architecture, mathematical formulas (reducing balance, Haversine, FOIR). |
