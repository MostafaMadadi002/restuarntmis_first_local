from decimal import Decimal
from django.db import models
from apps.crm.models import Customer
from apps.restaurants.models import Restaurant
from apps.orders.models import Order

class LoyaltyTier(models.TextChoices):
    BRONZE = 'BRONZE', 'Bronze Member'
    SILVER = 'SILVER', 'Silver VIP'
    GOLD = 'GOLD', 'Gold VIP'
    PLATINUM = 'PLATINUM', 'Platinum Elite'

class LoyaltyAccount(models.Model):
    customer = models.OneToOneField(Customer, on_delete=models.CASCADE, related_name='loyalty_account')
    points = models.IntegerField(default=0)
    tier = models.CharField(max_length=20, choices=LoyaltyTier.choices, default=LoyaltyTier.BRONZE)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'loyalty_account'

    def __str__(self):
        return f"{self.customer.name} - {self.points} Points ({self.tier})"

class LoyaltyMovementType(models.TextChoices):
    EARN = 'EARN', 'Earned from Order'
    REDEEM = 'REDEEM', 'Redeemed for Reward'
    ADJUSTMENT = 'ADJUSTMENT', 'Manual Adjustment'
    REVERSAL = 'REVERSAL', 'Void Reversal'

class LoyaltyLedger(models.Model):
    account = models.ForeignKey(LoyaltyAccount, on_delete=models.CASCADE, related_name='ledger_entries')
    movement_type = models.CharField(max_length=20, choices=LoyaltyMovementType.choices)
    points_delta = models.IntegerField(help_text="Positive for earned, negative for spent")
    points_balance_after = models.IntegerField()
    order = models.ForeignKey(Order, on_delete=models.SET_NULL, null=True, blank=True)
    description = models.CharField(max_length=255, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'loyalty_ledger'
        ordering = ['-created_at']
