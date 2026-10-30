"""
test_m5_neighborhood.py — Milestone 5 Neighborhood Intelligence Tests

Tests:
- Haversine distance calculation
- Bounding box area estimation
- Point-in-bbox logic
- Amenity assignment to regions
- Category counts
- Nearest facility distances
- Within-radius counts
- Transformation indicator registry
- Output JSON structure and data integrity
"""

import json
import math
import os
import sys
import unittest

# Make sure geo_pipeline and transformation_indicators are importable
SRC_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if SRC_DIR not in sys.path:
    sys.path.insert(0, SRC_DIR)

import geo_pipeline as gp
import transformation_indicators as ti

ANALYTICS_JSON = os.path.join(SRC_DIR, "data", "processed", "neighborhood_analytics.json")
INDICATORS_JSON = os.path.join(SRC_DIR, "data", "processed", "transformation_indicators.json")


class TestHaversine(unittest.TestCase):
    """Unit tests for the Haversine distance formula."""

    def test_same_point_is_zero(self):
        dist = gp.haversine_km(18.95, 72.82, 18.95, 72.82)
        self.assertAlmostEqual(dist, 0.0, places=5)

    def test_known_approx_distance(self):
        # Approx distance: 18.92 to 18.98 at same lon ≈ 6.67 km
        dist = gp.haversine_km(18.92, 72.82, 18.98, 72.82)
        self.assertGreater(dist, 6.0)
        self.assertLess(dist, 7.5)

    def test_south_to_north_mumbai(self):
        # Colaba (18.91) to roughly Bandra (19.06) should be ~16-17 km
        dist = gp.haversine_km(18.91, 72.81, 19.06, 72.84)
        self.assertGreater(dist, 14.0)
        self.assertLess(dist, 20.0)

    def test_symmetry(self):
        d1 = gp.haversine_km(18.92, 72.80, 18.98, 72.85)
        d2 = gp.haversine_km(18.98, 72.85, 18.92, 72.80)
        self.assertAlmostEqual(d1, d2, places=6)

    def test_east_west_at_mumbai_latitude(self):
        # 0.05° of longitude at lat ~18.95 ≈ cos(18.95°) * 111.32 * 0.05 ≈ 5.26 km
        dist = gp.haversine_km(18.95, 72.80, 18.95, 72.85)
        self.assertGreater(dist, 4.5)
        self.assertLess(dist, 6.0)


class TestBBoxArea(unittest.TestCase):
    """Tests for bounding-box area estimation."""

    def test_area_is_positive(self):
        area = gp.bbox_area_km2(18.92, 18.98, 72.80, 72.85)
        self.assertGreater(area, 0)

    def test_area_rough_magnitude(self):
        # South Mumbai bbox ≈ 6.67 km × 5.26 km ≈ 35 km² (full box)
        area = gp.bbox_area_km2(18.92, 18.98, 72.80, 72.85)
        self.assertGreater(area, 20)
        self.assertLess(area, 60)

    def test_zero_area_for_degenerate(self):
        area = gp.bbox_area_km2(18.95, 18.95, 72.82, 72.82)
        self.assertAlmostEqual(area, 0.0, places=4)


class TestPointInBbox(unittest.TestCase):
    """Tests for point-in-bounding-box logic."""

    def setUp(self):
        self.lat_min = 18.90
        self.lat_max = 18.96
        self.lon_min = 72.80
        self.lon_max = 72.85

    def test_center_point_is_inside(self):
        self.assertTrue(gp.point_in_bbox(18.93, 72.825, self.lat_min, self.lat_max, self.lon_min, self.lon_max))

    def test_point_outside_north(self):
        self.assertFalse(gp.point_in_bbox(18.97, 72.82, self.lat_min, self.lat_max, self.lon_min, self.lon_max))

    def test_point_outside_south(self):
        self.assertFalse(gp.point_in_bbox(18.88, 72.82, self.lat_min, self.lat_max, self.lon_min, self.lon_max))

    def test_point_outside_west(self):
        self.assertFalse(gp.point_in_bbox(18.93, 72.79, self.lat_min, self.lat_max, self.lon_min, self.lon_max))

    def test_boundary_point_is_inside(self):
        # Inclusive boundary
        self.assertTrue(gp.point_in_bbox(18.90, 72.80, self.lat_min, self.lat_max, self.lon_min, self.lon_max))


class TestRegionAssignment(unittest.TestCase):
    """Tests for amenity-to-region assignment."""

    def setUp(self):
        self.amenities = gp.load_amenities(
            os.path.join(SRC_DIR, "data", "raw", "osm", "osm_mumbai_amenities.csv")
        )
        self.assignments, self.unassigned = gp.assign_regions(self.amenities, gp.REGIONS)

    def test_total_count(self):
        self.assertEqual(len(self.amenities), 232)

    def test_all_amenities_assigned(self):
        total = sum(len(v) for v in self.assignments.values())
        self.assertEqual(total + len(self.unassigned), len(self.amenities))

    def test_no_unassigned(self):
        # All 232 amenities fall within at least one of the 4 regions
        self.assertEqual(len(self.unassigned), 0)

    def test_regions_have_expected_ids(self):
        expected_ids = {r["id"] for r in gp.REGIONS}
        self.assertEqual(set(self.assignments.keys()), expected_ids)

    def test_colaba_has_amenities(self):
        self.assertGreater(len(self.assignments["south-mumbai-colaba"]), 0)

    def test_fort_has_amenities(self):
        self.assertGreater(len(self.assignments["south-mumbai-fort"]), 0)

    def test_malabar_has_amenities(self):
        self.assertGreater(len(self.assignments["south-mumbai-malabar-hill"]), 0)

    def test_grant_road_has_amenities(self):
        self.assertGreater(len(self.assignments["south-mumbai-grant-road"]), 0)


class TestCategorySummary(unittest.TestCase):
    """Tests for per-category amenity counts."""

    def setUp(self):
        amenities = gp.load_amenities(
            os.path.join(SRC_DIR, "data", "raw", "osm", "osm_mumbai_amenities.csv")
        )
        self.counts = gp.category_summary(amenities)

    def test_all_expected_categories_present(self):
        expected = {"parking", "clinic", "hospital", "school", "stop_position",
                    "driving_school", "motorcycle_parking", "parking_entrance"}
        for cat in expected:
            self.assertIn(cat, self.counts, f"Category '{cat}' not found in counts")

    def test_total_matches_dataset_size(self):
        self.assertEqual(sum(self.counts.values()), 232)

    def test_counts_are_positive_integers(self):
        for cat, count in self.counts.items():
            self.assertIsInstance(count, int)
            self.assertGreater(count, 0)


class TestNearestFacility(unittest.TestCase):
    """Tests for nearest-facility distance calculation."""

    def setUp(self):
        amenities = gp.load_amenities(
            os.path.join(SRC_DIR, "data", "raw", "osm", "osm_mumbai_amenities.csv")
        )
        self.centroid_lat = 18.95
        self.centroid_lon = 72.825
        self.nearest = gp.nearest_per_category(self.centroid_lat, self.centroid_lon, amenities)

    def test_returns_dict(self):
        self.assertIsInstance(self.nearest, dict)

    def test_all_distances_positive(self):
        for cat, dist in self.nearest.items():
            self.assertGreater(dist, 0, f"Distance for {cat} should be positive")

    def test_distances_are_reasonable_km(self):
        # Nearest facility within South Mumbai should be < 10 km from centroid
        for cat, dist in self.nearest.items():
            self.assertLess(dist, 10.0, f"Distance for {cat} seems too large: {dist} km")

    def test_school_distance_present(self):
        self.assertIn("school", self.nearest)

    def test_hospital_distance_present(self):
        self.assertIn("hospital", self.nearest)


class TestWithinRadius(unittest.TestCase):
    """Tests for within-radius count calculation."""

    def setUp(self):
        self.amenities = gp.load_amenities(
            os.path.join(SRC_DIR, "data", "raw", "osm", "osm_mumbai_amenities.csv")
        )
        self.center_lat = 18.95
        self.center_lon = 72.825

    def test_500m_count_le_1km_count(self):
        n500 = gp.count_within_radius(self.center_lat, self.center_lon, self.amenities, 0.5)
        n1k = gp.count_within_radius(self.center_lat, self.center_lon, self.amenities, 1.0)
        self.assertLessEqual(n500, n1k)

    def test_10km_count_equals_total(self):
        # A 10 km radius should capture all South Mumbai amenities
        n = gp.count_within_radius(self.center_lat, self.center_lon, self.amenities, 10.0)
        self.assertEqual(n, 232)

    def test_very_small_radius_count_nonneg(self):
        n = gp.count_within_radius(self.center_lat, self.center_lon, self.amenities, 0.01)
        self.assertGreaterEqual(n, 0)


class TestAnalyticsJsonOutput(unittest.TestCase):
    """Tests for the neighborhood_analytics.json output file."""

    def setUp(self):
        with open(ANALYTICS_JSON, encoding="utf-8") as f:
            self.data = json.load(f)

    def test_top_level_keys(self):
        required = {"generated_at", "pipeline_version", "regions", "limitations",
                    "total_amenities_loaded", "total_amenities_assigned", "data_status"}
        for key in required:
            self.assertIn(key, self.data)

    def test_four_regions(self):
        self.assertEqual(len(self.data["regions"]), 4)

    def test_total_amenities_loaded(self):
        self.assertEqual(self.data["total_amenities_loaded"], 232)

    def test_all_assigned(self):
        self.assertEqual(self.data["total_amenities_unassigned"], 0)

    def test_data_status_is_real(self):
        self.assertEqual(self.data["data_status"], "real")

    def test_region_schema(self):
        required_region_keys = {
            "id", "name", "description", "bbox", "centroid",
            "area_km2", "total_amenities", "amenity_density_per_km2",
            "amenity_categories", "nearest_facility_km",
            "within_500m_count", "within_1km_count",
            "data_status", "limitations",
        }
        for region in self.data["regions"]:
            for key in required_region_keys:
                self.assertIn(key, region, f"Region '{region.get('id')}' missing key '{key}'")

    def test_density_is_positive(self):
        for region in self.data["regions"]:
            self.assertGreater(region["amenity_density_per_km2"], 0)

    def test_boundary_type_is_documented(self):
        for region in self.data["regions"]:
            self.assertEqual(region["boundary_type"], "approximate_bounding_box")


class TestTransformationIndicators(unittest.TestCase):
    """Tests for transformation_indicators.json output."""

    def setUp(self):
        with open(INDICATORS_JSON, encoding="utf-8") as f:
            self.data = json.load(f)

    def test_top_level_keys(self):
        required = {"generated_at", "summary", "indicators", "data_integrity_statement"}
        for key in required:
            self.assertIn(key, self.data)

    def test_has_real_indicators(self):
        self.assertGreater(self.data["summary"]["real_indicators"], 0)

    def test_has_unavailable_indicators(self):
        self.assertGreater(self.data["summary"]["unavailable_indicators"], 0)

    def test_real_indicator_schema(self):
        real = [i for i in self.data["indicators"] if i["data_status"] == "real"]
        self.assertGreater(len(real), 0)
        for ind in real:
            self.assertIn("id", ind)
            self.assertIn("name", ind)
            self.assertIn("value", ind)
            self.assertIn("source", ind)
            self.assertIsNotNone(ind["value"], f"Real indicator '{ind['id']}' has null value")

    def test_unavailable_indicator_has_reason(self):
        unavail = [i for i in self.data["indicators"] if i["data_status"] == "unavailable"]
        self.assertGreater(len(unavail), 0)
        for ind in unavail:
            self.assertIn("unavailability_reason", ind)
            self.assertTrue(len(ind["unavailability_reason"]) > 10)
            self.assertIsNone(ind["value"], f"Unavailable indicator '{ind['id']}' should have null value")

    def test_no_fabricated_neighborhood_hpi(self):
        # Ensure no indicator invents neighborhood-level HPI values
        for ind in self.data["indicators"]:
            if ind["id"] == "neighborhood-hpi":
                self.assertEqual(ind["data_status"], "unavailable")
                self.assertIsNone(ind["value"])

    def test_hpi_trend_has_required_keys(self):
        trend = self.data.get("hpi_city_trend")
        self.assertIsNotNone(trend)
        required = {"start_date", "end_date", "total_change_pct", "annualized_change_pct",
                    "n_observations", "unit"}
        for key in required:
            self.assertIn(key, trend)

    def test_data_integrity_statement_present(self):
        stmt = self.data.get("data_integrity_statement", "")
        self.assertTrue(
            "gentrification" in stmt.lower() or "gentrifying" in stmt.lower(),
            "Data integrity statement should mention gentrification/gentrifying"
        )


if __name__ == "__main__":
    unittest.main(verbosity=2)
