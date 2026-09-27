from django.db import models
from apps.restaurants.models import Restaurant
from django.conf import settings

class ShiftType(models.TextChoices):
    MORNING = 'MORNING', 'Morning (08:00 - 16:00)'
    EVENING = 'EVENING', 'Evening (16:00 - 24:00)'
    NIGHT = 'NIGHT', 'Night (24:00 - 08:00)'
    FULL_DAY = 'FULL_DAY', 'Full Day'

class StaffMember(models.Model):
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='staff_members')
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='staff_profile')
    name = models.CharField(max_length=150)
    code = models.CharField(max_length=30, unique=True)
    role = models.CharField(max_length=50, default='WAITER')
    phone = models.CharField(max_length=30, blank=True, default='')
    shift = models.CharField(max_length=30, choices=ShiftType.choices, default=ShiftType.MORNING)
    is_present = models.BooleanField(default=True)
    pin_code = models.CharField(max_length=10, blank=True, default='1234')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'staff_member'

    def __str__(self):
        return f"{self.name} ({self.code}) - {self.role}"
