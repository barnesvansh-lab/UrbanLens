# UrbanLens — Platform User Manual & Operating Guide

**Project**: UrbanLens — Urban Market Intelligence & Housing Affordability Analytics Platform  
**Target Milestone**: Milestone 8 (Final Engineering & Submission)  
**Date**: November 2026  
**Intended Audience**: Urban Analysts, Policy Evaluators, Prospective Homebuyers, Academic Reviewers  

---

## 1. Introduction & Navigation Architecture

UrbanLens provides a unified, responsive web workspace for urban real estate analytics, neighborhood infrastructure evaluation, and housing finance modeling.

### 1.1 Layout & Navigation Components
- **Collapsible Sidebar (Left)**: Allows rapid navigation across all primary analytical views. On mobile and tablet screens, the sidebar collapses into a slide-over drawer toggled via the hamburger icon.
- **Top Sticky Header**: Displays current module breadcrumbs, empirical data integration status badges, and quick links to API documentation.
- **Main Viewport**: Renders interactive charts, Leaflet geospatial maps, tabular amortization schedules, and dynamic parameter sliders.
- **Status Footer**: Displays copyright and system state:  
  *Empirical RBI HPI & OSM Data Integrated · Documented Demarcation for Synthetic Testing*.

---

## 2. Navigating the Analytical Modules

### 2.1 Overview Dashboard (`/`)
The primary executive summary screen provides high-level indicators:
- **Macro KPI Cards**:
  - *All-India HPI Composite*: Latest index value and quarterly delta.
  - *Mumbai Metropolitan HPI*: Latest index and 5-year CAGR.
  - *South Mumbai Amenity Coverage*: Total verified OSM educational, medical, and transit nodes.
  - *Evidence Sufficiency Status*: Real-time multi-indicator sufficiency verdict.
- **Macro Price Trend Chart**: 15-year historical trend line comparing All-India and Mumbai price trajectories with hoverable tooltips.
- **System Health & Provenance Panel**: Active status of external data connectors and pipeline quality metrics.

---

### 2.2 Market Trends (`/market-trends`)
Explores macroeconomic housing price movements across major Indian cities:
- **City Selector**: Toggle between Mumbai, Delhi, Bengaluru, Chennai, and All-India composite series.
- **Date Range Slider**: Narrow the observation window across the 2010–2025 timeline.
- **Annualized Growth & Volatility**: Interactive chart toggle displaying 4-quarter rolling standard deviation and annualized quarterly growth rates.
- **Empirical Provenance Badge**: Displays RBI DBIE citation and release date for the active series.

---

### 2.3 Forecasting & Model Evaluation (`/forecasting`)
Provides statistical baseline forecasts without black-box machine learning hype:
- **Model Selection Tabs**:
  1. *Linear Trend*: Fits ordinary least squares regression over historical trend points.
  2. *Naive Baseline*: Projects the latest observed value forward as a zero-growth benchmark.
  3. *Seasonal Naive*: Projects the corresponding calendar quarter from the previous year.
- **Horizon Selector**: Configure forecast horizon from 4 quarters (1 year) up to 12 quarters (3 years).
- **Prediction Intervals**: Visualizes 80% and 95% statistical confidence intervals shaded around the central forecast line.
- **Evaluation Metrics Table**: Real-time display of Mean Absolute Error (MAE), Root Mean Squared Error (RMSE), and Mean Absolute Percentage Error (MAPE) against chronological back-test splits.

---

### 2.4 Neighborhood Intelligence (`/neighborhood`)
Explores hyper-local urban infrastructure across South Mumbai:
- **Interactive Leaflet Geospatial Map**:
  - Pan and zoom across the southern tip of Mumbai.
  - Distinct colored boundary polygons demarcating:
    - `Colaba & Cuffe Parade` (Green)
    - `Fort Financial District` (Blue)
    - `Marine Lines & Churchgate` (Purple)
    - `Malabar Hill & Walkeshwar` (Amber)
- **Amenity Layer Filters**:
  - Toggle visibility of Education (schools, colleges), Healthcare (hospitals, pharmacies), Transit (train stations, bus hubs), and Commercial (supermarkets, cafes).
  - Clicking any node opens a popup with its exact name and OSM coordinates.
- **Amenity Density Breakdown**: Tabular summary showing count per km² and relative accessibility scores.
- **Side-by-Side Comparison (`/neighborhood/compare`)**: Select two neighborhoods to compare transit proximity, school density, and total infrastructure counts side-by-side.

---

### 2.5 Urban Transformation & Anomaly Engine (`/transformation`)
Examines structural changes across 8 urban transformation domains:
- **14-Indicator Framework Grid**: Browse through property price movements, amenity composition ratios, transit connectivity, redevelopment permits, and rental divergence.
- **Anomaly Detection Stream**: Review timeline of statistical outliers flagged by rolling Z-scores ($|Z| \ge 2.0$) and Tukey's interquartile range (IQR).
- **5-Pillar Evidence Sufficiency Card**:
  - Displays evaluation of Multi-Indicator Presence, Temporal Persistence, Spatial Coherence, Demographic Shift, and Data Reliability.
  - Clearly explains the **`INSUFFICIENT EVIDENCE`** verdict: Prevents premature gentrification claims due to the absence of longitudinal micro-spatial census data.

---

### 2.6 Housing Affordability Intelligence Engine (`/affordability`)
The core consumer and economic decision-support module, organized into 8 synchronized sections:

#### Section 1: Affordability Overview & Market Context
- Displays current prevailing home loan interest benchmarks (8.50% p.a.), standard tenure assumptions, and Mumbai median market pricing context.

#### Section 2: EMI Calculator & Amortization Schedule
- **Interactive Sliders**: Adjust Property Price (₹30 Lakhs to ₹10 Crores), Down Payment (10% to 50%), Annual Interest Rate (5% to 15%), and Tenure (5 to 30 years).
- **Amortization Breakdown**: Donut chart displaying total Principal versus total Interest payable.
- **Prepayment Simulation**: Enter an optional annual lump-sum prepayment amount to observe real-time tenure reduction and interest savings.
- **Full Amortization Table**: Expandable annual schedule showing Opening Balance, Principal Repaid, Interest Paid, Prepayment, and Closing Balance.

#### Section 3: Upfront Purchase Costs Breakdown
- Calculates all closing statutory and administrative charges:
  - *Down Payment*: Liquid equity required upfront.
  - *Stamp Duty*: 6.0% (Maharashtra statutory rate).
  - *Registration Fee*: 1.0% (statutory cap of ₹30,000 applied automatically for properties exceeding ₹30 Lakhs).
  - *Bank Processing Fee*: 0.5% + 18% GST.
  - *Legal & Inspection Reserve*: 0.5% provision.
- Visualizes total liquid capital required on Day 1 alongside loan principal.

#### Section 4: Monthly Cost of Ownership
- Goes beyond EMI to calculate the true monthly housing outlay:
  - Base Mortgage EMI.
  - Society Maintenance Charges (customizable ₹/month).
  - Property Tax Monthly Reserve.
  - Home Insurance Monthly Provision.
- Displays the "Hidden Ownership Burden" (the percentage by which true monthly outflow exceeds base EMI).

#### Section 5: Rent vs Buy Cash-Flow Simulator
- **Comprehensive Opportunity Cost Modeling**:
  - Compares the net wealth of buying a property versus renting an equivalent home and investing the down payment and monthly cash surplus in a market portfolio.
  - Configurable parameters: Monthly Rent, Annual Rent Escalation (5%–8%), Expected Property Appreciation (3%–7%), and Investment Portfolio Return (8%–12%).
- **Interactive Trajectory Chart**: Displays Net Wealth curves over a 1-to-30 year horizon.
- **Break-Even Analysis**: Highlights the exact year at which homeownership wealth eclipses tenant investment wealth (or indicates if renting remains superior across the horizon).

#### Section 6: Household Affordability & FOIR Budgeting
- Enter Gross Monthly Household Income and Existing Monthly Debt Obligations (car loans, education loans, credit card EMIs).
- Evaluates against the 50% Fixed Obligation to Income Ratio (FOIR) banking standard.
- Computes maximum allowable monthly housing EMI, maximum eligible loan amount, and recommended safe property purchase budget.
- Features a color-coded stress meter (Green: Safe $< 35\%$, Yellow: Moderate $35\%-50\%$, Red: Over-leveraged $> 50\%$).

#### Section 7: Financial Scenario Simulator
- Compares three pre-configured economic scenarios side-by-side:
  1. *Conservative*: High interest (9.5%), modest appreciation (3%), low equity return (7%).
  2. *Base Case*: Standard interest (8.5%), median appreciation (5%), balanced return (9%).
  3. *Optimistic*: Low interest (7.5%), strong appreciation (7%), bullish return (11%).
- Compare EMI, total interest, and 15-year net wealth across scenarios simultaneously.

#### Section 8: Methodology, Sources & Assumptions
- Complete transparent disclosure of all financial formulas, legal tax acts (Maharashtra Stamp Act 1958), source citations, and disclaimers.

---

### 2.7 Data Sources & Methodology Pages (`/data-sources`, `/methodology`)
- Comprehensive reference catalog containing full metadata, update cadences, download URLs, and mathematical derivations for academic evaluation.
