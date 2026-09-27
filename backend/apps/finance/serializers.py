from rest_framework import serializers
from decimal import Decimal
from apps.finance.models import Bill, Payment, PaymentMethod, PayerType

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            'id', 'bill', 'amount', 'payment_method', 'payer_type',
            'seat_number', 'idempotency_key', 'created_at'
        ]

class BillSerializer(serializers.ModelSerializer):
    payments = PaymentSerializer(many=True, read_only=True)
    table_number = serializers.CharField(source='table_session.table.table_number', read_only=True)

    class Meta:
        model = Bill
        fields = [
            'id', 'bill_number', 'restaurant', 'table_session', 'table_number',
            'subtotal', 'discount_total', 'tax_service_total', 'total_amount',
            'paid_amount', 'remaining_amount', 'status', 'payments', 'created_at'
        ]

class ProcessPaymentInputSerializer(serializers.Serializer):
    bill_id = serializers.IntegerField(required=True)
    amount = serializers.DecimalField(max_digits=12, decimal_places=2, required=True)
    payment_method = serializers.ChoiceField(choices=PaymentMethod.choices, default=PaymentMethod.CASH)
    payer_type = serializers.ChoiceField(choices=PayerType.choices, default=PayerType.FULL_TABLE)
    seat_number = serializers.IntegerField(required=False, allow_null=True)
    idempotency_key = serializers.CharField(required=False, allow_blank=True)
