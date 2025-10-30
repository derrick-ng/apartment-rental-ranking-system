from rest_framework import serializers
from .models import Listing

# Converts Listing model to JSON and vice versa
class ListingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Listing
        fields = [
            'id',
            'craigslist_id',
            'url',
            'title',
            'price',
            'location',
            'scraped_at',
            'active',
        ]
        read_only_fields = [
            'id',
            'scraped_at',
        ]