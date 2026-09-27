from decimal import Decimal
from django.db import models
from django.conf import settings
from apps.restaurants.models import Restaurant

class UnitType(models.TextChoices):
    KG = 'KG', 'Kilogram'
    GRAM = 'G', 'Gram'
    LITER = 'LITER', 'Liter'
    ML = 'ML', 'Milliliter'
    PIECE = 'PIECE', 'Piece / Unit'

class InventoryCategory(models.Model):
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='inventory_categories')
    name = models.CharField(max_length=100)

    class Meta:
        db_table = 'inventory_category'

    def __str__(self):
        return self.name

class InventoryItem(models.Model):
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='inventory_items')
    category = models.ForeignKey(InventoryCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name='items')
    name = models.CharField(max_length=150)
    base_unit = models.CharField(max_length=20, choices=UnitType.choices, default=UnitType.GRAM)
    current_stock = models.DecimalField(max_digits=12, decimal_places=3, default=Decimal('0.000'))
    minimum_stock = models.DecimalField(max_digits=12, decimal_places=3, default=Decimal('0.000'))
    cost_per_unit = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'inventory_item'
        indexes = [
            models.Index(fields=['restaurant', 'is_active']),
        ]

    def __str__(self):
        return f"{self.name} ({self.current_stock} {self.base_unit})"

class StockMovementType(models.TextChoices):
    PURCHASE = 'PURCHASE', 'Purchase Receipt'
    SALE_CONSUMPTION = 'SALE_CONSUMPTION', 'Sale Recipe Consumption'
    WASTE = 'WASTE', 'Waste / Spoiled'
    ADJUSTMENT = 'ADJUSTMENT', 'Audit Adjustment'
    RETURN = 'RETURN', 'Returned to Vendor'
    REVERSAL = 'REVERSAL', 'Void Reversal'

class StockMovement(models.Model):
    """Immutable Ledger for all stock changes."""
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='stock_movements')
    inventory_item = models.ForeignKey(InventoryItem, on_delete=models.PROTECT, related_name='movements')
    movement_type = models.CharField(max_length=30, choices=StockMovementType.choices)
    quantity = models.DecimalField(max_digits=12, decimal_places=3, help_text="Positive for addition, negative for deduction.")
    balance_after = models.DecimalField(max_digits=12, decimal_places=3)
    reference_type = models.CharField(max_length=50, blank=True, default='') # 'ORDER', 'PURCHASE', 'ADJUSTMENT'
    reference_id = models.CharField(max_length=80, blank=True, default='')
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'inventory_stockmovement'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['inventory_item', '-created_at']),
        ]
