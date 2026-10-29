# UrbanLens 🏙️
> **Urban Market Intelligence & Affordability Analytics Dashboard**

⚠️ **DEMO MODE NOTICE**: All data displayed across the UrbanLens platform is synthetically generated for demonstration and architectural prototyping purposes. It does NOT represent actual market transactions, real-world appraisals, or financial advice.

---

## 🌟 Overview
UrbanLens is an enterprise-grade urban analytics dashboard designed to monitor housing market dynamics, spatial price evolution, mortgage affordability metrics, and neighborhood intelligence across synthetic metro sectors.

### Key Capabilities
- **Market Dynamics**: Macro indicator cards, multi-area time-series analysis (2020–2024), transaction volume tracking, and seasonality heatmaps.
- **Predictive Forecasting**: Illustrative 12-month forward-looking projections (2025) with confidence intervals and anomaly detection indicators.
- **Neighborhood Intelligence**: Spatial geospatial visualization via Leaflet maps, amenity accessibility density scores, and gentrification vulnerability indices.
- **Mortgage & Affordability Analytics**: Real-time EMI amortization calculator, interactive 10-year Rent vs. Buy financial models, and income-to-price ratios.
- **Methodology & Data Transparency**: Comprehensive documentation of data pipelines, statistical formulas, and model architecture.

---

## 🏗️ Architecture & Tech Stack

### Frontend (`client/`)
- **Framework**: React 18 + TypeScript + Vite 6
- **Styling**: Tailwind CSS v4
- **Charts**: Recharts (Line, Area, Bar, Radar, Composed)
- **Maps**: Leaflet + React-Leaflet
- **Icons**: Lucide React
- **Routing**: React Router DOM v6

### Backend (`server/`)
- **Runtime**: Node.js v26 + Express
- **Language**: TypeScript
- **Endpoints**: `/api/health`, `/api/neighborhoods`, `/api/indicators`

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js (v18+)
- npm (v9+)

### 2. Installation
```bash
# Install frontend dependencies
cd client
npm install

# Install backend dependencies
cd ../server
npm install
```

### 3. Running Development Servers
```bash
# In the project root:
# Run frontend dev server (port 5173)
npm run dev:client

# Run backend API server (port 3001)
npm run dev:server
```

### 4. Production Build
```bash
# Build frontend
npm run build:client

# Build backend
npm run build:server
```

---

## ⚖️ Ethics & Data Disclaimer
UrbanLens does NOT provide real estate marketplace listings or brokerage services. All valuation models and risk scores are based on simulated data streams for technical demonstration.
