# UrbanLens — Machine Learning & Model Justification Evaluation

### 1. Model Justification & Evaluation Mandate
Section 6 of Milestone 6 mandates an explicit investigation of whether machine learning is genuinely appropriate for the available urban dataset.

### 2. Empirical Model Justification Analysis

| Modeling Approach | Considered Application | Empirical Suitability Evaluation | Final Technical Decision |
|---|---|---|---|
| **Deep Neural Networks (LSTM/Transformers)** | Multi-year price & gentrification forecasting | **REJECTED**: The real historical dataset comprises 60 quarterly points. Deep networks severely overfit on $N < 100$ time-series observations, generating illusory precision. | **NOT IMPLEMENTED** |
| **Random Forest / XGBoost Gentrification Classifier** | Neighborhood classification (`Gentrifying` vs `Not`) | **REJECTED**: No ground-truth labeled displacement data exists for Indian wards. Training a classifier on fabricated or proxy labels introduces severe confirmation bias and ethical violations. | **NOT IMPLEMENTED** |
| **K-Means / DBSCAN Spatial Clustering** | Grouping sub-regions by amenity mix | **EVALUATED**: Only 4 sub-regions exist in the South Mumbai peninsula bounding box. Clustering 4 data points in 2 dimensions is trivially reducible to manual matrix inspection. | **NOT IMPLEMENTED** |
| **Rolling Z-Score & Statistical Outlier Modeling** | Temporal rate-of-change anomaly detection | **JUSTIFIED**: $N = 60$ quarterly observations is mathematically sufficient to compute sliding 8-quarter moving windows ($\mu, \sigma$) and IQR fences without data leakage. | **IMPLEMENTED** |
| **Chronological Time-Series Forecasting (Milestone 3)** | Future HPI trend baseline comparison | **JUSTIFIED & INTEGRATED**: Uses existing Milestone 3 baseline engine (Linear Trend Regression & Naive Last) evaluated chronologically on 80/20 train/test splits. | **REUSED FROM M3** |

---

### 3. Chronological Validation & Prevention of Target Leakage
- **No Random Shuffling**: All temporal calculations strictly adhere to chronological ordering. Moving statistics at quarter $t$ only incorporate observations from quarters $t-8$ through $t-1$.
- **Clear Distinction**: The engine strictly distinguishes retrospective historical analysis (what occurred between 2010 and 2025) from prospective future forecasts.
- **Evidence Verdict**: Because ground-truth demographic and eviction data is absent, the engine reports `INSUFFICIENT EVIDENCE` rather than claiming pseudo-predictive accuracy.
