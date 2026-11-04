# UrbanLens — Complete Master Test Matrix

**Project**: UrbanLens — Urban Market Intelligence & Housing Affordability Analytics Platform  
**Target Milestone**: Milestone 8 (Agent 4 — QA, Regression & Performance Engineering)  
**Date**: November 2026  
**Auditor**: Lead QA & Test Automation Architect  
**Status**: 100% EXECUTED & PASSED  

---

## 1. Quality Assurance Summary

This document provides the authoritative, exhaustive test matrix covering all unit, integration, validation, boundary, regression, and build compilation gates across the UrbanLens platform.

### Summary Statistics

```
================================================================================
TOTAL VERIFIED QUALITY CHECKS : 251
--------------------------------------------------------------------------------
Automated Python Tests        : 172 passed / 172 executed (100%)
Automated Express API Tests   :  40 passed /  40 executed (100%)
Automated Affordability Tests :  36 passed /  36 executed (100%)
Build & Compilation Gates     :   3 passed /   3 executed (100%)
Failures / Errors             :   0
Skipped / Cancelled           :   0
Execution Success Rate        : 100.0%
================================================================================
```

---

## 2. Test Breakdown by Layer & Suite

```
+-----------------------------------------------------------------------------------------+
| Test Suite Hierarchy                                                                   |
+--------------------------+-----------------------------+-------+----------+-------------+
| Suite Identifier         | Target Domain               | Tests | Duration | Result      |
+--------------------------+-----------------------------+-------+----------+-------------+
| server/python/tests/     | Ingestion, Math, Validation | 172   | 0.092s   | PASS (100%) |
| server/src/__tests__/    | Express API (M1–M6)         | 40    | 0.035s   | PASS (100%) |
| server/src/__tests__/    | Affordability Engine (M7)   | 36    | 0.041s   | PASS (100%) |
| Build Gate 1             | Server TypeScript (`tsc`)   | 1     | 0.850s   | PASS (100%) |
| Build Gate 2             | Client TypeScript (`tsc -b`)| 1     | 1.100s   | PASS (100%) |
| Build Gate 3             | Client Vite Production      | 1     | 1.940s   | PASS (100%) |
+--------------------------+-----------------------------+-------+----------+-------------+
| GRAND TOTAL              | Full System Verification    | 251   | ~4.058s  | PASS (100%) |
+--------------------------+-----------------------------+-------+----------+-------------+
```

---

## 3. Detailed Automated Test Catalog

### 3.1 Python Analytics & Ingestion Suite (`server/python/tests/` — 172 Tests)

#### A. Ingestion Pipeline & Quality Gates (`test_ingestion.py` — 11 Tests)
1. `test_01_valid_hpi_fixture_ingestion` — Verifies successful parsing of standard CSV with 60 quarters.
2. `test_02_invalid_csv_missing_columns` — Asserts `ValidationError` when mandatory columns are missing.
3. `test_03_invalid_date_format_warning_and_rejection` — Rejects non-ISO/non-quarter date strings.
4. `test_04_invalid_metric_value_rejection` — Rejects negative or non-numeric index points.
5. `test_05_duplicate_detection_and_removal` — Deduplicates overlapping timestamps, preserving latest observation.
6. `test_06_metric_type_consistency_warning` — Flags inconsistent unit declarations.
7. `test_07_geography_normalization_applied` — Normalizes regional names (`MUMBAI` $\to$ `Mumbai`).
8. `test_08_ingestion_summary_accuracy` — Validates observation counts and min/max date coverage.
9. `test_09_all_india_hpi_has_quarterly_records` — Confirms quarterly frequency across 2010–2025.
10. `test_10_missing_file_handled_gracefully` — Verifies error handling when file path does not exist.
11. `test_11_quality_scores_within_bounds` — Asserts completeness and validity scores $\in [0, 100]$.

#### B. Validation & Normalization (`test_validators.py` — 13 Tests)
12. `test_normalize_geography_name` — String normalization and trimming.
13. `test_normalize_metric_value` — Float casting and NaN guarding.
14. `test_parse_observation_date_calendar_quarter` — Parses `2024-Q1` to `2024-01-01`.
15. `test_parse_observation_date_fy_quarter` — Parses `FY24-Q1` to `2023-04-01`.
16. `test_parse_observation_date_invalid` — Returns `None` for unparseable dates.
17. `test_parse_observation_date_iso` — Validates standard ISO-8601 `YYYY-MM-DD`.
18. `test_parse_observation_date_month_ranges` — Parses month range strings.
19. `test_check_duplicates` — Evaluates series for duplicate timestamp records.
20. `test_metric_type_consistency_warning` — Asserts warning logging on metric mismatch.
21. `test_validate_amenities_valid_and_invalid` — Validates OSM geojson properties.
22. `test_validate_hpi_invalid_date_rejected` — Verifies rejection of malformed dates.
23. `test_validate_hpi_invalid_metric_value_rejected` — Asserts rejection of negative prices.
24. `test_validate_hpi_missing_columns` — Asserts rejection of schemas lacking `observation_date`.

#### C. Real Data Integration (`test_m4_real_data.py` — 17 Tests)
25–41. Verification of real RBI All-India series, 10 metropolitan city indices, quarterly periodicity assertions, chronological continuity, and data provenance manifest validation.

#### D. Neighborhood Spatial Analytics (`test_m5_neighborhood.py` — 48 Tests)
42–89. Verification of South Mumbai bounding boxes (Colaba, Fort, Malabar Hill, Grant Road), OSM feature density per km², Haversine great-circle distance formulas, centroid 500m walk radius calculations, GeoJSON boundary topology, and categorical amenity counts (schools, clinics, transit stops, parking).

#### E. Urban Transformation & Anomaly Engine (`test_m6_transformation.py` — 45 Tests)
90–134. Verification of 14 transformation indicators across 8 domains, rolling Z-score anomaly detection ($\ge 2.0\sigma$), Interquartile Range (IQR $1.5\times$) outlier detection, Min-Max & Robust scaling, 5-pillar evidence sufficiency engine, and explicit verification of the `INSUFFICIENT EVIDENCE` verdict.

#### F. Predictive Time-Series Forecasting (`test_forecasting.py` — 26 Tests)
135–160. Verification of Naive Last-Value baseline, Seasonal Naive baseline, Linear Trend baseline, prediction interval Gaussian bounds ($80\%$ and $95\%$), train/validation chronological splits, horizon parameter bounds ($1 \le h \le 24$), and fallback handling when real data is unavailable.

#### G. Affordability Financial Mathematics (`test_affordability.py` — 11 Tests)
161. `test_standard_benchmark_emi` — Verifies ₹55,541 benchmark EMI on ₹80L loan at 8.5% over 20 years.
162. `test_thirty_year_tenure` — Verifies 30-year reducing-balance EMI.
163. `test_zero_interest_rate_lhopital_edge_case` — Tests L'Hôpital linear amortization ($P/n$) at 0% interest.
164. `test_zero_principal_or_tenure_returns_zero` — Boundary check for zero loan.
165. `test_upfront_costs_calculation` — Validates stamp duty (6%) and Maharashtra statutory cap (₹30,000).
166. `test_schedule_closing_balance_reaches_zero` — Verifies amortization balance reaches exactly ₹0 at maturity.
167. `test_prepayment_shortens_tenure_and_saves_interest` — Asserts interest savings under extra payments.
168. `test_rent_vs_buy_trajectory_consistency` — Verifies cash-flow equivalence wealth trajectories.
169. `test_high_property_appreciation_leads_to_buy_advantage` — Verifies net buy advantage under asset growth.
170. `test_household_affordability_standard_case` — Tests 45% FOIR threshold and disposable surplus.
171. `test_zero_or_negative_income_returns_error` — Asserts rejection of non-positive gross income.

#### H. Data Quality Reporting (`test_quality.py` — 1 Test)
172. `test_quality_report_structure` — Verifies schema of `data_quality_report.json`.

---

### 3.2 Express API Regression Suite (`server/src/__tests__/api.test.ts` — 40 Tests)

1. `GET /api/health` — 200, status: ok
2. `GET /api/data/sources` — 200, array of DataSource
3. `GET /api/data/series` — 200, observations array
4. `GET /api/data/series?start_date=bad` — 400 Bad Request
5. `GET /api/data/series?geography=../../etc/passwd` — 400 Path Traversal Rejected
6. `GET /api/data/quality` — 200, quality reports array
7. `GET /api/data/summary` — 200, data summary object
8. `GET /api/neighborhoods/amenities` — 200, amenities array
9. `GET /api/neighborhoods/amenities?amenity_type=school` — 200, filtered amenities
10. `GET /api/data/series?start_date=2020-01-01&end_date=2019-01-01` — 400 (end before start)
11. `GET /api/forecasting/predict?mode=demo` — 200 status: ok, data_status: synthetic_demo
12. `GET /api/forecasting/predict?mode=demo&geography=mumbai-central&horizon=6` — 200
13. `GET /api/forecasting/predict?mode=real` — 200 status: unavailable (real data required)
14. `GET /api/forecasting/predict?horizon=99` — 400 INVALID_HORIZON
15. `GET /api/forecasting/predict?mode=bad` — 400 INVALID_MODE
16. `GET /api/forecasting/predict?geography=../../etc` — 400 INVALID_GEOGRAPHY
17. `GET /api/forecasting/predict?metric=price_per_sqft` — 400 INVALID_METRIC
18. `GET /api/forecasting/predict?mode=real&geography=All%20India` — 200 status: ok, data_status: real
19. `GET /api/data/sources` — RBI-HPI and OSM status is "integrated"
20. `GET /api/data/series?geography=Mumbai&metric=hpi_assessment` — returns real observations
21. `GET /api/neighborhoods` — 200, array of regions with analytics
22. `GET /api/neighborhoods/boundaries` — 200, GeoJSON FeatureCollection
23. `GET /api/neighborhoods/south-mumbai-colaba/analytics` — 200
24. `GET /api/neighborhoods/compare?ids=south-mumbai-colaba,south-mumbai-fort` — 200
25. `GET /api/transformation/indicators` — 200, array of 14 indicators
26. `GET /api/transformation/summary` — 200, transformation summary
27. `GET /api/transformation/overview` — 200, macro HPI + evidence overview
28. `GET /api/transformation/trends` — 200, temporal trend points & volatility
29. `GET /api/transformation/areas` — 200, 4 South Mumbai sub-regions
30. `GET /api/transformation/areas/south-mumbai-colaba` — 200, area detail
31. `GET /api/transformation/areas/invalid@traversal..` — 400 INVALID_AREA_ID
32. `GET /api/transformation/areas/non-existent-area` — 404 AREA_NOT_FOUND
33. `GET /api/transformation/comparison?ids=south-mumbai-colaba,south-mumbai-fort` — 200
34. `GET /api/transformation/anomalies` — 200, Z-score & IQR detected anomalies
35. `GET /api/transformation/evidence` — 200, INSUFFICIENT EVIDENCE verdict + 5 pillars
36. `GET /api/transformation/data-sources & /quality` — 200
37. `GET /api/transformation/indicators?data_status=bad_status` — 400 INVALID_STATUS_FILTER
38. `GET /api/transformation/comparison (missing ids)` — 400 MISSING_IDS
39. `GET /api/transformation/data-sources` — 14-dataset provenance inventory
40. `GET /api/transformation/quality` — series validation & compatibility audit

---

### 3.3 Express Affordability API Suite (`server/src/__tests__/affordability.test.ts` — 36 Tests)

1. `GET /api/affordability/assumptions` — 200, version, defaults & sources
2. `GET /api/affordability/market-context` — 200, Mumbai benchmarks & RBI HPI context
3. `POST /api/affordability/emi` — 200, benchmark EMI ₹55,541 (₹80L @ 8.5%, 20yr)
4. `POST /api/affordability/emi with zero interest` — Exact $P/n$ linear quotient (no NaN)
5. `POST /api/affordability/emi` (missing tenure) — 400 MISSING_REQUIRED_PARAMS
6. `POST /api/affordability/emi` (negative price) — 400 INVALID_PROPERTY_PRICE
7. `POST /api/affordability/emi` (rate > 30) — 400 INVALID_INTEREST_RATE
8. `POST /api/affordability/emi` (tenure > 40) — 400 INVALID_TENURE
9. `POST /api/affordability/upfront-costs` — 200, itemized statutory fees
10. `POST /api/affordability/upfront-costs` (zero price) — 400 INVALID_PROPERTY_PRICE
11. `POST /api/affordability/ownership-cost` — 200, monthly total cost with EMI
12. `POST /api/affordability/ownership-cost` (missing params) — 400 MISSING_REQUIRED_PARAMS
13. `POST /api/affordability/rent-vs-buy` — 200, 15-year wealth trajectory
14. `POST /api/affordability/rent-vs-buy` (missing params) — 400 MISSING_REQUIRED_PARAMS
15. `POST /api/affordability/rent-vs-buy` (horizon > 40) — 400 INVALID_HORIZON_YEARS
16. `POST /api/affordability/household` — 200, FOIR & dual-constraint property budget
17. `POST /api/affordability/household` (zero income) — 400 INVALID_GROSS_INCOME
18. `POST /api/affordability/household` (negative income) — 400 INVALID_GROSS_INCOME
19. `POST /api/affordability/scenarios` — 200, standard Conservative/Moderate/Aggressive scenarios
20. `POST /api/affordability/scenarios` — 200, custom user scenarios
21. `POST /api/affordability/scenarios` (zero price) — 400 INVALID_PROPERTY_PRICE
22. Disclaimers array assertion across all POST responses — Contains educational disclaimers
23. EMI amortization schedule first-year structure — Opening balance, EMI, interest, closing balance
24. Rent vs Buy trajectory year count — Exactly matches requested horizon
25. Household affordability FOIR calculation — Mathematically consistent with debt/income ratio
26. Boundary case: 1-year loan tenure — Validated
27. Boundary case: 40-year maximum loan tenure — Validated
28. Boundary case: Prepayment simulation — Shortens tenure and saves interest
29. Boundary case: Absolute `down_payment_amount` overrides percentage — Validated
30. Invalid input: Down payment pct $\ge 100\%$ — 400 Bad Request
31. Invalid input: Down payment amount $\ge$ property price — 400 Bad Request
32. Invalid input: Non-numeric property price — 400 Bad Request
33. Invalid input: Negative monthly rent — 400 Bad Request
34. Boundary case: Existing debt at/above FOIR — Leaves ₹0 housing EMI capacity
35. INR Currency Formatter — Formats standard (₹1,00,00,000) and compact (₹1.00 Cr, ₹80.00 L)
36. Market context formatting guide — Returns compact examples

---

### 3.4 Build & Compilation Gates (3 Gates)

1. **Server TypeScript Compilation (`tsc`)**: Clean compilation to `server/dist/` without type errors.
2. **Client TypeScript Compilation (`tsc -b`)**: Zero client-side TypeScript errors.
3. **Client Vite Production Bundling (`vite build`)**: Production bundle generation in 1.94s with clean code-splitting into 29 assets.
