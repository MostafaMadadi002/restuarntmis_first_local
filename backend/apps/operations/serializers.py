from rest_framework import serializers
from apps.operations.models import CustomerRequest, RequestType, RequestStatus

class CustomerRequestSerializer(serializers.ModelSerializer):
    table_number = serializers.CharField(source='table_session.table.table_number', read_only=True)
    table_id = serializers.IntegerField(source='table_session.table.id', read_only=True)

    class Meta:
        model = CustomerRequest
        fields = ['id', 'table_session', 'table_id', 'table_number', 'request_type', 'status', 'notes', 'created_at']

class CreateRequestSerializer(serializers.Serializer):
    table_id = serializers.IntegerField(required=True)
    request_type = serializers.ChoiceField(choices=RequestType.choices, default=RequestType.CALL_WAITER)
    notes = serializers.CharField(required=False, allow_blank=True, default='')
