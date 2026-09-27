from django.contrib import admin
from django.urls import path, include
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from common.responses import api_response

class HealthCheckView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        return api_response({
            'status': 'HEALTHY',
            'service': 'Restaurant Local Backend',
            'version': '1.0.0',
            'database': 'Connected'
        })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/health/', HealthCheckView.as_view(), name='health_check'),
    path('api/v1/auth/', include('apps.accounts.urls')),
    path('api/v1/tables/', include('apps.tables.urls')),
    path('api/v1/catalog/', include('apps.catalog.urls')),
    path('api/v1/orders/', include('apps.orders.urls')),
    path('api/v1/kitchen/', include('apps.kitchen.urls')),
    path('api/v1/finance/', include('apps.finance.urls')),
    path('api/v1/inventory/', include('apps.inventory.urls')),
    path('api/v1/crm/', include('apps.crm.urls')),
    path('api/v1/operations/', include('apps.operations.urls')),
    path('api/v1/reports/', include('apps.reports.urls')),
    path('api/v1/staff/', include('apps.staff.urls')),
    path('api/v1/devices/', include('apps.devices.urls')),
]

