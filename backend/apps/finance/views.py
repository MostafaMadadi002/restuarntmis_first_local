from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from django.shortcuts import get_object_or_404
from apps.finance.models import Bill, Payment
from apps.finance.serializers import BillSerializer, PaymentSerializer, ProcessPaymentInputSerializer
from apps.finance.services import FinanceService
from apps.tables.models import TableSession
from common.responses import api_response

class BillForSessionView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, session_id):
        session = get_object_or_404(TableSession, pk=session_id)
        bill = FinanceService.generate_bill_for_session(session)
        return api_response(BillSerializer(bill).data)

class ProcessPaymentView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ProcessPaymentInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        payment = FinanceService.process_payment(
            bill_id=serializer.validated_data['bill_id'],
            amount=serializer.validated_data['amount'],
            payment_method=serializer.validated_data['payment_method'],
            payer_type=serializer.validated_data.get('payer_type', 'FULL_TABLE'),
            seat_number=serializer.validated_data.get('seat_number'),
            actor=request.user if request.user.is_authenticated else None,
            idempotency_key=serializer.validated_data.get('idempotency_key')
        )

        return api_response({
            'payment': PaymentSerializer(payment).data,
            'bill': BillSerializer(payment.bill).data
        }, message="Payment processed successfully")
