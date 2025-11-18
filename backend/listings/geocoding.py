import requests, os
from pathlib import Path
from dotenv import load_dotenv
from time import sleep

BASE_DIR = Path(__file__).resolve().parent.parent

load_dotenv(BASE_DIR / '.env')

TOMTOM_API_KEY = os.getenv('TOMTOM_API_KEY')

def geocode_address(address):
    if not address or not TOMTOM_API_KEY:
        print(address)
        print(TOMTOM_API_KEY)
        return None
    
    url = f'https://api.tomtom.com/search/2/geocode/{address}.json?key={TOMTOM_API_KEY}'

    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        
        if data['results']:
            position = data['results'][0]['position']

            return {
                'lat': position['lat'],
                'lon': position['lon']
            }
        
    except Exception as e:
        print(f'Geocoding Failed for {address}', e)
        return None


def batch_geocode_listings(listings):
    results = {}

    for index, listing in enumerate(listings):
        if not listing.address:
            continue

        print(f"[{index+1}/{len(listings)}] Geocoding: {listing.address}")
        coords = geocode_address(listing.address)

        if coords:
            results[listing.id] = coords

        sleep(.2)

    return results