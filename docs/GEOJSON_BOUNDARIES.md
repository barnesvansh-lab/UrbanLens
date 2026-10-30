# UrbanLens — Geographic Boundaries & Bounding Box Methodology

## 1. Context and Objective
Spatial visualization in UrbanLens requires geographic boundaries to delineate sub-regions and calculate spatial density indicators (amenities per km²). This document clarifies the provenance, coordinates, and limitations of geographic boundaries used in Milestone 5.

## 2. Investigation of Open Administrative Boundary Datasets

### 2.1 Municipal Corporation of Greater Mumbai (MCGM) Administrative Wards
- **Status**: Not available via open, programmatically accessible REST APIs under permissive licenses.
- **DataMeet Community Data**: Evaluated GitHub repository `datameet/mumbai`. Ward files exist in Shapefile format historically, but administrative ward re-delineations (2017/2022) are not officially certified by MCGM for automated production ingestion without data-licensing ambiguities.
- **Architectural Policy**: In alignment with UrbanLens's strict core constraint against inventing or fabricating government boundaries, **no unofficial shapefile is masqueraded as certified MCGM ward boundaries**.

### 2.2 Adopted Spatial Reference: Documented Bounding Boxes
UrbanLens adopts **documented bounding-box sub-regions** covering South Mumbai based on established historical and geographical landmarks:

| Region ID | Area Name | Latitude Extent | Longitude Extent | Area ($km^2$) | Primary Reference Landmarks |
|---|---|---|---|---|---|
| `south-mumbai-colaba` | Colaba & Cuffe Parade | [18.9000, 18.9350] | [72.8050, 72.8400] | 14.39 | Gateway of India, Taj Mahal Palace, Cuffe Parade |
| `south-mumbai-fort` | Fort & Marine Lines | [18.9350, 18.9600] | [72.8200, 72.8450] | 7.31 | Bombay Stock Exchange (BSE), Bombay High Court, Marine Drive |
| `south-mumbai-malabar-hill` | Malabar Hill & Walkeshwar | [18.9500, 18.9800] | [72.8000, 72.8250] | 8.77 | Hanging Gardens, Banganga Tank, Raj Bhavan |
| `south-mumbai-grant-road` | Grant Road & Girgaon | [18.9550, 18.9800] | [72.8250, 72.8500] | 7.31 | Grant Road Station, Girgaon Chowpatty |

## 3. GeoJSON Format Specification
The endpoint `GET /api/neighborhoods/boundaries` exports standard RFC 7946 GeoJSON:

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "id": "south-mumbai-colaba",
      "properties": {
        "id": "south-mumbai-colaba",
        "name": "Colaba & Cuffe Parade",
        "boundary_type": "approximate_bounding_box",
        "boundary_note": "NOT an official MCGM ward boundary...",
        "area_km2": 14.39,
        "total_amenities": 26,
        "amenity_density_per_km2": 1.81,
        "data_status": "real"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [72.805, 18.9],
            [72.84, 18.9],
            [72.84, 18.935],
            [72.805, 18.935],
            [72.805, 18.9]
          ]
        ]
      }
    }
  ]
}
```

## 4. Academic & Research Disclosure
- Bounding boxes provide consistent analytical extents for benchmarking point-in-polygon assignment.
- Under no circumstances should these research extents be interpreted as electoral, municipal, or property-tax assessment zones.
