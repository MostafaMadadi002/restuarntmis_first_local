from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from django.shortcuts import get_object_or_404
from apps.operations.models import CustomerRequest, RequestStatus
from apps.operations.serializers import CustomerRequestSerializer, CreateRequestSerializer
from apps.tables.models import Table, TableSession, TableSessionStatus
from common.responses import api_response

class CustomerRequestListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        status_param = request.query_params.get('status', 'PENDING')
        requests = CustomerRequest.objects.select_related('table_session__table').order_by('-created_at')
        if status_param and status_param != 'ALL':
            requests = requests.filter(status=status_param)
        return api_response(CustomerRequestSerializer(requests[:30], many=True).data)

    def post(self, request):
        serializer = CreateRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        table_id = serializer.validated_data['table_id']
        table = get_object_or_404(Table, pk=table_id)

        session = table.sessions.filter(status=TableSessionStatus.ACTIVE).first()
        if not session:
            session = TableSession.objects.create(
                restaurant=table.restaurant,
                table=table,
                status=TableSessionStatus.ACTIVE
            )

        req = CustomerRequest.objects.create(
            table_session=session,
            request_type=serializer.validated_data['request_type'],
            notes=serializer.validated_data.get('notes', ''),
            status=RequestStatus.PENDING
        )
        return api_response(CustomerRequestSerializer(req).data, message="Request sent to staff")

class ResolveCustomerRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, pk):
        req = get_object_or_404(CustomerRequest, pk=pk)
        req.status = RequestStatus.COMPLETED
        req.save(update_fields=['status'])
        return api_response(CustomerRequestSerializer(req).data, message="Request marked as completed")
