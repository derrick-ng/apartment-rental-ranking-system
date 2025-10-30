from django.contrib import admin
from .models import Listing

@admin.register(Listing)
class ListingAdmin(admin.ModelAdmin):
    list_display = ['title', 'price', 'location', 'scraped_at']
    list_filter = ['location', 'active']
    search_fields = ['title', 'craigslist_id', 'location']
    readonly_fields = ['scraped_at']