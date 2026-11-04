# UrbanLens — Complete REST API Specification

**Project**: UrbanLens — Urban Market Intelligence & Housing Affordability Analytics Platform  
**Target Milestone**: Milestone 8 (Final Engineering & Submission)  
**Date**: November 2026  
**Base URL**: `http://localhost:3001` (Dev) / `/api` (Reverse Proxy)  
**Content-Type**: `application/json`  

---

## 1. Overview & General Conventions

The UrbanLens API Gateway exposes 28 RESTful endpoints delivering macroeconomic indices, neighborhood geospatial boundaries, OpenStreetMap amenity distributions, urban transformation indicators, and financial calculations.

### Standard Response Envelope
All successful responses return HTTP 200 with standard JSON payloads. All error responses conform to the following schema:
```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable description of the validation failure or missing resource."
}
```

### Common HTTP Status Codes
- `200 OK`: Request succeeded.
- `400 Bad Request`: Parameter validation failure, path traversal attempt, or missing required body attributes.
- `404 Not Found`: Requested resource or neighborhood identifier not found.
- `500 Internal Server Error`: Server error (handled cleanly with no stack trace leakage).

---

## 2. API Endpoint Directory

```
+-----------------------------------------------------------------------------------------+
| Category               | Method | Path                                                  |
+------------------------+--------+-------------------------------------------------------+
| 1. System Health       | GET    | /api/health                                           |
| 2. Market Data         | GET    | /api/data/sources                                     |
|                        | GET    | /api/data/series                                      |
|                        | GET    | /api/data/quality                                     |
|                        | GET    | /api/data/summary                                     |
| 3. Neighborhoods       | GET    | /api/neighborhoods                                    |
|                        | GET    | /api/neighborhoods/boundaries                         |
|                        | GET    | /api/neighborhoods/amenities                          |
|                        | GET    | /api/neighborhoods/:id/analytics                      |
|                        | GET    | /api/neighborhoods/compare                            |
| 4. Forecasting         | GET    | /api/forecasting/predict                              |
| 5. Transformation      | GET    | /api/transformation/indicators                        |
|                        | GET    | /api/transformation/summary                           |
|                        | GET    | /api/transformation/overview                          |
|                        | GET    | /api/transformation/trends                            |
|                        | GET    | /api/transformation/areas                             |
|                        | GET    | /api/transformation/areas/:id                         |
|                        | GET    | /api/transformation/comparison                        |
|                        | GET    | /api/transformation/anomalies                         |
|                        | GET    | /api/transformation/evidence                          |
|                        | GET    | /api/transformation/data-sources                      |
|                        | GET    | /api/transformation/quality                           |
| 6. Affordability       | GET    | /api/affordability/assumptions                        |
|                        | GET    | /api/affordability/market-context                     |
|                        | POST   | /api/affordability/emi                                |
|                        | POST   | /api/affordability/upfront-costs                      |
|                        | POST   | /api/affordability/ownership-cost                     |
|                        | POST   | /api/affordability/rent-vs-buy                        |
|                        | POST   | /api/affordability/household                          |
|                        | POST   | /api/affordability/scenarios                          |
+-----------------------------------------------------------------------------------------+
```

---

## 3. Detailed Endpoint Reference

### 3.1 System Health

#### `GET /api/health`
- **Description**: Returns operational heartbeat and API version.
- **Sample Response**:
  ```json
  {
    "status": "ok",
    "version": "0.1.0",
    "timestamp": "2026-11-04T10:00:00.000Z"
  }
  ```

---

### 3.2 Market Data Endpoints

#### `GET /api/data/sources`
- **Description**: Returns all registered data sources, citations, update cadences, and integration statuses.
- **Sample Response**: Array of `DataSource` objects (`rbi_dbie`, `osm_overpass`, etc.).

#### `GET /api/data/series`
- **Description**: Queries time-series observations for a specific geography and metric.
- **Query Parameters**:
  - `geography` (optional, default: `Mumbai`): Target city or region.
  - `metric` (optional, default: `hpi_assessment`): Time-series metric name.
  - `start_date` (optional, ISO format): Filter start date.
  - `end_date` (optional, ISO format): Filter end date.
- **Security Check**: Path traversal strings (e.g. `../../etc/passwd`) rejected with HTTP 400.
- **Sample Response**:
  ```json
  [
    {
      "geography": "Mumbai",
      "metric_name": "hpi_assessment",
      "observation_date": "2010-06-30",
      "metric_value": 100.0,
      "unit": "index_points",
      "data_status": "real"
    }
  ]
  ```

#### `GET /api/data/quality`
- **Description**: Returns automated pipeline quality audit metrics, completeness percentages, and outlier diagnostics.

#### `GET /api/data/summary`
- **Description**: Returns aggregated metrics (min, max, latest, CAGR, observation count) for core market series.

---

### 3.3 Neighborhood Intelligence Endpoints

#### `GET /api/neighborhoods`
- **Description**: Returns all configured sub-regions (Colaba, Fort, Marine Lines, Malabar Hill) with area metrics and centroid coordinates.

#### `GET /api/neighborhoods/boundaries`
- **Description**: Serves RFC 7946 GeoJSON `FeatureCollection` containing boundary polygons for Leaflet rendering.

#### `GET /api/neighborhoods/amenities`
- **Description**: Queries spatial amenity points extracted from OpenStreetMap Overpass.
- **Query Parameters**:
  - `amenity_type` (optional): Filter by `education`, `healthcare`, `transit`, or `commercial_lifestyle`.
  - `area_id` (optional): Filter by sub-region ID.

#### `GET /api/neighborhoods/:id/analytics`
- **Description**: Returns localized amenity counts, density per km², and walkability metrics for a sub-region.
- **Security Check**: Route parameter `:id` validated against regex `/^[a-z0-9_-]{1,80}$/i`. Non-matching inputs return 400; non-existent IDs return 404.

#### `GET /api/neighborhoods/compare`
- **Description**: Returns side-by-side comparative spatial metrics for two or more comma-separated sub-region IDs.
- **Query Parameters**: `ids=south-mumbai-colaba,south-mumbai-fort`

---

### 3.4 Forecasting Endpoints

#### `GET /api/forecasting/predict`
- **Description**: Computes time-series baseline forecasts (Naive, Seasonal Naive, Linear Trend) with prediction intervals.
- **Query Parameters**:
  - `geography` (required): Target region.
  - `horizon` (optional, default: `4`, range: `1..36` quarters).
  - `mode` (optional, `real` or `demo`): Strict real data requirement or synthetic fallback.
- **Security & Validation**: `horizon > 36` returns 400 `INVALID_HORIZON`. Unrecognized mode returns 400 `INVALID_MODE`.

---

### 3.5 Urban Transformation & Anomaly Endpoints

#### `GET /api/transformation/indicators`
- **Description**: Returns full metadata inventory of the 14 indicators across 8 urban transformation domains.
- **Query Parameters**: `data_status` (optional: `real` or `synthetic_demo`). Invalid filter returns 400.

#### `GET /api/transformation/anomalies`
- **Description**: Returns all statistical anomaly events detected via rolling Z-score ($|Z| \ge 2.0$) and Tukey IQR criteria.

#### `GET /api/transformation/evidence`
- **Description**: Returns the comprehensive 5-Pillar Evidence Sufficiency assessment.
- **Verdict**: Emits `INSUFFICIENT EVIDENCE` for South Mumbai due to the lack of longitudinal micro-spatial census records, preventing spurious gentrification claims.

#### `GET /api/transformation/data-sources`
- **Description**: Returns complete provenance, legal authority, and spatial applicability for all 14 indicators.

---

### 3.6 Housing Affordability Endpoints

#### `GET /api/affordability/assumptions`
- **Description**: Returns standard baseline financial assumptions, regulatory tax rates, and historical reference benchmarks.

#### `GET /api/affordability/market-context`
- **Description**: Returns current metropolitan RBI Mumbai HPI benchmark, prevailing bank interest spreads, and Indian currency formatting guide.

#### `POST /api/affordability/emi`
- **Description**: Computes reducing-balance monthly loan EMI, total interest, and annual amortization schedule.
- **Request Body**:
  ```json
  {
    "property_price": 10000000,
    "down_payment_pct": 20,
    "interest_rate": 8.5,
    "tenure_years": 20,
    "prepayment_annual": 0
  }
  ```
- **Validation**:
  - `property_price` must be $> 0$.
  - `interest_rate` must be $0 \le r \le 30$.
  - `tenure_years` must be $1 \le n \le 40$.
  - Down payment pct must be $< 100$.
- **Zero-Interest Handling**: Automatically applies L'Hôpital linear quotient $P/n$ when `interest_rate: 0`.

#### `POST /api/affordability/upfront-costs`
- **Description**: Calculates statutory stamp duty (6%), registration charges (capped at ₹30,000 in Maharashtra), loan processing fees, and required total liquid capital.
- **Request Body**: `{ "property_price": 10000000, "down_payment_pct": 20 }`

#### `POST /api/affordability/ownership-cost`
- **Description**: Computes total recurring monthly cost of ownership (EMI + Society Maintenance + Property Tax Provision + Insurance).
- **Request Body**:
  ```json
  {
    "property_price": 10000000,
    "down_payment_pct": 20,
    "interest_rate": 8.5,
    "tenure_years": 20,
    "monthly_maintenance": 8000,
    "annual_property_tax": 24000,
    "annual_home_insurance": 6000
  }
  ```

#### `POST /api/affordability/rent-vs-buy`
- **Description**: Performs 1-to-40 year discounted cash-flow simulation comparing buyer asset equity against tenant invested down payment and monthly cash surplus.
- **Request Body**:
  ```json
  {
    "property_price": 10000000,
    "down_payment_pct": 20,
    "interest_rate": 8.5,
    "tenure_years": 20,
    "monthly_rent": 35000,
    "rent_escalation_pct": 6.0,
    "property_appreciation_pct": 5.0,
    "investment_return_pct": 8.0,
    "horizon_years": 15
  }
  ```
- **Response**: Contains terminal net wealth for both paths, year-by-year trajectory array, and calculated break-even year.

#### `POST /api/affordability/household`
- **Description**: Evaluates household debt capacity based on Fixed Obligation to Income Ratio (FOIR).
- **Request Body**:
  ```json
  {
    "monthly_gross_income": 200000,
    "existing_monthly_debt": 25000,
    "foir_pct": 50,
    "interest_rate": 8.5,
    "tenure_years": 20,
    "down_payment_pct": 20
  }
  ```
- **Response**: Returns maximum allowable EMI, maximum loan eligibility, and total affordable property purchase budget.

#### `POST /api/affordability/scenarios`
- **Description**: Simulates and compares three financial scenarios (Conservative, Base, Optimistic) or custom user scenarios.
- **Request Body**: `{ "property_price": 10000000, "scenarios": [...] }`
- **Limits**: Maximum 10 scenarios per payload to prevent compute exhaustion.
