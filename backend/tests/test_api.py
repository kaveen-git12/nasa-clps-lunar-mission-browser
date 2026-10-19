
import sys
import unittest
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

from app import app
from sites import SITES


class LunarMapApiTests(unittest.TestCase):
    def setUp(self):
        app.config["TESTING"] = True
        self.client = app.test_client()

    def test_health_endpoint(self):
        response = self.client.get("/api/health")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json["status"], "ok")

    def test_sites_endpoint(self):
        response = self.client.get("/api/sites")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json["meta"]["count"], len(SITES))
        self.assertEqual(response.json["data"], SITES)

    def test_site_detail_endpoint(self):
        site_id = SITES[0]["id"]
        response = self.client.get(f"/api/sites/{site_id}")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json["data"]["id"], site_id)

    def test_unknown_site_returns_404(self):
        response = self.client.get("/api/sites/unknown-site")

        self.assertEqual(response.status_code, 404)
        self.assertEqual(
            response.json["error"]["code"],
            "SITE_NOT_FOUND",
        )

    def test_coordinates_are_in_valid_ranges(self):
        for site in SITES:
            with self.subTest(site=site["id"]):
                self.assertGreaterEqual(site["latitude_deg"], -90)
                self.assertLessEqual(site["latitude_deg"], 90)
                self.assertGreaterEqual(site["longitude_deg"], -180)
                self.assertLessEqual(site["longitude_deg"], 180)

    def test_coordinate_metadata_exists_for_every_site(self):
        required_fields = {
            "coordinate_status",
            "coordinate_frame",
            "longitude_direction",
            "longitude_convention",
            "source_name",
            "source_url",
        }

        for site in SITES:
            with self.subTest(site=site["id"]):
                self.assertTrue(required_fields.issubset(site.keys()))
                self.assertTrue(site["source_url"].startswith("https://"))

    def test_sites_endpoint_discloses_unverified_frames(self):
        response = self.client.get("/api/sites")

        self.assertEqual(response.status_code, 200)
        self.assertIn(
            "not yet harmonized",
            response.json["meta"]["coordinate_frame_policy"],
        )
        self.assertEqual(
            response.json["meta"]["scientific_use_status"],
            "Pending coordinate-frame verification",
        )

    def test_coordinate_validation_accepts_valid_input(self):
        response = self.client.post(
            "/api/analysis/validate-coordinates",
            json={
                "latitude_deg": -85.5,
                "longitude_deg": 45.25,
                "coordinate_frame": "planetographic",
            },
        )

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json["data"]["range_valid"])
        self.assertEqual(
            response.json["data"]["scientific_validity"],
            "not_assessed",
        )
        self.assertEqual(
            response.json["data"]["coordinate_frame"],
            "planetographic",
        )

    def test_coordinate_validation_rejects_missing_fields(self):
        response = self.client.post(
            "/api/analysis/validate-coordinates",
            json={"latitude_deg": -85.5},
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.json["error"]["code"],
            "MISSING_REQUIRED_FIELDS",
        )

    def test_coordinate_validation_rejects_non_numeric_latitude(self):
        response = self.client.post(
            "/api/analysis/validate-coordinates",
            json={
                "latitude_deg": "south",
                "longitude_deg": 45.25,
                "coordinate_frame": "planetographic",
            },
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.json["error"]["code"],
            "INVALID_LATITUDE",
        )

    def test_coordinate_validation_rejects_out_of_range_latitude(self):
        response = self.client.post(
            "/api/analysis/validate-coordinates",
            json={
                "latitude_deg": -91,
                "longitude_deg": 45.25,
                "coordinate_frame": "planetographic",
            },
        )

        self.assertEqual(response.status_code, 422)
        self.assertEqual(
            response.json["error"]["code"],
            "LATITUDE_OUT_OF_RANGE",
        )

    def test_coordinate_validation_rejects_out_of_range_longitude(self):
        response = self.client.post(
            "/api/analysis/validate-coordinates",
            json={
                "latitude_deg": -85.5,
                "longitude_deg": 181,
                "coordinate_frame": "planetographic",
            },
        )

        self.assertEqual(response.status_code, 422)
        self.assertEqual(
            response.json["error"]["code"],
            "LONGITUDE_OUT_OF_RANGE",
        )

    def test_coordinate_validation_rejects_empty_frame(self):
        response = self.client.post(
            "/api/analysis/validate-coordinates",
            json={
                "latitude_deg": -85.5,
                "longitude_deg": 45.25,
                "coordinate_frame": " ",
            },
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.json["error"]["code"],
            "INVALID_COORDINATE_FRAME",
        )

    def test_coordinate_validation_rejects_non_json_body(self):
        response = self.client.post(
            "/api/analysis/validate-coordinates",
            data="not json",
            content_type="text/plain",
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.json["error"]["code"],
            "INVALID_JSON_BODY",
        )


if __name__ == "__main__":
    unittest.main()
