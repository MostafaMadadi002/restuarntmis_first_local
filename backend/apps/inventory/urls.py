from django.urls import path
from apps.inventory.views import InventoryListView, InventoryAdjustView

urlpatterns = [
    path('items/', InventoryListView.as_view(), name='inventory_items'),
    path('adjust/', InventoryAdjustView.as_view(), name='inventory_adjust'),
]
