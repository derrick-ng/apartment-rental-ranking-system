import pandas as pd

def clean_listings_data(listings_data):
    df = pd.DataFrame(listings_data)

    df = df.dropna(subset=['craigslist_id', 'url', 'title', 'price'])

    #standardize location names
    df['location'] = df['location'].apply(standardize_location)

    #remove outlier prices
    df = df[(df['price'] >= 500) & df['price'] <= 10000]

    df['title'] = df['title'].str.strip()
    df['title'] = df['title'].str.replace(r'\s+', ' ', regex=True)

    df['data_quality'] = df.apply(calculate_quality_score, axis=1)

    df = df.replace({pd.NA: None, float('nan'): None})

    numeric_cols = ['bedrooms', 'bathrooms', 'sqft']
    for col in numeric_cols:
        if col in df.columns:
            df[col] = df[col].where(pd.notna(df[col]), None)

    return df.to_dict('records')

def standardize_location(location):
    if pd.isna(location):
        return "Unknown"
    
    location_map = {
        'fidi': 'Financial District',
        'soma': 'SoMa',
        'nob hill': 'Nob Hill',
        'pac heights': 'Pacific Heights',
        'mission': 'Mission District',
        'castro': 'The Castro',
        'haight': 'Haight-Ashbury',
    }

    location_lower = location.lower().strip()

    for abbrev, full_name in location_map.items():
        if abbrev in location_lower:
            return full_name
    
    return location.title()
    
def calculate_quality_score(row):
    score = 0

    if pd.notna(row['title']): score += 10
    if pd.notna(row['price']): score += 10
    if pd.notna(row['location']): score += 10
    if pd.notna(row['url']): score += 10

    if pd.notna(row.get('bedrooms')): score += 6
    if pd.notna(row.get('bathrooms')): score += 6
    if pd.notna(row.get('sqft')): score += 6
    if pd.notna(row.get('address')): score += 6
    if pd.notna(row.get('laundry_type')): score += 3
    if pd.notna(row.get('parking')): score += 3

    if pd.notna(row.get('latitude')) and pd.notna(row.get('longitude')):
        score += 10

    #title details are good
    if any(keyword in str(row['title']).lower() for keyword in ['studio', 'bedroom', 'apt', 'apartment', 'house', 'condo']):
        score += 5

    #title clickbait is bad, possible scam
    if any(bad in str(row['title']).lower() for bad in ['cheap', 'deal', 'urgent', 'click']):
        score -= 10

    #reward "normal" prices
    price = row['price']
    if 1000 <= price <= 8000:
        score += 10
    #extremely suspicious prices
    elif price < 500:
        score -= 20
    elif price > 10000:
        score -= 10
    #slightly suspicious prices
    elif 500 <= price < 1000:
        score -= 5
    elif 8000 <= price <= 10000:
        score -= 5

    bedrooms = row.get('bedrooms')
    if pd.notna(bedrooms) and bedrooms > 0:
        price_per_br = price / bedrooms

        if 1000 <= price_per_br <= 3500:
            score += 5
        elif price_per_br <= 750 or price_per_br >= 4000:
            score -= 10

    return max(0, min(100, score))