from django.db import models
from django.utils import timezone

class Listing(models.Model):

    craigslist_id = models.CharField(max_length=255, unique=True)
    url = models.URLField()
    title = models.CharField(max_length=255)
    price = models.IntegerField()
    location = models.CharField(max_length=255)

    scraped_at = models.DateTimeField(default=timezone.now)
    active = models.BooleanField(default=True)
    data_quality = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.title} - {self.price}"
    
    class Meta:
        ordering = ['-scraped_at']