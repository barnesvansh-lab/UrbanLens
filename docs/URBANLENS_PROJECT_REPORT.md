# URBANLENS: An Urban Market Intelligence and Housing Affordability Analytics Platform

**Final-Year Major Project Report**  
**Bachelor of Technology (B.Tech) in Computer Science & Engineering**  
**Academic Year**: 2025–2026  
**Author**: Vansh Barnes  
**Project Repository**: `UrbanLens`  
**Target Environment**: macOS / Lightweight Cross-Platform Architecture  

---

## Abstract

Urban housing markets in developing economies, particularly India, are characterized by acute information asymmetry, fragmented empirical data, and opaque financial advisory tools. Commercial real-estate web portals are overwhelmingly optimized for advertising, property listings, and lead generation, frequently presenting unverified promoter claims as objective market metrics. Furthermore, existing consumer calculators typically apply simplified mortgage formulas that disregard statutory closing costs (stamp duty, registration), recurring maintenance overheads, differential inflation, and the opportunity cost of down-payment capital.

This project presents **UrbanLens**, a modular, web-based Urban Market Intelligence and Housing Affordability Analytics Platform engineered to provide empirical, transparent, and multi-dimensional urban analytics without commercial bias. UrbanLens unifies four analytical capabilities:
1. **Urban Market Intelligence**: Automated ingestion, quality assurance, and econometric evaluation of 15 years of Reserve Bank of India (RBI) House Price Index (HPI) records across major Indian metropolitan centers.
2. **Neighborhood Intelligence**: Hyper-local geospatial visualization of urban amenities derived from OpenStreetMap (OSM) Overpass extracts across South Mumbai sub-regions (Colaba, Fort, Marine Lines, Malabar Hill).
3. **Urban Transformation Intelligence**: An econometric anomaly and evidence-sufficiency engine tracking 14 indicators across 8 urban transformation domains, preventing spurious gentrification claims through rigorous statistical thresholding.
4. **Housing Affordability Intelligence**: A high-precision financial calculation engine computing reducing-balance loan amortization schedules, statutory transaction expenses, total cost of ownership, rent-versus-buy terminal wealth equivalence, and household Fixed Obligation to Income Ratio (FOIR) borrowing capacity.

The software is implemented using a lightweight, performant modern stack comprising React, Vite, TypeScript, Tailwind CSS, Recharts, and React Leaflet on the client; Node.js, Express, and TypeScript at the API gateway; and Python (pandas, NumPy) for mathematical modeling and pipeline validation. The platform is backed by a 248-test automated test suite and three build verification gates achieving a 100% pass rate.

---

## 1. Introduction & Background

### 1.1 Urban Growth and Indian Housing Economics
India's urban population is projected to exceed 600 million by 2030, driving unprecedented structural demand for urban residential infrastructure. In major economic hubs like Mumbai, housing costs represent the largest capital commitment and recurring expenditure in a citizen's lifetime. Despite this economic significance, the Indian real estate ecosystem suffers from systemic data opacity. Unlike developed economies with centralized multi-listing services (MLS) and mandatory public registry transaction feeds, Indian property pricing data is fragmented across municipal stamp offices, registration registries, banking appraisal panels, and developer promotional campaigns.

### 1.2 Information Asymmetry in Existing Commercial Portals
Commercial real estate aggregators operating in India are financially incentivized to maximize sales transactions and developer advertising revenues. Consequently:
- Advertised pricing indices often reflect listing quotes rather than verified registry settlements.
- Property search interfaces steer users toward commercial listings rather than long-term macro trend analyses.
- Affordability calculators universally present simplistic "loan eligibility" numbers designed to maximize borrower leverage, omitting statutory transaction frictions, property tax, insurance, society maintenance, and post-purchase investment opportunity costs.

### 1.3 The Need for an Independent Urban Intelligence Platform
To empower urban researchers, policy analysts, prospective homebuyers, and economic evaluators, there is a vital need for a non-commercial, scientifically grounded analytics system. UrbanLens was conceived to bridge this gap by treating urban housing as a multi-layered economic, spatial, and financial system rather than an advertising marketplace.

---

## 2. Problem Definition & Research Scope

### 2.1 Problem Statement
"To design, develop, and empirically validate an open, modular urban market intelligence and housing affordability analytics platform that synthesizes macroeconomic indices, hyper-local geospatial amenity distributions, multi-indicator transformation anomalies, and complete discounted cash-flow housing finance models into an objective decision-support system."

### 2.2 Scope Demarcation & Explicit Non-Goals
To preserve absolute analytical integrity, UrbanLens enforces strict boundaries:
- **No Commercial Marketplace**: UrbanLens contains zero property listings, broker profiles, booking inquiries, or lead-capture workflows.
- **No Synthetic Presentation as Empirical Truth**: Where empirical datasets are unavailable (such as longitudinal sub-ward income distributions), the system strictly displays "Demarcated Synthetic Demo" or flags "Insufficient Evidence" rather than presenting synthetic proxies as real observations.
- **No City-to-Neighborhood Conflation**: The platform strictly prohibits presenting macro city-level RBI HPI data as sub-locality transaction prices.
- **No Causation Fallacy in Gentrification**: Anomaly detection identifies statistical outliers in price or amenity growth, but explicitly repudiates claims of proven gentrification or displacement without verified micro-spatial census corroboration.

---

## 3. Literature Review & Research Gaps

### 3.1 Review of Existing Systems
1. **Commercial Portals (MagicBricks, 99acres, Housing.com)**:
   - *Strengths*: Vast inventory of active classifieds; high visual production value.
   - *Weaknesses*: Lead generation business model; lack of methodological transparency; absence of source citations; no integration of macroeconomic indices (RBI, NHB RESIDEX).
2. **Government Portals (RBI DBIE, NHB RESIDEX)**:
   - *Strengths*: Highly reliable, official statutory data based on bank loan valuations and registered transaction deeds.
   - *Weaknesses*: Static tabular formats (PDF, Excel); lack of interactive visualization; absent geospatial and neighborhood context; zero consumer-facing financial modeling tools.
3. **Academic Urban Analytics Frameworks**:
   - *Strengths*: Methodological rigor; multi-variable regression; econometric validation.
   - *Weaknesses*: Non-interactive, command-line or notebook-bound scripts; poor accessibility for non-technical stakeholders; absence of unified consumer affordability tools.

### 3.2 Identified Research Gaps
- **Gap 1: Disconnect Between Macro HPI and Hyper-Local Amenities**: Existing tools fail to contextualize macroeconomic price indices alongside micro-spatial walkability, school accessibility, and healthcare distributions.
- **Gap 2: Simplistic vs. Comprehensive Affordability**: Mainstream calculators calculate only $P \times r \times n$ EMI, completely ignoring upfront capital depletion (stamp duty, registration, legal fees) and terminal opportunity cost.
- **Gap 3: Unsubstantiated Urban Transformation Claims**: Emerging analytics startups frequently label neighborhoods as "rapidly gentrifying" based on single-variable price spikes, confusing noise with structural transformation.

---

## 4. System Architecture & Design

UrbanLens is structured as a decoupled, four-tier architecture designed for maximum performance, maintainability, and zero bloat:

```
+-----------------------------------------------------------------------------------+
|                            TIER 1: PRESENTATION LAYER                            |
|                 React 18 + Vite + TypeScript + Tailwind CSS + Recharts            |
|       [Overview]   [Market Trends]   [Forecasting]   [Neighborhoods]              |
|       [Urban Transformation]   [Affordability Engine]   [Data Sources]            |
+-----------------------------------------------------------------------------------+
                                       |
                               REST / JSON (HTTP)
                                       v
+-----------------------------------------------------------------------------------+
|                            TIER 2: API GATEWAY LAYER                             |
|                           Node.js + Express + TypeScript                          |
|    - CORS Hardening                  - Path Traversal Regex Filter                |
|    - 1 MB Body Rate Ceiling          - Safe Financial Input Normalization         |
|    - Stateless Router Hub            - Micro-Caching Layer                        |
+-----------------------------------------------------------------------------------+
                                       |
                  +--------------------+--------------------+
                  |                                         |
                  v                                         v
+-----------------------------------+     +-----------------------------------------+
|    TIER 3: ANALYTICAL ENGINE      |     |         TIER 4: DATA REPOSITORY         |
|         Python 3 / TypeScript     |     |          Flat-File Architecture         |
| - High-Precision EMI & Amortize   |     | - RBI All-India & Mumbai HPI CSVs       |
| - Rent vs Buy Cash Flow Engine    |     | - OpenStreetMap Overpass GeoJSON & JSON |
| - Time-Series Forecasting Models  |     | - 14 Transformation Domain Series       |
| - Rolling Z-Score & IQR Outliers  |     | - Data Quality & Provenance Manifests   |
+-----------------------------------+     +-----------------------------------------+
```

### 4.1 Presentation Layer (Client)
- Implemented in React 18 with Vite for instantaneous hot-module replacement and rapid production compilation.
- Utilizes Tailwind CSS for a professional, unified design system.
- Employs Recharts for interactive SVG charting and React Leaflet for interactive GeoJSON polygon rendering.
- Implements route-level code splitting (`React.lazy()` and `<Suspense>`) ensuring no vendor or application bundle exceeds 500 kB.

### 4.2 API Gateway Layer (Server)
- Built on Node.js and Express in strict TypeScript mode.
- Serves 28 RESTful endpoints across data delivery, neighborhood spatial queries, forecasting triggers, transformation evidence audits, and financial calculations.
- Hardened against OWASP vulnerabilities: strict regex for path parameters (`/^[a-z0-9_-]{1,80}$/i`), body payload ceiling of 1 MB, and origin-locked CORS.

### 4.3 Analytical & Calculation Engine
- Core financial formulas implemented in high-precision TypeScript with parallel reference implementations in Python (`server/python/affordability.py`).
- Eliminates premature floating-point rounding during amortization step computation.
- Implements L'Hôpital zero-interest limits and robust boundary validation.

### 4.4 Flat-File Data Repository
- Avoids the resource bloat of running heavy database engines (PostgreSQL, MongoDB) on resource-constrained development machines (MacBook Air M2 with 8 GB RAM).
- Stores structured datasets in version-controlled, immutable CSV and GeoJSON files with associated JSON schema manifests.

---

## 5. Detailed Module Methodologies & Mathematical Formulations

### 5.1 Module 1: Urban Market Intelligence (RBI HPI Engine)
- **Data Source**: Reserve Bank of India quarterly House Price Index (Base Year: 2010–11 = 100), spanning Q1 FY2010-11 through Q4 FY2024-25 across All India, Mumbai, Delhi, Bengaluru, and other major metros.
- **Compound Annual Growth Rate (CAGR)**:
  $$\text{CAGR}(t_0, t_n) = \left( \frac{\text{HPI}_{t_n}}{\text{HPI}_{t_0}} \right)^{\frac{1}{n}} - 1$$
- **Rolling Volatility**: Evaluated using a 4-quarter rolling standard deviation of annualized quarterly percentage changes.

### 5.2 Module 2: Neighborhood Intelligence (Spatial Analytics)
- **Geographic Focus**: South Mumbai core urban zone encompassing Colaba, Fort, Marine Lines, and Malabar Hill.
- **Geospatial Processing**: Polygon boundaries demarcated in RFC 7946 GeoJSON format.
- **Amenity Density Analysis**: Extracted from OpenStreetMap Overpass API across four functional categories: Education (schools, colleges), Healthcare (hospitals, clinics), Transit (railway stations, bus terminals), and Commercial/Lifestyle (cafes, markets).
- **Amenity Density Index (ADI)**:
  $$\text{ADI}_i = \frac{N_{\text{amenities}, i}}{\text{Area}_i \text{ (km}^2\text{)}}$$

### 5.3 Module 3: Urban Transformation & Anomaly Engine
Tracks 14 indicators across 8 distinct domains:
1. Property Price Movement (Macro RBI HPI)
2. Amenity Composition (OSM Commercial vs Civic Ratio)
3. Infrastructure Investment (Public Transit Proximity)
4. Commercial Vibrancy (Retail Density)
5. Housing Density & Redevelopment (Permit Activity)
6. Demographic Shift Indicators
7. Environmental & Public Space
8. Rental Yield Divergence

- **Statistical Anomaly Detection**:
  - *Rolling Z-Score*:
    $$Z_t = \frac{x_t - \mu_{w}}{\sigma_{w}}$$
    Flags an anomaly if $|Z_t| \ge 2.0$ over a rolling window $w = 8$ quarters.
  - *Tukey's Interquartile Range (IQR)*:
    $$\text{Threshold}_{\text{upper}} = Q_3 + 1.5 \times (Q_3 - Q_1), \quad \text{Threshold}_{\text{lower}} = Q_1 - 1.5 \times (Q_3 - Q_1)$$
- **Evidence Sufficiency Verdict**: Evaluates evidence against 5 core pillars (multi-indicator presence, temporal persistence, spatial coherence, demographic corroboration, and data reliability). If fewer than 3 pillars have longitudinal empirical backing, the system returns `INSUFFICIENT EVIDENCE`, preventing false gentrification conclusions.

### 5.4 Module 4: Housing Affordability Intelligence Engine

#### 5.4.1 Reducing-Balance Mortgage EMI
The monthly installment is calculated using standard reducing-balance amortization:
$$\text{EMI} = \frac{P \cdot r \cdot (1 + r)^n}{(1 + r)^n - 1}$$
where $P$ is principal loan amount, $r$ is monthly interest rate ($R_{\text{annual}} / 1200$), and $n$ is total tenure in months ($N_{\text{years}} \times 12$).

*Zero-Interest L'Hôpital Boundary Condition*:
When $r \to 0$:
$$\lim_{r \to 0} \text{EMI} = \lim_{r \to 0} \frac{P \cdot \left[ (1+r)^n + n \cdot r \cdot (1+r)^{n-1} \right]}{n \cdot (1+r)^{n-1}} = \frac{P}{n}$$
This ensures graceful execution without runtime `ZeroDivisionError` exceptions.

#### 5.4.2 Statutory Upfront Acquisition Costs
Unlike commercial calculators that assume property price equals total capital required, UrbanLens models the complete acquisition burden:
$$\text{Total Upfront Capital} = \text{Down Payment} + \text{Stamp Duty} + \text{Registration Fee} + \text{Processing Fee} + \text{Legal/Contingency}$$
- **Stamp Duty (Maharashtra)**: 6.0% (5% State Stamp Duty + 1% Local Body Surcharge).
- **Registration**: 1.0% of property value, capped at ₹30,000 for residential properties under Maharashtra Stamp Rules.
- **Loan Processing Fee**: 0.5% of loan principal + 18% GST.
- **Legal & Valuation Reserve**: Estimated at 0.5% (customizable).

#### 5.4.3 Total Monthly Ownership Burden
$$\text{Monthly Cost} = \text{EMI} + \text{Society Maintenance} + \text{Property Tax Provision} + \text{Home Insurance Provision}$$

#### 5.4.4 Rent-versus-Buy Terminal Wealth Equivalence
Models the comparative net-wealth trajectory of a homebuyer versus a tenant investing the capital difference over a continuous time horizon $T$ years ($t = 1, \dots, T$):

*Buyer's Net Wealth at Year $t$*:
$$\text{Wealth}_{\text{Buy}}(t) = \text{Property Value}(t) - \text{Remaining Loan Balance}(t) - \text{Selling Transaction Costs}(t)$$
$$\text{Property Value}(t) = P_{\text{purchase}} \times (1 + g_{\text{property}})^t$$

*Renter's Net Wealth at Year $t$*:
At $t = 0$, the renter retains the upfront capital:
$$W_{\text{Rent}}(0) = \text{Down Payment} + \text{Transaction Costs}$$
In each successive month $m$, the monthly cash-flow differential between homeownership expenses and current rent is invested (or liquidated) at market investment yield $r_{\text{invest}}$:
$$\Delta \text{CF}_m = \text{Cost}_{\text{Buy}, m} - \text{Rent}_m$$
$$W_{\text{Rent}, m} = W_{\text{Rent}, m-1} \times \left(1 + \frac{r_{\text{invest}}}{12}\right) + \Delta \text{CF}_m$$
Rent escalates annually at $g_{\text{rent}}$ (typically 5%–7% in Indian metros).  
The **Break-Even Year** is defined as the earliest integer $t^*$ where:
$$\text{Wealth}_{\text{Buy}}(t^*) \ge \text{Wealth}_{\text{Rent}}(t^*)$$

#### 5.4.5 Household Affordability & FOIR Budgeting
Calculates maximum safe borrowing based on the banking industry standard **Fixed Obligation to Income Ratio (FOIR)**:
$$\text{Max Allowable Total Debt} = \text{Monthly Gross Income} \times \text{FOIR}_{\text{limit}} \quad (\text{default: } 50\%)$$
$$\text{Max Affordable EMI} = \max\left(0, \text{Max Allowable Total Debt} - \text{Existing Monthly EMIs}\right)$$
$$\text{Max Loan Principal} = \text{Max Affordable EMI} \times \frac{(1+r)^n - 1}{r \cdot (1+r)^n}$$
$$\text{Affordable Property Budget} = \frac{\text{Max Loan Principal}}{1 - \text{Down Payment Pct}}$$

---

## 6. Implementation & Engineering Highlights

1. **Precision Currency Formatting**: Custom Indian numbering system formatter handling Lakhs (₹1,00,000) and Crores (₹1,00,00,000) across all input panels and Recharts tooltips.
2. **Interactive Amortization Table**: Tabular and graphical decomposition of principal repayment versus interest burn across loan life, featuring annual prepayment simulations that recompute interest savings in real time.
3. **Optimized Frontend Code-Splitting**: Recharts and Leaflet libraries are isolated into dedicated vendor chunks (`maps.js`, `charts.js`, `vendor.js`). All primary routes are dynamically loaded via `React.lazy()`, reducing initial page weight to under 22 kB.
4. **Security & Sandbox Hardening**: Comprehensive input sanitization, body parser limits, CORS domain locking, and zero persistence of user financial data.

---

## 7. Results, Testing & Verification

The platform was subjected to a comprehensive verification protocol across all tiers.
- **Python Unit & Pipeline Tests**: 172 tests executed in 0.093s. All assertions passed.
- **Express Core API Tests**: 40 tests executed in 32.2 ms. All assertions passed.
- **Express Affordability Tests**: 36 tests executed in 51.0 ms. All assertions passed.
- **Static Type Safety**: TypeScript compiler (`tsc` and `tsc -b`) compiled both frontend and backend codebases with zero errors.
- **Vite Production Bundler**: Successfully compiled all 2,270 modules into optimized static chunks in 1.98s with zero warnings.

```
Total Test Suite: 248 Automated Tests + 3 Build Verification Gates = 251 PASS (100% Pass Rate)
```

---

## 8. Limitations & Future Scope

### 8.1 Current Limitations
1. **Macro-vs-Micro Spatial Aggregation**: Official RBI HPI data is published at the metropolitan city tier (Mumbai), whereas local property values vary significantly between sub-localities.
2. **Static Amenity Snapshots**: OpenStreetMap Overpass amenity extracts represent point-in-time infrastructure and cannot serve as longitudinal proof of historical amenity growth.
3. **Constant Interest Rate Assumption**: Mortgages are modeled on fixed reducing-balance schedules; real-world Indian home loans are predominantly floating-rate facilities linked to RBI's External Benchmark Lending Rate (EBLR).
4. **Tax Regime Variations**: Tax deductions on home loan interest (Section 24b) and principal (Section 80C) differ substantially between the Old and New Tax Regimes.

### 8.2 Future Scope
1. **Municipal Property Tax Integration**: Ingesting ward-level ready reckoner rates and municipal property tax rate cards.
2. **Monte Carlo Simulation**: Introducing stochastic interest rate shocks and volatile equity return distributions into the Rent-versus-Buy engine.
3. **Automated Overpass Cron Ingestion**: Implementing automated quarterly OSM delta sync to track newly added educational, medical, and transit nodes.

---

## 9. Conclusion

UrbanLens establishes a rigorous, transparent, and mathematically grounded alternative to commercial real estate portals. By synthesizing macroeconomic house price indices, hyper-local geospatial infrastructure, robust statistical anomaly detection, and comprehensive housing finance modeling, the platform eliminates information asymmetry without commercial bias. Built with clean software engineering principles, comprehensive test coverage, and a lightweight footprint, UrbanLens represents a complete, academically sound engineering artifact.

---

## References

1. Reserve Bank of India (RBI). (2025). *Quarterly House Price Index (Base: 2010–11 = 100)*. Reserve Bank of India Database on Indian Economy (DBIE).
2. National Housing Bank (NHB). (2024). *NHB RESIDEX: Housing Price Index for Indian Cities*. NHB Publications.
3. OpenStreetMap Contributors. (2025). *Planet Dump and Overpass API for Greater Mumbai Infrastructure*. OpenStreetMap Foundation.
4. Government of Maharashtra. (2024). *The Maharashtra Stamp Act (Act LX of 1958) & Registration Fee Rules*. Inspector General of Registration and Stamps (IGR Maharashtra).
5. Indian Banks' Association (IBA). (2024). *Model Retail Home Loan Guidelines & Credit Risk Norms: Fixed Obligation to Income Ratio (FOIR)*.
6. Tukey, J. W. (1977). *Exploratory Data Analysis*. Addison-Wesley Publishing Company.
7. Hyndman, R. J., & Athanasopoulos, G. (2018). *Forecasting: Principles and Practice* (2nd ed.). OTexts: Melbourne, Australia.
