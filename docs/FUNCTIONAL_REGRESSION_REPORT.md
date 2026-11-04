# URBANLENS FUNCTIONAL REGRESSION REPORT
## Zero-Regression Verification Across Milestones 1–8
**Document Version:** 2.0.0  
**Date:** November 2026  
**Test Suite Summary:**
* **Express API Tests:** 40 / 40 Passed (100%)
* **Affordability Engine Tests:** 36 / 36 Passed (100%)
* **Python Analytical & Forecasting Tests:** 172 / 172 Passed (100%)
* **Production Build Gate:** Passed (`tsc -b && vite build` and `tsc` in server)
* **Overall Gate Status:** 248 / 248 Automated Tests PASSED (0 Failures, 0 Skips)

---

## 1. Automated Test Execution Evidence

### 1.1 Express API Gateway Suite (`server/src/__tests__/api.test.ts`)
* **Total Tests:** 40
* **Pass Count:** 40
* **Fail Count:** 0
* **Execution Time:** ~30ms
* **Key Verified Contracts:**
  * Health check (`GET /api/health` → 200 ok)
  * Data sources registry (`GET /api/data/sources` → 200, 14 verified items)
  * Time series queries & path traversal rejection (`GET /api/data/series?geography=../../etc` → 400)
  * Forecasting mode contracts (`mode=demo` → 200, `mode=real` without geography → 200 unavailable, `mode=real&geography=All India` → 200 real)
  * Spatial endpoints (`GET /api/neighborhoods`, `/api/neighborhoods/boundaries`, `/api/neighborhoods/amenities`)
  * Transformation engine (`GET /api/transformation/indicators`, `/overview`, `/trends`, `/anomalies`, `/evidence`, `/areas`)

### 1.2 Affordability Decision Engine Suite (`server/src/__tests__/affordability.test.ts`)
* **Total Tests:** 36
* **Pass Count:** 36
* **Fail Count:** 0
* **Execution Time:** ~49ms
* **Key Verified Contracts:**
  * Reducing-balance EMI math (₹80L @ 8.5% for 20 yrs = ₹55,541 benchmark)
  * Zero interest rate boundary check (principal / months, no divide-by-zero)
  * Maximum tenure clamp (tenure > 40 rejected with 400)
  * Upfront purchase costs & Maharashtra statutory caps (stamp duty + ₹30,000 registration cap)
  * Monthly true ownership breakdown (EMI + maintenance + tax + utilities)
  * Rent vs. Buy 15-year equivalence wealth trajectory
  * FOIR borrowing limit & dual constraint household budgeting
  * Three financial scenarios (Conservative, Moderate, Aggressive)
  * INR currency formatting validation

### 1.3 Python Econometric & Machine Learning Suite
* **Total Tests:** 172
* **Pass Count:** 172
* **Fail Count:** 0
* **Key Verified Modules:**
  * Data validation, range checking, schema integrity
  * SARIMA / baseline forecasting algorithms
  * Z-score & IQR outlier anomaly tracking
  * 5-Pillar transformation scoring

---

## 2. Production Build Verification

```bash
> urbanlens-workspace@0.1.0 build
> npm run build --prefix client && npm run build --prefix server

> urbanlens-client@0.1.0 build
> tsc -b && vite build

✓ 2272 modules transformed.
✓ built in 2.00s

> urbanlens-server@0.1.0 build
> tsc
```

* **Client Bundle Size:**
  * `dist/index.html`: 1.13 kB
  * CSS bundles: 54.12 kB (gzip: 9.70 kB)
  * Vendor manual chunk: 165.52 kB (gzip: 54.17 kB)
  * Charts chunk (Recharts): 445.40 kB (gzip: 117.80 kB)
  * Maps chunk (Leaflet): 154.90 kB (gzip: 45.19 kB)
  * Application chunks: all cleanly split under 60 kB each.
* **Server Compilation:** `tsc` output to `server/dist/` clean with zero warnings.

---

## 3. Regression Verdict

**VERDICT: ZERO REGRESSION.**
All API routes, calculation logic, mathematical assertions, GeoJSON boundaries, and Recharts/Leaflet visualization pipelines remain 100% operational. The UI/UX transformation was accomplished entirely through presentation layer modernization without tampering with backend mathematical guarantees.
