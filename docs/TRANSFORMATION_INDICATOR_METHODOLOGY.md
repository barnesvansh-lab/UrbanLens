# UrbanLens — Multi-Domain Urban Transformation Indicator Methodology

### 1. Conceptual Framework
Urban transformation and gentrification encompass capital reinvestment, spatial restructuring, demographic succession, and housing affordability pressures. The UrbanLens Milestone 6 framework evaluates 16 indicators across 8 functional domains:

1. **Housing Market Dynamics**:
   - `hpi-cumulative-15yr`: Total % change from Q1 2010–11 to Q4 2024–25 ($+370.39\%$).
   - `hpi-cagr-5yr`: 5-year Compound Annual Growth Rate across the most recent 20 quarters ($1.10\% / \text{year}$).
   - `hpi-rolling-volatility`: Average 8-quarter rolling sample standard deviation ($2.45\%$).
   - `neighborhood-hpi`: Ward-level transaction prices (`DATA UNAVAILABLE`).
2. **Demographics & Population Shifts**:
   - `population-density-growth`: Decennial population density change (`DATA UNAVAILABLE` — Census 2021 unreleased).
   - `household-size-composition`: Average household size and composition shift (`DATA UNAVAILABLE`).
3. **Infrastructure & Civic Amenities**:
   - `osm-amenity-density-snapshot`: Civic amenity density across South Mumbai ($6.15\text{ amenities/km}^2$).
   - `historical-infrastructure-growth`: Historical expansion rate (`DATA UNAVAILABLE` — single OSM snapshot).
4. **Land-Use & Redevelopment Activity**:
   - `mcgm-building-permit-velocity`: New construction approvals (`DATA UNAVAILABLE` — MCGM AutoDCR lacks public API).
   - `sra-slum-redevelopment-cluster`: Slum Redevelopment Authority scheme footprint (`DATA UNAVAILABLE`).
5. **Affordability & Displacement Pressure**:
   - `rent-to-income-ratio`: Residential rent burden (`DATA UNAVAILABLE` — no official rental index).
   - `displacement-pressure-index`: Tenant displacement score (`INSUFFICIENT EVIDENCE`).
6. **Accessibility & Urban Connectivity**:
   - `centroid-walkshed-500m`: Amenities within 500m walk of centroid ($14.5\text{ amenities average}$).
   - `transit-catchment-1000m`: Amenities within 1000m micro-transit radius ($52.8\text{ amenities average}$).
7. **Socioeconomic Indicators**:
   - `ward-income-distribution-shift`: Ward per-capita income distribution change (`DATA UNAVAILABLE`).
8. **Environment & Urban Fabric**:
   - `satellite-ndvi-canopy-change`: Multispectral canopy change (`REQUIRES MANUAL VALIDATION`).

---

### 2. Mathematical Formulations

#### 2.1 Quarter-over-Quarter (QoQ) Percentage Change
$$\text{QoQ}_t = \left(\frac{\text{HPI}_t - \text{HPI}_{t-1}}{\text{HPI}_{t-1}}\right) \times 100\%$$

#### 2.2 Compound Annual Growth Rate (CAGR)
$$\text{CAGR} = \left[\left(\frac{\text{HPI}_{\text{end}}}{\text{HPI}_{\text{start}}}\right)^{\frac{1}{N_{\text{years}}}} - 1\right] \times 100\%$$

#### 2.3 Rolling 8-Quarter Volatility
$$\bar{x}_t = \frac{1}{8}\sum_{k=0}^{7} \text{QoQ}_{t-k}$$
$$\sigma_t = \sqrt{\frac{1}{7}\sum_{k=0}^{7} (\text{QoQ}_{t-k} - \bar{x}_t)^2}$$

#### 2.4 Acceleration / Deceleration
$$\Delta \text{QoQ}_t = \text{QoQ}_t - \text{QoQ}_{t-1}$$
A positive value indicates market momentum acceleration; a negative value denotes market deceleration.

---

### 3. Normalization & Incomparability Safeguards
- Incomparable metrics (e.g. index points vs point amenity counts) are **never aggregated into an arbitrary single composite score**.
- Each indicator retains its native unit of measurement, confidence rating, and limitation caveats.
