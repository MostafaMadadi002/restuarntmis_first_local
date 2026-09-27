from django.db import models
from apps.restaurants.models import Restaurant
from django.utils import timezone

class DeviceType(models.TextChoices):
    POS = 'POS', 'POS Terminal'
    WAITER_TABLET = 'WAITER_TABLET', 'Waiter Tablet'
    KITCHEN_DISPLAY = 'KITCHEN_DISPLAY', 'Kitchen Display'
    CUSTOMER = 'CUSTOMER', 'Customer Terminal'

class DeviceStatus(models.TextChoices):
    ONLINE = 'ONLINE', 'Online'
    OFFLINE = 'OFFLINE', 'Offline'

class ConnectedDevice(models.Model):
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='devices')
    name = models.CharField(max_length=120)
    device_type = models.CharField(max_length=40, choices=DeviceType.choices, default=DeviceType.WAITER_TABLET)
    ip_address = models.GenericIPAddressField(protocol='both', unpack_ipv4=False)
    mac_address = models.CharField(max_length=50, blank=True, default='')
    status = models.CharField(max_length=20, choices=DeviceStatus.choices, default=DeviceStatus.ONLINE)
    is_blocked = models.BooleanField(default=False)
    last_ping = models.DateTimeField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'devices_device'

    def __str__(self):
        return f"{self.name} [{self.device_type}] ({self.ip_address})"
