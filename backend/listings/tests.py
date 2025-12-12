from django.test import TestCase
import pandas as pd
from .etl import clean_listings_data, standardize_location, calculate_quality_score

# Create your tests here.
class ETLTests(TestCase):
    def test_calculate_quality_score_good(self):
        full_listing = {
            'title': 'Luxury 1 Bedroom with Parking',
            'price': 3000,
            'location': 'pac heights',
            'url': 'https://url.com',
            'bedrooms': 1,
            'bathrooms': 1.0,
            'sqft': 600,
            'address': '123 address st',
            'laundry_type': 'in unit',
            'parking': 'garage',
            'cats_allowed': True,
            'dogs_allowed': True,
            'latitude': '37.7',
            'longitude': '-122.4',
        }

        score = calculate_quality_score(full_listing)
        self.assertEqual(score, 100)
        self.assertTrue(score > 85, f'Expected good score for complete data, got {score}')

    def test_calculate_quality_score_bad(self):
        bad_listing = {
            'title': 'CHEAP NOT SCAM PLACE',
            'price': 500,
            'location': 'Tenderloin',
            'url': 'https://url.com',
            'bedrooms': None,
            'bathrooms': None,
        }

        score = calculate_quality_score(bad_listing)
        self.assertTrue(score < 50, f'Expected bad score for missing data, got {score}')

    def test_standardize_location(self):
        self.assertEqual(standardize_location('fidi'), 'Financial District')
        self.assertEqual(standardize_location('lower pac heights'), 'Pacific Heights')
        self.assertEqual(standardize_location('mission'), 'Mission District')
        self.assertEqual(standardize_location(None), 'Unknown')

    def test_clean_listings_data_outliers(self):
        raw_data = [
            # good data
            {'craigslist_id': '1', 'url': 'u1', 'title': 't1', 'price': 2500, 'location': 'mission'},
            # dropped - price too low
            {'craigslist_id': '2', 'url': 'u2', 'title': 'Cheap', 'price': 100, 'location': 'mission'},
            # dropped - price too high
            {'craigslist_id': '3', 'url': 'u3', 'title': 'Expensive', 'price': 50000, 'location': 'mission'},
            # dropped - missing title
            {'craigslist_id': '4', 'url': 'u4', 'title': None, 'price': 2500, 'location': 'mission'},
        ]

        cleaned_data = clean_listings_data(raw_data)
        self.assertEqual(len(cleaned_data), 1)
        self.assertEqual(cleaned_data[0]['craigslist_id'], '1')