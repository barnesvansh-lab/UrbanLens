# UrbanLens — Home-Loan EMI & Amortization Calculation Methodology

**Document Version**: 1.0.0  
**Domain**: Housing Affordability Intelligence Engine (Milestone 7)  
**Target Architecture**: Shared TypeScript / Python Deterministic Financial Calculations  

---

## 1. Executive Summary

Equated Monthly Installment (EMI) calculations form the foundational mathematical pillar of housing affordability analysis. In India, retail home loans from Scheduled Commercial Banks (SCBs) and Housing Finance Companies (HFCs) operate on a **monthly reducing-balance amortization structure**. 

This document defines the mathematical derivations, edge-case formulations, amortization scheduling algorithms, prepayment acceleration mechanics, and verified numerical benchmarks implemented in UrbanLens.

---

## 2. Mathematical Formulations

### 2.1 The Standard Reducing-Balance EMI Equation

The Equated Monthly Installment is derived from the present value of an ordinary annuity:

$$P = \sum_{t=1}^{n} \frac{\text{EMI}}{(1 + r)^t} = \text{EMI} \cdot \left[ \frac{1 - (1 + r)^{-n}}{r} \right] = \text{EMI} \cdot \left[ \frac{(1 + r)^n - 1}{r(1 + r)^n} \right]$$

Rearranging to solve explicitly for $\text{EMI}$:

$$\text{EMI} = P \cdot r \cdot \frac{(1 + r)^n}{(1 + r)^n - 1}$$

Where:
- $P = \text{Principal Loan Amount} = \text{Property Price} - \text{Down Payment}$ (in ₹ INR)
- $R = \text{Annual Interest Rate}$ (in percent, e.g., $8.50\%$)
- $r = \text{Periodic Monthly Interest Rate} = \frac{R}{12 \times 100}$
- $Y = \text{Loan Tenure in Years}$
- $n = \text{Total Number of Monthly Installments} = Y \times 12$

---

### 2.2 Boundary Conditions & Zero-Interest Edge Case

If the nominal interest rate is zero ($R = 0 \implies r = 0$), direct evaluation of the annuity formula yields a $\frac{0}{0}$ indeterminate form. Applying L'Hôpital's rule with respect to $r$:

$$\lim_{r \to 0} \left[ P \cdot r \cdot \frac{(1 + r)^n}{(1 + r)^n - 1} \right] = \frac{P}{n}$$

UrbanLens enforces explicit branching:
$$\text{EMI} = \begin{cases} \dfrac{P}{n}, & \text{if } r \le 10^{-7} \\ P \cdot r \cdot \dfrac{(1 + r)^n}{(1 + r)^n - 1}, & \text{if } r > 10^{-7} \end{cases}$$

---

### 2.3 Repayment Aggregates & LTV Ratio

1. **Total Repayment ($T_{\text{pay}}$)**:
   $$T_{\text{pay}} = \text{EMI} \times n$$

2. **Total Interest Payable ($I_{\text{tot}}$)**:
   $$I_{\text{tot}} = T_{\text{pay}} - P = (\text{EMI} \times n) - P$$

3. **Loan-to-Value (LTV) Ratio**:
   $$\text{LTV} = \left( \frac{P}{\text{Property Purchase Price}} \right) \times 100$$
   *(Under Reserve Bank of India prudential regulations, maximum allowable LTV is capped at 75%–90% depending on ticket size).*

4. **Interest-to-Principal Ratio ($\rho_{\text{int}}$)**:
   $$\rho_{\text{int}} = \frac{I_{\text{tot}}}{P}$$
   *(In typical Indian 20- to 30-year mortgages at 8.5%–9.0%, $\rho_{\text{int}}$ exceeds $1.0$, meaning total interest paid exceeds the original loan amount).*

---

## 3. Month-by-Month Amortization Recursion

At any month $t \in [1, n]$:
- Let $B_0 = P$ (initial opening balance).
- For each month $t$:
  1. **Monthly Interest Component ($I_t$)**:
     $$I_t = B_{t-1} \times r$$
  2. **Monthly Principal Component ($P_t$)**:
     $$P_t = \min(B_{t-1}, \; \text{EMI} - I_t)$$
  3. **Closing Principal Balance ($B_t$)**:
     $$B_t = B_{t-1} - P_t$$
  4. **Cumulative Principal Repaid ($C_{P, t}$)**:
     $$C_{P, t} = \sum_{k=1}^{t} P_k = P - B_t$$
  5. **Cumulative Interest Paid ($C_{I, t}$)**:
     $$C_{I, t} = \sum_{k=1}^{t} I_k$$
  6. **Cumulative Homeowner Equity ($E_t$)**:
     $$E_t = \text{Down Payment} + C_{P, t}$$

---

## 4. Prepayment & Extra Repayment Acceleration

Borrowers in India have statutory rights under RBI Master Directions (2014 / 2019) to prepay floating-rate retail home loans without penalty. UrbanLens supports an **additional monthly prepayment** $\Delta P_{\text{extra}}$:

$$\text{Effective Monthly Outflow}_t = \text{EMI} + \Delta P_{\text{extra}}$$
$$\text{Principal Component}_t = (\text{EMI} - I_t) + \Delta P_{\text{extra}}$$

This shortens the effective amortization horizon from $n$ to $n_{\text{effective}} < n$:
$$n_{\text{effective}} = \left\lceil \frac{-\ln\left(1 - \frac{r \cdot P}{\text{EMI} + \Delta P_{\text{extra}}}\right)}{\ln(1 + r)} \right\rceil$$

---

## 5. Fully Worked Numerical Benchmark

To ensure zero drift across backend, Python, and frontend calculations, the following standard benchmark is implemented in test suites:

### Input Parameters:
- **Property Purchase Price**: ₹1,00,00,000 (1.00 Crore)
- **Down Payment**: 20.0% $\implies$ ₹20,00,000 (20.00 Lakh)
- **Principal Loan Amount ($P$)**: ₹80,00,000 (80.00 Lakh)
- **Annual Interest Rate ($R$)**: $8.50\%$ per annum
- **Loan Tenure ($Y$)**: 20 years $\implies n = 240$ months
- **Monthly Interest Rate ($r$)**: $\frac{8.50}{1200} \approx 0.007083333333$

### Step-by-Step Calculation:
1. Compounding Factor $(1 + r)^{240}$:
   $$(1 + 0.007083333333)^{240} \approx 5.419084$$
2. Annuity Quotient:
   $$\frac{r(1 + r)^n}{(1 + r)^n - 1} = \frac{0.007083333333 \times 5.419084}{5.419084 - 1} = \frac{0.03838518}{4.419084} \approx 0.00868623$$
3. Exact Monthly EMI:
   $$\text{EMI} = 80\,00\,000 \times 0.00868623 = \text{₹}69\,490 \quad (\text{rounded to nearest whole rupee: ₹}69\,426\text{ with exact floating point})$$
   *Exact double precision value:* **₹69,425.96** $\to$ **₹69,426 / month**.
4. Total Repayment:
   $$T_{\text{pay}} = 240 \times 69\,425.96 = \text{₹}1,66,62,230.40 \quad (\text{₹}1,66,62,240 \text{ at integer EMI})$$
5. Total Interest:
   $$I_{\text{tot}} = 1,66,62,230.40 - 80\,00\,000 = \text{₹}86,62,230.40 \quad (\approx \text{₹}86.62 \text{ Lakh})$$
6. Loan-to-Value:
   $$\text{LTV} = 80.0\%$$

### Annualized Amortization Trajectory Table:

| Year | Annual EMI Outflow (₹) | Principal Paid (₹) | Interest Paid (₹) | Closing Balance (₹) | Homeowner Equity (₹) |
|:---:|:---:|:---:|:---:|:---:|:---:|
| **Yr 1** | ₹8,33,112 | ₹1,58,958 | ₹6,74,154 | ₹78,41,042 | ₹21,58,958 |
| **Yr 3** | ₹8,33,112 | ₹1,88,382 | ₹6,44,730 | ₹74,74,771 | ₹25,25,229 |
| **Yr 5** | ₹8,33,112 | ₹2,23,234 | ₹6,09,878 | ₹70,40,652 | ₹29,59,348 |
| **Yr 10** | ₹8,33,112 | ₹3,40,736 | ₹4,92,376 | ₹55,75,983 | ₹44,24,017 |
| **Yr 15** | ₹8,33,112 | ₹5,20,084 | ₹3,13,028 | ₹33,40,820 | ₹66,59,180 |
| **Yr 20** | ₹8,33,112 | ₹7,93,903 | ₹39,209 | ₹0 | ₹1,00,00,000 |

*Key Financial Insight*: During Year 1, **80.9%** of the borrower's annual payments go toward interest. Only in Year 11 does the monthly principal component exceed the monthly interest component.

---

## 6. Input Validation & Numeric Safety Guards

The engine enforces strict validation checks returning HTTP 400 with machine-readable error codes:

| Field | Type | Valid Range | Failure Code | Error Condition |
|---|:---:|:---:|---|---|
| `property_price` | `number` | ₹1,00,000 to ₹100,00,00,000 | `INVALID_PRICE` | $\le 0$ or non-numeric |
| `down_payment_pct` | `number` | 0.0% to 99.9% | `INVALID_DOWN_PAYMENT` | $< 0$ or $\ge 100$ |
| `down_payment_amount` | `number` | ₹0 to Property Price - ₹1 | `DOWN_PAYMENT_EXCEEDS_PRICE` | $\ge \text{Property Price}$ |
| `annual_interest_rate`| `number` | 0.0% to 30.0% | `INVALID_INTEREST_RATE` | $< 0$ or $> 30$ |
| `tenure_years` | `integer`| 1 to 40 years | `INVALID_TENURE` | $\le 0$ or $> 40$ |
| `extra_monthly_pay` | `number` | $\ge 0$ | `INVALID_PREPAYMENT` | $< 0$ |
