
import math

from flask import Flask, jsonify, request

from sites import SITES

app = Flask(__name__)


def error_response(code, message, status_code, details=None):
    error = {
        "code": code,
        "message": message,
    }

    if details is not None:
        error["details"] = details

    return jsonify({"error": error}), status_code


@app.get("/api/health")
def health():
    return jsonify({
        "status": "ok",
        "service": "NASA CLPS Lunar Mission Browser API",
        "version": "0.1.0",
    })


@app.get("/api/sites")
def list_sites():
    return jsonify({
        "data": SITES,
        "meta": {
            "count": len(SITES),
            "coordinate_units": "degrees",
            "latitude_range": [-90, 90],
            "longitude_range": [-180, 180],
            "coordinate_frame_policy": (
                "Per-site metadata; coordinate frames are not yet "
                "harmonized across all records."
            ),
            "scientific_use_status": (
                "Pending coordinate-frame verification"
            ),
        },
    })


@app.get("/api/sites/<site_id>")
def get_site(site_id):
    site = next(
        (item for item in SITES if item["id"] == site_id),
        None,
    )

    if site is None:
        return error_response(
            "SITE_NOT_FOUND",
            f"No site found with id '{site_id}'.",
            404,
        )

    return jsonify({"data": site})


@app.post("/api/analysis/validate-coordinates")
def validate_coordinates():
    payload = request.get_json(silent=True)

    if not isinstance(payload, dict):
        return error_response(
            "INVALID_JSON_BODY",
            "Request body must be a JSON object.",
            400,
        )

    required_fields = [
        "latitude_deg",
        "longitude_deg",
        "coordinate_frame",
    ]
    missing_fields = [
        field for field in required_fields if field not in payload
    ]

    if missing_fields:
        return error_response(
            "MISSING_REQUIRED_FIELDS",
            "Provide latitude_deg, longitude_deg, and coordinate_frame.",
            400,
            {"missing_fields": missing_fields},
        )

    latitude = payload["latitude_deg"]
    longitude = payload["longitude_deg"]
    coordinate_frame = payload["coordinate_frame"]

    if (
        isinstance(latitude, bool)
        or not isinstance(latitude, (int, float))
        or not math.isfinite(latitude)
    ):
        return error_response(
            "INVALID_LATITUDE",
            "latitude_deg must be a finite number.",
            400,
        )

    if (
        isinstance(longitude, bool)
        or not isinstance(longitude, (int, float))
        or not math.isfinite(longitude)
    ):
        return error_response(
            "INVALID_LONGITUDE",
            "longitude_deg must be a finite number.",
            400,
        )

    if (
        not isinstance(coordinate_frame, str)
        or not coordinate_frame.strip()
    ):
        return error_response(
            "INVALID_COORDINATE_FRAME",
            "coordinate_frame must be a non-empty string.",
            400,
        )

    if not -90 <= latitude <= 90:
        return error_response(
            "LATITUDE_OUT_OF_RANGE",
            "latitude_deg must be between -90 and 90 degrees.",
            422,
        )

    if not -180 <= longitude <= 180:
        return error_response(
            "LONGITUDE_OUT_OF_RANGE",
            "longitude_deg must be between -180 and 180 degrees.",
            422,
        )

    return jsonify({
        "data": {
            "latitude_deg": latitude,
            "longitude_deg": longitude,
            "coordinate_frame": coordinate_frame.strip(),
            "range_valid": True,
            "scientific_validity": "not_assessed",
        },
        "meta": {
            "coordinate_units": "degrees",
            "note": (
                "Numeric ranges are valid. The supplied coordinate "
                "frame is recorded, not independently verified. "
                "This result does not establish scientific accuracy."
            ),
        },
    })


if __name__ == "__main__":
    app.run(debug=True, port=5000)
