from django.urls import path
from apps.catalog.views import CategoryListView, MenuItemListView, MenuItemDetailView, MenuItemToggleAvailabilityView, StationListView

urlpatterns = [
    path('categories/', CategoryListView.as_view(), name='category_list'),
    path('stations/', StationListView.as_view(), name='station_list'),
    path('items/', MenuItemListView.as_view(), name='menu_item_list'),
    path('items/<int:pk>/', MenuItemDetailView.as_view(), name='menu_item_detail'),
    path('items/<int:pk>/toggle/', MenuItemToggleAvailabilityView.as_view(), name='menu_item_toggle'),
]
