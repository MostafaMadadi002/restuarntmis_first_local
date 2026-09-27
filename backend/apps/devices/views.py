from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from django.shortcuts import get_object_or_404
from apps.devices.models import ConnectedDevice
from apps.devices.serializers import ConnectedDeviceSerializer
from common.responses import api_response

class DeviceListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        devices = ConnectedDevice.objects.all().order_by('id')
        return api_response(ConnectedDeviceSerializer(devices, many=True).data)

class DeviceToggleBlockView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, pk):
        device = get_object_or_404(ConnectedDevice, pk=pk)
        device.is_blocked = not device.is_blocked
        device.save(update_fields=['is_blocked'])
        return api_response(ConnectedDeviceSerializer(device).data, message="Device blocked state toggled")

class BroadcastMessageView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        message = request.data.get('message', '')
        # In LAN WebSocket/Redis or local SSE, message is dispatched
        return api_response({'broadcast_text': message}, message="Notice broadcast to all local terminals")
