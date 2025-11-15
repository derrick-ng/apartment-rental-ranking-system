from django.core.management.base import BaseCommand
from listings.models import Listing
from listings.detail_scraper import scrape_listing_details
import time, random

class Command(BaseCommand):
    def handle(self, *args, **options):
        listings = Listing.objects.filter(active=True)

        total = listings.count()
        self.stdout.write(f"Checking {total} active listings")

        new_inactive = 0
        changed = 0
        unchanged = 0

        changed_urls = []

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
                    time.sleep(random.uniform(1, 2))
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
                    changed_urls.append(listing.url)
                else:
                    unchanged += 1

                time.sleep(random.uniform(1, 2))
                
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

        if changed_urls:
            self.stdout.write("Changed URLs:")
            for url in changed_urls:
                self.stdout.write(f" - {url}")