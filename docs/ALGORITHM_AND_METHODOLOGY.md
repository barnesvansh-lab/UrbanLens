# UrbanLens — Algorithms, Mathematical Formulations & Methodologies

**Project**: UrbanLens — Urban Market Intelligence & Housing Affordability Analytics Platform  
**Target Milestone**: Milestone 8 (Agent 5 — Technical Documentation & Academic Report)  
**Date**: November 2026  
**Auditor**: Lead Quantitative Systems & Methodology Architect  
**Status**: FORMALIZED & MATHEMATICALLY VERIFIED  

---

## 1. Overview

This document presents the complete mathematical formulations, statistical models, spatial algorithms, and econometric rules implemented within the UrbanLens platform. All calculations are executed deterministically in the analytical backend (`server/src/services/` and `server/python/`) without arbitrary heuristics or fabricated constants.

---

## 2. Housing Finance & Affordability Algorithms

### 2.1 Reducing-Balance Home-Loan EMI Formula
The standard reducing-balance monthly installment equates the discounted present value of $n$ periodic payments to the initial principal loan balance $P$ at monthly interest rate $r$:

$$P = \sum_{k=1}^{n} \frac{\text{EMI}}{(1+r)^k} = \text{EMI} \cdot \left[ \frac{1 - (1+r)^{-n}}{r} \right]$$

Solving for $\text{EMI}$:
$$\text{EMI} = \frac{P \cdot r \cdot (1+r)^n}{(1+r)^n - 1}$$

Where:
* $P = \text{Property Price} - \text{Down Payment}$ (Loan Principal in ₹)
* $r = \frac{\text{Annual Interest Rate (\%)}}{12 \times 100}$ (Periodic monthly interest rate)
* $n = \text{Tenure (Years)} \times 12$ (Total monthly amortization periods)

#### L'Hôpital Zero-Interest Edge Case:
When $r \to 0$, the standard formula evaluates to the indeterminate form $\frac{0}{0}$. Applying L'Hôpital's Rule with respect to $r$:
$$\lim_{r \to 0} \text{EMI} = \lim_{r \to 0} \frac{\frac{d}{dr} \left[ P \cdot r \cdot (1+r)^n \right]}{\frac{d}{dr} \left[ (1+r)^n - 1 \right]} = \frac{P}{n}$$
The calculation engine detects $r \le 10^{-7}$ and computes $\text{EMI} = \frac{P}{n}$, avoiding `NaN` or `DivideByZero` exceptions.

### 2.2 Periodic Amortization Schedule & Prepayment Acceleration
At each monthly iteration $m \in \{1, 2, \dots, n\}$:
$$\text{Interest Component}_m = B_{m-1} \cdot r$$
$$\text{Principal Component}_m = \min(B_{m-1}, \text{EMI} - \text{Interest Component}_m)$$
$$B_m = \max(0, B_{m-1} - \text{Principal Component}_m - E_m)$$

Where:
* $B_0 = P$
* $E_m$ is the optional extra monthly prepayment.
* If $E_m > 0$, the effective closing balance reaches zero in $m^* < n$ months. Total interest saved is:
$$\Delta I = \sum_{m=1}^{n} (\text{Interest}_m^{\text{baseline}}) - \sum_{m=1}^{m^*} (\text{Interest}_m^{\text{prepayment}})$$

### 2.3 Statutory Acquisition Costs & Upfront Capital
Total upfront liquidity required to acquire property $P_{\text{prop}}$:

$$C_{\text{upfront}} = D + S + R + F_{\text{proc}} + L + B + M + I_{\text{fitout}} + O$$

Where:
1. **Down Payment ($D$)**: Default $20\%$ of $P_{\text{prop}}$ (or user-specified amount).
2. **Stamp Duty ($S$)**: Standard Maharashtra benchmark $6.0\%$ of $P_{\text{prop}}$:
   $$S = P_{\text{prop}} \times 0.06$$
3. **Registration Fee ($R$)**: Governed by the Maharashtra Registration Rules (1% capped at ₹30,000):
   $$R = \min(30000, P_{\text{prop}} \times 0.01)$$
4. **Loan Processing Fee ($F_{\text{proc}}$)**: $0.25\%$ of principal capped at ₹25,000 plus 18% GST:
   $$F_{\text{proc}} = \min(25000, P \times 0.0025) \times 1.18$$
5. **Legal & Document Audit ($L$)**: ₹25,000 default.
6. **Brokerage Fee ($B$)**: Percentage fee plus 18% GST (default: 0% in direct portal model).
7. **Moving Expenses ($M$)**: ₹25,000 baseline.
8. **Interiors & Initial Fitout ($I_{\text{fitout}}$)**: ₹2,50,000 baseline.
9. **Ancillary Contingency Reserve ($O$)**: ₹50,000 baseline.

### 2.4 True Monthly Cost of Homeownership (Non-Mortgage Overhead)
Total monthly homeowner expenditure normalizes recurring annual obligations:

$$\text{Total Monthly Ownership Cost} = \text{EMI} + M_{\text{maint}} + \frac{T_{\text{prop}}}{12} + \frac{I_{\text{home}}}{12} + U + R_{\text{rep}} + O_{\text{rec}}$$

Where:
* $M_{\text{maint}}$: Monthly society maintenance (default: ₹5.0 / sq.ft).
* $T_{\text{prop}}$: Annual municipal property tax divided by 12.
* $I_{\text{home}}$: Annual hazard/structure insurance divided by 12.
* $U$: Monthly utility overheads.
* $R_{\text{rep}}$: Repairs and capital replacement reserve fund.
* **Housing Expense-to-Income Ratio (HEIR)**:
  $$\text{HEIR} = \left( \frac{\text{Total Monthly Ownership Cost}}{\text{Monthly Gross Income}} \right) \times 100$$

### 2.5 Rent vs. Buy Cash-Flow Equivalence Model
The rent-vs-buy model enforces strict cash-flow equivalence across analysis horizon $H$ years:

#### Initial Capital Condition:
* **Buyer**: Deploys down payment $D$ and statutory acquisition costs $C_{\text{ancillary}}$:
  $$K_0^{\text{buyer}} = D + C_{\text{ancillary}}$$
* **Renter**: Allocates rental deposit ($3 \text{ months rent} = 3 \cdot R_0$). Remaining capital seeds an equity investment portfolio:
  $$W_0^{\text{renter}} = K_0^{\text{buyer}} - 3 \cdot R_0$$

#### Annual Dynamic Trajectory:
For each year $y \in \{1, 2, \dots, H\}$:
1. **Rental Escalation**: Monthly rent inflates at annual rate $g_{\text{rent}}$:
   $$R_y = R_0 \cdot (1 + g_{\text{rent}})^{y-1}$$
   $$\text{Annual Rent Outflow}_y = 12 \cdot R_y$$
2. **Buyer Cash Outflow**:
   $$\text{Annual Buyer Outflow}_y = 12 \cdot (\text{EMI} + M_{\text{maint}, y} + T_{\text{prop}, y})$$
3. **Cash-Flow Difference & Portfolio Compounding**:
   $$\Delta C_y = \text{Annual Buyer Outflow}_y - \text{Annual Rent Outflow}_y$$
   $$W_y^{\text{renter}} = W_{y-1}^{\text{renter}} \cdot (1 + r_{\text{invest}}) + \Delta C_y$$
4. **Buyer Terminal Equity**:
   Property value inflates at rate $g_{\text{prop}}$:
   $$V_y^{\text{prop}} = P_{\text{prop}} \cdot (1 + g_{\text{prop}})^y$$
   $$\text{Buyer Net Equity}_y = \max(0, V_y^{\text{prop}} - B_y^{\text{loan}} - 0.02 \cdot V_y^{\text{prop}})$$
   *(Note: 2% brokerage/transaction fee is deducted upon simulated property liquidation).*
5. **Net Buy Advantage**:
   $$\text{Advantage}_y = \text{Buyer Net Equity}_y - (W_y^{\text{renter}} + 3 \cdot R_0)$$
   *Break-even Year* is the earliest $y^*$ where $\text{Advantage}_{y^*} \ge 0$.

### 2.6 Household Affordability & Dual-Constraint Property Budgeting
Evaluates maximum purchase budget subject to simultaneous income and savings constraints:

1. **Maximum Allowable Housing EMI (FOIR Constraint)**:
   Given gross household income $I_{\text{gross}}$, existing non-housing loan EMIs $E_{\text{exist}}$, and prudential threshold $\text{FOIR}_{\text{threshold}}$ (default: 45%):
   $$\text{Max Debt Service} = I_{\text{gross}} \cdot \frac{\text{FOIR}_{\text{threshold}}}{100}$$
   $$\text{Max Allowable Housing EMI} = \max(0, \text{Max Debt Service} - E_{\text{exist}})$$

2. **Reverse Loan Sizing**:
   The maximum loan principal $P_{\max}$ supported by the maximum housing EMI is:
   $$P_{\max} = \text{Max Housing EMI} \cdot \left[ \frac{(1+r)^n - 1}{r \cdot (1+r)^n} \right]$$

3. **Dual-Constraint Sizing**:
   * **Loan-Constrained Budget**: Given target down payment fraction $d = \frac{\text{DP}_{\%}}{100}$:
     $$B_{\text{loan}} = \frac{P_{\max}}{1 - d}$$
   * **Cash-Constrained Budget**: Given liquid savings $S_{\text{liquid}}$ and ancillary cost fraction $a = \frac{\text{Ancillary}_{\%}}{100}$:
     $$B_{\text{cash}} = \frac{S_{\text{liquid}}}{d + a}$$
   * **Binding Property Budget**:
     $$\text{Budget}_{\text{binding}} = \min(B_{\text{loan}}, B_{\text{cash}})$$

---

## 3. Spatial & Geospatial Algorithms

### 3.1 Haversine Great-Circle Distance
Used to compute the shortest geodesic distance between neighborhood centroid $(\phi_1, \lambda_1)$ and OpenStreetMap amenity nodes $(\phi_2, \lambda_2)$ on a spherical Earth of radius $R = 6371.0\text{ km}$:

$$\Delta \phi = \frac{(\phi_2 - \phi_1) \cdot \pi}{180}, \quad \Delta \lambda = \frac{(\lambda_2 - \lambda_1) \cdot \pi}{180}$$
$$a = \sin^2\left(\frac{\Delta \phi}{2}\right) + \cos\left(\frac{\phi_1 \cdot \pi}{180}\right) \cdot \cos\left(\frac{\phi_2 \cdot \pi}{180}\right) \cdot \sin^2\left(\frac{\Delta \lambda}{2}\right)$$
$$c = 2 \cdot \text{atan2}\left(\sqrt{a}, \sqrt{1-a}\right)$$
$$d = R \cdot c$$

### 3.2 Amenity Density Index (ADI)
Quantifies civic amenity concentrations per square kilometer for sub-region $i$:

$$\text{ADI}_i = \frac{N_{\text{amenities}, i}}{\text{Area}_i \text{ (km}^2\text{)}}$$

### 3.3 Walkshed Proximity (500m Radius)
Evaluates pedestrian convenience by counting the total number of civic infrastructure nodes within a 500-meter ($0.5\text{ km}$) radius from the geometric centroid:

$$N_{500\text{m}, i} = \sum_{j=1}^{N_i} \mathbb{I}(d(\text{Centroid}_i, \text{Node}_j) \le 0.5)$$

---

## 4. Time-Series & Statistical Forecasting Algorithms

### 4.1 Compound Annual Growth Rate (CAGR)
Evaluates annualized price index expansion between observation periods $t_0$ and $t_n$:

$$\text{CAGR}(t_0, t_n) = \left( \frac{\text{HPI}_{t_n}}{\text{HPI}_{t_0}} \right)^{\frac{1}{n_{\text{years}}}} - 1$$

Where $n_{\text{years}} = \frac{t_n - t_0}{4}$ for quarterly observations.

### 4.2 Baseline Forecasting Models
1. **Naive Last-Value**:
   $$\hat{y}_{t+h} = y_t, \quad \forall h \in \{1, 2, \dots, H\}$$
2. **Seasonal Naive**:
   $$\hat{y}_{t+h} = y_{t+h-s \cdot (k+1)}$$
   Where $s = 4$ for quarterly series.
3. **Linear Trend Extrapolation**:
   Fitting ordinary least squares $\hat{y}_t = \beta_0 + \beta_1 t$:
   $$\beta_1 = \frac{\sum_{t=1}^{T} (t - \bar{t})(y_t - \bar{y})}{\sum_{t=1}^{T} (t - \bar{t})^2}, \quad \beta_0 = \bar{y} - \beta_1 \bar{t}$$
   $$\hat{y}_{T+h} = \beta_0 + \beta_1 (T+h)$$

### 4.3 Forecast Evaluation Metrics
* **Mean Absolute Error (MAE)**:
  $$\text{MAE} = \frac{1}{N} \sum_{i=1}^{N} |y_i - \hat{y}_i|$$
* **Root Mean Squared Error (RMSE)**:
  $$\text{RMSE} = \sqrt{\frac{1}{N} \sum_{i=1}^{N} (y_i - \hat{y}_i)^2}$$
* **Percentage Reduction vs. Baseline**:
  $$\Delta \text{Metric}_{\%} = \left( \frac{\text{Metric}_{\text{naive}} - \text{Metric}_{\text{model}}}{\text{Metric}_{\text{naive}}} \right) \times 100$$

---

## 5. Urban Transformation & Anomaly Detection Algorithms

### 5.1 Rolling Z-Score Anomaly Detection
Detects sudden macroeconomic deviations from a moving window of size $w = 8$ quarters:

$$\mu_t = \frac{1}{w} \sum_{k=0}^{w-1} y_{t-k}, \quad \sigma_t = \sqrt{\frac{1}{w-1} \sum_{k=0}^{w-1} (y_{t-k} - \mu_t)^2}$$
$$Z_t = \frac{y_t - \mu_t}{\sigma_t}$$
An observation is flagged as an **anomaly event** if $|Z_t| \ge 2.0$.

### 5.2 Interquartile Range (IQR) Outlier Detection
Non-parametric outlier detection robust to heavy-tailed distributions:

$$\text{IQR} = Q_3 - Q_1$$
$$\text{Lower Bound} = Q_1 - 1.5 \cdot \text{IQR}, \quad \text{Upper Bound} = Q_3 + 1.5 \cdot \text{IQR}$$
An observation $y_t$ is flagged if $y_t < \text{Lower Bound}$ or $y_t > \text{Upper Bound}$.

### 5.3 5-Pillar Evidence Sufficiency Engine Logic
To prevent premature or irresponsible claims of neighborhood gentrification, the engine evaluates evidence across 5 essential pillars:
1. **Data Availability**: Minimum 10 valid quarterly observations.
2. **Anomaly Presence**: Verified statistical anomaly in price or transaction volume.
3. **Spatial Clustering**: Evidence of localized infrastructure concentration.
4. **Temporal Depth**: Minimum 3-year contiguous longitudinal records.
5. **Displacement Indicators**: Demographic shift and socio-economic census evidence.

**Verdict Decision Rule**:
Because public demographic and displacement indicators are not published at micro-ward quarterly resolution in India, Pillar 5 cannot be empirically verified. The engine deterministically emits the verdict:
$$\text{Verdict} = \textbf{INSUFFICIENT EVIDENCE}$$
Accompanied by the disclosure: *"Statistical anomalies indicate price acceleration but cannot establish gentrification or population displacement without micro-census panel data."*
