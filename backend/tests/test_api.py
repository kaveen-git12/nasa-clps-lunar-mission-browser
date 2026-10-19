
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


if __name__ == "__main__":
    unittest.main()
