from django.core.management.base import BaseCommand
from listings.models import Listing
from listings.detail_scraper import scrape_listing_details
import time, random

class Command(BaseCommand):
    def handle(self, *args, **options):
        listings_to_backfill = Listing.objects.filter(
            active=True,
            bedrooms__isnull=True
        )

        total = listings_to_backfill.count()

        if total == 0:
            self.stdout(self.style.SUCCESS("No listings need backfilling"))
            return
        
        self.stdout.write(f"Found {total} listings needing backfill")

        updated = 0
        inactive = 0
        failed = 0

        for index, listing in enumerate(listings_to_backfill, 1):
            try:
                self.stdout.write(f"[{index}/{total}] Scraping: {listing.url}")
                details = scrape_listing_details(listing.url)

                if not details or all(v is None or v is False for v in details.values()):
                    self.stdout.write(
                        self.style.WARNING(f"  → Listing removed/flagged, marking inactive")
                    )
                    listing.active = False
                    listing.save()
                    inactive += 1
                    time.sleep(random.uniform(0, 1.5))
                    continue

                for key, value in details.items():
                    setattr(listing, key, value)
                
                self.stdout.write("Listing succesfully scraped")
                listing.save()
                updated += 1

                time.sleep(random.uniform(0, 1.5))
            except Exception as e:
                failed += 1
                self.stdout.write(self.style.ERROR(f"Failed to scrape {listing.url}: {e}"))

        self.stdout.write(
            self.style.SUCCESS(
                f"BACKFILL COMPLETE\n"
                f"✓ Updated with details: {updated}\n"
                f"⚠ Marked inactive (removed): {inactive}\n"
                f"✗ Failed (errors): {failed}\n"
                f"Total processed: {total}\n"
            )
        )
