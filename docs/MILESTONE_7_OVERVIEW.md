# Milestone 7 — Housing Affordability Intelligence Engine

## Overview

Milestone 7 delivers a comprehensive Housing Affordability Intelligence Engine for UrbanLens. The module provides users with transparent, empirical analytics covering home-loan repayment costs, upfront statutory acquisition charges, monthly true cost of homeownership, cash-flow equivalent rent-versus-buy trade-offs, household affordability limits (FOIR/DTI), and multi-scenario financial comparisons — all utilizing verified reducing-balance mathematics and editable Indian housing-finance assumptions.

> **Educational Disclaimer**: All calculations are illustrative estimates for educational and exploratory purposes. They do not constitute official bank loan pre-approvals, legal fee quotations, or personalized investment advice. Users should verify numbers with licensed mortgage underwriters and financial advisors before entering into property transactions.

---

## System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                       React + Vite Frontend                            │
│   client/src/pages/Affordability.tsx   (8 sections, 1087 lines)        │
│   Recharts interactive charts · Indian ₹ (Lakh/Cr) notation           │
│   Responsive Tailwind UI · Dynamic input sliders · Error boundaries   │
└────────────────────────────┬───────────────────────────────────────────┘
                             │ POST /api/affordability/* (via /api proxy)
┌────────────────────────────▼───────────────────────────────────────────┐
│                       Express Backend                                  │
│   server/src/routes/affordability.ts     (370 lines, 8 endpoints)     │
│   server/src/services/affordabilityService.ts (653 lines, 8 methods)  │
│   Input validation · Zero/Negative guards · INR formatters             │
└────────────────────────────┬───────────────────────────────────────────┘
                             │ RBI HPI context from Milestone 6
┌────────────────────────────▼───────────────────────────────────────────┐
│                       Python Financial Engine                          │
│   server/python/affordability/financial_engine.py (270 lines)         │
│   Reducing-balance EMI · Amortization · Rent vs Buy · Affordability   │
│   Full unit test suite: server/python/tests/test_affordability.py     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## API Endpoints Specification

| Endpoint | Method | Input Parameters | Output Response |
|---|---|---|---|
| `/api/affordability/emi` | POST | `property_price`, `annual_interest_rate`, `tenure_years`, `down_payment_pct` / `down_payment_amount`, `extra_monthly_payment` | Reducing-balance EMI, total interest, principal, LTV ratio, full amortization schedule, prepayment savings, disclaimers. |
| `/api/affordability/upfront-costs` | POST | `property_price`, `down_payment_pct`, `stamp_duty_pct`, optional fit-out and ancillary costs | Down payment, stamp duty, registration fee (capped at ₹30K), loan processing fee, legal/doc fees, total cash required, disclaimers. |
| `/api/affordability/ownership-cost` | POST | `monthly_emi` or property loan setup, `society_maintenance_monthly`, `property_tax_annual`, `home_insurance_annual`, `repairs_reserve_monthly`, `monthly_gross_income` | Itemized monthly recurring costs, non-EMI expenses total, annualized cost, EMI vs non-EMI shares, Housing Expense to Income Ratio (HEIR), disclaimers. |
| `/api/affordability/rent-vs-buy` | POST | `property_price`, `initial_monthly_rent`, `annual_rent_increase_pct`, `property_appreciation_pct`, `investment_return_pct`, `analysis_period_years` | Terminal buyer net equity (less 2% selling costs), renter liquid portfolio, net advantage, break-even year, annual wealth trajectory, disclaimers. |
| `/api/affordability/household` | POST | `monthly_gross_income`, `existing_loan_emis`, `essential_monthly_expenses`, `available_liquid_savings`, `target_property_price`, `foir_guideline_pct` | FOIR ratio, max allowable housing EMI, loan-constrained budget, cash-constrained budget, binding budget, affordability gap, recommendations, disclaimers. |
| `/api/affordability/scenarios` | POST | `property_price`, optional custom `scenarios` array | Conservative, Moderate Baseline, and Aggressive side-by-side comparative stress test, EMI, terminal equity, disclaimers. |
| `/api/affordability/assumptions` | GET | None | Regulatory assumptions, baseline defaults, source attribution (RBI, IGR Maharashtra, NHB, NSE), version and notes. |
| `/api/affordability/market-context` | GET | None | Mumbai market benchmarks, real RBI HPI 15-year CAGR (11.07%), recent market regime, Indian currency formatting guide. |

All POST endpoints return structured error codes on invalid input (HTTP 400) and an educational `disclaimers` array.

---

## Mathematical & Financial Formulation

### 1. Standard Reducing-Balance EMI & Boundary Guards

$$\text{EMI} = P \times \frac{r(1+r)^n}{(1+r)^n - 1}$$

- $P$: Loan principal = $\text{Property Price} - \text{Down Payment}$
- $r$: Periodic monthly interest rate = $\frac{\text{Annual Interest Rate \%}}{1200}$
- $n$: Total repayment tenure in months = $\text{Tenure Years} \times 12$
- **L'Hôpital Boundary Evaluation**: As $r \to 0$, $\lim_{r \to 0} \text{EMI} = \frac{P}{n}$ (guards against divide-by-zero on interest-free loans).

### 2. Prepayment Acceleration

Extra monthly principal payments ($P_{\text{extra}}$) reduce the outstanding balance before monthly interest is computed:

$$\text{Principal Repaid Month } m = \min(B_{m-1}, (\text{EMI} - I_m) + P_{\text{extra}})$$

This shortens effective tenure and computes total interest saved: $\text{Interest Saved} = \text{Total Interest}_{\text{Standard}} - \text{Total Interest}_{\text{Prepay}}$.

### 3. Upfront Statutory Charges (Maharashtra Structure)

- **Stamp Duty**: $6.0\%$ of Agreement Value (Article 25 Schedule I, including 1% Local Body / Metro Cess).
- **Registration Fee**: $1\%$ of Agreement Value subject to a statutory maximum cap of **₹30,000** (Government of Maharashtra IGR Notification).
- **Loan Processing Fee**: $0.25\%$ of principal borrowing (typical commercial bank benchmark).
- **Total Closing Cash**: $\text{Down Payment} + \text{Stamp Duty} + \text{Registration} + \text{Processing} + \text{Legal} + \text{Fitout Buffer}$.

### 4. True Cost of Ownership (Monthly & Annual Normalization)

$$\text{Monthly Outflow} = \text{EMI} + \text{Maintenance} + \frac{\text{Annual Property Tax}}{12} + \frac{\text{Annual Insurance}}{12} + \text{Repairs Reserve}$$

$$\text{Housing Expense to Income Ratio (HEIR)} = \frac{\text{Total Monthly Ownership Outflow}}{\text{Gross Monthly Household Income}} \times 100$$

### 5. Rent vs Buy Cash-Flow Equivalence Model

Avoids the "EMI vs Rent" comparison fallacy:
- **Renter**: Initial portfolio = $\text{Buyer Down Payment} + \text{Acquisition Fees} - \text{Rental Deposit}$. At each period $t$, the net cash flow differential ($\text{Buyer Outflow}_t - \text{Renter Outflow}_t$) is added to (or drawn from) the investment portfolio earning the equity hurdle rate ($R_{\text{equity}}$).
- **Buyer**: Net Terminal Equity = $\text{Terminal Property Value}_n - \text{Remaining Loan Debt}_n - \text{Selling Transaction Costs (2\%)}$.
- **Break-Even**: Earliest year $t^*$ where $\text{Buyer Net Equity}_{t^*} \ge \text{Renter Investment Portfolio}_{t^*}$.

### 6. Household Affordability & Dual-Constraint Budgeting

- **Max Housing EMI**: $(\text{Gross Income} \times \text{FOIR Guideline \%}) - \text{Existing Debt EMIs}$
- **Max Borrowable Loan Principal**: Reverse loan sizing from Max Housing EMI.
- **Loan-Constrained Budget**: $\frac{\text{Max Loan Principal}}{1 - \text{Down Payment \%}}$
- **Cash-Constrained Budget**: $\frac{\text{Available Liquid Savings}}{\text{Down Payment \%} + \text{Statutory Cost Buffer \%}}$
- **Binding Property Budget**: $\min(\text{Loan-Constrained Budget}, \text{Cash-Constrained Budget})$
- **Affordability Gap**: $\text{Target Property Price} - \text{Binding Property Budget}$

---

## Frontend Dashboard Structure (8 Sections)

The React dashboard in [`client/src/pages/Affordability.tsx`](file:///Users/vanshbarnes/Documents/UrbanLens%20Project/client/src/pages/Affordability.tsx) provides 8 integrated modules:

1. **Affordability Overview**: High-level market intelligence, benchmark rates, real RBI HPI CAGR (11.07%), instant budget sizing snapshot, and module launcher cards.
2. **EMI Calculator**: Dual sliders (price, down payment, interest rate, tenure, extra EMI), KPI cards, Recharts Area chart, and annual amortization schedule data table (toggleable view).
3. **Upfront Purchase Costs**: Statutory closing charge itemization, registration fee cap visualization, and Recharts Donut allocation chart.
4. **Monthly Ownership Costs**: True cost stack beyond mortgage debt, society maintenance, municipal tax normalization, HEIR ratio, and horizontal stacked bar chart.
5. **Rent vs Buy**: Cash-flow equivalence simulation, dynamic verdict banner, terminal wealth comparison, and Recharts trajectory line chart with break-even marker.
6. **Household Affordability**: Reverse debt capacity, FOIR/DTI threshold gauge, dual-constraint property budget, and actionable financial planning recommendations.
7. **Financial Scenario Simulator**: Conservative vs Moderate Baseline vs Aggressive stress testing with comparative bar chart.
8. **Methodology & Assumptions**: Mathematical formulation audit, live assumptions registry, and regulatory citations.

---

## Quality Assurance & Verification Summary

| Suite | Scope | Executed Tests | Result |
|---|---|---|---|
| Python Analytical Suite | Financial engine, forecasting, validators, transformation | 172 | ✅ 172/172 Passed |
| Express Affordability Suite | All 8 endpoints, boundary cases, invalid inputs, INR formatting | 36 | ✅ 36/36 Passed |
| Express Regression Suite | Milestones 1–6 (Health, Data, Neighborhoods, Forecasting, Transformation) | 40 | ✅ 40/40 Passed |
| TypeScript Compiler | Server compilation (`tsc`) | 1 | ✅ Zero Errors |
| Client Production Build | Vite + React + Tailwind + Recharts bundler (`tsc -b && vite build`) | 1 | ✅ Zero Errors (2.04s) |
| **Total Automated Checks** | **End-to-end full stack** | **250** | **✅ 100% Passed** |
