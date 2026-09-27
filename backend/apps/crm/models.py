from decimal import Decimal
from django.db import models
from apps.restaurants.models import Restaurant
from apps.tables.models import TableSession

class Customer(models.Model):
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='customers')
    name = models.CharField(max_length=150)
    phone = models.CharField(max_length=30, db_index=True)
    email = models.EmailField(blank=True, default='')
    birth_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True, default='')
    total_spend = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal('0.00'))
    total_visits = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'crm_customer'
        constraints = [
            models.UniqueConstraint(fields=['restaurant', 'phone'], name='unique_customer_phone_per_restaurant')
        ]

    def __str__(self):
        return f"{self.name} ({self.phone})"

class Feedback(models.Model):
    table_session = models.ForeignKey(TableSession, on_delete=models.CASCADE, related_name='feedbacks')
    customer = models.ForeignKey(Customer, on_delete=models.SET_NULL, null=True, blank=True)
    overall_rating = models.PositiveSmallIntegerField(help_text="1 to 5 stars")
    food_rating = models.PositiveSmallIntegerField(default=5)
    service_rating = models.PositiveSmallIntegerField(default=5)
    comment = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'crm_feedback'
