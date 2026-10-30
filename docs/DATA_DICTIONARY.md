# UrbanLens — Data Dictionary

This data dictionary formalizes all schemas, fields, data types, metric classifications, and governance rules across UrbanLens.

---

## 1. Observation Time Series Schema (`processed_hpi.csv`)

| Field Name | Type | Allowed Values / Format | Description |
|---|---|---|---|
| `observation_date` | String | `YYYY-MM-DD` | Date representing the first or last day of the observation period (quarterly series use calendar quarter ends: 03-31, 06-30, 09-30, 12-31). |
| `geography_name` | String | `All India`, `Mumbai`, `Delhi`, `Bengaluru`, etc. | Canonical metropolitan region or national aggregate name. |
| `geography_level` | String | `city`, `district`, `neighborhood` | Spatial granularity. All official RBI HPI series are strictly `city`. |
| `metric_name` | String | `hpi_assessment`, `hpi_market` | Dimensionless housing price metric. |
| `metric_value` | Float | Numeric (> 0.0) | Numerical observation value (e.g., 301.1181). |
| `unit` | String | `index_points` | Dimensionless index value (Base: 2010-11 = 100). |
| `source_name` | String | `RBI-HPI`, `NHB-RESIDEX`, `SYNTHETIC_TEST_DATA` | Attribution identifier. |
| `source_url` | String | URL | Originating repository or institutional portal URL. |
| `retrieved_at` | String | ISO 8601 Timestamp | Timestamp when data was retrieved or normalized. |
| `data_status` | String | `real`, `synthetic_test`, `synthetic_demo` | Data provenance classification. |
| `index_base` | String | `2010-11=100` | Reference base year standard. |
| `frequency` | String | `quarterly`, `monthly` | Sampling frequency of the time series. |

---

## 2. Amenities Geospatial Schema (`processed_amenities.csv`)

| Field Name | Type | Allowed Values / Format | Description |
|---|---|---|---|
| `lat` | Float | `-90.0` to `90.0` | Decimal latitude coordinate (WGS84). |
| `lon` | Float | `-180.0` to `180.0` | Decimal longitude coordinate (WGS84). |
| `amenity_type` | String | `school`, `hospital`, `clinic`, `park`, `parking`, etc. | Categorical facility type classification. |
| `name` | String | Free-text string | Name of facility or point of interest. |
| `geography_name` | String | Canonical city name | Metropolitan region containing the feature. |
| `retrieved_at` | String | ISO 8601 Timestamp | Extraction timestamp. |
| `source_name` | String | `OSM`, `SYNTHETIC_TEST_DATA` | Data provider (e.g. OpenStreetMap). |
| `data_status` | String | `real`, `synthetic_test` | Authenticity classification. |

---

## 3. Metric Classifications & Isolation Rules

- **Dimensionless Index Metrics**: `hpi_assessment`, `hpi_market`, `housing_price_index`.
  - Unit: `index_points`
  - Base Year: 2010-11 = 100.0
- **Currency Price Metrics**: `avgPrice`, `price_per_sqft`, `avg_price_inr`.
  - Unit: `₹/sq.ft` (or `INR_per_sqft`)
  - Scope: Confined to demo simulations and neighborhood-level estimates.

> [!CAUTION]
> The data pipeline rejects or raises critical warnings if `index_points` is paired with currency units, or if HPI metrics are displayed with currency labels.
