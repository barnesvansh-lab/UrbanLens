# UrbanLens — Academic Demonstration Pre-Flight Checklist

**Project**: UrbanLens — Urban Market Intelligence & Housing Affordability Analytics Platform  
**Target Milestone**: Milestone 8 (Agent 6 — Deployment & Final Demonstration Engineering)  
**Date**: November 2026  
**Auditor**: Lead Systems Integration & Deployment Architect  
**Status**: APPROVED CHECKLIST  

---

## 1. Pre-Flight Hardware & Runtime Checklist

Complete these checks 30 minutes before presenting to academic evaluators:

- [ ] **Hardware Power**: MacBook / Laptop connected to AC power adapter (prevents throttling during build or bundling).
- [ ] **External Display**: Tested HDMI/USB-C projection at $1080\text{p}$ ($1920\times1080$) or $1440\text{p}$. Verified browser scaling ($100\%$).
- [ ] **Node.js Environment**: Verified Node.js $\ge \text{v18.16.0}$ (`node --version`).
- [ ] **Python 3 Environment**: Verified Python $\ge 3.9$ with `numpy`, `pandas`, and `scikit-learn` installed (`python3 --version`).
- [ ] **Port Availability**: Confirmed ports `3001` and `5173` are unallocated:
  ```bash
  lsof -i :3001 -i :5173
  ```
  *(If occupied, run `kill -9 $(lsof -t -i :3001 -i :5173)`).*

---

## 2. Automated Test & Build Gate Checklist

Verify that all automated test gates pass cleanly before launching services:

- [ ] **Python Unit & Pipeline Tests (172 Tests)**:
  ```bash
  python3 -m unittest discover server/python/tests
  ```
  *Expected*: `Ran 172 tests ... OK (0.09s)`.
- [ ] **Express API Regression Tests (40 Tests)**:
  ```bash
  cd server && NODE_ENV=test npx ts-node src/__tests__/api.test.ts
  ```
  *Expected*: `tests 40, pass 40, fail 0`.
- [ ] **Express Affordability Tests (36 Tests)**:
  ```bash
  cd server && NODE_ENV=test npx ts-node src/__tests__/affordability.test.ts
  ```
  *Expected*: `tests 36, pass 36, fail 0`.
- [ ] **Full-Stack TypeScript & Vite Production Build**:
  ```bash
  npm run build
  ```
  *Expected*: Server `tsc` and client `tsc -b && vite build` complete with zero errors.

---

## 3. Live Service Startup Checklist

- [ ] **One-Click Startup Script**:
  ```bash
  ./run_demo.sh
  ```
  *Confirm both servers report ready without errors.*
- [ ] **Backend Health Endpoint**:
  Navigate to `http://localhost:3001/api/health` in browser. Confirm HTTP 200 `{"status":"ok"}`.
- [ ] **Data Pipeline Endpoint**:
  Navigate to `http://localhost:3001/api/data/summary`. Confirm 60 real observations from RBI HPI.
- [ ] **Frontend Application**:
  Navigate to `http://localhost:5173/`. Confirm clean rendering without browser console errors.

---

## 4. UI/UX & Functional Inspection Checklist

Verify on-screen behavior across all major screens:

- [ ] **Main Overview Dashboard (`/`)**:
  - [ ] Top header displays `"RBI HPI & OSM Integrated"` with green pulse badge.
  - [ ] 4 macro metric cards render with values and mini sparklines.
  - [ ] Neighborhood snapshot table renders walk scores and risk pills.
  - [ ] 4 pillar navigation cards successfully navigate to their respective routes.
- [ ] **Market Trends (`/market-trends`)**:
  - [ ] City dropdown permits switching to Mumbai, Delhi, Bengaluru, All-India.
  - [ ] Time range buttons (1Y, 3Y, All) update line chart.
  - [ ] Monthly seasonality bar chart renders 12-month transaction distribution.
- [ ] **Forecasting Engine (`/forecasting`)**:
  - [ ] Mode selector switches between `"Demo Mode"` and `"Real RBI Data"`.
  - [ ] Shaded Gaussian prediction intervals ($80\%$ and $95\%$) render around trend line.
  - [ ] MAE and RMSE evaluation table populates.
- [ ] **Neighborhood Spatial Intelligence (`/neighborhood`)**:
  - [ ] Leaflet map loads OpenStreetMap tiles and South Mumbai bounding boxes.
  - [ ] Clicking region pills (Colaba, Fort, Malabar Hill, Grant Road) animates map recentering.
  - [ ] Amenity category filter buttons (Schools, Clinics, Transit) toggle markers.
  - [ ] Amber Geographic & Temporal Disclosure banner is visible.
- [ ] **Area Comparison (`/neighborhood/compare`)**:
  - [ ] Multi-select pill selector allows toggling 2 to 4 regions.
  - [ ] Grouped bar charts compare amenity density per km² and 500m walk access.
- [ ] **Urban Transformation (`/transformation`)**:
  - [ ] 14 indicators across 8 domains are visible.
  - [ ] Anomalies tab tabulates Z-score ($|Z| \ge 2.0$) and IQR outliers.
  - [ ] Evidence Engine tab displays the amber **`INSUFFICIENT EVIDENCE`** verdict card.
- [ ] **Housing Affordability Engine (`/affordability`)**:
  - [ ] Property price, interest rate, and tenure sliders recompute EMI dynamically in $<1\text{ ms}$.
  - [ ] Prepayment simulation calculates interest savings and shortened tenure.
  - [ ] Expandable amortization schedule displays opening balance, EMI, interest, principal, and closing balance.
  - [ ] Upfront purchase costs calculate 6% Maharashtra stamp duty and ₹30,000 registration fee cap.
  - [ ] Rent vs Buy tab renders 15-year wealth trajectory line chart and break-even year.
  - [ ] Household budget tab calculates maximum safe borrowing under 45% FOIR threshold.
  - [ ] Scenario simulator displays side-by-side Conservative, Moderate, and Aggressive scenario cards.
- [ ] **Data Sources & Provenance (`/data-sources`)**:
  - [ ] Registered data sources list RBI DBIE and OpenStreetMap Overpass with source URLs.
  - [ ] Data dictionary maps all 6 primary schema fields.
- [ ] **Methodology & Mathematical Proofs (`/methodology`)**:
  - [ ] Code blocks render formulas for reducing-balance EMI, L'Hôpital zero-interest limit, and CAGR.

---

## 5. Emergency Fallback Plan

* **If Node.js process crashes unexpectedly**:
  Re-run `./run_demo.sh` immediately. The trap handler will clean lingering ports and boot fresh instances within 4 seconds.
* **If browser caching causes visual artifacts**:
  Hard-refresh browser using `Cmd + Shift + R` (macOS) or `Ctrl + Shift + R` (Windows/Linux).
* **If an examiner questions a metric value**:
  Open [`docs/COMPLETE_TEST_MATRIX.md`](file:///Users/vanshbarnes/Documents/UrbanLens%20Project/docs/COMPLETE_TEST_MATRIX.md) or [`docs/ALGORITHM_AND_METHODOLOGY.md`](file:///Users/vanshbarnes/Documents/UrbanLens%20Project/docs/ALGORITHM_AND_METHODOLOGY.md) to demonstrate the mathematical formulation and automated test assertion.
