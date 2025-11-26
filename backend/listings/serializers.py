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
            'bedrooms',
            'bathrooms',
            'sqft',
            'address',
            'cats_allowed',
            'dogs_allowed',
            'laundry_type',
            'parking',
            'extra_amenities',
            'latitude',
            'longitude',
            'scraped_at',
            'active',
            'data_quality',
        ]
        read_only_fields = [
            'id',
            'scraped_at',
        ]