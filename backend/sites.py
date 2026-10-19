"""Source-referenced lunar south-pole locations for the Lunar Map."""

SITES = [
    {
        "id": "shackleton-crater-center",
        "name": "Shackleton Crater",
        "location_kind": "crater_center",
        "latitude_deg": -89.54,
        "longitude_deg": 0.0,
        "coordinate_status": "source-reported; frame verification pending",
        "source_name": "NASA Technical Reports Server",
        "source_url": (
            "https://ntrs.nasa.gov/api/citations/"
            "20180007435/downloads/20180007435.pdf"
        ),
        "source_note": "Reported crater-center coordinates.",
    },
    {
        "id": "de-gerlache-rim-1",
        "name": "de Gerlache Rim 1",
        "location_kind": "candidate_landing_region",
        "latitude_deg": -88.07,
        "longitude_deg": -67.97,
        "coordinate_status": "source-reported; frame verification pending",
        "source_name": "Remote Sensing research article",
        "source_url": (
            "https://www.mdpi.com/2072-4292/17/9/1579"
        ),
        "source_note": (
            "Published candidate-region coordinates; "
            "not a surveyed touchdown point."
        ),
    },
    {
        "id": "malapert-region",
        "name": "Malapert Region",
        "location_kind": "region",
        "latitude_deg": -85.99,
        "longitude_deg": -2.93,
        "coordinate_status": "source-reported; frame verification pending",
        "source_name": "NASA Science",
        "source_url": "https://science.nasa.gov/image-detail/20100618/",
        "source_note": (
            "NASA reports 85.99 S, 357.07 E; "
            "longitude is normalized to -180 through +180 degrees."
        ),
    },
    {
        "id": "nobile-crater-center",
        "name": "Nobile Crater",
        "location_kind": "crater_center",
        "latitude_deg": -85.2,
        "longitude_deg": 53.49,
        "coordinate_status": "source-reported; frame verification pending",
        "source_name": "Remote Sensing research article",
        "source_url": (
            "https://www.mdpi.com/2072-4292/17/9/1579"
        ),
        "source_note": "Reported crater coordinates.",
    },
    {
        "id": "athena-landing-site",
        "name": "Athena Landing Site",
        "location_kind": "landed_mission_site",
        "latitude_deg": -84.79,
        "longitude_deg": 29.20,
        "coordinate_status": "source-reported; frame verification pending",
        "source_name": "NASA Planetary Data System",
        "source_url": (
            "https://pds.nasa.gov/services/search/search"
        ),
        "source_note": (
            "IM-2 Athena landing location in the Mons Mouton region."
        ),
    },
]