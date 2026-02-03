# Rental Intel

Finding a reasonably priced apartment in San Francisco is hard. Rental Intel helps you save time by scraping listings, analyzing market data, and highlighting the best deals so you can make smarter renting decisions.

Check it out: https://apartment-rental-ranking-system.vercel.app

## What It Does

- **Scrapes & Aggregates**: Pulls rental listings from Craigslist and enriches them with detailed amenities data
- **Finds the Best Deals**: Algorithms rank listings based on overall value, price per sqft, and below-market pricing
- **Interactive Map**: See all listings geocoded and clustered on a map
- **Market Analytics**: Visualizes neighborhood pricing trends, bedroom distributions, price ranges, etc

## Tech Stack

**Frontend**: React (Vite), TailwindCSS, Leaflet, Recharts  
**Backend**: Django, PostgreSQL, Celery, Redis  
**Data**: BeautifulSoup for scraping, Pandas for ETL, TomTom API for geocoding  
**Hosting**: Vercel (frontend), AWS EC2 (backend + database), AWS CloudFront

## Why I Built This

I wanted to improve my full-stack development while solving a real problem. This project gave me hands-on experience with web scraping, data pipelines, background task scheduling, and building a polished UI.
