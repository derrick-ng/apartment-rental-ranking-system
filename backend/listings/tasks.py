from celery import shared_task
from time import sleep
from .scraper import scrape_list_urls
from .models import Listing
from .etl import clean_listings_data
from .geocoding import geocode_address
import time, random

@shared_task
def scrape_listings_task():
    # don't wanna visit site same time everyday
    # delay scrape by 2 to 30 mins
    # time.sleep(random.uniform(120, 1800))

    listings_data = scrape_list_urls()

    cleaned_data = clean_listings_data(listings_data)
    
    created_count = 0
    updated_count = 0
    skipped_count = 0
    
    for data in cleaned_data:
        duplicate_exists = Listing.objects.filter(
            title=data['title'],
            location=data['location'],
            price=data['price']
        ).exclude(craigslist_id=data['craigslist_id']).exists()

        if duplicate_exists:
            skipped_count += 1
            continue

        listing, created = Listing.objects.get_or_create(
            craigslist_id=data['craigslist_id'],
            defaults=data
        )
        
        if created:
            created_count += 1

            if listing.address and not listing.latitude:
                coords = geocode_address(listing.address)

                if coords:
                    listing.latitude = coords['lat']
                    listing.longitude = coords['lon']
                    listing.save()
                sleep(.2)
        else:
            for key, value in data.items():
                setattr(listing, key, value)
            listing.save()
            updated_count += 1
    
    return f"Created: {created_count}, Updated: {updated_count}, Skipped {skipped_count}"