from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404
from apps.tables.models import Table, TableSession, TableStatus
from apps.tables.serializers import TableSerializer, TableStatusUpdateSerializer, ValidateQRSerializer, TableSessionSerializer
from apps.tables.services import TableSessionService
from common.responses import api_response
from common.utils.qr_security import generate_signed_qr_payload

class TableListView(APIView):
    permission_classes = [AllowAny] # In local POS/LAN, allow quick querying

    def get(self, request):
        tables = Table.objects.filter(is_active=True).select_related('section', 'restaurant').prefetch_related('sessions').order_by('id')
        serializer = TableSerializer(tables, many=True)
        return api_response(serializer.data)

class TableDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        table = get_object_or_404(Table, pk=pk, is_active=True)
        return api_response(TableSerializer(table).data)

class TableStatusUpdateView(APIView):
    permission_classes = [AllowAny]

    def patch(self, request, pk):
        table = get_object_or_404(Table, pk=pk, is_active=True)
        serializer = TableStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        new_status = serializer.validated_data['status']

        table.status = new_status
        table.save(update_fields=['status'])

        # If set to AVAILABLE or CLEANING, check if active session needs closing
        if new_status == TableStatus.AVAILABLE:
            active_sessions = table.sessions.filter(status='ACTIVE')
            for s in active_sessions:
                s.status = 'CLOSED'
                s.save(update_fields=['status'])

        return api_response(TableSerializer(table).data, message="Table status updated")

class ValidateQRView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ValidateQRSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        qr_token = serializer.validated_data['qr_token']

        session = TableSessionService.get_or_create_active_session_for_qr(qr_token)
        return api_response({
            'session': TableSessionSerializer(session).data,
            'table': TableSerializer(session.table).data,
            'guest_token': str(session.session_uuid)
        }, message="QR code validated successfully")

class GenerateQRView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        table = get_object_or_404(Table, pk=pk)
        signed_token = generate_signed_qr_payload(
            restaurant_id=table.restaurant_id,
            table_id=table.id,
            qr_version=table.qr_version
        )
        return api_response({
            'table_id': table.id,
            'table_number': table.table_number,
            'qr_version': table.qr_version,
            'qr_token': signed_token,
            'customer_url': f"/?tableId={table.id}&qr={signed_token}"
        })
