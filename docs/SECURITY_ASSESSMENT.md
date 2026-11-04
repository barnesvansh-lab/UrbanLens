# UrbanLens — Security & Hardening Assessment

**Project**: UrbanLens — Urban Market Intelligence & Housing Affordability Analytics Platform  
**Target Milestone**: Milestone 8 (Final Engineering & Submission)  
**Date**: November 2026  
**Auditor**: Lead Security Architect & Systems Integration Team  
**Status**: APPROVED / HARDENED  

---

## 1. Executive Summary

This Security Assessment document details the security posture, vulnerability analysis, hardening mitigations, and verification results across the UrbanLens full-stack platform. 

UrbanLens is an analytical, non-transactional application designed for urban researchers, housing analysts, and academic evaluators. It does not handle user authentication credentials, payment processing, or personal banking data. However, robust security hardening has been implemented across the API gateway, execution sandbox, input parsers, and frontend client to prevent unauthorized filesystem access, denial-of-service (DoS) via resource exhaustion, cross-site scripting (XSS), injection attacks, and cross-origin abuse.

All identified vulnerabilities have been remediated, verified by automated security regression tests, and audited against industry standards (OWASP Top 10 API Security Risks).

---

## 2. Threat Model & Attack Surface

The system architecture presents four principal attack boundaries:
1. **Client Interface (Browser)**: React + Vite web dashboard consuming RESTful endpoints.
2. **API Gateway (Node.js / Express / TypeScript)**: Network-exposed HTTP server on port 3001.
3. **Analytical Subprocess / Computation Modules (Python / TypeScript)**: High-precision mathematical and time-series computation engines.
4. **Static Datasets & File Storage**: Flat-file CSV and JSON repositories containing empirical RBI HPI, OSM geo-amenities, and transformation indicators.

```
+-------------------------------------------------------------------------+
| Threat Matrix                                                           |
+----------------------+--------------------+-----------------------------+
| Threat Category      | Potential Vector   | Mitigation Implemented      |
+----------------------+--------------------+-----------------------------+
| Path Traversal       | Query / Path Param | Regex Whitelisting          |
| DoS / Memory Bloom   | Large JSON Payload | Express 1 MB Body Limit     |
| Numerical Injection  | NaN / Inf / -ve    | Boundary & Type Validation  |
| Data Poisoning       | Malformed CSV/JSON | Ingestion Quality Gate      |
| Cross-Origin Abuse   | Malicious Origins  | Configurable CORS Whitelist |
| PII / Data Leaks     | Financial Inputs   | Stateless In-Memory Engine  |
+----------------------+--------------------+-----------------------------+
```

---

## 3. Detailed Vulnerability Analysis & Hardening Controls

### 3.1 Path Traversal Mitigation (CWE-22)

* **Vulnerability Description**: Unsanitized geography names, area IDs, or file path parameters passed in URLs could permit attackers to step outside data directories (e.g., `../../etc/passwd` or accessing unauthorized server code).
* **Mitigation**: 
  - Every route accepting path or query parameters (`/api/data/series`, `/api/transformation/areas/:id`, `/api/forecasting/predict`) enforces strict alphanumeric, hyphen, and underscore regex validation:
    ```typescript
    const SAFE_ID_REGEX = /^[a-z0-9_-]{1,80}$/i;
    if (!SAFE_ID_REGEX.test(param)) {
      return res.status(400).json({ error: 'INVALID_IDENTIFIER', message: 'Contains invalid characters' });
    }
    ```
  - Filename construction uses resolved, bounded paths within `data/` and rejects directory separators (`/`, `\`, `..`).
* **Verification**:
  - Test `5. GET /api/data/series?geography=../../etc/passwd` → returns HTTP 400 Bad Request.
  - Test `16. GET /api/forecasting/predict?geography=../../etc` → returns HTTP 400 `INVALID_GEOGRAPHY`.
  - Test `31. GET /api/transformation/areas/invalid@traversal..` → returns HTTP 400 `INVALID_AREA_ID`.

---

### 3.2 Request Body Size & Denial-of-Service (CWE-400 / CWE-770)

* **Vulnerability Description**: Unbounded JSON body parsing in Node.js allows an attacker to stream multi-megabyte payloads, exhausting V8 memory and starving event-loop execution.
* **Mitigation**:
  - Body parser configured with strict `1mb` maximum size ceiling:
    ```typescript
    app.use(express.json({ limit: '1mb' }));
    ```
  - Numerical array and scenario limits: Scenario analysis endpoints (`/api/affordability/scenarios`) enforce a maximum of 10 concurrent scenarios per payload, preventing computational combinatorial explosion.
  - Horizon bounds: Time-series forecasting horizon parameter is strictly bounded between $1 \le h \le 36$ quarters ($1 \le h \le 12$ years).

---

### 3.3 Strict Numerical Validation & Edge Case Handling (CWE-1284)

* **Vulnerability Description**: Financial and statistical equations with unchecked inputs risk `Divide-by-Zero`, `NaN`, `Infinity`, or negative principal/tenure corrupting application state and response structures.
* **Mitigation**:
  - **L'Hôpital Zero-Interest Handling**: When interest rate $r = 0$, the reducing-balance EMI formula $\frac{P \cdot r}{1 - (1+r)^{-n}}$ becomes indeterminate ($\frac{0}{0}$). The calculation engine explicitly switches to linear principal amortization:
    $$\lim_{r \to 0} \text{EMI} = \frac{P}{n}$$
  - **Input Bounds Enforcement**:
    - Property price: Must be strictly positive ($> 0$), finite, non-null.
    - Interest rate: Bounded between $0 \le r \le 30\%$ per annum.
    - Tenure: Bounded between $1 \le n \le 40$ years.
    - Down payment: Strictly validated such that $0\% \le \text{down\_payment\_pct} < 100\%$ and $\text{down\_payment\_amount} < \text{property\_price}$.
    - Gross Income: Must be strictly positive ($> 0$).
* **Verification**:
  - Verified by Express Affordability tests 4, 6, 7, 8, 10, 15, 17, 18, 21, 30, 31, 32, 33.

---

### 3.4 Cross-Origin Resource Sharing (CORS) Hardening (CWE-942)

* **Vulnerability Description**: Unrestricted wildcard CORS headers (`Access-Control-Allow-Origin: *`) allow arbitrary third-party web domains to issue credentialed or unauthorized cross-origin requests.
* **Mitigation**:
  - CORS middleware restricts access to the designated frontend origin via environment variable `CORS_ORIGIN`:
    ```typescript
    const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';
    app.use(cors({ origin: CORS_ORIGIN }));
    ```
  - Disallows unwhitelisted external origins while supporting developer iteration on standard Vite dev ports.

---

### 3.5 Privacy & Sensitive Financial Data Protection (CWE-359)

* **Vulnerability Description**: User-submitted financial profiles (monthly gross salary, existing car/personal loans, property valuations) risk accidental logging in plain text or server disk persistence.
* **Mitigation**:
  - **100% Stateless Computation**: Neither PostgreSQL, MongoDB, nor file-based storage persists user-submitted financial profiles. In-flight requests calculate results purely in memory and immediately return the JSON response.
  - **Zero Logging of Financial Payloads**: Express middleware logging suppresses request body serialization for `/api/affordability/*` routes, preventing user income or balance records from entering syslog or console streams.

---

### 3.6 Data Pipeline Ingestion Integrity (CWE-20)

* **Vulnerability Description**: Ingesting external CSV files without structural and statistical validation risks data poisoning, silent schema drift, or broken series downstream.
* **Mitigation**:
  - The Python ingestion pipeline (`server/python/ingestion/`) implements a 7-step automated quality gate:
    1. Mandatory column verification (`geography`, `metric_name`, `observation_date`, `metric_value`).
    2. Date format normalization (ISO-8601, calendar quarters `YYYY-Q#`, Indian financial quarters `FY##-Q#`).
    3. Monotonic positive value assertions for price and HPI indexes.
    4. Automated deduplication preserving latest chronological records.
    5. Geography canonicalization (`Mumbai`, `Delhi`, `All India`).
    6. Z-score anomaly checking on raw ingestion streams.
    7. Automated generation of `data_quality_report.json` with completeness and validity scores.

---

## 4. Security Verification Matrix

| Test Suite | Security Check | Target Endpoint / Function | Test Output | Result |
| :--- | :--- | :--- | :--- | :--- |
| Express API | Path Traversal Rejection | `GET /api/data/series?geography=../../etc/passwd` | HTTP 400 Bad Request | **PASS** |
| Express API | Traversal in Forecasting | `GET /api/forecasting/predict?geography=../../etc` | HTTP 400 INVALID_GEOGRAPHY | **PASS** |
| Express API | Area Traversal Rejection | `GET /api/transformation/areas/invalid@traversal..` | HTTP 400 INVALID_AREA_ID | **PASS** |
| Express API | Non-existent Area Access | `GET /api/transformation/areas/non-existent-area` | HTTP 404 AREA_NOT_FOUND | **PASS** |
| Express API | Forecasting Horizon Bounds | `GET /api/forecasting/predict?horizon=99` | HTTP 400 INVALID_HORIZON | **PASS** |
| Express API | Invalid Mode Handling | `GET /api/forecasting/predict?mode=bad` | HTTP 400 INVALID_MODE | **PASS** |
| Affordability | Negative Property Price | `POST /api/affordability/emi` (`property_price: -500`) | HTTP 400 INVALID_PROPERTY_PRICE | **PASS** |
| Affordability | Unreasonable Interest Rate | `POST /api/affordability/emi` (`interest_rate: 45`) | HTTP 400 INVALID_INTEREST_RATE | **PASS** |
| Affordability | Down Payment $\ge$ Price | `POST /api/affordability/upfront-costs` | HTTP 400 INVALID_DOWN_PAYMENT | **PASS** |
| Affordability | Zero / Negative Income | `POST /api/affordability/household` (`income: 0`) | HTTP 400 INVALID_GROSS_INCOME | **PASS** |
| Affordability | Negative Monthly Rent | `POST /api/affordability/rent-vs-buy` | HTTP 400 INVALID_MONTHLY_RENT | **PASS** |
| Affordability | L'Hôpital Zero Interest | `POST /api/affordability/emi` (`interest_rate: 0`) | Exact $P/n$ Linear Quotient | **PASS** |
| Ingestion Py | Malformed CSV Columns | `test_02_invalid_csv_missing_columns` | Schema ValidationError Raised | **PASS** |
| Ingestion Py | Invalid Observation Date | `test_03_invalid_date_format_warning_and_rejection` | Rejected with warning entry | **PASS** |
| Ingestion Py | Duplicate Observation Removal| `test_05_duplicate_detection_and_removal` | Clean deduplicated series | **PASS** |

---

## 5. Security Posture Sign-Off

The UrbanLens codebase exhibits zero high or critical security vulnerabilities. Input sanitization, execution boundaries, memory ceilings, and error handlers are strictly configured for academic defense and production demonstration.
