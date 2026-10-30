# UrbanLens — Urban Transformation Data Source Audit & Availability Matrix

### 1. Overview
In accordance with Milestone 6 research specifications, UrbanLens conducted a structured data source discovery audit across Indian official repositories. Each dataset is classified into one of four empirical categories:
1. `VERIFIED REAL DATA`
2. `DOCUMENTED PROXY`
3. `DATA UNAVAILABLE`
4. `REQUIRES MANUAL VALIDATION`

---

### 2. Comprehensive Data Source Matrix

| ID | Dataset Name | Organization | Scope & Resolution | Observation Window | Format & License | Status | Missing Values | Limitations & Analytical Suitability |
|---|---|---|---|---|---|---|---|---|
| `rbi-hpi-mumbai` | RBI House Price Index (Mumbai) | Reserve Bank of India (RBI) | Mumbai Metropolitan Area (City level) | Q1 2010–11 to Q4 2024–25 (60 quarters) | CSV; Open Government Data (OGDL-India) | **VERIFIED REAL DATA** | 0 | Assessment-based registration values; cannot measure localized ward prices. Suitable for historical macro trends. |
| `rbi-hpi-all-india` | RBI House Price Index (All India + 9 Cities) | Reserve Bank of India (RBI) | 10 Indian metropolitan areas | Q1 2010–11 to Q4 2024–25 (600 quarters) | CSV; OGDL-India | **VERIFIED REAL DATA** | 0 | National and Tier-1 city aggregates. Suitable for multi-city benchmark comparison. |
| `osm-south-mumbai` | OpenStreetMap Civic Infrastructure | OSM Foundation Contributors | South Mumbai Bounding Box `[18.92, 72.80, 18.98, 72.85]` | Single snapshot: Oct 30, 2026 (232 nodes) | CSV / GeoJSON; ODbL License | **VERIFIED REAL DATA** | 0 | Point-in-time snapshot. High parking representation. Unsuitable for historical expansion rates. |
| `south-mumbai-bounding-boxes` | South Mumbai Sub-Region Extents | UrbanLens Research Definition | Colaba, Fort, Malabar Hill, Grant Road | Static Spatial Definition (4 polygons) | GeoJSON FeatureCollection; MIT License | **DOCUMENTED PROXY** | 0 | Approximate research bounding boxes; NOT official MCGM wards (A Ward, D Ward). |
| `census-2021-mumbai-wards` | Census of India 2021 (Wards) | Registrar General & Census Commissioner | Greater Mumbai Municipal Wards | Unreleased | Unreleased official tables | **DATA UNAVAILABLE** | 100% | 2021 Census enumeration was postponed; ward tables unreleased. 2011 Census is static and outdated. |
| `mcgm-building-permits` | MCGM AutoDCR Building Approvals | Municipal Corporation of Greater Mumbai | Greater Mumbai Wards | Proprietary / Case-by-case | Non-API web portal / PDF | **DATA UNAVAILABLE** | 100% | No public REST API; requires registered architect credentials. |
| `sra-redevelopment-gis` | SRA Slum Redevelopment Footprints | Slum Redevelopment Authority, Maharashtra | Mumbai Metropolitan Region | Non-georeferenced project lists | PDF notices / Scans | **DATA UNAVAILABLE** | 100% | Scanned documents lacking GIS vector coordinates. |
| `official-rental-index` | Official Residential Rental Index | MoHUA / NHB | Indian Tier-1 Cities | Non-existent | N/A | **DATA UNAVAILABLE** | 100% | No official Indian agency produces a residential rental index. Private portal listings suffer severe self-selection bias. |
| `satellite-ndvi-canopy` | Satellite Multispectral Imagery (NDVI) | European Space Agency (Sentinel-2) / USGS | South Mumbai Peninsula (10m raster) | 2018–2025 (5-day revisit) | GeoTIFF; Copernicus Open Access | **REQUIRES MANUAL VALIDATION** | Monsoon cloud voids | Multi-gigabyte image processing bounds exceed local 8 GB RAM offline environment. |

---

### 3. Ethical Anti-Fabrication Safeguards
- **Zero Synthetic Substitutions**: When data is unavailable (e.g., Census 2021 ward demographics or tenant eviction filings), UrbanLens returns `DATA UNAVAILABLE` with explicit rationales and potential proxies.
- **No Conflation of Scales**: City-level price growth (+370.39%) is never converted into fabricated neighborhood prices.
