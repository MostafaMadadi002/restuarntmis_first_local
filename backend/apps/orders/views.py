import time
from decimal import Decimal
from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from apps.orders.models import Order, OrderItem, OrderStatus, KitchenItemStatus
from apps.orders.serializers import OrderSerializer, CreateOrderInputSerializer
from apps.tables.models import Table, TableSession, TableStatus, TableSessionStatus
from apps.catalog.models import MenuItem
from common.responses import api_response
from common.exceptions import BusinessLogicError

class OrderListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        table_id = request.query_params.get('table_id')
        status_param = request.query_params.get('status')
        orders = Order.objects.select_related('table_session__table').prefetch_related('items__menu_item').order_by('-created_at')

        if table_id:
            orders = orders.filter(table_session__table_id=table_id)
        if status_param:
            orders = orders.filter(status=status_param)

        return api_response(OrderSerializer(orders[:50], many=True).data)

    def post(self, request):
        serializer = CreateOrderInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        table_id = serializer.validated_data['table_id']
        items_data = serializer.validated_data['items']
        source = serializer.validated_data.get('source', 'POS')
        notes = serializer.validated_data.get('notes', '')

        with transaction.atomic():
            table = get_object_or_404(Table.objects.select_for_update(), pk=table_id)
            
            # Find or create active session
            session = table.sessions.filter(status=TableSessionStatus.ACTIVE).first()
            if not session:
                session = TableSession.objects.create(
                    restaurant=table.restaurant,
                    table=table,
                    status=TableSessionStatus.ACTIVE
                )
                table.status = TableStatus.OCCUPIED
                table.save(update_fields=['status'])

            order_num = f"ORD-{table.table_number}-{int(time.time())}"
            order = Order.objects.create(
                order_number=order_num,
                restaurant=table.restaurant,
                table_session=session,
                source=source,
                status=OrderStatus.CONFIRMED,
                notes=notes
            )

            for item_input in items_data:
                menu_item = get_object_or_404(MenuItem, pk=item_input['menu_item_id'])
                qty = item_input['quantity']
                unit_price = menu_item.base_price
                subtotal = unit_price * qty

                OrderItem.objects.create(
                    order=order,
                    menu_item=menu_item,
                    seat_number=item_input.get('seat_number', 1),
                    quantity=qty,
                    unit_price_at_order=unit_price,
                    subtotal=subtotal,
                    course=menu_item.default_course,
                    kitchen_status=KitchenItemStatus.NEW,
                    notes=item_input.get('notes', '')
                )

            return api_response(OrderSerializer(order).data, message="Order created and dispatched to kitchen")

class OrderDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        order = get_object_or_404(Order.objects.prefetch_related('items__menu_item'), pk=pk)
        return api_response(OrderSerializer(order).data)

    def patch(self, request, pk):
        order = get_object_or_404(Order, pk=pk)
        new_status = request.data.get('status')
        if new_status in OrderStatus.values:
            order.status = new_status
            order.save(update_fields=['status'])
        return api_response(OrderSerializer(order).data, message="Order status updated")
