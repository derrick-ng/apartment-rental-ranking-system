from django.core.management.base import BaseCommand
from listings.models import Listing
from listings.scraper import scrape_list_urls

class Command(BaseCommand):
    def handle(self, *args, **options):
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

        self.stdout.write(
            self.style.SUCCESS(
                f"Created: {created_count}, Updated: {updated_count}"
            )
        )