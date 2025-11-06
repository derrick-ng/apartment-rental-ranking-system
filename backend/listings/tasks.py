from celery import shared_task
from .scraper import scrape_list_urls
from .models import Listing

@shared_task
def scrape_listings_task():
    
    # Celery task to scrape listings in the background.
    listings_data = scrape_list_urls()
    
    created_count = 0
    updated_count = 0
    
    for data in listings_data:
        listing, created = Listing.objects.get_or_create(
            craigslist_id=data['craigslist_id'],
            defaults=data
        )
        
        if created:
            created_count += 1
        else:
            for key, value in data.items():
                setattr(listing, key, value)
            listing.save()
            updated_count += 1
    
    return f"Created: {created_count}, Updated: {updated_count}"