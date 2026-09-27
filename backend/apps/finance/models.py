from decimal import Decimal
from django.db import models
from django.conf import settings
from apps.restaurants.models import Restaurant
from apps.tables.models import TableSession

class BillStatus(models.TextChoices):
    OPEN = 'OPEN', 'Open & Unpaid'
    PARTIALLY_PAID = 'PARTIALLY_PAID', 'Partially Paid'
    PAID = 'PAID', 'Fully Paid & Cleared'
    VOIDED = 'VOIDED', 'Voided'

class PaymentMethod(models.TextChoices):
    CASH = 'CASH', 'Cash'
    CARD = 'CARD', 'POS Card Terminal'
    OTHER = 'OTHER', 'Other / QR Wallet'

class PayerType(models.TextChoices):
    FULL_TABLE = 'FULL_TABLE', 'Full Bill Payment'
    SEAT = 'SEAT', 'Individual Seat / Guest Share'
    CUSTOM = 'CUSTOM', 'Custom Amount Split'

class Bill(models.Model):
    bill_number = models.CharField(max_length=50, unique=True)
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='bills')
    table_session = models.ForeignKey(TableSession, on_delete=models.CASCADE, related_name='bills')
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    discount_total = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    tax_service_total = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    paid_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    remaining_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    status = models.CharField(max_length=20, choices=BillStatus.choices, default=BillStatus.OPEN)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'finance_bill'

    def __str__(self):
        return f"Bill #{self.bill_number} - Total: {self.total_amount} (Paid: {self.paid_amount})"

class Payment(models.Model):
    bill = models.ForeignKey(Bill, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=PaymentMethod.choices, default=PaymentMethod.CASH)
    payer_type = models.CharField(max_length=20, choices=PayerType.choices, default=PayerType.FULL_TABLE)
    seat_number = models.PositiveSmallIntegerField(null=True, blank=True)
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    idempotency_key = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'finance_payment'

class CashSession(models.Model):
    cashier = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='cash_sessions')
    opening_balance = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    closing_balance = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    expected_balance = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    actual_balance = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    difference = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    is_open = models.BooleanField(default=True)
    opened_at = models.DateTimeField(auto_now_add=True)
    closed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'finance_cashsession'
