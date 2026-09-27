from rest_framework import serializers
from decimal import Decimal
from apps.inventory.models import InventoryItem, StockMovement, UnitType, StockMovementType

class InventoryItemSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True, default='')
    status = serializers.SerializerMethodField()

    class Meta:
        model = InventoryItem
        fields = [
            'id', 'restaurant', 'category', 'category_name', 'name',
            'base_unit', 'current_stock', 'minimum_stock', 'cost_per_unit',
            'status', 'is_active', 'updated_at'
        ]

    def get_status(self, obj):
        if obj.current_stock <= Decimal('0'):
            return 'OUT'
        elif obj.current_stock <= obj.minimum_stock:
            return 'LOW'
        return 'HEALTHY'

class AdjustStockSerializer(serializers.Serializer):
    item_id = serializers.IntegerField(required=True)
    quantity_delta = serializers.DecimalField(max_digits=12, decimal_places=3, required=True)
    movement_type = serializers.ChoiceField(choices=StockMovementType.choices, default=StockMovementType.PURCHASE)
    notes = serializers.CharField(required=False, allow_blank=True, default='')
