from flask import Flask, jsonify

from sites import SITES

app = Flask(__name__)


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
            "coordinate_verification": "pending",
        },
    })


@app.get("/api/sites/<site_id>")
def get_site(site_id):
    site = next(
        (item for item in SITES if item["id"] == site_id),
        None,
    )

    if site is None:
        return jsonify({
            "error": {
                "code": "SITE_NOT_FOUND",
                "message": f"No site found with id '{site_id}'.",
            }
        }), 404

    return jsonify({"data": site})


if __name__ == "__main__":
    app.run(debug=True, port=5000)