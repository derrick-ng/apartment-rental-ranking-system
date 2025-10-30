from django.shortcuts import render
from rest_framework import viewsets
from .models import Listing
from .serializers import ListingSerializer

# gets data from database, converts to JSON format
class ListingViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Listing.objects.filter(active=True).order_by('-scraped_at')
    serializer_class = ListingSerializer