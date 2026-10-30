# UrbanLens — Milestone 5: Neighborhood Intelligence Documentation

## 1. Overview
The Neighborhood Intelligence module delivers hyper-local spatial analysis of civic infrastructure and accessibility across South Mumbai. It integrates real OpenStreetMap (OSM) vector nodes and computes spatial density indicators, nearest-facility distances, and walkability catchment areas.

## 2. Spatial Data Sources & Provenance

### 2.1 OpenStreetMap (OSM) Civic Nodes
- **Source**: OpenStreetMap via Overpass API
- **License**: Open Data Commons Open Database License (ODbL)
- **Snapshot Date**: October 30, 2026
- **Total Points of Interest**: 232 verified real features
- **Geographic Bounding Box**: Lat [18.9230, 18.9795], Lon [72.8020, 72.8486] (South Mumbai)
- **Included Categories**:
  - `school` & `driving_school` (Education)
  - `hospital` & `clinic` (Healthcare)
  - `stop_position` (Public Transit Stop)
  - `parking`, `motorcycle_parking`, `parking_entrance` (Parking & Vehicular Access)

### 2.2 Sub-Region Extents (Bounding Boxes)
Because no official Municipal Corporation of Greater Mumbai (MCGM) ward boundary GeoJSON is available under open public licenses programmatically, UrbanLens uses **documented approximate bounding boxes** derived from landmark positions:
1. **Colaba & Cuffe Parade** (`south-mumbai-colaba`): [18.9000, 72.8050] to [18.9350, 72.8400] (Gateway of India, Taj Hotel, Cuffe Parade)
2. **Fort & Marine Lines** (`south-mumbai-fort`): [18.9350, 72.8200] to [18.9600, 72.8450] (BSE, Bombay High Court, Marine Drive)
3. **Malabar Hill & Walkeshwar** (`south-mumbai-malabar-hill`): [18.9500, 72.8000] to [18.9800, 72.8250] (Hanging Gardens, Banganga Tank, Raj Bhavan)
4. **Grant Road & Girgaon** (`south-mumbai-grant-road`): [18.9550, 72.8250] to [18.9800, 72.8500] (Grant Road Station, Girgaon Chowpatty)

> **Important Disclosure**: These bounding boxes are analytical conveniences for research and demonstration. They do **not** correspond to official MCGM administrative wards (e.g., A Ward, D Ward).

## 3. Mathematical & Algorithmic Formulation

### 3.1 Great-Circle Distance (Haversine Formula)
Distances between geographic coordinates $(lat_1, lon_1)$ and $(lat_2, lon_2)$ are computed using the Haversine formula on a spherical Earth with mean radius $R = 6371.0\text{ km}$:

$$\Delta \phi = \text{radians}(lat_2 - lat_1)$$
$$\Delta \lambda = \text{radians}(lon_2 - lon_1)$$
$$a = \sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta \lambda}{2}\right)$$
$$d = 2 R \cdot \text{atan2}(\sqrt{a}, \sqrt{1 - a})$$

### 3.2 Approximate Bounding Box Area
For small geographic extents ($< 0.1^\circ$), the surface area is approximated by:

$$\text{Height (km)} = \text{Haversine}(lat_{\min}, lon_{\min}, lat_{\max}, lon_{\min})$$
$$\text{Width (km)} = \text{Haversine}(lat_{\text{mid}}, lon_{\min}, lat_{\text{mid}}, lon_{\max})$$
$$\text{Area (km}^2\text{)} = \text{Height} \times \text{Width}$$

### 3.3 Amenity Density
$$\text{Amenity Density} = \frac{\text{Total OSM Amenities in Region}}{\text{Approximate Bounding Box Area (km}^2\text{)}}$$

### 3.4 Catchment Radii
- **500m Walkshed**: Number of verified amenities within $\le 0.5\text{ km}$ of the region centroid.
- **1km Transit Catchment**: Number of verified amenities within $\le 1.0\text{ km}$ of the region centroid.

## 4. API Endpoints
- `GET /api/neighborhoods`: Lists all available regions with high-level summary metrics.
- `GET /api/neighborhoods/boundaries`: Returns GeoJSON Polygon FeatureCollection for map rendering.
- `GET /api/neighborhoods/:id`: Returns detailed profile and metric breakdown for a single region.
- `GET /api/neighborhoods/:id/analytics`: Returns deep-dive analytics and methodological context.
- `GET /api/neighborhoods/compare?ids=...`: Side-by-side comparative benchmarking for 1 to 4 regions.
- `GET /api/neighborhoods/amenities`: Filtered raw OSM amenity points (M4 baseline).
