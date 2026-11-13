
"""Source-referenced lunar south-pole locations for the Lunar Map.

Coordinate frames are tracked per site. Do not use these records for
scientific calculations until the required frames and conventions have
been verified and harmonized.
"""

SITES = [
    {
        "id": "shackleton-crater-center",
        "name": "Shackleton Crater",
        "location_kind": "crater_center",
        "latitude_deg": -89.67,
        "longitude_deg": 129.78,
        "coordinate_status": (
            "source-reported; cross-source harmonization pending"
        ),
        "coordinate_frame": "planetographic",
        "longitude_direction": "positive_east",
        "longitude_convention": "-180_to_180",
        "source_name": "USGS Gazetteer of Planetary Nomenclature",
        "source_url": "https://planetarynames.wr.usgs.gov/Feature/5450",
        "source_note": (
            "Gazetteer center coordinates. Verify the selected control "
            "network and compatibility with other site records."
        ),
    },
    {
        "id": "de-gerlache-rim-1",
        "name": "de Gerlache Rim 1",
        "location_kind": "candidate_landing_region",
        "latitude_deg": -88.07,
        "longitude_deg": -67.97,
        "coordinate_status": "source-reported; frame verification pending",
        "coordinate_frame": "unspecified",
        "longitude_direction": "unspecified",
        "longitude_convention": "unspecified",
        "source_name": "Remote Sensing research article",
        "source_url": "https://www.mdpi.com/2072-4292/17/9/1579",
        "source_note": (
            "Published candidate-region coordinates; not a surveyed "
            "touchdown point. Verify coordinate conventions."
        ),
    },
    {
        "id": "malapert-region",
        "name": "Malapert Region",
        "location_kind": "region",
        "latitude_deg": -85.99,
        "longitude_deg": -2.93,
        "coordinate_status": "source-reported; frame verification pending",
        "coordinate_frame": "unspecified",
        "longitude_direction": "positive_east_as_reported",
        "longitude_convention": "-180_to_180_normalized",
        "source_name": "NASA Science",
        "source_url": "https://science.nasa.gov/image-detail/20100618/",
        "source_note": (
            "NASA reports 85.99 S, 357.07 E. Longitude is normalized "
            "to -2.93 degrees; verify frame compatibility before use."
        ),
    },
    {
        "id": "nobile-crater-center",
        "name": "Nobile Crater",
        "location_kind": "crater_center",
        "latitude_deg": -85.2,
        "longitude_deg": 53.49,
        "coordinate_status": "source-reported; frame verification pending",
        "coordinate_frame": "unspecified",
        "longitude_direction": "unspecified",
        "longitude_convention": "unspecified",
        "source_name": "Remote Sensing research article",
        "source_url": "https://www.mdpi.com/2072-4292/17/9/1579",
        "source_note": (
            "Published crater coordinates. Verify coordinate conventions."
        ),
    },
    {
        "id": "athena-landing-site",
        "name": "Athena Landing Site",
        "location_kind": "landed_mission_site",
        "latitude_deg": -84.79,
        "longitude_deg": 29.20,
        "coordinate_status": "source-reported; frame verification pending",
        "coordinate_frame": "unspecified",
        "longitude_direction": "unspecified",
        "longitude_convention": "unspecified",
        "source_name": "NASA Planetary Data System",
        "source_url": (
            "https://pds.nasa.gov/ds-view/pds/viewContext.jsp"
            "?identifier=urn%3Anasa%3Apds%3Acontext%3Ainstrument_host%3A"
            "spacecraft.clps_to_prime1_athena&version=1.0"
        ),
        "source_note": (
            "NASA reports Athena landed at 84.79 S, 29.20 E in the "
            "Mons Mouton region. Coordinate frame still needs verification."
        ),
    },
]
