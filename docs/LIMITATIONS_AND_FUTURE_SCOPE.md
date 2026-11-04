# UrbanLens — Known Limitations & Future Scope

**Project**: UrbanLens — Urban Market Intelligence & Housing Affordability Analytics Platform  
**Target Milestone**: Milestone 8 (Agent 5 — Technical Documentation & Academic Report)  
**Date**: November 2026  
**Status**: APPROVED SCIENTIFIC DISCLOSURE  

---

## 1. Scientific Rigor & Philosophical Stance

UrbanLens adheres to strict scientific honesty and academic transparency. Rather than concealing data gaps behind opaque machine learning algorithms or speculative claims, this document explicitly identifies the structural, geographic, and financial boundaries of the current implementation, followed by a concrete research and development roadmap.

---

## 2. Comprehensive Limitations Analysis

### 2.1 Macro-vs-Micro Spatial Aggregation
* **Context**: The official House Price Index (HPI) published by the Reserve Bank of India (RBI) operates at the metropolitan agglomeration tier (e.g., Greater Mumbai).
* **Limitation**: Urban housing markets exhibit acute spatial heterogeneity. A metropolitan-wide index reflects citywide tendencies across central, suburban, and peripheral corridors, but cannot capture the distinct micro-market pricing dynamics of localized South Mumbai precincts (e.g., Colaba, Fort) versus outer suburban belts (e.g., Thane, Navi Mumbai).
* **System Safeguard**: UrbanLens strictly forbids disaggregating or multiplying citywide RBI HPI index points into neighborhood per-square-foot listing estimates. In the UI and API documentation, macro HPI data is explicitly isolated from localized amenity densities.

### 2.2 Point-in-Time Nature of OpenStreetMap Amenity Extracts
* **Context**: Civic infrastructure nodes (schools, clinics, hospitals, transit stops, parking facilities) were extracted via the OpenStreetMap Overpass API for South Mumbai.
* **Limitation**: While OpenStreetMap provides high-fidelity geographic coordinates and tagging for currently existing infrastructure, standard API extracts represent a single point-in-time snapshot (October 2026). Standard extracts lack historical emergence timestamps and cannot prove that amenity density expanded by a specific percentage over the 2015–2025 period.
* **System Safeguard**: The Urban Transformation Evidence Engine explicitly requires longitudinal persistence before validating transformation hypotheses. Because OSM lacks historical timestamps in point-in-time extracts, the system deterministically outputs the verdict `INSUFFICIENT EVIDENCE`, preventing spurious gentrification or causality claims.

### 2.3 Fixed-Rate Assumption in Floating-Rate Indian Mortgage Markets
* **Context**: The Housing Affordability Engine calculates reducing-balance amortization schedules based on a constant nominal annual interest rate over the selected tenure ($1 \le n \le 40$ years).
* **Limitation**: In the Indian retail banking landscape, over 95% of residential home loans are floating-rate mortgages pegged to the Reserve Bank of India's External Benchmark Lending Rate (EBLR / Repo Rate). Over a 20-year horizon, macroeconomic monetary tightening or easing cycles alter the effective interest rate, causing banks to extend loan tenure or adjust monthly EMIs.
* **System Safeguard**: To help users evaluate interest rate volatility, the platform provides the Financial Scenario Simulator (`POST /api/affordability/scenarios`), allowing side-by-side comparison under baseline (8.5%), stress-test (+100 bps / 9.5%), and expansionary (-100 bps / 7.5%) conditions.

### 2.4 Pre-Tax Basis in Rent vs. Buy Equivalence
* **Context**: Indian home loans historically offered tax shields under Section 24(b) (deduction up to ₹2,00,000 on interest) and Section 80C (deduction up to ₹1,50,000 on principal repayment) of the Income Tax Act, 1961.
* **Limitation**: Since the introduction of the default New Tax Regime (Section 115BAC) under Union Budget 2023, these deductions are disallowed for taxpayers opting for the revised slab structure. Because individual tax liability depends on total income, itemized deductions, and individual tax regime election, embedding an assumed tax rebate would distort generalized cash-flow comparisons.
* **System Safeguard**: All rent-versus-buy cash-flow equations are evaluated on a transparent pre-tax basis. A clear disclaimer informs users that personalized post-tax benefits under the Old Tax Regime may modestly improve homeownership economics.

### 2.5 Absence of Ward-Level Longitudinal Demographic Census Data
* **Context**: The 2021 Census of India was officially postponed. Consequently, the latest available nationwide decennial census data dates to 2011.
* **Limitation**: Sub-ward demographic shifts (median household income, educational attainment, tenure type) cannot be verified empirically at the micro-locality level for 2020–2025.
* **System Safeguard**: The platform utilizes synthetic demo fixtures for demographic indicators in test suites and explicitly marks them with `data_status: synthetic_test` or `synthetic_demo`, maintaining clear visual demarcation in the UI.

---

## 3. Future Scope & Research Roadmap

| Phase | Enhancement Scope | Technical Implementation Plan |
| :--- | :--- | :--- |
| **Phase 1: Official Ready Reckoner Rate API** | Ingestion of IGR Maharashtra annual Annual Statement of Rates (ASR). | Integrate sub-zone circle rates for precise government minimum valuation benchmarks per survey number. |
| **Phase 2: Stochastic Monte Carlo Simulation** | Probabilistic interest rate and equity yield modeling. | Execute 10,000-path stochastic interest walks via the Cox-Ingersoll-Ross (CIR) model to compute break-even probability distributions. |
| **Phase 3: OSM Historical Changeset Ingestion** | Tracking chronological infrastructure additions. | Ingest OpenStreetMap Historical Data dumps (OSH files) to reconstruct year-by-year commercial and civic openings from 2012 to 2025. |
| **Phase 4: Municipal Property Tax Assessment** | Localized property tax formulas. | Implement Municipal Corporation of Greater Mumbai (MCGM) Capital Value System (CVS) rules accounting for building age, structure type, and floor factor. |
| **Phase 5: Automated Spatial Clustering** | Spatial econometric models. | Implement Spatial Autoregressive (SAR) and Moran's $I$ clustering to detect geographic spillovers across adjacent municipal wards. |

---

## 4. Academic Disclosure Sign-Off

UrbanLens demonstrates that an academic urban analytics tool achieves greater utility and integrity by openly demarcating its boundaries, isolating empirical facts from synthetic fixtures, and repudiating unsubstantiated commercial claims.
