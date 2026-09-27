from django.urls import path
from apps.devices.views import DeviceListView, DeviceToggleBlockView, BroadcastMessageView

urlpatterns = [
    path('', DeviceListView.as_view(), name='device_list'),
    path('<int:pk>/toggle-block/', DeviceToggleBlockView.as_view(), name='device_toggle_block'),
    path('broadcast/', BroadcastMessageView.as_view(), name='device_broadcast'),
]
