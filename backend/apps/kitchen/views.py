from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from django.shortcuts import get_object_or_404
from apps.orders.models import OrderItem, KitchenItemStatus
from apps.kitchen.serializers import KitchenItemSerializer, UpdateKitchenStatusSerializer
from common.responses import api_response

class KitchenTicketListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        station = request.query_params.get('station')
        items = OrderItem.objects.filter(
            kitchen_status__in=[KitchenItemStatus.NEW, KitchenItemStatus.ACCEPTED, KitchenItemStatus.PREPARING, KitchenItemStatus.READY]
        ).select_related('order__table_session__table', 'menu_item__station').order_by('created_at')

        if station and station != 'ALL':
            items = items.filter(menu_item__station__code=station)

        return api_response(KitchenItemSerializer(items, many=True).data)

class UpdateKitchenItemStatusView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, pk):
        item = get_object_or_404(OrderItem, pk=pk)
        serializer = UpdateKitchenStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        new_status = serializer.validated_data['status']

        item.kitchen_status = new_status
        item.save(update_fields=['kitchen_status'])

        return api_response(KitchenItemSerializer(item).data, message=f"Kitchen item status updated to {new_status}")
