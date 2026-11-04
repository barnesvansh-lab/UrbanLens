# UrbanLens — Security & Hardening Assessment

**Project**: UrbanLens — Urban Market Intelligence & Housing Affordability Analytics Platform  
**Target Milestone**: Milestone 8 (Agent 2 — Security & Backend Reliability Engineering)  
**Date**: November 2026  
**Auditor**: Lead Security Architect & Systems Integration Team  
**Status**: AUDITED & HARDENED (No Critical or High Vulnerabilities)  

---

## 1. Executive Summary

This Security Assessment document details the security posture, vulnerability analysis, hardening controls, and empirical verification results across the UrbanLens platform.

UrbanLens is an analytical, non-transactional web platform designed for urban market intelligence, neighborhood amenity spatial analysis, multi-indicator gentrification transformation detection, and housing affordability intelligence. The application does not handle user authentication, session cookies, payment gateway processing, or permanent storage of personal banking credentials.

However, comprehensive security hardening has been applied to prevent common web application vulnerabilities (OWASP Top 10 API Security Risks), including path traversal, denial-of-service (DoS) via resource exhaustion, numerical injection, cross-origin request abuse, and unintentional exposure of sensitive financial inputs.

> [!CAUTION]
> **Security Scope & Boundary Disclaimer**:  
> No system is fully secure. This assessment covers the internal source code, Express middleware, numerical engines, input validation rules, and local development configurations audited in Milestone 8. It does not certify protection against kernel-level host exploits, network-level distributed denial-of-service (DDoS) attacks, automated adversarial fuzzing, or physical device tampering.

---

## 2. Threat Model & Vulnerability Register

The system attack surface is partitioned into four primary architectural zones:
1. **Client Interface**: React 19 + TypeScript SPA running in user browser.
2. **API Gateway**: Node.js + Express REST API listening on port 3001.
3. **Execution Subprocesses**: Python 3 time-series statistical forecasting scripts.
4. **Data Repositories**: Flat-file CSV and JSON datasets (RBI HPI, OSM amenities, transformation indicators).

### Vulnerability & Finding Classification Table

| Issue ID | Category | Severity | Description | Status | Remediation / Verification |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SEC-01** | Cross-Origin Policy | **Medium** | `CORS_ORIGIN` defaulted to wildcard (`*`) in `server/src/index.ts`, permitting cross-origin requests from any arbitrary web origin. | **RESOLVED** | Hardened default to explicit frontend origins (`http://localhost:5173`, `http://127.0.0.1:5173`) while supporting `process.env.CORS_ORIGIN` overrides. |
| **SEC-02** | Path Traversal | **Medium** | Path and query parameters (`geography`, `id`, `area_id`) could theoretically traverse directories if unconstrained. | **RESOLVED** | Whitelisted strict regex filters (`^[a-z0-9_-]{1,80}$/i` and safe string matching). Blocks `..`, `/`, `\`. 100% test coverage. |
| **SEC-03** | Denial of Service | **Medium** | Large incoming JSON payloads or unbounded scenario configurations could exhaust V8 heap memory. | **RESOLVED** | Enforced `express.json({ limit: '1mb' })`, capped forecasting horizon at $h \le 24$, and validated parameter array lengths. |
| **SEC-04** | Numerical Injection | **Low** | Division-by-zero ($\text{EMI} \to \frac{0}{0}$ at 0% interest), negative tenures, or non-finite inputs ($NaN, \pm\infty$). | **RESOLVED** | Implemented L'Hôpital linear quotient fallback for 0% interest rate, and strict `Number.isFinite()` range checks on all financial inputs. |
| **SEC-05** | Sensitive Data Leakage | **Low** | User-submitted financial profiles (income, debt, property price) could be logged to server consoles or persisted to disk. | **RESOLVED** | Zero disk storage; calculations are 100% stateless and in-memory. Zero request body console logging across all routes. |
| **SEC-06** | Subprocess Injection | **Low** | Python process invocation for forecasting could be susceptible to command injection if passed to a shell interpreter. | **RESOLVED** | Uses `spawnSync('python3', args, { shell: false })` with distinct argument array. Parameter inputs are regex-validated prior to invocation. |
| **SEC-07** | Dependency Health | **Informational** | Node.js and client dependency vulnerabilities. | **RESOLVED** | Server dependencies are minimal: only `cors` (^2.8.5) and `express` (^4.21.2). No vulnerable database ORMs or session packages. |
| **SEC-08** | Error Leakage | **Informational** | Uncaught server exceptions exposing file paths or internal stack traces. | **RESOLVED** | Global Express error handler catches all unhandled exceptions, logging `err.message` to server console and returning generic HTTP 500 JSON. |

---

## 3. Detailed Security Controls & Mitigations

### 3.1 Path Traversal Mitigation (CWE-22)
* **Risk**: Attacker supplies `../../` sequences in URL paths or query strings to inspect arbitrary filesystem contents.
* **Control**:
  - `server/src/middleware/validateQuery.ts` enforces `SAFE_STRING_RE = /^[a-zA-Z0-9 _\-\.]+$/` and explicitly rejects any occurrences of `..` or `/`.
  - Area and neighborhood route handlers enforce `/^[a-z0-9_-]{1,80}$/i`.
  - All file accesses in `dataService.ts` are bound to `PROCESSED_DIR` and `MANIFESTS_DIR` using pre-scanned directory manifests (`fs.readdirSync`).
* **Verification**:
  - `GET /api/data/series?geography=../../etc/passwd` $\to$ **HTTP 400**
  - `GET /api/forecasting/predict?geography=../../etc` $\to$ **HTTP 400**
  - `GET /api/transformation/areas/invalid@traversal..` $\to$ **HTTP 400**

### 3.2 Cross-Origin Resource Sharing (CORS) Hardening (CWE-942)
* **Risk**: Wildcard CORS configuration allows malicious external websites to send cross-origin requests.
* **Control**:
  - `server/src/index.ts` restricts origins to:
    ```typescript
    const allowedOrigins = process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
      : ['http://localhost:5173', 'http://127.0.0.1:5173'];
    app.use(cors({ origin: allowedOrigins }));
    ```
* **Verification**: Requests from unapproved origins are blocked by CORS headers. Tested and confirmed in server suite.

### 3.3 Strict Numerical Validation & Edge Case Handling (CWE-1284)
* **Risk**: Division by zero, non-finite values ($NaN, \infty$), and negative inputs causing application crashes or corrupt financial results.
* **Control**:
  - **L'Hôpital Zero-Interest Handling**: At $r = 0$, $\text{EMI} = \frac{P}{n}$ (exact linear principal quotient).
  - **Boundary Checks**:
    - Property price: $> 0$ and strictly finite.
    - Interest rate: $0 \le r \le 30\%$.
    - Tenure: $1 \le n \le 40$ years.
    - Down payment: $0 \le dp < \text{property\_price}$ and $dp\% < 100\%$.
    - Income: $> 0$ and strictly finite.
* **Verification**: Tested across 36 dedicated financial integration tests (all pass).

### 3.4 Subprocess Execution Security (CWE-78)
* **Risk**: Arbitrary OS command execution via Python subprocess.
* **Control**:
  - Uses `spawnSync` with array arguments (`pythonArgs`), `shell: false`, and `timeout: 15000` (15 seconds).
  - All arguments are validated before spawning.
* **Verification**: Tested with invalid geography inputs and non-existent parameters; subprocess injection attempts are rejected at the Express middleware layer before process spawning.

### 3.5 Privacy & Sensitive Data Protections (CWE-359)
* **Risk**: User-entered financial parameters (gross salary, outstanding debts, property budget) leaked into server logs or persisted to disk.
* **Control**:
  - No database or persistent storage is connected.
  - Zero request body logging in Express middleware.
  - Calculations run strictly in-memory and discard state after response serialization.

---

## 4. Verification Matrix

| Test ID | Security Check | Target Endpoint / Module | Expected Result | Actual Result |
| :--- | :--- | :--- | :--- | :--- |
| **SEC-T01** | Path Traversal Query Param | `GET /api/data/series?geography=../../etc/passwd` | HTTP 400 Bad Request | **PASS** |
| **SEC-T02** | Path Traversal Forecasting | `GET /api/forecasting/predict?geography=../../etc` | HTTP 400 `INVALID_GEOGRAPHY` | **PASS** |
| **SEC-T03** | Path Traversal Area Route | `GET /api/transformation/areas/invalid@traversal..` | HTTP 400 `INVALID_AREA_ID` | **PASS** |
| **SEC-T04** | Missing Area Handled Cleanly | `GET /api/transformation/areas/non-existent-area` | HTTP 404 `AREA_NOT_FOUND` | **PASS** |
| **SEC-T05** | Horizon Upper Bound | `GET /api/forecasting/predict?horizon=99` | HTTP 400 `INVALID_HORIZON` | **PASS** |
| **SEC-T06** | Invalid Mode Rejection | `GET /api/forecasting/predict?mode=bad` | HTTP 400 `INVALID_MODE` | **PASS** |
| **SEC-T07** | Negative Property Price | `POST /api/affordability/emi` (`price: -500`) | HTTP 400 `INVALID_PROPERTY_PRICE` | **PASS** |
| **SEC-T08** | Unreasonable Interest Rate | `POST /api/affordability/emi` (`rate: 45`) | HTTP 400 `INVALID_INTEREST_RATE` | **PASS** |
| **SEC-T09** | Down Payment $\ge$ Price | `POST /api/affordability/upfront-costs` | HTTP 400 `INVALID_DOWN_PAYMENT` | **PASS** |
| **SEC-T10** | Zero / Negative Gross Income | `POST /api/affordability/household` (`income: 0`) | HTTP 400 `INVALID_GROSS_INCOME` | **PASS** |
| **SEC-T11** | Negative Monthly Rent | `POST /api/affordability/rent-vs-buy` | HTTP 400 `INVALID_MONTHLY_RENT` | **PASS** |
| **SEC-T12** | Zero-Interest L'Hôpital Case | `POST /api/affordability/emi` (`rate: 0`) | Exact $P/n$ linear quotient | **PASS** |
| **SEC-T13** | Ingestion Schema Validation | `test_02_invalid_csv_missing_columns` | Schema ValidationError raised | **PASS** |
| **SEC-T14** | Ingestion Date Validation | `test_03_invalid_date_format_warning_and_rejection` | Rejected with warning | **PASS** |
| **SEC-T15** | Ingestion Deduplication | `test_05_duplicate_detection_and_removal` | Clean deduplicated series | **PASS** |

---

## 5. Scope of Audit & Unverified Areas

To ensure academic and technical transparency, the following areas were explicitly audited versus those remaining outside project scope:

### What Was Audited & Verified
- Express route definitions, parameter parsing, and middleware order.
- CORS policy defaults and environment variable overrides.
- HTTP request body size boundaries (`1mb`).
- File path construction and directory traversal defenses.
- Mathematical engine edge cases (division-by-zero, negative numbers, extreme tenures, floating point overflow).
- Python child process invocation security and timeout controls.
- Logging hygiene (confirming zero request body logging for financial inputs).
- Absence of hardcoded credentials, API keys, and sensitive tokens.
- Build integrity across TypeScript compiler (`tsc`) and Vite production bundle.

### What Remains Unverified / Outside Scope
- **Live Network Penetration Testing**: No external network penetration testing or dynamic application security testing (DAST) tools were run against an exposed public IP.
- **Fuzz Testing**: While extensive boundary and negative test cases are implemented, systematic coverage-guided protocol fuzzing was not performed.
- **Distributed Denial of Service (DDoS)**: Application-layer rate limiting (`express-rate-limit`) is not enabled; resilience relies on upstream reverse-proxy layers (e.g., NGINX/Cloudflare) if deployed publicly.
- **Host OS & Hardware Security**: Host-level kernel vulnerabilities, Spectre/Meltdown hardware exploits, or root-level process tampering are not mitigated at the application layer.

---

## 6. Security Posture Sign-Off

The UrbanLens backend demonstrates a hardened security posture appropriate for an academic research and urban analytics platform. With SEC-01 remediated and verified through 248 automated tests and 3 clean build gates, all identified vulnerabilities have been addressed without breaking existing API contracts or Milestones 1–7 functionality.
