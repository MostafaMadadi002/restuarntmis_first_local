from rest_framework import serializers
from apps.orders.models import OrderItem, KitchenItemStatus

class KitchenItemSerializer(serializers.ModelSerializer):
    dish_name = serializers.CharField(source='menu_item.name', read_only=True)
    table_number = serializers.CharField(source='order.table_session.table.table_number', read_only=True)
    order_id = serializers.IntegerField(source='order.id', read_only=True)
    station_code = serializers.CharField(source='menu_item.station.code', read_only=True, default='GRILL')

    class Meta:
        model = OrderItem
        fields = [
            'id', 'order_id', 'table_number', 'menu_item', 'dish_name', 'station_code',
            'quantity', 'kitchen_status', 'notes', 'seat_number', 'created_at'
        ]

class UpdateKitchenStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=KitchenItemStatus.choices)
