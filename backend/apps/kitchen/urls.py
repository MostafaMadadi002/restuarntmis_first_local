from django.urls import path
from apps.kitchen.views import KitchenTicketListView, UpdateKitchenItemStatusView

urlpatterns = [
    path('tickets/', KitchenTicketListView.as_view(), name='kitchen_tickets'),
    path('items/<int:pk>/status/', UpdateKitchenItemStatusView.as_view(), name='kitchen_item_status'),
]
