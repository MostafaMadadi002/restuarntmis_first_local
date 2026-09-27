from decimal import Decimal
from django.db import models
from django.conf import settings
from apps.restaurants.models import Restaurant
from apps.tables.models import TableSession
from apps.catalog.models import MenuItem, CourseType
from apps.inventory.models import InventoryItem, UnitType

class OrderType(models.TextChoices):
    DINE_IN = 'DINE_IN', 'Dine-In'
    TAKEAWAY = 'TAKEAWAY', 'Takeaway'
    DELIVERY = 'DELIVERY', 'Delivery'

class OrderSource(models.TextChoices):
    CUSTOMER_QR = 'CUSTOMER_QR', 'Customer Table QR'
    WAITER = 'WAITER', 'Waiter Tablet'
    POS = 'POS', 'POS Cashier'
    ADMIN = 'ADMIN', 'Admin'

class OrderStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pending Confirmation'
    CONFIRMED = 'CONFIRMED', 'Confirmed & Sent to Kitchen'
    COMPLETED = 'COMPLETED', 'Fully Completed & Served'
    CANCELLED = 'CANCELLED', 'Cancelled'

class KitchenItemStatus(models.TextChoices):
    NEW = 'NEW', 'New Ticket'
    ACCEPTED = 'ACCEPTED', 'Accepted'
    PREPARING = 'PREPARING', 'In Preparation'
    READY = 'READY', 'Ready for Pickup'
    SERVED = 'SERVED', 'Served to Table'
    VOIDED = 'VOIDED', 'Voided'

class Order(models.Model):
    order_number = models.CharField(max_length=40)
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='orders')
    table_session = models.ForeignKey(TableSession, on_delete=models.CASCADE, related_name='orders')
    order_type = models.CharField(max_length=20, choices=OrderType.choices, default=OrderType.DINE_IN)
    source = models.CharField(max_length=20, choices=OrderSource.choices, default=OrderSource.CUSTOMER_QR)
    status = models.CharField(max_length=20, choices=OrderStatus.choices, default=OrderStatus.PENDING)
    waiter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='taken_orders')
    notes = models.TextField(blank=True, default='')
    idempotency_key = models.CharField(max_length=100, blank=True, null=True, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'orders_order'
        ordering = ['-created_at']

    def __str__(self):
        return f"Order #{self.order_number} ({self.status})"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    menu_item = models.ForeignKey(MenuItem, on_delete=models.PROTECT, related_name='order_items')
    seat_number = models.PositiveSmallIntegerField(default=1, help_text="Designates specific seat/guest for accurate Split Bills")
    quantity = models.DecimalField(max_digits=8, decimal_places=3, default=Decimal('1.000'))
    
    # SNAPSHOTS: Locked in price and recipe at the moment of order
    unit_price_at_order = models.DecimalField(max_digits=12, decimal_places=2)
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    
    course = models.CharField(max_length=20, choices=CourseType.choices, default=CourseType.COURSE_2)
    kitchen_status = models.CharField(max_length=20, choices=KitchenItemStatus.choices, default=KitchenItemStatus.NEW)
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'orders_orderitem'

class OrderItemSplitShare(models.Model):
    """
    Allocates portions of a single shared dish (e.g. 1 Pizza = 400 AFN split across 4 friends: 100 each).
    """
    order_item = models.ForeignKey(OrderItem, on_delete=models.CASCADE, related_name='split_shares')
    seat_number = models.PositiveSmallIntegerField()
    allocated_amount = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        db_table = 'orders_orderitemsplitshare'

class OrderItemConsumption(models.Model):
    """
    Historical immutable snapshot of the raw inventory deducted for this dish.
    """
    order_item = models.ForeignKey(OrderItem, on_delete=models.CASCADE, related_name='consumptions')
    inventory_item = models.ForeignKey(InventoryItem, on_delete=models.PROTECT, related_name='consumptions')
    quantity_consumed = models.DecimalField(max_digits=12, decimal_places=3)
    base_unit = models.CharField(max_length=20, choices=UnitType.choices)
    recipe_version = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'orders_orderitemconsumption'
