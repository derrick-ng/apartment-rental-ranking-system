from django.db.models import Avg
from .models import Listing
from .analytics import get_neighborhood_stats

def get_overall_best_value_ai():
    """
    ai weights
    - Price per sqft (30%)
    - Below neighborhood average (25%)
    - Price per bedroom (20%)
    - Amenities (parking, laundry) (15%)
    - Data quality (10%)
    """

    stats = get_neighborhood_stats()
    neighborhood_avgs = {stat['location']: stat['avg_price'] for stat in stats}

    listings = Listing.objects.filter(
        active=True,
        bedrooms__isnull=False,
        bedrooms__gt=0,
        sqft__isnull=False,
        sqft__gt=0
    )

    scored_listings = []

    for listing in listings:
        score = 0
        details = {}

        #Factor 1: Price Per Sqft
        price_per_sqft = listing.price / listing.sqft
        
        if 1.50 <= price_per_sqft <= 6.00:
            if price_per_sqft <= 2.50:
                sqft_score = 30
            elif price_per_sqft <= 3.00:
                sqft_score = 25
            elif price_per_sqft <= 3.50:
                sqft_score = 20
            elif price_per_sqft <= 4.00:
                sqft_score = 15
            else:
                sqft_score = 10
            
            score += sqft_score
            details['price_per_sqft'] = round(price_per_sqft, 2)
        else:
            continue

        #Factor 2: Below Neighborhood Average
        avg_price = neighborhood_avgs.get(listing.location)

        if avg_price:
            percent_of_avg = (listing.price / avg_price) * 100
            
            if percent_of_avg <= 70:
                market_score = 25
            elif percent_of_avg <= 80:
                market_score = 20
            elif percent_of_avg <= 90:
                market_score = 15
            elif percent_of_avg <= 100:
                market_score = 10
            else:
                market_score = 5

            score += market_score
            details['percent_of_avg'] = round(percent_of_avg, 1)

        #Factor 3: Price Per Bedroom
        price_per_br = listing.price / listing.bedrooms

        if price_per_br <= 1500:
            bedroom_score = 20
        elif price_per_br <= 2000:
            bedroom_score = 15
        elif price_per_br <= 2500:
            bedroom_score = 10
        elif price_per_br <= 3000:
            bedroom_score = 5
        else:
            bedroom_score = 0
        
        score += bedroom_score
        details['price_per_bedroom'] = round(price_per_br, 2)

        amenity_score = 0
        
        #Factor 4: Amenities (Laundry & Pets)
        if listing.parking == 'garage':
            amenity_score += 7
        elif listing.parking == 'off_street':
            amenity_score += 5
        elif listing.parking == 'carport':
            amenity_score += 3
        elif listing.parking == 'street':
            amenity_score += 1
        
        # Laundry
        if listing.laundry_type == 'in_unit':
            amenity_score += 5
        elif listing.laundry_type == 'on_site':
            amenity_score += 3
        
        # Pets
        if listing.cats_allowed and listing.dogs_allowed:
            amenity_score += 3
        elif listing.cats_allowed or listing.dogs_allowed:
            amenity_score += 2
        
        score += amenity_score
        details['amenity_score'] = amenity_score
        
        # Factor 5: Data quality
        quality_score = (listing.data_quality / 100) * 10
        score += quality_score
        
    
        if score >= 40:
            scored_listings.append({
                'id': listing.id,
                'title': listing.title,
                'price': listing.price,
                'bedrooms': listing.bedrooms,
                'bathrooms': float(listing.bathrooms) if listing.bathrooms else None,
                'sqft': listing.sqft,
                'location': listing.location,
                'parking': listing.parking,
                'laundry_type': listing.laundry_type,
                'url': listing.url,
                'total_score': round(score, 1),
                'details': details
            })
        
    scored_listings.sort(key=lambda x: x['total_score'], reverse=True)

    return scored_listings[:10]


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

def get_best_price_per_sqft():
    listings = Listing.objects.filter(
        active=True,
        bedrooms__isnull=False,
        sqft__isnull=False,
        sqft__gt=0,
    )

    best_deals = []

    for listing in listings:
        price_per_sqft = listing.price / listing.sqft

        if price_per_sqft < 1.50 or price_per_sqft > 6.00:
            continue
            
        best_deals.append({
            'id': listing.id,
            'title': listing.title,
            'price': listing.price,
            'sqft': listing.sqft,
            'price_per_sqft': round(price_per_sqft, 2),
            'bedrooms': listing.bedrooms,
            'bathrooms': float(listing.bathrooms) if listing.bathrooms else None,
            'location': listing.location,
            'url': listing.url,
        })

    best_deals.sort(key=lambda x: x['price_per_sqft'])

    return best_deals[:10]
