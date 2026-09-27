from django.db import models
from apps.restaurants.models import Restaurant
from apps.catalog.models import KitchenStation

class KitchenDisplay(models.Model):
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='kitchen_displays')
    station = models.ForeignKey(KitchenStation, on_delete=models.CASCADE, related_name='displays')
    name = models.CharField(max_length=100)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'kitchen_display'

    def __str__(self):
        return f"{self.name} - Station: {self.station.name}"
