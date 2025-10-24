import requests
from bs4 import BeautifulSoup
import re

url = "https://sfbay.craigslist.org/search/sfc/apa"

headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"
}

response = requests.get(url, headers=headers)
print(f"status code: {response.status_code}")

soup = BeautifulSoup(response.content, 'lxml')
listings = soup.find_all('li', class_='cl-static-search-result')

print(f"Found {len(listings)} listings\n")

for index, listing in enumerate(listings[:3], 1):
    link = listing.find('a')
    url = link['href'] if link else None

    craigslist_id = url.split('/')[-1].replace('.html', '') if url else None

    title_div = listing.find('div', class_='title')
    title = title_div.text.strip() if title_div else None

    price_div = listing.find('div', class_='price')
    price_text = price_div.text.strip() if price_div else None

    #remove commas in price to cast to int
    price = None
    if price_text:
        price = int(price_text.replace('$', '').replace(',', ''))

    location_div = listing.find('div', class_='location')
    location = location_div.text.strip() if location_div else None

    print(f"{index} LISTING HTML\n")
    print(f"ID: {craigslist_id}")
    print(f"Title: {title}")
    print(f"Price: ${price}")
    print(f"Location: {location}")
    print(f"URL: {url}\n")
