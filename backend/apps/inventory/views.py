from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from django.shortcuts import get_object_or_404
from apps.inventory.models import InventoryItem
from apps.inventory.serializers import InventoryItemSerializer, AdjustStockSerializer
from apps.inventory.services import InventoryService
from common.responses import api_response

class InventoryListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        items = InventoryItem.objects.filter(is_active=True).select_related('category').order_by('id')
        return api_response(InventoryItemSerializer(items, many=True).data)

class InventoryAdjustView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = AdjustStockSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        item_id = serializer.validated_data['item_id']
        item = get_object_or_404(InventoryItem, pk=item_id)

        movement = InventoryService.adjust_stock(
            restaurant_id=item.restaurant_id,
            inventory_item_id=item.id,
            quantity_delta=serializer.validated_data['quantity_delta'],
            movement_type=serializer.validated_data['movement_type'],
            actor=request.user if request.user.is_authenticated else None,
            notes=serializer.validated_data.get('notes', '')
        )

        item.refresh_from_db()
        return api_response(InventoryItemSerializer(item).data, message="Stock adjusted successfully")
