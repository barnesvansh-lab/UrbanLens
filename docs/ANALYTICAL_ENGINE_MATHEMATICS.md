# UrbanLens — Milestone 6 Analytical Engine Mathematics & Methodological Assumptions

This document provides a mathematical specification of the algorithms, statistical formulations, normalization methods, anomaly detection thresholds, and scientific assumptions implemented in the UrbanLens Milestone 6 Analytical Engine.

---

## 1. Temporal Rate Calculations

### 1.1 Quarter-over-Quarter (QoQ) Percentage Change
Measures the short-term sequential rate of change between consecutive quarterly observations:

$$\Delta_{\text{QoQ}, t} = \left( \frac{V_t - V_{t-1}}{V_{t-1}} \right) \times 100$$

- **Domain Guard**: If $V_{t-1} \le 0$ or either value is missing (`null`), $\Delta_{\text{QoQ}, t}$ returns `None`.
- **Unit**: Percent ($\%$).

### 1.2 Year-over-Year (YoY) Percentage Change
Measures the annual change relative to the identical quarter of the preceding year (4 quarters prior), filtering out quarterly seasonal fluctuations:

$$\Delta_{\text{YoY}, t} = \left( \frac{V_t - V_{t-4}}{V_{t-4}} \right) \times 100$$

- **Domain Guard**: Requires at least $t \ge 4$ chronological observations.

### 1.3 Compound Annual Growth Rate (CAGR)
Measures the constant annual rate of geometric growth over an observation interval of $n$ quarters ($Y = n / 4$ years):

$$\text{CAGR} = \left[ \left( \frac{V_{\text{end}}}{V_{\text{start}}} \right)^{\frac{1}{Y}} - 1 \right] \times 100$$

- **Domain Guard**: Requires $V_{\text{start}} > 0$, $V_{\text{end}} > 0$, and $Y > 0$.
- **Windows Evaluated**:
  - Full Series (15-year baseline: Q1 2010 to Q4 2024, $Y \approx 14.75$ years).
  - 5-Year Medium Term ($Y = 5.0$, 20 quarters).
  - 3-Year Short Term ($Y = 3.0$, 12 quarters).

### 1.4 Rolling Sample Volatility (Standard Deviation)
Measures valuation stability and cyclical risk across a sliding window of $W = 8$ quarters on quarterly growth rates $\Delta_i$:

$$\bar{\Delta}_t = \frac{1}{W} \sum_{k=0}^{W-1} \Delta_{t-k}$$

$$\sigma_{\text{rolling}, t} = \sqrt{\frac{1}{W - 1} \sum_{k=0}^{W-1} (\Delta_{t-k} - \bar{\Delta}_t)^2}$$

- **Implementation**: Uses Bessel's correction ($W - 1$) for unbiased sample variance.
- **Window**: 8 quarters (2 full calendar years). Returns `None` for the initial 7 quarters.

---

## 2. Statistical Anomaly Detection

### 2.1 Rolling Z-Score Anomaly Detection
Detects localized shocks where the quarterly growth rate deviates significantly from its historical baseline:

$$Z_t = \frac{\Delta_t - \bar{\Delta}_{t, W}}{\sigma_{t, W}}$$

- **Baseline Window**: Preceding $W = 8$ quarters excluding the current observation ($t-8$ to $t-1$).
- **Anomaly Threshold**: $|Z_t| \ge 2.0$ (statistically significant at $p < 0.05$ under normality).
- **Severity Classification**:
  - **Moderate**: $2.0 \le |Z_t| < 3.0$
  - **High**: $|Z_t| \ge 3.0$

### 2.2 Global Interquartile Range (IQR) Outlier Detection
Detects global distribution anomalies across the complete 60-quarter distribution:

$$\text{IQR} = Q_3 - Q_1$$

$$\text{Lower Fence} = Q_1 - 1.5 \times \text{IQR}$$

$$\text{Upper Fence} = Q_3 + 1.5 \times \text{IQR}$$

- **Percentile Interpolation**: Continuous linear interpolation:
  $$k = (N - 1) \cdot p, \quad f = \lfloor k \rfloor, \quad c = \lceil k \rceil$$
  $$P_p = V_f \cdot (c - k) + V_c \cdot (k - f)$$
- **Non-Parametric**: Requires zero distributional assumptions (valid for skewed real-estate data).

---

## 3. Indicator Normalization & Standardization

### 3.1 Min-Max Feature Scaling
Transforms indicators into a standardized unit interval $[a, b]$ (default $[0, 1]$):

$$x' = a + \frac{x - x_{\min}}{x_{\max} - x_{\min}} \cdot (b - a)$$

- **Zero-Variance Guard**: If $x_{\max} = x_{\min}$, returns the scale midpoint $(a + b) / 2$ to prevent division by zero.
- **Missing Value Handling**: Preserves missingness as `None`.

### 3.2 Z-Score Standardization
Transforms a feature distribution to zero mean and unit variance:

$$z = \frac{x - \mu}{\sigma}$$

- **Zero-Variance Guard**: Returns $0.0$ if $\sigma = 0$.

### 3.3 Robust IQR Scaling
Normalizes variables with extreme skewness using rank-based statistics:

$$x' = \frac{x - \text{median}}{\text{IQR}}$$

### 3.4 Composite Normalization Integrity Guard
Prevents mathematically invalid index construction:
1. **Spatial Scale Invariance Check**: Forbids summing or averaging indicators from different geographic levels (e.g. city-level HPI + ward-level amenity density).
2. **Missing Observation Policy**: Rejects composite index generation when any constituent indicator is `null`.
3. **Polarity Check**: Mandates explicit directionality alignment before multi-criteria weighting.

---

## 4. Methodological Assumptions & Guardrails

### 4.1 Ecological Fallacy Prevention
- **Principle**: Statistical relationships observed at an aggregated macro level (Mumbai Metropolitan Area) do not necessarily hold at disaggregated micro scales (e.g., Ward A / Colaba).
- **Enforcement**: UrbanLens strictly forbids scaling, disaggregating, or interpolating city-level RBI HPI into ward-level property valuations without verified local transactional clearing data.

### 4.2 Single-Snapshot Non-Velocity Mandate
- **Principle**: A single geographic export (OpenStreetMap 2026 snapshot) contains spatial positions but zero historical temporal depth.
- **Enforcement**: The engine strictly prohibits computing historical expansion rates, civic growth velocities, or longitudinal trends from static OSM amenity counts.

### 4.3 Demographics & Gentrification Evidence Sufficiency
- **Scientific Definition**: Gentrification is defined as the socio-demographic transformation of a historically lower-income neighborhood through capital investment, leading to higher-income in-migration and resident displacement.
- **Sufficiency Condition**: Gentrification **cannot** be concluded from property appreciation alone. It mathematically requires joint observation of:
  1. Sustained localized housing price acceleration.
  2. In-migration of higher-income / higher-education cohorts (Census demographic turnover).
  3. Disproportionate rent burdens and involuntary tenant departures (displacement filings).
- **Engine Verdict**: Because Census 2021 ward tables and eviction registries are officially unreleased in India, the engine strictly outputs:
  $$\text{Overall Verdict} = \text{"INSUFFICIENT EVIDENCE"}$$
  preventing speculative or irresponsible gentrification labeling.
