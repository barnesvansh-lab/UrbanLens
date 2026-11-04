# UrbanLens — Installation & Setup Guide

**Project**: UrbanLens — Urban Market Intelligence & Housing Affordability Analytics Platform  
**Target Milestone**: Milestone 8 (Final Engineering & Submission)  
**Date**: November 2026  
**Audience**: Evaluators, Academic Supervisors, Developers  

---

## 1. System Prerequisites

UrbanLens is engineered to run on standard consumer hardware, specifically optimized for lightweight developer workstations such as a **MacBook Air M2 with 8 GB RAM and 256 GB SSD**.

### Required Runtimes
1. **Node.js**: Version 18.16.0 or higher (Version 20.x or 22.x LTS recommended).
2. **npm**: Version 9.x or higher (packaged automatically with Node.js).
3. **Python**: Version 3.9 or higher (Version 3.10+ recommended) with standard library support.
4. **Git**: Version 2.30+ for version control management.

*Note: No database installation (PostgreSQL, MySQL, MongoDB, or Redis) is required. All data is served from flat-file repositories.*

---

## 2. Repository Cloning & Project Layout

```bash
# Clone the repository
git clone https://github.com/vanshbarnes/UrbanLens.git
cd UrbanLens
```

### Directory Tree Walkthrough
```
UrbanLens/
├── client/                     # Frontend Application (React, Vite, TypeScript)
│   ├── src/                    # Components, Pages, Charts, Custom Hooks
│   ├── public/                 # Static Assets
│   ├── package.json            # Client Dependencies
│   └── vite.config.ts          # Vite & Rollup Chunk Configuration
├── server/                     # Backend API & Gateway (Node.js, Express, TS)
│   ├── src/                    # Routers, Services, Type Definitions, Tests
│   ├── data/                   # Flat-file Datasets (GeoJSON, Indicators, OSM)
│   ├── python/                 # Analytical Modeling, Ingestion & Validation
│   │   ├── affordability.py    # Reference Financial Math Engine
│   │   ├── forecasting/        # Baseline Time-Series Models
│   │   ├── ingestion/          # Quality Assurance & Date Normalizers
│   │   ├── tests/              # 172 Python Unit & Pipeline Tests
│   │   └── data/               # Raw & Processed RBI HPI Time-Series CSVs
│   └── package.json            # Server Dependencies & Scripts
├── docs/                       # Comprehensive Academic & Technical Docs
├── package.json                # Workspace Master Scripts
├── run_demo.sh                 # One-Click Automated Demo & Verification Runner
└── README.md                   # Project Overview & Quickstart
```

---

## 3. Dependency Installation

UrbanLens uses standard npm workspaces and pip packages. Run the following commands from the repository root:

### 3.1 Install Frontend & Backend Packages
```bash
# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install

# Return to repository root
cd ..
```

### 3.2 Python Environment Setup
Ensure standard data science libraries are installed in your active Python environment:
```bash
python3 -m pip install numpy pandas scikit-learn
```

---

## 4. Environment Configuration

The application is pre-configured with safe, production-grade defaults. If custom ports or CORS origins are required, configure `server/.env`:

```bash
# Optional: server/.env
PORT=3001
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

---

## 5. Running the Application in Development Mode

You can run the frontend and backend servers concurrently using two separate terminal tabs:

### Terminal 1: API Server
```bash
cd server
npm run dev
# Server boots at http://localhost:3001
```

### Terminal 2: Client Web Dashboard
```bash
cd client
npm run dev
# Vite dev server boots at http://localhost:5173
```

Open your web browser and navigate to:  
`http://localhost:5173`

---

## 6. Running Production Builds

To compile and verify production bundles:

```bash
# Build both client and server from root
npm run build

# Or individually:
cd client && npm run build    # Compiles React TypeScript & Vite bundles
cd ../server && npm run build  # Compiles Express TypeScript via tsc
```

The compiled client bundle will be located in `client/dist/`, and compiled server code in `server/dist/`.

---

## 7. Running the Automated Test Suites

UrbanLens provides 248 automated unit and integration tests across three suites:

### 7.1 Run Complete Python Test Suite (172 Tests)
```bash
python3 -m unittest discover server/python/tests -v
```
*Expected Result*: `Ran 172 tests in ~0.1s. OK.`

### 7.2 Run Express Core & Affordability Tests (76 Tests)
```bash
cd server
npm test
```
*Expected Result*: `40 api tests passed, 36 affordability tests passed. Total 76 tests passed.`

---

## 8. One-Click Demonstration Script

For academic review, evaluation presentations, or quick verification, execute the automated demo runner:

```bash
./run_demo.sh
```

This script automatically:
1. Verifies Node.js and Python runtime environments.
2. Executes all 248 automated tests (Python and Express).
3. Executes production compilation for client and server.
4. Launches the Express API gateway and Vite client concurrently.
5. Displays direct access links for all four analytical modules.

---

## 9. Common Troubleshooting

| Issue | Root Cause | Resolution |
| :--- | :--- | :--- |
| `EADDRINUSE: port 3001` | Another process is occupying port 3001 | Terminate the process via `lsof -ti :3001 \| xargs kill -9` or change `PORT` in `server/.env`. |
| `ModuleNotFoundError: No module named 'numpy'` | Python environment lacks scientific libraries | Run `python3 -m pip install numpy pandas`. |
| `Operation not permitted (sandbox)` | Terminal permissions restricting miniconda3 | Use system python via `/usr/bin/python3` or activate a standard virtual environment (`python3 -m venv venv`). |
| Leaflet map tiles fail to render | Offline mode or network restriction | React Leaflet uses CartoDB/OSM CDN tiles. Ensure active internet access for tile fetching, or inspect local GeoJSON boundaries directly. |
