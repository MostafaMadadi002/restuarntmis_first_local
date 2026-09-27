from rest_framework import serializers
from apps.tables.models import Table, TableSession, TableStatus

class TableSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = TableSession
        fields = ['id', 'session_uuid', 'status', 'guest_session_version', 'started_at', 'closed_at']

class TableSerializer(serializers.ModelSerializer):
    active_session = serializers.SerializerMethodField()
    section_name = serializers.CharField(source='section.name', read_only=True)
    section_code = serializers.CharField(source='section.code', read_only=True)

    class Meta:
        model = Table
        fields = [
            'id', 'restaurant', 'section', 'section_name', 'section_code',
            'table_number', 'name_label', 'capacity', 'status', 'qr_version',
            'pos_x', 'pos_y', 'width', 'height', 'rotation', 'shape',
            'active_session', 'is_active'
        ]

    def get_active_session(self, obj):
        session = obj.sessions.filter(status='ACTIVE').first()
        if session:
            return TableSessionSerializer(session).data
        return None

class TableStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=TableStatus.choices)

class ValidateQRSerializer(serializers.Serializer):
    qr_token = serializers.CharField(required=True)
