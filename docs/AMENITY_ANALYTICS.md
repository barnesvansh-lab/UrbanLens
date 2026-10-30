# UrbanLens — OpenStreetMap Civic Amenity Analytics

## 1. Overview
The amenity analytics pipeline ingests real civic points of interest (POIs) from OpenStreetMap, filters and validates spatial coordinates, assigns them to South Mumbai sub-regions, and computes accessibility indicators.

## 2. Ingestion & Preprocessing
The raw dataset is stored at `server/python/data/raw/osm/osm_mumbai_amenities.csv` and contains 232 validated nodes.

### 2.1 Category Taxonomy & Schema
Each observation conforms to the following schema:
- `lat`: Geographic latitude (WGS84, float degrees, 18.92 to 18.98)
- `lon`: Geographic longitude (WGS84, float degrees, 72.80 to 72.85)
- `amenity_type`: Canonical category tag
- `name`: Feature label or empty string
- `geography_name`: "Mumbai"
- `retrieved_at`: ISO 8601 UTC timestamp
- `source_name`: "OSM"
- `data_status`: "real"

### 2.2 Category Breakdown in South Mumbai (Total: 232)
| Category Tag | Functional Domain | Feature Count | Percentage |
|---|---|---|---|
| `parking` | Vehicular Access / Infrastructure | 163 | 70.3% |
| `hospital` | Healthcare / Emergency | 24 | 10.3% |
| `clinic` | Primary Healthcare | 15 | 6.5% |
| `school` | Primary & Secondary Education | 12 | 5.2% |
| `parking_entrance` | Access Point | 7 | 3.0% |
| `motorcycle_parking` | Two-Wheeler Transit | 7 | 3.0% |
| `stop_position` | Public Transit Node | 3 | 1.3% |
| `driving_school` | Vocational Education | 1 | 0.4% |

## 3. Spatial Distribution by Sub-Region
- **Malabar Hill & Walkeshwar**: 105 amenities, $11.97\text{ amenities/km}^2$
- **Fort & Marine Lines**: 67 amenities, $9.17\text{ amenities/km}^2$
- **Grant Road & Girgaon**: 34 amenities, $4.65\text{ amenities/km}^2$
- **Colaba & Cuffe Parade**: 26 amenities, $1.81\text{ amenities/km}^2$
- **Unassigned**: 0 amenities (100% assignment rate)

## 4. Accessibility Indicators
1. **Centroid Proximity Matrix**: Haversine distance in kilometres from the sub-region centroid to the closest facility of each category.
2. **500m Centroid Walkshed**: Count of civic amenities accessible within a 6-minute walk ($\le 500\text{ m}$).
3. **1000m Transit Catchment**: Count of civic amenities within a 12-minute walk or micro-transit hop ($\le 1000\text{ m}$).

## 5. Analytical Limitations & Caveats
- **Single Snapshot**: OSM data is a point-in-time capture ({retrieved_at}); historical growth rates cannot be calculated from a single snapshot.
- **Crowdsourced Density Bias**: High counts of parking nodes reflect OSM contributor mapping patterns in commercial South Mumbai rather than absolute municipal dominance over other civic uses.
