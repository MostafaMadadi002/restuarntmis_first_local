from django.db import models
from apps.restaurants.models import Restaurant
from apps.inventory.models import InventoryItem

class PurchaseOrder(models.Model):
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='purchase_orders')
    po_number = models.CharField(max_length=50, unique=True)
    supplier_name = models.CharField(max_length=150)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    status = models.CharField(max_length=30, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'purchasing_order'
