from django.urls import path
from apps.tables.views import TableListView, TableDetailView, TableStatusUpdateView, ValidateQRView, GenerateQRView

urlpatterns = [
    path('', TableListView.as_view(), name='table_list'),
    path('<int:pk>/', TableDetailView.as_view(), name='table_detail'),
    path('<int:pk>/status/', TableStatusUpdateView.as_view(), name='table_status_update'),
    path('qr/validate/', ValidateQRView.as_view(), name='table_qr_validate'),
    path('<int:pk>/qr/generate/', GenerateQRView.as_view(), name='table_qr_generate'),
]
