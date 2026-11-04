# UrbanLens — Upfront Home Purchase Cost Calculation Methodology

**Document Version**: 1.0.0  
**Domain**: Housing Affordability Intelligence Engine (Milestone 7)  
**Target Architecture**: Shared TypeScript / Python Deterministic Financial Calculations  

---

## 1. Executive Summary

A critical pitfall in retail real-estate acquisition in India is the **"Down Payment Fallacy"**—the mistaken belief that savings equal to the minimum 20% down payment are sufficient to complete a home purchase. 

In Indian metropolitan property transactions, statutory stamp duty, government registration charges, bank processing fees, legal scrutiny expenses, society advance maintenance deposits, and initial fit-out costs typically add **8% to 15%** of the property purchase price in additional out-of-pocket cash requirements. 

This document outlines the mathematical model, statutory fee structures across major Indian states, fee capping rules, and worked numerical examples implemented in UrbanLens.

---

## 2. Upfront Capital Formula

The total initial liquidity required by a buyer before moving into a purchased home is:

$$\text{Total Upfront Cash Required} = D + S + R_{\text{reg}} + F_{\text{loan}} + L_{\text{doc}} + B_{\text{broker}} + M_{\text{shift}} + I_{\text{fitout}} + O_{\text{other}}$$

Where:
- $D = \text{Down Payment Amount}$
- $S = \text{Statutory Stamp Duty}$
- $R_{\text{reg}} = \text{Government Registration Fee}$
- $F_{\text{loan}} = \text{Bank Loan Processing Fee} + \text{Valuation Charges}$
- $L_{\text{doc}} = \text{Legal Due Diligence, Title Search \& Documentation Fee}$
- $B_{\text{broker}} = \text{Brokerage Commission (if secondary / resale property)}$
- $M_{\text{shift}} = \text{Relocation \& Shifting Reserve}$
- $I_{\text{fitout}} = \text{Initial Interior Work, Painting \& Furnishing Reserve}$
- $O_{\text{other}} = \text{Society Transfer Fees, Electric Meter \& Advance Maintenance Charges}$

---

## 3. Statutory Fee Structures in Major Indian States

Stamp duty and registration fees are levied by State Governments under Entry 63 of the State List (Seventh Schedule of the Constitution of India). Rates vary widely by state, municipal jurisdiction, gender of the buyer, and property type.

### 3.1 Illustrative State Stamp Duty & Registration Reference Table

| State / Union Territory | Major Urban Area | Illustrative Stamp Duty Rate | Registration Charges Structure | Source / Reference Act |
|---|---|:---:|---|---|
| **Maharashtra** | Mumbai (MCGM / MMR) | **6.00%** (5% base + 1% Metro Cess) | **Capped at ₹30,000** (for properties > ₹30 Lakh); 1% below ₹30L | Maharashtra Stamp Act & IGR Maharashtra (2024–2026) |
| **Karnataka** | Bengaluru (BBMP) | **5.60%** (5% base + 2% Surcharge + 10% Cess on stamp duty) | **1.00%** of property value (No cap) | Karnataka Stamp Act 1957 / Department of Stamps |
| **Delhi** | National Capital Territory | **6.00%** (Male) / **4.00%** (Female) / **5.00%** (Joint) | **1.00%** of property value + ₹100 pasting fee | Delhi Revenue Department / DOR |
| **Tamil Nadu** | Chennai (GCC) | **7.00%** | **4.00%** (revised under TN Registration Amendment) | Tamil Nadu Registration Department |
| **Telangana** | Hyderabad (GHMC) | **7.50%** (includes transfer duty) | **0.50%** (subject to min/max rules) | Telangana Registration & Stamps Department |

> [!IMPORTANT]
> **Mandatory Transparency Disclosure**: UrbanLens provides default illustrative rates for common metropolitan areas (e.g. 6% stamp duty in Mumbai). All rates in UrbanLens are **editable by the user** and labeled as illustrative planning assumptions. They are not legal or government quotations.

---

## 4. Itemized Fee Formulations

### 4.1 Down Payment ($D$)
Based on Reserve Bank of India prudential Loan-to-Value (LTV) regulatory norms:
$$D = \text{Property Purchase Price} \times \frac{d_{\%}}{100}$$
- Minimum required by Indian banks:
  - Loans up to ₹30 Lakh: Minimum 10% ($LTV \le 90\%$)
  - Loans ₹30 Lakh to ₹75 Lakh: Minimum 20% ($LTV \le 80\%$)
  - Loans above ₹75 Lakh: Minimum 25% ($LTV \le 75\%$)

### 4.2 Statutory Stamp Duty ($S$)
$$S = \text{Property Value} \times \frac{s_{\%}}{100}$$
- Calculated on the higher of the **Agreement Value** or the government's **Ready Reckoner / Circle Rate / Annual Statement of Rates (ASR)**.

### 4.3 Registration Charges ($R_{\text{reg}}$)
In Maharashtra, registration on properties above ₹30 Lakh is capped by government gazette:
$$R_{\text{reg, MH}} = \min(30\,000, \; \text{Property Value} \times 0.01)$$
In states without a ceiling (e.g. Karnataka, Delhi, Tamil Nadu):
$$R_{\text{reg, generic}} = \text{Property Value} \times \frac{r_{\%}}{100}$$

### 4.4 Bank Loan Processing Fee ($F_{\text{loan}}$)
Lenders charge processing and administrative fees subject to 18% GST:
$$F_{\text{loan}} = \min\left(F_{\text{cap}}, \; P \times \frac{f_{\%}}{100}\right) \times 1.18$$
- Typical retail norm: 0.25% to 0.50% of loan principal, often capped between ₹10,000 and ₹25,000 + GST.

### 4.5 Legal & Due Diligence Fee ($L_{\text{doc}}$)
Independent legal search of title ownership (search report covering 30 years in sub-registrar records):
- Typical urban market norm: Flat ₹15,000 to ₹35,000.

### 4.6 Brokerage Commission ($B_{\text{broker}}$)
For secondary/resale transactions or mediated builder sales:
$$B_{\text{broker}} = \text{Property Value} \times \frac{b_{\%}}{100} \times 1.18 \quad (\text{with 18\% GST})$$
- Default: 0.0% (for direct developer primary purchases) to 1.0%–2.0% for resale transactions.

---

## 5. Fully Worked Numerical Benchmark

### Input Scenario:
- **Property**: 2-BHK Residential Flat in South/Central Mumbai
- **Agreed Purchase Price**: ₹1,25,00,000 (1.25 Crore)
- **Down Payment Selected**: 20.0% $\implies$ Loan Principal = ₹1,00,00,000 (1.00 Crore)
- **Jurisdiction**: MCGM (Mumbai City, Maharashtra)

### Itemized Calculation:

| Cost Component | Rate / Basis | Amount (₹ INR) | % of Property Value | Cash vs Loan Funded |
|---|---|:---:|:---:|:---:|
| **Down Payment** | 20.0% of Agreement Value | **₹25,00,000** | 20.00% | Out-of-pocket Cash |
| **Stamp Duty** | 6.00% (5% base + 1% cess) | **₹7,50,000** | 6.00% | Out-of-pocket Cash |
| **Registration Fee** | Maharashtra statutory cap | **₹30,000** | 0.24% | Out-of-pocket Cash |
| **Loan Processing Fee** | 0.25% of ₹1.0 Cr + 18% GST | **₹29,500** | 0.24% | Out-of-pocket Cash |
| **Legal & Title Verification** | Fixed advocate fee | **₹25,000** | 0.20% | Out-of-pocket Cash |
| **Brokerage Commission** | 1.0% on resale + 18% GST | **₹1,47,500** | 1.18% | Out-of-pocket Cash |
| **Society Advance Maintenance** | 12 months @ ₹5,000/mo | **₹60,000** | 0.48% | Out-of-pocket Cash |
| **Moving & Relocation** | Packers & movers estimate | **₹30,000** | 0.24% | Out-of-pocket Cash |
| **Initial Interiors / Fit-out** | Essential woodwork/painting | **₹3,50,000** | 2.80% | Out-of-pocket Cash |
| **Total Non-Downpayment Costs** | Sum of ancillary expenses | **₹14,22,000** | **11.38%** | **Out-of-pocket Cash** |
| **TOTAL UPFRONT CASH REQUIRED** | Down Payment + Ancillaries | **₹39,22,000** | **31.38%** | **Total Liquid Savings Needed** |

### Critical Takeaway:
While the buyer budgeted ₹25 Lakh for the 20% down payment, the **actual cash required to complete the acquisition and inhabit the home is ₹39.22 Lakh** (31.38% of the property value). 
Ancillary expenses require an additional ₹14.22 Lakh (+56.9% above the nominal down payment).

---

## 6. Input Validation & Verification Rules

1. **Non-Negativity**: All monetary inputs must be $\ge 0$.
2. **Down Payment Bound**: $0 \le D < \text{Property Price}$.
3. **Percentage Sanity**: Stamp duty must be bounded between $0.0\%$ and $20.0\%$.
4. **Transparent Labeling**: The interface must explicitly present:
   - Total Down Payment vs. Total Ancillary Acquisition Costs.
   - Percentage of property price represented by statutory vs. non-statutory charges.
