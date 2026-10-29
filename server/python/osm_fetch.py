#!/usr/bin/env python3
"""
OSM Amenity Data Fetcher for UrbanLens
Manual use only — run this script to fetch amenity data from OpenStreetMap Overpass API.

Usage:
    python osm_fetch.py --city Mumbai --bbox "18.89,72.77,19.27,72.99" --output data/raw/osm_mumbai_amenities.csv

Attribution: Data © OpenStreetMap contributors, ODbL license.
https://www.openstreetmap.org/copyright
"""

import sys
import argparse
import csv
import json
import urllib.request
import urllib.parse
import urllib.error
from datetime import datetime, timezone
from pathlib import Path


OVERPASS_ENDPOINT = "https://overpass-api.de/api/interpreter"


def fetch_osm_amenities(city: str, bbox: str, output_path: str) -> bool:
    """
    Executes a single Overpass API query for civic amenities in the specified bounding box.
    Parses nodes and outputs a CSV matching the UrbanLens schema.
    """
    # Overpass QL query format: (south, west, north, east)
    query = f"""[out:json][timeout:30];
(
  node["amenity"~"school|hospital|park|clinic"]({bbox});
  node["public_transport"="stop_position"]({bbox});
);
out body;
"""
    print(f"Querying Overpass API for {city} with bbox [{bbox}]...")
    data = urllib.parse.urlencode({"data": query}).encode("utf-8")
    req = urllib.request.Request(
        OVERPASS_ENDPOINT,
        data=data,
        headers={"User-Agent": "UrbanLens-Research-Pipeline/0.2 (academic/research)"},
    )

    try:
        with urllib.request.urlopen(req, timeout=40) as response:
            if response.status != 200:
                print(f"Error: Received HTTP status code {response.status} from Overpass API")
                return False
            payload = json.loads(response.read().decode("utf-8"))
    except urllib.error.URLError as e:
        print(f"Network error querying Overpass API: {e}")
        print("Note: In air-gapped or sandbox environments without external network access,")
        print("please download OSM data via Overpass Turbo in a browser or use the synthetic test fixture.")
        return False
    except Exception as e:
        print(f"Unexpected error: {e}")
        return False

    elements = payload.get("elements", [])
    print(f"Received {len(elements)} elements from OpenStreetMap.")

    out_file = Path(output_path)
    out_file.parent.mkdir(parents=True, exist_ok=True)

    retrieved_at = datetime.now(timezone.utc).isoformat()

    with open(out_file, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["lat", "lon", "amenity_type", "name", "geography_name", "retrieved_at", "source_name", "data_status"])

        for elem in elements:
            lat = elem.get("lat")
            lon = elem.get("lon")
            tags = elem.get("tags", {})
            amenity_type = tags.get("amenity") or tags.get("public_transport", "amenity")
            name = tags.get("name", "Unnamed Facility")

            writer.writerow([lat, lon, amenity_type, name, city, retrieved_at, "OSM", "real"])

    print(f"Successfully wrote {len(elements)} amenity features to {out_file}")
    print("Attribution requirement: Data © OpenStreetMap contributors, ODbL license.")
    return True


def main() -> int:
    parser = argparse.ArgumentParser(description="Fetch OSM amenities via Overpass API for UrbanLens")
    parser.add_argument("--city", required=True, help="Canonical city name (e.g. Mumbai)")
    parser.add_argument("--bbox", required=True, help="Bounding box as 'south,west,north,east' (e.g. '18.89,72.77,19.27,72.99')")
    parser.add_argument("--output", required=True, help="Destination CSV path")

    args = parser.parse_args()
    success = fetch_osm_amenities(args.city, args.bbox, args.output)
    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())
