from django.urls import path
from apps.operations.views import CustomerRequestListView, ResolveCustomerRequestView

urlpatterns = [
    path('requests/', CustomerRequestListView.as_view(), name='operations_requests'),
    path('requests/<int:pk>/resolve/', ResolveCustomerRequestView.as_view(), name='operations_resolve_request'),
]
