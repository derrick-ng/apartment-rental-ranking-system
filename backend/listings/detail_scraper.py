import requests
from bs4 import BeautifulSoup
import re

def scrape_listing_details(url):
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"
    }

    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return {}
    
    soup = BeautifulSoup(response.content, 'lxml')

    details = {
        'bedrooms': None,
        'bathrooms': None,
        'sqft': None,
        'address': None,
        'cats_allowed': False,
        'dogs_allowed': False,
        'laundry_type': None,
        'parking': None,
        'extra_amenities': None,
    }

    #check for BR/BA
    attrgroups = soup.find_all('div', class_='attrgroup')
    bed_bath_sqft = attrgroups[0].find_all('span', class_='attr important')
    bed_bath = bed_bath_sqft[0].get_text().split('/')
    details['bedrooms'] = bed_bath[0].strip()[0]
    details['bathrooms'] = bed_bath[1].strip()[0]
    
    if len(bed_bath_sqft) > 1:
        sqft = bed_bath_sqft[1].get_text(strip=True)
        sqft_match = re.search(r'(\d+)ft', sqft, re.IGNORECASE)

        if sqft_match:
            details['sqft'] = sqft.split('ft')[0]

    #check for address
    details['address'] = soup.find('h2', class_='street-address').get_text(strip=True)

    #check for cats and dogs
    extra_amenities = attrgroups[2]
    cat_check = extra_amenities.find('div', class_='pets_cat')
    if cat_check:
        details['cats_allowed'] = True 

    dog_check = extra_amenities.find('div', class_='pets_dog')
    if dog_check:
        details['dogs_allowed'] = True

    #check for laundry and parking
    amenities_list = []
    for amenity in extra_amenities:
        text = amenity.get_text(strip=True)
        if text == "":
            continue

        if 'cats are OK' in text or 'dogs are OK' in text:
            continue

        #laundry conditions
        if 'w/d in unit' in text:
            details['laundry_type'] = 'in_unit'
            continue
        elif 'laundry on site' in text or 'laundry in bldg' in text:
            details['laundry_type'] = 'on_site'
            continue
        elif 'no laundry' in text:
            details['laundry_type'] = 'none'
            continue

        #parking conditions
        elif 'attached garage' in text or 'detached garage' in text:
            details['parking'] = 'garage'
            continue
        elif 'off-street' in text:
            details['parking'] = 'off_street'
            continue
        elif 'carport' in text:
            details['parking'] = 'carport'
            continue
        elif 'street parking' in text:
            details['parking'] = 'street'
            continue
        elif 'no parking' in text:
            details['parking'] = 'none'
            continue

        amenities_list.append(text)

    #add untracked, misc amenities
    if amenities_list:
        details['extra_amenities'] = ', '.join(amenities_list)    

    return details