# UrbanLens — Urban Transformation & Gentrification Modeling Methodology

## 1. Academic & Ethical Principles
Urban transformation and gentrification are multidimensional socioeconomic phenomena characterized by capital reinvestment, neighborhood demographic shifts, and potential lower-income household displacement. In computer science and urban data science projects, researchers often encounter the temptation to create superficial "gentrification risk scores" by combining arbitrary variables or synthesizing fake data.

**UrbanLens strictly rejects this practice.**

### 1.1 Core Rules Governing UrbanLens Analysis
1. **Never conflate property price appreciation with gentrification**: A rising House Price Index indicates macroeconomic valuation growth across transaction registrations, but does not measure whether lower-income households are being displaced or whether local commercial character is changing.
2. **Never claim city-level indices represent ward-level trends**: RBI House Price Index (HPI) is published at the metropolitan scale. Treating city-level index points as neighborhood-level property prices introduces ecological fallacies.
3. **Never interpret single-snapshot amenity counts as historical growth**: OpenStreetMap data retrieved at a single timestamp reflects contributor coverage on that date, not civic investment velocity over the past decade.
4. **Never simulate socioeconomic demographics**: Census 2011 is outdated, and Census 2021 ward-level data remains unreleased in machine-readable open formats. UrbanLens marks demographic change as `data_unavailable` with honest justifications rather than inventing synthetic demographics.

## 2. Transformation Indicator Registry (Milestone 5)

The indicator registry evaluates 12 distinct indicators across 7 functional domains:

### 2.1 Verified Real Indicators (4)
1. **Mumbai HPI — 15-Year Cumulative Change (2010–2025)**:
   - Category: `housing_price`
   - Geographic level: `city`
   - Observed Value: **+370.39%** (100.0 to 470.39 index points)
   - Source: Reserve Bank of India (DBIE portal)
2. **Mumbai HPI — 5-Year Medium-Term Change**:
   - Category: `housing_price`
   - Geographic level: `city`
   - Observed Value: **+45.45%** over the last 20 quarters
   - Source: Reserve Bank of India (DBIE portal)
3. **Mumbai HPI — Compound Annual Growth Rate (CAGR)**:
   - Category: `housing_price`
   - Geographic level: `city`
   - Observed Value: **10.87% per annum**
   - Source: Reserve Bank of India (DBIE portal)
4. **South Mumbai OSM Amenity Density Baseline**:
   - Category: `amenity_infrastructure`
   - Geographic level: `neighborhood` (South Mumbai bounding box)
   - Observed Value: **232 verified civic nodes**
   - Source: OpenStreetMap (Overpass API)

### 2.2 Transparently Unavailable Indicators (8)
1. **Neighborhood-Level House Price Index**:
   - Reason: Official RBI HPI is published only at city/metropolitan scale. No official ward-level index exists.
2. **Population Density Change**:
   - Reason: Census 2021 has not been released at municipal ward level. 2011 tables are static and not integrated.
3. **Household Income Distribution Change**:
   - Reason: Periodic Labour Force Survey (PLFS) / NSSO data is too coarse (district/state level). No ward-level income survey exists.
4. **Rental Price Index**:
   - Reason: No official residential rental index exists in India. Commercial portal listings (Magicbricks, 99acres) have unverified licensing and severe sampling bias.
5. **New Construction Permits (IOD / Intimation of Disapproval & CC / Commencement Certificate)**:
   - Reason: Municipal Corporation of Greater Mumbai (MCGM) building permit registers are not published via open machine-readable REST APIs.
6. **Slum Redevelopment Authority (SRA) Project Footprints**:
   - Reason: SRA project maps and rehabilitation boundary files are published in non-georeferenced PDF formats without polygon coordinates.
7. **Commercial Footprint & Retail Change**:
   - Reason: Time-series land-use records require historical municipal property-tax roll access.
8. **Urban Green Cover & Tree Canopy Change**:
   - Reason: Normalized Difference Vegetation Index (NDVI) time-series computation requires satellite imagery (Sentinel-2 / Landsat) processing through Earth Engine, exceeding current offline compute constraints.

## 3. Recommended Future Work
For subsequent development (Milestone 6 and beyond), the recommended path to defensibly expand urban transformation indicators is:
1. Integration of 2011 Census Mumbai ward-level tables as a static historical baseline.
2. Formal data-sharing request for MCGM ward GIS layers.
3. Automated satellite NDVI calculation using Google Earth Engine or Planetary Computer APIs for canopy coverage trends.
