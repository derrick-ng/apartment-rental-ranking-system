from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Listing
from .serializers import ListingSerializer
from .analytics import (
    get_neighborhood_stats,
    get_price_distribution,
    get_overall_stats
)
from .algorithms import (
    get_good_deals,
    get_best_price_per_sqft
    )
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

    @action(detail=False, methods=['get'])
    def analytics(self, request):
        return Response({
            'overall': get_overall_stats(),
            'neighborhoods': get_neighborhood_stats(),
            'price_distribution': get_price_distribution(),
            'good_deals': get_good_deals(),
            'best_price_per_sqft': get_best_price_per_sqft(),
        })