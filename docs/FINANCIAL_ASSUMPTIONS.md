# UrbanLens — Indian Housing Finance Reference Assumptions & Methodology

**Document Version**: 1.0.0  
**Domain**: Housing Affordability Intelligence Engine (Milestone 7)  
**Target Architecture**: Central Reference Configuration & Provenance Registry  

---

## 1. Executive Summary & Governance Mandate

Financial scenario analysis in housing markets requires baseline reference assumptions—such as prevailing mortgage interest rates, statutory stamp duty schedules, recurring society maintenance costs, rental escalation rates, and alternative investment returns.

To maintain strict scientific and academic integrity, UrbanLens adheres to three governance mandates:
1. **Source Attribution & Effective Dates**: Every financial default is mapped to its originating institution, statutory act, or empirical economic series with explicit effective dates.
2. **Clear Classification**: Parameters are strictly bifurcated into **Verified Official Benchmarks** (e.g. RBI repo-linked lending rates, statutory state stamp duty acts) versus **Illustrative Market Defaults** (e.g. maintenance charges, equity portfolio returns).
3. **Full User Editability**: No financial parameter is hardcoded as an immutable constant. Every assumption is fully editable in the interface and API to accommodate custom user circumstances and changing economic conditions.

---

## 2. Comprehensive Financial Assumptions Registry

### 2.1 Retail Mortgage Financing Benchmarks

| Parameter ID | Parameter Name | Default Value | Sensible Configured Bounds | Primary Source | Effective Date | Geographic Scope | Status | Methodological Rationale |
|---|---|:---:|:---:|---|:---:|:---:|:---:|---|
| `default_interest_rate` | Benchmark Retail Home Loan Interest Rate | **8.50% p.a.** | 0.0% to 20.0% | Reserve Bank of India (RBI) / State Bank of India EBLR Schedule | Q4 FY 2024–25 | All India (Prime Salaried) | **Verified Benchmark** | Prime floating retail home loans from major public and private banks (SBI, HDFC Bank, ICICI Bank) hover between 8.35% and 8.75% for CIBIL $\ge 750$. |
| `default_loan_tenure` | Standard Retail Loan Tenure | **20 Years** | 1 to 40 Years | Indian Banking Industry Practice | FY 2024–25 | All India | **Illustrative Assumption** | 20 years (240 months) is the modal mortgage term in urban India, balancing EMI affordability with total interest load. |
| `default_down_payment_pct` | Standard Down Payment Share | **20.0%** | 0.0% to 99.0% | RBI Prudential Regulations (Master Direction) | Continuous | All India | **Verified Benchmark** | Matches RBI's 80% LTV regulatory ceiling for loans between ₹30 Lakh and ₹75 Lakh. |
| `rbi_ltv_max_tier1` | Maximum LTV for Loans $\le$ ₹30 Lakh | **90.0%** | 90.0% max | RBI Master Direction DBR.BP.BC.No.44 | 2017–Present | All India | **Official Regulation** | Statutory regulatory ceiling for small-ticket affordable housing loans. |
| `rbi_ltv_max_tier2` | Maximum LTV for Loans ₹30L to ₹75L | **80.0%** | 80.0% max | RBI Master Direction DBR.BP.BC.No.44 | 2017–Present | All India | **Official Regulation** | Statutory regulatory ceiling for mid-segment home loans. |
| `rbi_ltv_max_tier3` | Maximum LTV for Loans $>$ ₹75 Lakh | **75.0%** | 75.0% max | RBI Master Direction DBR.BP.BC.No.44 | 2017–Present | All India | **Official Regulation** | Statutory regulatory ceiling for high-value residential mortgages. |

---

### 2.2 Statutory State Taxes & Government Fees

| Parameter ID | Parameter Name | Default Value | Sensible Bounds | Primary Source | Effective Date | Geographic Scope | Status | Methodological Rationale |
|---|---|:---:|:---:|---|:---:|:---:|:---:|---|
| `stamp_duty_maharashtra` | Maharashtra Stamp Duty (Mumbai) | **6.00%** | 1.0% to 15.0% | Maharashtra Stamp Act / IGR Maharashtra | FY 2024–26 | Mumbai City & Suburbs (MCGM) | **Official Statutory Rate** | Comprises 5.0% base stamp duty + 1.0% Metro Cess (Maharashtra Metro Rail Surcharge). |
| `registration_fee_maharashtra` | Maharashtra Registration Fee | **₹30,000 Cap** (or 1% if $<$ ₹30L) | ₹0 to ₹1,00,000 | Department of Registration & Stamps, Maharashtra | Continuous | Maharashtra | **Official Statutory Rate** | Government gazette notification caps residential registration at ₹30,000 for properties above ₹30 Lakh. |
| `stamp_duty_karnataka` | Karnataka Stamp Duty (Bengaluru) | **5.60%** | 1.0% to 15.0% | Karnataka Stamp Act 1957 | FY 2024–25 | Bengaluru Urban (BBMP) | **Official Statutory Rate** | Comprises 5.0% base + 2.0% surcharge + 10% cess on stamp duty. Registration is 1.0% with no cap. |
| `stamp_duty_delhi` | Delhi NCT Stamp Duty | **6.00% (Male)** / **4.00% (Female)** | 1.0% to 15.0% | Revenue Department, GNCTD | FY 2024–25 | Delhi NCT | **Official Statutory Rate** | 6% for male buyers, 4% for female buyers, 5% for joint ownership. Registration is 1% flat. |
| `loan_processing_rate` | Bank Loan Processing Fee Rate | **0.25% + 18% GST** | 0.0% to 2.0% | Indian Banking Tariff Schedules | FY 2024–25 | All India | **Illustrative Benchmark** | Typically 0.25%–0.50% of principal, capped between ₹10,000 and ₹25,000 + GST. |
| `legal_documentation_fee` | Title Search & Legal Scrutiny Fee | **₹25,000** | ₹0 to ₹1,00,000 | Bar Association / Bank Panel Legal Tariffs | FY 2024–25 | Metropolitan India | **Illustrative Market Default** | Advocate fees for 30-year title search report and non-encumbrance certificate. |

---

### 2.3 Recurring Homeownership Expenses

| Parameter ID | Parameter Name | Default Value | Sensible Bounds | Primary Source | Geographic Scope | Status | Methodological Rationale |
|---|---|:---:|:---:|---|:---:|:---:|---|
| `maintenance_rate_sqft` | Society Maintenance & Sinking Fund | **₹5.00 / sq.ft / mo** (or ₹6,000/mo flat) | ₹1 to ₹25 / sq.ft | Cooperative Housing Societies (CHS) / RERA | Metropolitan India | **Illustrative Market Default** | Covers common area electricity, security, lift maintenance, water, and sinking fund reserve. |
| `property_tax_annual_rate` | Municipal Property Tax Rate | **0.15% of property value / yr** | 0.0% to 2.0% | Municipal Corporations (MCGM / BBMP) | Urban India | **Illustrative Market Default** | Derived from capital value property tax assessment formulas. |
| `home_insurance_rate` | Homeowners Hazard / Fire Insurance | **0.05% of structure value / yr** | 0.0% to 0.5% | General Insurance Corporation of India (GIC) / IRDAI | All India | **Illustrative Market Default** | Covers building reinstatement value against fire, earthquake, and flood hazards. |

---

### 2.4 Rental Market & Investment Opportunity Cost Parameters

| Parameter ID | Parameter Name | Default Value | Sensible Bounds | Primary Source | Observation Period | Geographic Scope | Status | Methodological Rationale |
|---|---|:---:|:---:|---|:---:|:---:|:---:|---|
| `gross_rental_yield_mumbai` | Gross Residential Rental Yield | **3.50% p.a.** | 1.0% to 8.0% | Real Estate Research / Knight Frank India | 2023–2025 | Mumbai MMR | **Empirical Market Benchmark** | Gross annual rent divided by property purchase price in Mumbai ranges between 2.5% and 3.8%. |
| `annual_rent_escalation` | Annual Rent Escalation Rate ($g_{\text{rent}}$) | **6.00% p.a.** | 0.0% to 15.0% | Model Tenancy Act / Standard Lease Agreements | Multi-year standard | Urban India | **Contractual Benchmark** | Standard 11-month registered leave and license agreements specify 5.0% to 10.0% annual rent escalation. |
| `rental_deposit_months` | Rental Security Deposit Horizon | **3 Months Rent** | 0 to 12 Months | Prevailing Lease Market Customs | Current | Mumbai / Tier-1 | **Illustrative Market Default** | Refundable deposit held by landlord (ranges from 2–3 months in Mumbai to 6–10 months in Bengaluru). |
| `investment_portfolio_return` | Capital Opportunity Cost Return ($r_{\text{invest}}$) | **10.00% p.a.** | 0.0% to 25.0% | National Stock Exchange (NSE) / Nifty 50 Index 15-Yr CAGR | 2009–2024 | All India | **Empirical Benchmark** | Long-term annualized returns for diversified Indian broad-market equity mutual funds / Nifty 50 TRI. |
| `property_appreciation_rate` | Expected Property Appreciation ($g_{\text{prop}}$) | **6.00% p.a.** | -5.0% to 20.0% | Reserve Bank of India House Price Index (HPI) | 2010–2025 Series | Mumbai Context | **Empirical Market Benchmark** | Historical RBI HPI series for Mumbai achieved 10.87% CAGR over 15 years, but normalized post-2019 growth stabilized at 5%–7%. |

---

### 2.5 Household Credit & Affordability Thresholds

| Parameter ID | Parameter Name | Default Value | Sensible Bounds | Primary Source | Geographic Scope | Status | Methodological Rationale |
|---|---|:---:|:---:|---|:---:|:---:|---|
| `foir_conservative` | Conservative Affordability Threshold | **35.0%** | 20.0% to 40.0% | Financial Planning Prudence Standards | All India | **Guideline Benchmark** | Protects household from floating-rate spikes and employment shocks. |
| `foir_moderate` | Standard Bank Prime Salaried FOIR | **45.0%** | 35.0% to 55.0% | Major SCBs Retail Underwriting Guidelines | All India | **Standard Retail Benchmark** | Most common lending threshold applied by SBI, HDFC Bank, ICICI Bank. |
| `foir_aggressive` | Upper Bank Lending Ceiling | **55.0%** | 45.0% to 65.0% | Retail Banking Upper Discretionary Limits | All India | **Ceiling Benchmark** | Permitted only for high-income or super-prime credit profiles. |

---

## 3. Scope Compliance & Anti-Fabrication Safeguards

1. **No Artificial Universal Rules**: UrbanLens explicitly documents that Indian banking does NOT apply a single statutory debt-to-income threshold across all borrowers.
2. **State Diversity Preservation**: The engine does NOT treat Maharashtra's stamp duty or registration cap as a national standard. Other states are modeled with distinct parameters.
3. **Editable Custom Inputs**: The user retains complete authority to alter any rate, yield, or escalation factor to evaluate customized personal scenarios.
4. **Transparent Disclaimers**: All outputs state:
   > *"UrbanLens provides educational financial calculations and scenario analysis. Results are estimates based on user-provided inputs and assumptions. They are not loan approvals, legal fee quotations, or personalized financial advice."*
