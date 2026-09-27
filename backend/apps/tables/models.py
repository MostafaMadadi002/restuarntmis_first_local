import uuid
from django.db import models
from django.utils import timezone
from apps.restaurants.models import Restaurant, Section

class TableStatus(models.TextChoices):
    AVAILABLE = 'AVAILABLE', 'Available'
    OCCUPIED = 'OCCUPIED', 'Occupied'
    RESERVED = 'RESERVED', 'Reserved'
    CLEANING = 'CLEANING', 'Cleaning / Sanitizing'

class TableShape(models.TextChoices):
    RECTANGLE = 'RECTANGLE', 'Rectangle'
    ROUND = 'ROUND', 'Round'
    SQUARE = 'SQUARE', 'Square'

class Table(models.Model):
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='tables')
    section = models.ForeignKey(Section, on_delete=models.CASCADE, related_name='tables')
    table_number = models.CharField(max_length=20)
    name_label = models.CharField(max_length=50, blank=True, default='')
    capacity = models.PositiveSmallIntegerField(default=4)
    status = models.CharField(max_length=20, choices=TableStatus.choices, default=TableStatus.AVAILABLE)
    qr_version = models.PositiveIntegerField(default=1, help_text="Incrementing revokes all previously printed QR codes.")
    
    # 2D Floor Plan layout coordinates
    pos_x = models.FloatField(default=0.0)
    pos_y = models.FloatField(default=0.0)
    width = models.FloatField(default=100.0)
    height = models.FloatField(default=100.0)
    rotation = models.FloatField(default=0.0)
    shape = models.CharField(max_length=20, choices=TableShape.choices, default=TableShape.RECTANGLE)

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'tables_table'
        constraints = [
            models.UniqueConstraint(fields=['restaurant', 'table_number'], name='unique_table_per_restaurant')
        ]
        indexes = [
            models.Index(fields=['restaurant', 'status']),
        ]

    def __str__(self):
        return f"Table {self.table_number} ({self.section.name})"

class TableSessionStatus(models.TextChoices):
    ACTIVE = 'ACTIVE', 'Active Dining'
    CLOSED = 'CLOSED', 'Closed & Paid'

class TableSession(models.Model):
    session_uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='table_sessions')
    table = models.ForeignKey(Table, on_delete=models.CASCADE, related_name='sessions')
    status = models.CharField(max_length=20, choices=TableSessionStatus.choices, default=TableSessionStatus.ACTIVE)
    guest_session_version = models.PositiveIntegerField(default=1)
    started_at = models.DateTimeField(default=timezone.now)
    closed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'tables_tablesession'
        constraints = [
            # CRITICAL: Ensures a table can NEVER have more than one ACTIVE session at any given millisecond
            models.UniqueConstraint(
                fields=['table'],
                condition=models.Q(status='ACTIVE'),
                name='unique_active_session_per_table'
            )
        ]

    def __str__(self):
        return f"Session {self.session_uuid} on Table {self.table.table_number} [{self.status}]"
