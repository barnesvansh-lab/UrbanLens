# UrbanLens — Milestone 6 Comprehensive Test Report

### 1. Test Execution Summary
- **Execution Timestamp**: October 30, 2026
- **Test Harnesses**:
  - Python: `unittest` discovery across `server/python/tests/`
  - Express: `node:test` + `ts-node` in `server/src/__tests__/`
  - Frontend: `tsc -b && vite build` in `client/`
- **Result**: **100% Passed. Zero Failures.**

---

### 2. Python Unit Tests (147 / 147 Passed)
```
Ran 147 tests in 0.090s
OK
```

#### Detailed Milestone 6 Python Test Breakdown (`test_m6_transformation.py`):
- `test_percentage_change_positive`: Validated positive rate calculations.
- `test_percentage_change_negative`: Validated negative rate calculations.
- `test_percentage_change_zero_base`: Validated zero denominator guard (returns None).
- `test_percentage_change_none_input`: Validated null safety.
- `test_cagr_calculation`: Validated 5-year CAGR formula against KaTeX analytical solution.
- `test_cagr_zero_or_negative_years`: Validated edge case handling for invalid periods.
- `test_rolling_std_window`: Validated 8-quarter moving window sample variance.
- `test_analyze_hpi_insufficient_data`: Confirmed graceful handling for $N < 2$.
- `test_analyze_hpi_full_series`: Verified full 60-observation series analysis and summary metrics.
- `test_zscore_calculation`: Validated standard score math.
- `test_zscore_zero_std`: Validated standard deviation singularity protection.
- `test_iqr_thresholds`: Validated Q1, median, Q3, and $1.5 \times \text{IQR}$ fences.
- `test_detect_anomalies_insufficient_data`: Verified threshold on short series ($N < 8$).
- `test_detect_anomalies_with_spike`: Verified detection of synthetic spike and mandatory caveat presence.
- `test_catalog_has_at_least_eight_sources`: Verified 9 data sources documented.
- `test_required_metadata_fields`: Verified publisher, license, format, and limitations on every source.
- `test_valid_statuses`: Verified 4 strict status classifications.
- `test_summary_counts_match`: Verified totals match catalog length.
- `test_total_indicators_count`: Verified 16 indicators registered.
- `test_eight_domains_covered`: Confirmed coverage across all 8 required domains.
- `test_real_indicators_have_values`: Verified real indicators have non-null observed values.
- `test_unavailable_indicators_have_reasons`: Verified unavailable indicators include reasons.
- `test_verdict_is_insufficient_evidence`: Verified academic verdict string.
- `test_five_core_pillars_present`: Confirmed all 5 assessment pillars evaluated.
- `test_academic_mandate_included`: Confirmed anti-gentrification mandate presence.
- `test_demographics_pillar_marked_insufficient`: Verified demographic pillar classification.
- `test_trends_json_exists_and_valid`: Validated on-disk `transformation_trends.json`.
- `test_anomalies_json_exists_and_valid`: Validated on-disk `transformation_anomalies.json`.
- `test_evidence_json_exists_and_valid`: Validated on-disk `transformation_evidence.json`.
- `test_quality_json_exists_and_valid`: Validated on-disk `transformation_quality.json`.
- `test_overview_json_exists_and_valid`: Validated on-disk `transformation_overview.json`.

---

### 3. Express Integration Tests (36 / 36 Passed)
```
▶ UrbanLens Express API Endpoints
  ✔ 1. GET /api/health → 200, status: ok
  ...
  ✔ 26. GET /api/transformation/summary → 200
  ✔ 27. GET /api/transformation/overview → 200 with macro HPI and evidence summary
  ✔ 28. GET /api/transformation/trends → 200 with chronological points and rolling volatility
  ✔ 29. GET /api/transformation/areas → 200 with 4 South Mumbai sub-regions
  ✔ 30. GET /api/transformation/areas/south-mumbai-colaba → 200 with area detail
  ✔ 31. GET /api/transformation/areas/invalid@traversal.. → 400 INVALID_AREA_ID
  ✔ 32. GET /api/transformation/areas/non-existent-area → 404 AREA_NOT_FOUND
  ✔ 33. GET /api/transformation/comparison?ids=south-mumbai-colaba,south-mumbai-fort → 200
  ✔ 34. GET /api/transformation/anomalies → 200 with Z-score and IQR detected events
  ✔ 35. GET /api/transformation/evidence → 200 with INSUFFICIENT EVIDENCE verdict and 5 pillars
  ✔ 36. GET /api/transformation/data-sources & /api/transformation/quality → 200
✔ UrbanLens Express API Endpoints (40.5ms)
ℹ tests 36 | pass 36 | fail 0
```

---

### 4. Client Production Build
```
vite v6.4.5 building for production...
✓ 2270 modules transformed.
dist/index.html                   1.01 kB │ gzip:   0.56 kB
dist/assets/index-Bq0dofrO.css   58.76 kB │ gzip:  14.55 kB
dist/assets/index-BzoOQID3.js   955.87 kB │ gzip: 263.79 kB
✓ built in 2.08s
```
Zero TypeScript or bundling errors.
