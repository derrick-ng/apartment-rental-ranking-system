import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'rental_intel.settings')

app = Celery('rental_intel')

app.config_from_object('django.conf:settings', namespace='CELERY')

app.autodiscover_tasks()

app.conf.beat_schedule = {
    'scrape-bi-daily': {
        'task': 'listings.tasks.scrape_listings_task',
        'schedule': crontab(
            hour=7,
            minute=0,
            day_of_month='*/2'
        )
    }
}

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')