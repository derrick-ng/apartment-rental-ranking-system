from django.core.management.base import BaseCommand
from listings.models import Listing
from listings.detail_scraper import scrape_listing_details
from listings.serializers import ListingSerializer
import time, random, os, requests

class Command(BaseCommand):
    def handle(self, *args, **options):
        listings = Listing.objects.filter(active=True)

        total = listings.count()
        self.stdout.write(f"Checking {total} active listings")

        new_inactive = 0
        changed = 0
        unchanged = 0

        changed_listings = []
        inactive_ids = []

        for index, listing in enumerate(listings, 1):
            try:
                self.stdout.write(f"[{index}/{total}] Checking: {listing.url}")

                details = scrape_listing_details(listing.url)

                if not details or all(v is None or v is False for v in details.values()):
                    self.stdout.write(
                        self.style.WARNING(f"Listing appears removed, marking inactive")
                    )

                    listing.active = False
                    listing.save()
                    new_inactive += 1
                    inactive_ids.append(listing.craigslist_id)
                    time.sleep(random.uniform(1.5, 3))
                    continue
                
                changes_detected = False

                for key, new_value in details.items():
                    old_value = getattr(listing, key)

                    if old_value != new_value and (new_value or old_value):
                        self.stdout.write(f"{key} changed: {old_value} -> {new_value}")
                        setattr(listing, key, new_value)
                        changes_detected = True
                
                if changes_detected:
                    listing.save()
                    changed += 1
                    changed_listings.append(listing)
                else:
                    unchanged += 1

                time.sleep(random.uniform(1.5, 3))
                
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Error checking: {e}"))
    
        self.stdout.write(
            self.style.SUCCESS(
                f"\n=== Update Complete ===\n"
                f"Unchanged: {unchanged}\n"
                f"Changed: {changed}\n"
                f"New inactive: {new_inactive}\n"
                f"Total checked: {total}"
            )
        )

        self.sync_to_production(changed_listings, inactive_ids)


    def sync_to_production(self, changed_listings, inactive_ids):
        prod_url = os.getenv('PRODUCTION_API_URL')

        if changed_listings:
            try:
                self.stdout.write(f"\nSyncing {len(changed_listings)} changed listings to production")

                serializer = ListingSerializer(changed_listings, many=True)
                data = serializer.data

                response = requests.post(
                    f'{prod_url}/api/listings/bulk_create_listings/',
                    json=data
                )

                if response.status_code == 200:
                    result = response.json()
                    self.stdout.write(
                        self.style.SUCCESS(
                            f"PRODUCTION: Synced {result['updated']} changed listings"
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

        if inactive_ids:
            try:
                self.stdout.write(f"\nMarking {len(inactive_ids)} listings as inactive in production")

                response = requests.post(
                    f'{prod_url}/api/listings/mark_inactive/',
                    json={'craigslist_ids': inactive_ids}
                )

                if response.status_code == 200:
                    result = response.json()
                    self.stdout.write(
                        self.style.SUCCESS(
                            f"PRODUCTION: Marked {result['marked_inactive']} as inactive"
                        )
                    )
                else:
                    self.stdout.write(
                        self.style.ERROR(
                            f"Production inactive sync failed: {response.status_code}"
                        )
                    )
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f"Production inactive sync error: {str(e)}")
                )

        #realistically, this only hits if both params are incorrect types
        if not changed_listings and not inactive_ids:
            self.stdout.write('\nNo changes to sync to production, this should never hit')