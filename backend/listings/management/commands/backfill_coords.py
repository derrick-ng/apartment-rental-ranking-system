from django.core.management.base import BaseCommand
from listings.models import Listing
from listings.geocoding import batch_geocode_listings

class Command(BaseCommand):
    def handle(self, *args, **options):
        listings_to_geocode = Listing.objects.filter(
            active=True,
            address__isnull=False,
            latitude__isnull=True
        )

        total = listings_to_geocode.count()

        if total == 0:
            self.stdout.write(
                self.style.SUCCESS("No listings to geocode")
            )
            return
        
        self.stdout.write(f'Found {total} listings to geocode')

        results = batch_geocode_listings(list(listings_to_geocode))

        success_count = 0
        for listing_id, coords in results.items():
            listing = Listing.objects.get(id=listing_id)
            listing.latitude = coords['lat']
            listing.longitude = coords['lon']
            listing.save()
            success_count += 1

        failed_count = total - success_count
        self.stdout.write(
            self.style.SUCCESS(
                f"\n=== Geocoding Complete ===\n"
                f"Success: {success_count}\n"
                f"Failed: {failed_count}\n"
                f"Total: {total}"
            )
        )