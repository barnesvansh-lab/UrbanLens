# RBI House Price Index (HPI) — Raw & Normalized Data

## Source & Provenance
- **Originating Authority**: Reserve Bank of India (RBI) Database on Indian Economy (DBIE).
- **Public Mirror / Retrieval Repository**: `https://github.com/sharanya-singh/HPI-Analysis`
- **Raw File**: `cleaned_hpi.csv` (saved locally as `rbi_hpi_raw.csv`)
- **Attribution**: "Data sourced from Reserve Bank of India DBIE via sharanya-singh/HPI-Analysis (GitHub)"
- **Retrieved At**: October 2026

## Characteristics & Coverage
- **Metric Name**: `hpi_assessment`
- **Unit**: `index_points` (Base: 2010-11 = 100)
- **Geographic Level**: `city`
- **Frequency**: Quarterly (end of quarter dates: 06-30, 09-30, 12-31, 03-31)
- **Date Range**: 2010-06-30 (Q1 FY 2010-11) to 2025-03-31 (Q4 FY 2024-25)
- **Observations**: Exactly 60 quarterly observations for each of the 10 geographies:
  - All India
  - Ahmedabad
  - Bengaluru (normalized from Bangalore)
  - Chennai
  - Delhi
  - Jaipur
  - Kanpur
  - Kolkata
  - Lucknow
  - Mumbai
- **Total Records**: 600 records

## Normalization & Deduplication Methodology
1. **Base Year Separation**: The original raw dataset contained observations from two overlapping base years:
   - Base 2008-09 = 100 (retired series, 2009-Q4 to 2013-Q1)
   - Base 2010-11 = 100 (active official series, 2010-Q1 onwards)
2. **Pre-2010 Filtering**: Records prior to 2010-06-01 belonged exclusively to the retired 2008-09=100 series and were excluded to prevent mixing incompatible bases.
3. **Overlapping Quarters Resolution**: For quarters between 2010-06-30 and 2013-03-31 where both series existed, records were sorted by HPI ascending and deduplicated by keeping the minimum value. The 2010-11 base series starts around 100 in FY 2010-11, whereas the 2008-09 base series was around 140–210 during the same period. Keeping the smaller value preserves the consistent 2010-11=100 base series.
4. **Standard Schema**: Normalized data contains standard fields: `observation_date`, `geography_name`, `geography_level`, `metric_name`, `metric_value`, `unit`, `source_name`, `source_url`, `retrieved_at`, `data_status`, `index_base`, and `frequency`.

## Critical Data Integrity Principles
- **Dimensionless Index**: HPI values are index numbers (base 100), NOT rupee amounts (₹/sqft).
- **City-Level Only**: City-level index series cannot be used for direct neighborhood-level property price prediction.
