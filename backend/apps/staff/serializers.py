from rest_framework import serializers
from apps.staff.models import StaffMember

class StaffMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = StaffMember
        fields = ['id', 'name', 'code', 'role', 'phone', 'shift', 'is_present', 'pin_code']
