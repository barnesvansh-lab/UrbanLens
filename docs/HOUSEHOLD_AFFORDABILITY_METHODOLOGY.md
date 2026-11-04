# UrbanLens — Household Financial Affordability Methodology

**Document Version**: 1.0.0  
**Domain**: Housing Affordability Intelligence Engine (Milestone 7)  
**Target Architecture**: Shared TypeScript / Python Deterministic Financial Calculations  

---

## 1. Executive Summary

Household housing affordability measures the proportion of a family's financial resources that can be sustainably committed toward home acquisition without inducing household distress or default risk.

In Indian retail banking, credit underwriting is governed by the **Fixed Obligation to Income Ratio (FOIR)**—also known internationally as the **Debt-to-Income (DTI) ratio**. However, bank lending limits represent the *maximum leverage a bank is willing to risk*, which is often higher than the *prudent housing budget a household can comfortably afford*.

This document formalizes the mathematical frameworks for household income aggregation, debt obligation auditing, reverse loan sizing, maximum property budgeting, and affordability gap analysis implemented in UrbanLens.

---

## 2. Income & Debt Aggregation Framework

### 2.1 Gross Monthly Household Income ($I_{\text{gross}}$)
$$I_{\text{gross}} = I_{\text{primary}} + I_{\text{co-borrower}} + I_{\text{stable\_ancillary}}$$
Where:
- $I_{\text{primary}} = \text{Gross monthly take-home salary or certified business income of primary applicant}$
- $I_{\text{co-borrower}} = \text{Monthly income of spouse, parent, or co-applicant}$
- $I_{\text{stable\_ancillary}} = \text{Long-term rental income or dividend income with verified tax history}$

---

### 2.2 Existing Debt Obligations ($E_{\text{debt}}$)
All non-housing recurring fixed debt commitments:
$$E_{\text{debt}} = \sum \text{Existing Vehicle Loans} + \sum \text{Personal Loans} + \sum \text{Education Loans} + \sum \text{Credit Card Minimum Repayments}$$

---

### 2.3 Non-Housing Essential Expenses ($E_{\text{living}}$)
Household nondiscretionary consumption:
$$E_{\text{living}} = \text{Food} + \text{Utilities} + \text{Children's Schooling} + \text{Healthcare} + \text{Insurance Premiums}$$

---

### 2.4 True Disposable Surplus ($S_{\text{disposable}}$)
$$S_{\text{disposable}} = I_{\text{gross}} - E_{\text{debt}} - E_{\text{living}} - T_{\text{taxes}}$$
This represents the absolute mathematical cash-flow ceiling for all housing-related outlays.

---

## 3. Financial Affordability Ratios & Banking Benchmarks

### 3.1 Fixed Obligation to Income Ratio (FOIR / DTI)
FOIR measures the fraction of gross monthly household income committed to servicing debt:

$$\text{FOIR}_{\text{current}} = \left( \frac{E_{\text{debt}}}{I_{\text{gross}}} \right) \times 100$$
$$\text{FOIR}_{\text{post-purchase}} = \left( \frac{E_{\text{debt}} + \text{Proposed Home Loan EMI}}{I_{\text{gross}}} \right) \times 100$$

### 3.2 Indian Banking Credit Underwriting Benchmarks

| Tier | Target FOIR Threshold | Typical Profile in Indian Banking | Household Risk Profile |
|:---:|:---:|---|---|
| **Conservative (Prudent)** | **30.0% to 35.0%** | Recommended financial planning threshold | Very Low: High buffer for job volatility and interest rate hikes. |
| **Moderate (Bank Prime)** | **40.0% to 50.0%** | Standard retail benchmark for salaried borrowers (SBI, HDFC Bank, ICICI Bank) | Moderate: Normal retail standard for prime corporate employees. |
| **Aggressive (Bank Ceiling)** | **55.0% to 60.0%** | Extended only to high-income brackets ($I_{\text{gross}} > \text{₹2.5 Lakh/month}$) | High: Tight liquidity; sensitive to floating interest rate shocks. |

> [!IMPORTANT]
> **Regulatory Notice**: UrbanLens allows users to toggle between Conservative (35%), Moderate (45%), Aggressive (55%), or a **Custom FOIR Threshold**. The platform explicitly labels these as **illustrative planning guidelines**, NOT guaranteed bank sanction limits.

---

## 4. Reverse Loan Sizing & Property Budget Derivation

Given a chosen FOIR threshold $\theta_{\text{FOIR}}$ (e.g. $45\% = 0.45$):

### 4.1 Maximum Allowable Monthly EMI ($\text{EMI}_{\max}$)
$$\text{EMI}_{\max} = \max\left(0, \; (I_{\text{gross}} \times \theta_{\text{FOIR}}) - E_{\text{debt}}\right)$$

To guard against over-indebtedness, UrbanLens also checks the disposable cash buffer:
$$\text{EMI}_{\text{prudent}} = \min\left( \text{EMI}_{\max}, \; S_{\text{disposable}} - \text{Emergency Reserve Buffer} \right)$$

---

### 4.2 Maximum Affordable Loan Principal ($P_{\max}$)
Inverting the reducing-balance annuity formula:

$$P_{\max} = \text{EMI}_{\max} \cdot \left[ \frac{(1 + r)^n - 1}{r(1 + r)^n} \right]$$

Where:
- $r = \frac{R_{\text{annual}}}{1200}$
- $n = Y_{\text{tenure}} \times 12$
*(If $r = 0$, $P_{\max} = \text{EMI}_{\max} \times n$)*.

---

### 4.3 Maximum Affordable Property Purchase Budget ($V_{\max}$)
A buyer's purchasing power is constrained by two distinct boundaries:
1. **Borrowing Capacity Constraint**: Maximum loan $P_{\max}$.
2. **Liquid Savings Constraint**: Available cash $S_{\text{available}}$ for down payment and mandatory acquisition costs (stamp duty, registration, fees).

Let $\alpha_{\text{down}}$ be the target down payment percentage (e.g. $20\% = 0.20$), and $\beta_{\text{ancillary}}$ be the estimated acquisition cost percentage (e.g. $8\% = 0.08$ for stamp duty and fees):

$$\text{Cash-Constrained Budget} = \frac{S_{\text{available}}}{\alpha_{\text{down}} + \beta_{\text{ancillary}}}$$
$$\text{Loan-Constrained Budget} = \frac{P_{\max}}{1 - \alpha_{\text{down}}}$$

The true binding affordability budget is the **minimum of the two constraints**:
$$V_{\max} = \min\left( \text{Cash-Constrained Budget}, \; \text{Loan-Constrained Budget} \right)$$

---

### 4.4 Affordability Gap ($\Delta_{\text{gap}}$)
When evaluating a specific target property priced at $V_{\text{target}}$:

$$\Delta_{\text{gap}} = V_{\text{target}} - V_{\max}$$
- **If $\Delta_{\text{gap}} \le 0$**: The target property is **Affordable** within the household's financial parameters (Surplus budget $= |\Delta_{\text{gap}}|$).
- **If $\Delta_{\text{gap}} > 0$**: The property exhibits an **Affordability Shortfall**. The household must either:
  1. Increase down payment savings by $\Delta_{\text{gap}} \times (\alpha_{\text{down}} + \beta_{\text{ancillary}})$.
  2. Increase monthly income or clear existing debt obligations to raise $P_{\max}$.
  3. Extend loan tenure (e.g., from 15 to 25 years).
  4. Select an alternative property within $V_{\max}$.

---

## 5. Fully Worked Numerical Benchmark

### Household Profile:
- **Primary Monthly Income**: ₹1,75,000
- **Co-borrower Monthly Income**: ₹75,000
- **Gross Household Monthly Income ($I_{\text{gross}}$)**: **₹2,50,000**
- **Existing Debt**: Car Loan EMI = **₹35,000 / month** (Current $\text{FOIR} = 14.0\%$)
- **Essential Monthly Living Expenses**: ₹65,000
- **Available Liquid Savings**: **₹35,00,000** (35.0 Lakh)
- **Target Property Price**: **₹1,50,00,000** (1.50 Crore)
- **Mortgage Terms**: $8.50\%$ annual interest, 20-year tenure ($n = 240$, Annuity Factor $\approx 115.228$)
- **Acquisition Cost Buffer**: $8.0\%$ (Stamp duty, registration, processing)

---

### Multi-Threshold Affordability Sensitivity Matrix:

| Guideline | FOIR Threshold ($\theta$) | Max Total Debt (₹) | Max Housing EMI ($\text{EMI}_{\max}$) | Max Loan Principal ($P_{\max}$) | Cash-Constrained Property Budget | Binding Max Property Budget ($V_{\max}$) | Affordability Gap on ₹1.50 Cr Target |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Conservative** | **35.0%** | ₹87,500 | ₹52,500 | ₹60.49 Lakh | ₹125.00 Lakh | **₹75.61 Lakh** (Loan-bound) | **-₹74.39 Lakh Shortfall** |
| **Moderate** | **45.0%** | ₹1,12,500 | ₹77,500 | ₹89.30 Lakh | ₹125.00 Lakh | **₹111.63 Lakh** (Loan-bound) | **-₹38.37 Lakh Shortfall** |
| **Aggressive** | **55.0%** | ₹1,37,500 | ₹1,02,500 | ₹118.11 Lakh | ₹125.00 Lakh | **₹125.00 Lakh** (Cash-bound) | **-₹25.00 Lakh Shortfall** |

### Critical Analytical Findings:
1. **The ₹1.50 Crore Target Gap**: Even under the Aggressive 55% FOIR threshold, the household cannot afford the ₹1.50 Crore target property. At 55% FOIR, their borrowing capacity is ₹1.18 Crore, but their **liquid savings of ₹35 Lakh binds their maximum purchase to ₹1.25 Crore** (as ₹1.25 Cr requires ₹25 Lakh down payment + ₹10 Lakh in stamp duty/fees).
2. **Actionable Resolution**: To acquire the ₹1.50 Crore home comfortably at 45% FOIR, the household needs an additional **₹15 Lakh in cash savings** (reaching ₹50 Lakh) and an income increase of ₹45,000/month or full retirement of the car loan.

---

## 6. Regulatory & Ethical Disclaimers

The following disclosures are embedded directly in UrbanLens API responses and frontend views:
1. **Not a Loan Sanction**: Mathematical affordability does NOT guarantee credit approval from any financial institution.
2. **Underwriting Factors**: Actual bank sanction depends on credit bureau scores (CIBIL $\ge 750$), employer tier, age at retirement, property legal title vetting, and technical valuation.
3. **No Financial Advisory Liability**: Calculations are provided for educational and scenario planning purposes only.
