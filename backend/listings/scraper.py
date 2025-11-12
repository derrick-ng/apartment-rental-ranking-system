import requests
import time, random
from bs4 import BeautifulSoup
from listings.detail_scraper import scrape_listing_details

def scrape_list_urls():
    all_listings = []
    url = f"https://sfbay.craigslist.org/search/sfc/apa#search=2~gallery~0"
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"
    }

    response = requests.get(url, headers=headers)
    print(f"Status Code: {response.status_code}")

    soup = BeautifulSoup(response.content, 'lxml')
    listings = soup.find_all('li', class_='cl-static-search-result')
    print(f"Found {len(listings)} Listings")

    for index, listing in enumerate(listings):
        link = listing.find('a')
        url = link['href'] if link else None

        craigslist_id = url.split('/')[-1].replace('.html', '') if url else None

        title_div = listing.find('div', class_='title')
        title = title_div.text.strip() if title_div else None

        price_div = listing.find('div', class_='price')
        price_text = price_div.text.strip() if price_div else None

        #remove commas and $ in price to cast to int
        price = None
        if price_text:
            price = int(price_text.replace('$', '').replace(',', ''))

        location_div = listing.find('div', class_='location')
        location = location_div.text.strip() if location_div else None

        data = {
            'craigslist_id': craigslist_id,
            'url': url,
            'title': title,
            'price': price,
            'location': location,
        }

        if url:
            print(f"[{index+1}/{len(listings)}] url:{url}")
            details = scrape_listing_details(url)
            data.update(details)
            time.sleep(random.uniform(0, 1.5))

        all_listings.append(data)

    return all_listings