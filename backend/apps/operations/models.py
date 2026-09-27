from django.db import models
from apps.tables.models import TableSession

class RequestType(models.TextChoices):
    CALL_WAITER = 'CALL_WAITER', 'Call Waiter'
    WATER = 'WATER', 'Bring Water'
    EXTRA_PLATE = 'EXTRA_PLATE', 'Extra Plates / Cutlery'
    BILL = 'BILL', 'Request Bill'
    OTHER = 'OTHER', 'Other Request'

class RequestStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pending'
    IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
    COMPLETED = 'COMPLETED', 'Completed'
    CANCELLED = 'CANCELLED', 'Cancelled'

class CustomerRequest(models.Model):
    table_session = models.ForeignKey(TableSession, on_delete=models.CASCADE, related_name='customer_requests')
    request_type = models.CharField(max_length=30, choices=RequestType.choices, default=RequestType.CALL_WAITER)
    status = models.CharField(max_length=20, choices=RequestStatus.choices, default=RequestStatus.PENDING)
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'operations_customerrequest'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.get_request_type_display()} for Table {self.table_session.table.table_number}"
