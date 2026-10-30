# UrbanLens — Statistical Anomaly Detection Methodology

### 1. Research Objective
To detect unusual, high-velocity fluctuations in historical quarterly housing price growth without generating false-positive gentrification classifications.

### 2. Analytical Algorithms

#### 2.1 Rolling Z-Score Outlier Detection
For each quarter $t$ with an 8-quarter moving baseline ($t-8$ to $t-1$):
$$\mu_t = \frac{1}{8}\sum_{k=1}^{8} \text{QoQ}_{t-k}$$
$$\sigma_t = \sqrt{\frac{1}{7}\sum_{k=1}^{8} (\text{QoQ}_{t-k} - \mu_t)^2}$$
$$Z_t = \frac{\text{QoQ}_t - \mu_t}{\sigma_t}$$

An anomaly is flagged when $|Z_t| \ge 2.0$:
- **High Severity Surge**: $Z_t \ge +3.0$
- **Moderate Severity Surge**: $+2.0 \le Z_t < +3.0$
- **Moderate Severity Decline**: $-3.0 < Z_t \le -2.0$
- **High Severity Decline**: $Z_t \le -3.0$

#### 2.2 Global Interquartile Range (IQR) Outlier Detection
Using the empirical distribution of all historical quarterly growth rates:
- $Q_1 = 25\text{th percentile}$
- $Q_3 = 75\text{th percentile}$
- $\text{IQR} = Q_3 - Q_1$
- $\text{Lower Fence} = Q_1 - 1.5 \times \text{IQR}$
- $\text{Upper Fence} = Q_3 + 1.5 \times \text{IQR}$

Observations outside $[\text{Lower Fence}, \text{Upper Fence}]$ that were not captured by local rolling Z-score are flagged as global distribution outliers.

---

### 3. Empirical Findings on Mumbai RBI HPI (2010–2025)
Across 60 historical quarters, the engine detected **6 significant growth anomalies**:
- **2011-09-30**: Surge ($+10.95\%$ QoQ, $Z = 2.45$) — post-2010 valuation surge following base year reclassification.
- **2012-06-30**: Surge ($+10.15\%$ QoQ, $Z = 2.19$) — commercial district capital reinvestment phase.
- **2014-06-30**: Surge ($+7.33\%$ QoQ, $Z = 2.10$) — pre-election real estate registration spike.
- **2016-06-30**: Surge ($+5.83\%$ QoQ, $Z = 2.62$) — implementation window of RERA enactment announcement.
- **2020-09-30**: Decline ($-3.69\%$ QoQ, $Z = -2.31$) — Q2 FY2020–21 COVID-19 national lockdown transaction hiatus.
- **2021-03-31**: Surge ($+8.73\%$ QoQ, $Z = 2.76$) — Maharashtra stamp duty concession stimulus rebound.

---

### 4. Methodological Disclaimer
Every anomaly report contains the mandatory caveat:
> *"This price fluctuation reflects unusual valuation velocity in official transaction assessment records. It does NOT independently prove gentrification or tenant displacement."*
