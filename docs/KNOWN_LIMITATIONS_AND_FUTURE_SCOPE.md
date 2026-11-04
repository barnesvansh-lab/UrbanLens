# UrbanLens — Known Limitations & Future Scope

**Project**: UrbanLens — Urban Market Intelligence & Housing Affordability Analytics Platform  
**Target Milestone**: Milestone 8 (Final Engineering & Submission)  
**Date**: November 2026  
**Status**: APPROVED SCIENTIFIC DISCLOSURE  

---

## 1. Philosophical Stance on Academic Rigor

UrbanLens adheres to strict scientific honesty. Rather than masking data limitations behind speculative machine learning algorithms or promotional claims, this document explicitly details every technical, spatial, and financial boundary of the current system, followed by a concrete research roadmap.

---

## 2. Comprehensive Limitations Analysis

### 2.1 Macro-vs-Micro Spatial Aggregation
- **Observation**: The official House Price Index (HPI) published by the Reserve Bank of India (RBI) operates at the metropolitan agglomeration tier (e.g., Greater Mumbai).
- **Limitation**: Real estate pricing within a mega-city exhibits severe spatial heterogeneity. A metropolitan index cannot reflect the distinct micro-market dynamics of South Mumbai heritage precincts (Colaba, Fort) versus outer suburban corridors.
- **System Safeguard**: The system explicitly flags this demarcation in the UI and documentation. It forbids multiplying or mapping metropolitan HPI index points directly to localized per-square-foot listing estimates.

---

### 2.2 Point-in-Time Static Nature of OpenStreetMap Amenity Extracts
- **Observation**: Infrastructure nodes (schools, hospitals, transit terminals) were extracted via the OpenStreetMap Overpass API for South Mumbai as a verified point-in-time snapshot.
- **Limitation**: While OSM provides high-fidelity geographic coordinates and tags for existing amenities, a single-snapshot extraction does not contain historical emergence timestamps. It cannot prove that amenity density expanded by a specific percentage over the 2015–2025 period.
- **System Safeguard**: The Urban Transformation Evidence Engine explicitly requires longitudinal persistence before validating transformation hypotheses. Because OSM lacks historical timestamps in standard extracts, the system flags `INSUFFICIENT EVIDENCE`, preventing spurious gentrification claims.

---

### 2.3 Fixed-Rate Assumption in Floating-Rate Indian Mortgage Markets
- **Observation**: The Housing Affordability Engine calculates reducing-balance amortization schedules based on a constant nominal annual interest rate over the chosen tenure ($1 \le n \le 40$ years).
- **Limitation**: In the Indian retail banking landscape, over 95% of residential mortgages are floating-rate loans pegged to the Reserve Bank of India's External Benchmark Lending Rate (EBLR / Repo Rate). Over a 20-year horizon, macroeconomic monetary tightening or easing cycles alter the effective interest rate, causing banks to extend loan tenure or adjust monthly EMIs.
- **System Safeguard**: To help users evaluate rate volatility, the platform provides the Financial Scenario Simulator (`POST /api/affordability/scenarios`), allowing side-by-side comparison under $+100\text{ bps}$ and $+200\text{ bps}$ stress-test conditions.

---

### 2.4 Tax Regime Heterogeneity (Old vs. New Tax Regime)
- **Observation**: Historically, Indian home loans provided significant tax shields under Section 24(b) (deduction up to ₹2,00,000 on interest) and Section 80C (deduction up to ₹1,50,000 on principal repayment) of the Income Tax Act, 1961.
- **Limitation**: Since the introduction of the default New Tax Regime (Section 115BAC) in Union Budget 2023, these deductions are disallowed for taxpayers electing the revised tax slabs. Because individual tax liability depends on the user's total income, deductions, and regime election, embedding an assumed tax rebate would distort cash-flow comparisons.
- **System Safeguard**: All rent-versus-buy cash-flow equations are evaluated on a transparent pre-tax basis. A clear disclaimer informs users that personalized post-tax benefits under the Old Tax Regime may modestly improve homeownership economics.

---

### 2.5 Absence of Ward-Level Longitudinal Demographic Census Data
- **Observation**: The 2021 Census of India was officially postponed. Consequently, the latest available nationwide decennial census data dates to 2011.
- **Limitation**: Sub-ward demographic shifts (median household income, educational attainment, tenure type) cannot be verified empirically at the micro-locality level for 2020–2025.
- **System Safeguard**: The platform utilizes synthetic demo fixtures for demographic indicators in test suites and explicitly marks them with `data_status: synthetic_demo`, maintaining clear visual demarcation in the UI.

---

## 3. Future Scope & Research Roadmap

```
+-----------------------------------------------------------------------------------+
| Research Roadmap                                                                 |
+----+-----------------------------+------------------------------------------------+
| Q  | Enhancement Phase           | Technical Scope                                |
+----+-----------------------------+------------------------------------------------+
| Q1 | Ready Reckoner Rate API     | Ingestion of IGR Maharashtra annual ASR data   |
| Q2 | Monte Carlo Simulation      | Stochastic interest and equity yield modeling  |
| Q3 | OSM Changeset Ingestion     | Tracking historical node additions via OSHEC   |
| Q4 | Municipal Tax Assessment    | Integration of BMC ward property tax formulas  |
| Q5 | Commercial Rental Spread    | Web-scraping verified lease agreements via IGR |
+----+-----------------------------+------------------------------------------------+
```

### 3.1 Municipal Ready Reckoner & Stamp Office Integration
Future releases will interface with the annual Annual Statement of Rates (ASR) published by the Department of Registrations and Stamps, Maharashtra. This will provide official government base rates for property transactions at the specific survey-number and road-tier resolution.

### 3.2 Stochastic Monte Carlo Financial Modeling
Rather than deterministic interest rates and equity growth assumptions, the calculation engine will incorporate Monte Carlo simulation:
- Modeling 10,000 paths of stochastic interest rate walks ($\text{d}r_t = \kappa(\theta - r_t)\text{d}t + \sigma \sqrt{r_t}\text{d}W_t$ via the Cox-Ingersoll-Ross model).
- Generating probabilistic break-even distributions (e.g., "72% probability that Buying outperforms Renting over a 15-year horizon").

### 3.3 Historical OpenStreetMap Changeset Archive Parsing
By parsing OpenStreetMap Historical Data dumps (OSH files), future iterations will reconstruct the exact chronological introduction of cafes, retail stores, and schools between 2012 and 2025, enabling verified longitudinal infrastructure velocity metrics.

### 3.4 Municipal Property Tax Assessment Engine
Integrating the Municipal Corporation of Greater Mumbai (MCGM) Capital Value System (CVS) rules to automatically calculate property tax based on building age, nature of construction, and floor factor.
