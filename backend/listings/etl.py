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

    #details are good
    if any(keyword in str(row['title']).lower() for keyword in ['studio', 'bedroom', 'apt', 'apartment', 'house', 'condo']):
        score += 5

    #clickbait is bad
    if any(bad in str(row['title']).lower() for bad in ['cheap', 'deal', 'urgent', 'click']):
        score -= 10

    #reward "normal" prices
    price = row['price']
    if 1000 <= price <= 5000:
        score += 30
    elif 1 <= price < 1000:
        score -= 30
    elif 5000 < price <= 10000:
        score -= 15

    return score