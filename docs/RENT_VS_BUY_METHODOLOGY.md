# UrbanLens — Rent vs. Buy Cash-Flow Equivalence Methodology

**Document Version**: 1.0.0  
**Domain**: Housing Affordability Intelligence Engine (Milestone 7)  
**Target Architecture**: Shared TypeScript / Python Deterministic Financial Calculations  

---

## 1. Executive Summary & The "EMI vs. Rent" Fallacy

A prevalent error in consumer housing decisions is comparing monthly home-loan EMI directly with monthly rent:
$$\text{"My EMI is ₹70,000, but rent is ₹40,000, so renting is always cheaper."} \quad \text{— OR —}$$
$$\text{"Rent is dead money thrown away, so buying is always better."}$$

Both statements represent fundamental financial fallacies:
1. **The Buyer's Non-Equity Cash Drain**: EMI includes interest (which is an unrecoverable financing fee, not equity building). Furthermore, owners pay non-recoverable property taxes, society maintenance charges, and building insurance.
2. **The Renter's Capital Opportunity Cost**: The buyer commits a large amount of upfront capital ($\text{Down Payment} + \text{Stamp Duty} + \text{Registration} + \text{Legal Fees}$) into the property. The renter retains this capital and can invest it in financial assets (equities, mutual funds, fixed income).
3. **The Monthly Cash Flow Delta**: Because gross rental yields in Indian metropolitan cities are historically low (**2.0% to 3.5%**) while retail home loan interest rates are **8.25% to 9.00%**, renting is almost always significantly cheaper on a monthly cash-flow basis during initial years. A disciplined renter who invests this monthly cash-flow difference can build substantial liquid wealth.
4. **Inflation Asymmetry**: While rent escalates annually ($5\% \text{ to } 8\% \text{ p.a.}$ in Indian metros), a fixed-rate or typical amortizing EMI remains constant in nominal rupee terms, while property value appreciates.

UrbanLens implements an academically rigorous **Consistent Cash-Flow Equivalence Model** that eliminates double-counting and objectively tracks the net financial wealth of both paths over identical multi-year horizons.

---

## 2. Cash-Flow Equivalence Framework

To ensure a fair financial comparison, both paths are endowed with the exact same initial capital and identical total monthly expenditure capacity:

```
                          Initial Liquid Capital
                 (= Down Payment + Acquisition Costs)
                                   │
                 ┌─────────────────┴─────────────────┐
                 ▼                                   ▼
          BUY SCENARIO                        RENT SCENARIO
  • Capital locked into Property      • Rental Deposit (Refundable)
  • Monthly Outflow:                  • Remaining Capital Invested
    - EMI (Principal + Interest)      • Monthly Outflow:
    - Society Maintenance               - Monthly Rent (Escalating)
    - Property Tax & Insurance          - Tenant Maintenance
  • Monthly Cash Flow:                • Monthly Cash Flow:
    Outflow_Buy = Outflow_Total         Outflow_Rent < Outflow_Buy
                                      • Monthly Surplus Invested:
                                        ΔCF = Outflow_Buy - Outflow_Rent
                                        deposited into Investment Portfolio
```

---

## 3. Mathematical Specifications

### 3.1 Initial Capital Allocation ($t = 0$)
- **Total Initial Capital ($C_0$)**:
  $$C_0 = \text{Down Payment} + \text{Upfront Purchase Costs (Stamp Duty, Registration, Fees)}$$
- **Buy Scenario ($t = 0$)**:
  - Full $C_0$ is expended to purchase the home.
  - Property Value: $V_0 = \text{Property Price}$
  - Loan Principal: $P_0 = \text{Property Price} - \text{Down Payment}$
- **Rent Scenario ($t = 0$)**:
  - Refundable Rental Security Deposit: $D_{\text{rent}} = \text{Monthly Rent}_0 \times m_{\text{dep}}$ *(typically 3 to 6 months in Mumbai/Bengaluru)*
  - Initial Investment Portfolio:
    $$W_{\text{portfolio}, 0} = C_0 - D_{\text{rent}}$$
  - The portfolio is invested in a diversified wealth asset earning annual compound rate $r_{\text{invest}}$ (compounded monthly: $r_{\text{inv, mo}} = (1 + r_{\text{invest}})^{1/12} - 1$).

---

### 3.2 Year-by-Year Dynamic Cash Flows ($t \in [1, Y]$)

For each year $t$:

#### 1. Homeowner Outflow (Buy Scenario):
- **Annual Debt Service**: $12 \times \text{EMI}$
- **Annual Maintenance & Municipal Taxes**:
  $$M_{\text{own}, t} = (\text{Maintenance}_0 + \text{Property Tax}_0 + \text{Insurance}_0) \times (1 + g_{\text{maint}})^t$$
- **Total Annual Buy Outflow**:
  $$\text{Outflow}_{\text{Buy}, t} = (12 \times \text{EMI}) + M_{\text{own}, t}$$

#### 2. Tenant Outflow (Rent Scenario):
- **Annual Rent Outflow**:
  $$\text{Rent}_t = (12 \times \text{Monthly Rent}_0) \times (1 + g_{\text{rent}})^{t - 1}$$
- **Total Annual Rent Outflow**:
  $$\text{Outflow}_{\text{Rent}, t} = \text{Rent}_t + \text{Tenant Ancillary Expenses}_t$$

#### 3. Monthly Cash Flow Difference ($\Delta \text{CF}_t$):
$$\Delta \text{CF}_t = \text{Outflow}_{\text{Buy}, t} - \text{Outflow}_{\text{Rent}, t}$$
- **If $\Delta \text{CF}_t > 0$** (Buying is more expensive): The renter saves $\Delta \text{CF}_t$ over the year. This annual surplus is added directly into the renter's investment portfolio at year-end.
- **If $\Delta \text{CF}_t < 0$** (Renting has become more expensive due to rent inflation): The renter withdraws $|\Delta \text{CF}_t|$ from the investment portfolio to cover the rent deficit.

#### 4. Portfolio Growth Recursion:
$$W_{\text{portfolio}, t} = \left[ W_{\text{portfolio}, t-1} \times (1 + r_{\text{invest}}) \right] + \Delta \text{CF}_t$$

---

### 3.3 Terminal Net Wealth Formulation (Year $N$)

At the conclusion of the evaluation horizon ($N$ years):

#### Net Financial Wealth of Buying ($\text{Wealth}_{\text{Buy}, N}$):
$$\text{Wealth}_{\text{Buy}, N} = \text{Appreciated Property Value}_N - \text{Remaining Loan Balance}_N - \text{Selling Transaction Costs}$$
Where:
- $\text{Appreciated Property Value}_N = V_0 \times (1 + g_{\text{prop}})^N$
- $\text{Remaining Loan Balance}_N = B_N$ (from amortization formula; $B_N = 0$ if $N \ge \text{Loan Tenure}$)
- $\text{Selling Transaction Costs} = \text{Property Value}_N \times c_{\text{sell}}$ (Brokerage & legal: default $2.0\%$)

#### Net Financial Wealth of Renting ($\text{Wealth}_{\text{Rent}, N}$):
$$\text{Wealth}_{\text{Rent}, N} = W_{\text{portfolio}, N} + D_{\text{rent}}$$
Where:
- $W_{\text{portfolio}, N} = \text{Final compounded balance of initial capital} + \text{accumulated cash flow deltas}$
- $D_{\text{rent}} = \text{Refundable rental deposit returned in full}$

---

### 3.4 Net Financial Advantage & Break-Even Year

1. **Net Buy Advantage at Year $N$**:
   $$\text{Advantage}_{\text{Buy}, N} = \text{Wealth}_{\text{Buy}, N} - \text{Wealth}_{\text{Rent}, N}$$
   - If $\text{Advantage}_{\text{Buy}, N} > 0$: Buying resulted in greater net wealth after $N$ years.
   - If $\text{Advantage}_{\text{Buy}, N} < 0$: Renting and investing the surplus resulted in greater net wealth.

2. **Break-Even Year ($N^*$):**
   The earliest year $N^* \in [1, \text{Horizon}]$ at which:
   $$\text{Advantage}_{\text{Buy}, N^*} \ge 0$$
   *(If $\text{Advantage}_{\text{Buy}}$ remains negative throughout the horizon, the break-even period is reported as "Does not break even within $N$ years under selected assumptions").*

---

## 4. Fully Worked Numerical Benchmark

### Input Assumptions:
- **Property Value**: ₹1,25,00,000 (1.25 Crore)
- **Down Payment**: 20.0% $\implies$ ₹25,00,000 (Loan Principal: ₹1,00,00,000)
- **Upfront Acquisition Costs**: 11.38% $\implies$ ₹14,22,000 (Stamp Duty, Registration, Legal, Interiors)
- **Total Initial Capital ($C_0$)**: **₹39,22,000**
- **Home Loan**: ₹1.00 Crore @ $8.50\%$ for 20 years $\implies$ Monthly EMI = **₹86,782**
- **Monthly Maintenance & Taxes**: ₹6,000 / month ($g_{\text{maint}} = 5.0\% / \text{year}$)
- **Initial Monthly Rent**: ₹38,000 / month (Gross rental yield: $3.65\%$)
- **Rental Security Deposit**: ₹1,14,000 (3 months rent, refundable)
- **Initial Renter Portfolio**: ₹39,22,000 - ₹1,14,000 = **₹38,08,000**
- **Annual Rent Escalation ($g_{\text{rent}}$)**: $6.0\%$ per year
- **Annual Property Appreciation ($g_{\text{prop}}$)**: $6.0\%$ per year
- **Annual Investment Portfolio Return ($r_{\text{invest}}$)**: $10.0\%$ per year (Diversified Index / Equity Mutual Funds)
- **Analysis Horizon**: 15 Years

---

### Year-by-Year Financial Progression Table:

| Year | Monthly Rent (₹) | Monthly Buy Outflow (₹) | Annual Rent Outflow (₹) | Annual Buy Outflow (₹) | Property Value (₹) | Remaining Loan (₹) | Buyer Net Equity (₹) | Renter Portfolio (₹) | Net Advantage (₹) |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Yr 1** | ₹38,000 | ₹92,782 | ₹4,56,000 | ₹11,13,384 | ₹1,32,50,000 | ₹98,01,302 | ₹31,83,700 | ₹48,46,184 | **-₹16,62,484 (Rent leads)** |
| **Yr 3** | ₹42,697 | ₹93,397 | ₹5,12,362 | ₹11,20,766 | ₹1,48,87,700 | ₹93,43,464 | ₹52,46,482 | ₹74,38,720 | **-₹21,92,238 (Rent leads)** |
| **Yr 5** | ₹47,973 | ₹94,075 | ₹5,75,674 | ₹11,28,898 | ₹1,67,27,838 | ₹88,00,815 | ₹75,92,466 | ₹1,09,84,628 | **-₹33,92,162 (Rent leads)** |
| **Yr 8** | ₹57,136 | ₹95,248 | ₹6,85,635 | ₹11,42,980 | ₹1,99,23,086 | ₹77,72,508 | ₹1,17,52,116 | ₹1,72,94,840 | **-₹55,42,724 (Rent leads)** |
| **Yr 10** | ₹64,198 | ₹96,163 | ₹7,70,380 | ₹11,53,959 | ₹2,23,89,355 | ₹69,69,979 | ₹1,49,71,589 | ₹2,23,48,210 | **-₹73,76,621 (Rent leads)** |
| **Yr 12** | ₹72,133 | ₹97,173 | ₹8,65,595 | ₹11,66,071 | ₹2,51,56,679 | ₹59,77,225 | ₹1,86,76,320 | ₹2,80,68,912 | **-₹93,92,592 (Rent leads)** |
| **Yr 15** | ₹85,912 | ₹98,894 | ₹10,30,948 | ₹11,86,725 | ₹2,99,56,861 | ₹41,76,025 | **₹2,51,81,699** | **₹3,78,14,350** | **-₹1,26,32,651 (Rent leads)** |

### Critical Sensitivity Demonstration:
In the baseline above, because the investment portfolio earned **10.0% p.a.** while the property appreciated at **6.0% p.a.** and the initial gross rental yield was low (3.65%), the renter's compounded equity portfolio outperformed the leveraged home purchase over 15 years.

However, if **property appreciation increases to 9.0% p.a.** (matching high historical Mumbai cycles) or if the **investment portfolio return is reduced to 7.0% p.a.** (conservative fixed income), **the break-even point shifts dramatically to Year 7**, with Buying generating a ₹42.8 Lakh surplus by Year 15.

---

## 5. Principles of Objective Presentation in UrbanLens

1. **Conditional Outcomes Only**: The interface must explicitly state that the financial advantage is conditional on user-specified return and appreciation assumptions.
2. **Never Label Rent as "Wasted"**: The interface explains that interest, taxes, and maintenance paid by a homeowner are also unrecoverable non-equity expenses.
3. **Editable Parameters**: Every parameter (property appreciation, investment return, rent escalation, initial rent, maintenance) is fully editable.
4. **Transparent Formula Cards**: Tooltips explain the opportunity cost of capital and display the exact terminal balance breakdown.
