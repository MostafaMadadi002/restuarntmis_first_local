from rest_framework import serializers
from decimal import Decimal
from apps.orders.models import Order, OrderItem, OrderStatus, KitchenItemStatus, OrderType, OrderSource
from apps.catalog.models import MenuItem

class OrderItemSerializer(serializers.ModelSerializer):
    menu_item_name = serializers.CharField(source='menu_item.name', read_only=True)
    station_code = serializers.CharField(source='menu_item.station.code', read_only=True, default='GRILL')

    class Meta:
        model = OrderItem
        fields = [
            'id', 'menu_item', 'menu_item_name', 'station_code', 'seat_number',
            'quantity', 'unit_price_at_order', 'discount_amount', 'subtotal',
            'course', 'kitchen_status', 'notes', 'created_at'
        ]

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    table_number = serializers.CharField(source='table_session.table.table_number', read_only=True)
    table_id = serializers.IntegerField(source='table_session.table.id', read_only=True)
    total_amount = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'restaurant', 'table_session', 'table_id', 'table_number',
            'order_type', 'source', 'status', 'notes', 'items', 'total_amount', 'created_at'
        ]

    def get_total_amount(self, obj):
        return sum([item.subtotal for item in obj.items.all()], Decimal('0.00'))

class CreateOrderItemInputSerializer(serializers.Serializer):
    menu_item_id = serializers.IntegerField(required=True)
    quantity = serializers.DecimalField(max_digits=8, decimal_places=3, default=Decimal('1.000'))
    seat_number = serializers.IntegerField(default=1)
    notes = serializers.CharField(required=False, allow_blank=True, default='')

class CreateOrderInputSerializer(serializers.Serializer):
    table_id = serializers.IntegerField(required=True)
    items = CreateOrderItemInputSerializer(many=True, required=True)
    source = serializers.ChoiceField(choices=OrderSource.choices, default=OrderSource.POS)
    notes = serializers.CharField(required=False, allow_blank=True, default='')
