from rest_framework import serializers
from apps.catalog.models import Category, MenuItem, KitchenStation, ModifierGroup, Modifier

class KitchenStationSerializer(serializers.ModelSerializer):
    class Meta:
        model = KitchenStation
        fields = ['id', 'name', 'code', 'is_active']

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'display_order', 'is_active']

class MenuItemSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    station_code = serializers.CharField(source='station.code', read_only=True, default='GRILL')
    price = serializers.DecimalField(source='base_price', max_digits=12, decimal_places=2)

    class Meta:
        model = MenuItem
        fields = [
            'id', 'restaurant', 'category', 'category_name', 'station', 'station_code',
            'name', 'description', 'price', 'default_course', 'is_available', 'is_active'
        ]
        read_only_fields = ['id']
