from django.core.management.base import BaseCommand
from listings.models import Listing
from listings.scraper import scrape_list_urls
from listings.etl import clean_listings_data
from listings.geocoding import geocode_address
import time, requests, os

class Command(BaseCommand):
    def handle(self, *args, **options):
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
                    time.sleep(.2)
            else:
                for key, value in data.items():
                    setattr(listing, key, value)

                listing.save()
                updated_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Created: {created_count}, Updated: {updated_count}"
            )
        )
    
        self.sync_to_production()

    def sync_to_production(self):
        prod_url = os.getenv('PRODUCTION_API_URL')

        try:
            listings = Listing.objects.filter(active=True)
            data = list(listings.values())

            self.stdout.write(f"\nSyncing {len(data)} listings to production...")

            response = requests.post(
                f'{prod_url}/api/listings/bulk_create_listings/',
                json=data
            )

            if response.status_code == 200:
                result = response.json()
                self.stdout.write(
                    self.style.SUCCESS(
                        f"PRODUCTION: Created {result['created']}, "
                        f"Updated {result['updated']}"
                    )
                )
            else:
                self.stdout.write(
                    self.style.ERROR(
                        f"Production sync failed: {response.status_code} - {response.text}"
                    )
                )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f"Production sync error: {str(e)}")
            )