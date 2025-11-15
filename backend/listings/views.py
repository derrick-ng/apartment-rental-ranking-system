from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Listing
from .serializers import ListingSerializer

# gets data from database, converts to JSON format
class ListingViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Listing.objects.filter(active=True).order_by('-scraped_at')
    serializer_class = ListingSerializer
    
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    
    filterset_fields = {
        'price': ['gte', 'lte'],
        'location': ['icontains'],
        'bedrooms': ['exact', 'gte', 'lte'],
        'bathrooms': ['exact', 'gte', 'lte'],
        'cats_allowed': ['exact'],
        'dogs_allowed': ['exact'],
        'laundry_type': ['exact'],
        'parking': ['exact'],
    }
    
    ordering_fields = ['price', 'scraped_at', 'bedrooms', 'bathrooms']
    ordering = ['-scraped_at']