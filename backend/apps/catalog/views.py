from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from django.shortcuts import get_object_or_404
from apps.catalog.models import Category, MenuItem, KitchenStation
from apps.catalog.serializers import CategorySerializer, MenuItemSerializer, KitchenStationSerializer
from common.responses import api_response
from apps.restaurants.models import Restaurant

class CategoryListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        categories = Category.objects.filter(is_active=True).order_by('display_order', 'id')
        return api_response(CategorySerializer(categories, many=True).data)

class StationListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        stations = KitchenStation.objects.filter(is_active=True)
        return api_response(KitchenStationSerializer(stations, many=True).data)

class MenuItemListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        category_id = request.query_params.get('category_id')
        items = MenuItem.objects.filter(is_active=True).select_related('category', 'station').order_by('id')
        if category_id:
            items = items.filter(category_id=category_id)
        return api_response(MenuItemSerializer(items, many=True).data)

    def post(self, request):
        data = request.data.copy()
        if 'restaurant' not in data:
            restaurant = Restaurant.objects.first()
            if restaurant:
                data['restaurant'] = restaurant.id
        serializer = MenuItemSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        item = serializer.save()
        return api_response(MenuItemSerializer(item).data, message="Menu item added")

class MenuItemDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        item = get_object_or_404(MenuItem, pk=pk)
        return api_response(MenuItemSerializer(item).data)

    def patch(self, request, pk):
        item = get_object_or_404(MenuItem, pk=pk)
        serializer = MenuItemSerializer(item, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        item = serializer.save()
        return api_response(MenuItemSerializer(item).data, message="Menu item updated")

    def delete(self, request, pk):
        item = get_object_or_404(MenuItem, pk=pk)
        item.is_active = False
        item.save(update_fields=['is_active'])
        return api_response(message="Menu item removed")

class MenuItemToggleAvailabilityView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, pk):
        item = get_object_or_404(MenuItem, pk=pk)
        item.is_available = not item.is_available
        item.save(update_fields=['is_available'])
        return api_response(MenuItemSerializer(item).data, message=f"Item is now {'available' if item.is_available else 'out of stock'}")
