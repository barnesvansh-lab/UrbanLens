# UrbanLens — Local Demonstration & Setup Guide

**Project**: UrbanLens — Urban Market Intelligence & Housing Affordability Analytics Platform  
**Target Milestone**: Milestone 8 (Agent 6 — Deployment & Final Demonstration Engineering)  
**Date**: November 2026  
**Auditor**: Lead Systems Integration & Deployment Architect  
**Status**: VERIFIED & DEMO READY  

---

## 1. Quickstart: One-Click Demonstration

The fastest and most reliable method to verify and demonstrate UrbanLens is via the root demonstration runner script:

```bash
# 1. Open your terminal and navigate to the project directory
cd "/Users/vanshbarnes/Documents/UrbanLens Project"

# 2. Make the runner executable
chmod +x run_demo.sh

# 3. Launch the automated test gate and full-stack services
./run_demo.sh
```

### What `run_demo.sh` Executes:
1. Validates Node.js (`v18+`) and Python (`3.9+`) runtimes.
2. Runs all **172 Python unit and statistical pipeline tests** (`server/python/tests/`).
3. Runs all **76 Express API integration tests** (`server/src/__tests__/`).
4. Executes static compilation and bundling (`npm run build` $\to$ `tsc` and `vite build`).
5. Boots the Express API Gateway on `http://localhost:3001`.
6. Boots the React Vite Client Dashboard on `http://localhost:5173`.
7. Prints clickable direct URLs to all four intelligence modules.
8. Traps `Ctrl+C` to cleanly kill both background server processes.

---

## 2. Manual Multi-Terminal Startup Procedure

If you prefer running services in separate terminal tabs for debugging and inspection:

### Terminal 1: Backend API Gateway
```bash
cd server
npm run dev
```
*Expected Output*:
```text
UrbanLens API v0.2.0 running on http://localhost:3001
```

### Terminal 2: Frontend React Client
```bash
cd client
npm run dev
```
*Expected Output*:
```text
VITE v6.4.5 ready in 220 ms
➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### Terminal 3: Test Verification (Optional)
```bash
# Verify Python test suite
python3 -m unittest discover server/python/tests -v

# Verify Express API and Affordability test suites
cd server && npm test
```

---

## 3. Pre-Flight Verification Checklist

Before presenting to evaluators, verify the following baseline checks:

1. **API Health Check**:  
   Open `http://localhost:3001/api/health` in your browser.  
   Expected JSON response: `{"status":"ok","version":"0.1.0",...}`.
2. **Data Pipeline Status**:  
   Open `http://localhost:3001/api/data/summary`.  
   Expected: `total_observations: 60`, `data_status_breakdown: {"real": 60, ...}`.
3. **Frontend Dashboard**:  
   Open `http://localhost:5173` in Google Chrome or Safari.  
   Confirm top header renders `"RBI HPI & OSM Integrated"` with an emerald pulse badge.
4. **Interactive Amortization**:  
   Navigate to `http://localhost:5173/affordability`.  
   Confirm the EMI slider recomputes installments in real time with INR notation (e.g. ₹55,541/mo on ₹80L loan).
5. **Geospatial Map**:  
   Navigate to `http://localhost:5173/neighborhood`.  
   Confirm Leaflet renders OpenStreetMap tiles, South Mumbai boundaries, and amenity markers.

---

## 4. Troubleshooting Common Local Issues

### Issue 1: Port `3001` or `5173` Already Bound (`EADDRINUSE`)
* **Symptom**: `Error: listen EADDRINUSE: address already in use :::3001`.
* **Fix**: Terminate the lingering process occupying the port:
  ```bash
  kill -9 $(lsof -t -i :3001) 2>/dev/null || true
  kill -9 $(lsof -t -i :5173) 2>/dev/null || true
  ```

### Issue 2: Python Subprocess Fails in Forecasting
* **Symptom**: Forecasting returns `status: "unavailable"` or `python3: command not found`.
* **Fix**: Ensure `python3` is available on the system PATH and required dependencies are installed:
  ```bash
  python3 -m pip install numpy pandas scikit-learn
  ```

### Issue 3: Browser Console Shows CORS Warning
* **Symptom**: `Access to fetch at 'http://localhost:3001/api/...' has been blocked by CORS policy`.
* **Fix**: Ensure `CORS_ORIGIN` in `server/src/index.ts` matches your client port (`http://localhost:5173`).
