from django.db import models
from apps.restaurants.models import Restaurant

class DailyReportSnapshot(models.Model):
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='daily_reports')
    report_date = models.DateField()
    total_sales = models.DecimalField(max_digits=14, decimal_places=2, default=0.00)
    total_orders = models.PositiveIntegerField(default=0)
    cash_sales = models.DecimalField(max_digits=14, decimal_places=2, default=0.00)
    card_sales = models.DecimalField(max_digits=14, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'reports_dailysnapshot'
        unique_together = ('restaurant', 'report_date')
