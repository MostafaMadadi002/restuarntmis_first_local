from rest_framework import serializers
from apps.devices.models import ConnectedDevice

class ConnectedDeviceSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConnectedDevice
        fields = ['id', 'name', 'device_type', 'ip_address', 'status', 'is_blocked', 'last_ping']
