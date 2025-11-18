from django.db.models import Avg, Count, Min, Max
from .models import Listing

def get_neighborhood_stats():
    stats = Listing.objects.filter(
        active=True,
        bedrooms__isnull=False
    ).values('location').annotate(
        avg_price=Avg('price'),
        median_bedrooms=Avg('bedrooms'),
        listing_count=Count('id'),
        min_price=Min('price'),
        max_price=Max('price'),
        avg_sqft=Avg('sqft')
    ).order_by('-listing_count')

    return list(stats)

def get_price_distribution():
    buckets = [
        (1, 1500),
        (1500, 2000),
        (2000, 2500),
        (2500, 3000),
        (3500, 4000),
        (4000, 5000),
        (5000, 10000),
    ]
    
    distribution = []
    for min_price, max_price in buckets:
        count = Listing.objects.filter(
            active=True,
            price__gte=min_price,
            price__lt=max_price
        ).count()

        distribution.append({
            'range': f'${min_price}-${max_price}',
            'count': count
        })
    return distribution

def get_good_deals():
    stats = get_neighborhood_stats()

    neighborhood_avgs = {}
    for stat in stats:
        neighborhood_avgs[stat['location']] = stat['avg_price']
    
    good_deals = []

    listings = Listing.objects.filter(
        active=True,
        bedrooms__isnull=False)
    
    for listing in listings:
        avg_price = neighborhood_avgs.get(listing.location)

        #good deal starts at 90% of avg?
        if avg_price and listing.price < avg_price * .9:
            savings = avg_price - listing.price
            good_deals.append({
                'id': listing.id,                
                'title': listing.title,
                'price': listing.price,
                'location': listing.location,
                'avg_price': round(avg_price, 2),
                'savings': round(savings, 2),
                'savings_percent': round((savings / avg_price) * 100, 1),
                'url': listing.url,
            })

    good_deals.sort(key=lambda x: x['savings'], reverse=True)

    return good_deals[:10]

def get_overall_stats():
    listings = Listing.objects.filter(
        active=True,
    )

    stats = {
        'total_listings': listings.count(),
        'avg_price': round(listings.aggregate(Avg('price'))['price__avg'] or 0, 2),
        'median_bedrooms': round(listings.aggregate(Avg('bedrooms'))['bedrooms__avg'] or 0, 1),
        'locations_count': listings.values('location').distinct().count(),
        'with_details': listings.filter(
            bedrooms__isnull=False,
            bathrooms__isnull=False,
            address__isnull=False,
            sqft__isnull=False,
            laundry_type__isnull=False,
            parking__isnull=False,
        ).count(),
    }

    return stats