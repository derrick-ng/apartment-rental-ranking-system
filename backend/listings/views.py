from rest_framework import viewsets, filters, status
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
    get_best_price_per_sqft,
    get_overall_best_value,
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
        'latitude': ['isnull'],
        'longitude': ['isnull']
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
            'overall_best_value': get_overall_best_value(),
        })
    
    @action(detail=False, methods=['post'])
    def bulk_create_listings(self, request):
        try:
            listings_data = request.data
            
            created_count = 0
            updated_count = 0

            for item in listings_data:
                item.pop('id', None)

                listing, was_created = Listing.objects.update_or_create(
                    craigslist_id=item['craigslist_id'],
                    defaults=item
                )
                if was_created:
                    created_count += 1
                else:
                    updated_count += 1
            
            return Response({
                'status': 'Success',
                'created': created_count,
                'updated': updated_count,
            })
        except Exception as e:
            return Response({
                'status': 'Error',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
        
    @action(detail=False, methods=['post'])
    def mark_inactive(self, request):
        try:
            craigslist_ids = request.data.get('craigslist_ids', [])

            updated = Listing.objects.filter(
                craigslist_id__in=craigslist_ids
            ).update(active=False)

            return Response({
                'status': 'success',
                'marked_inactive': updated
            })
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)