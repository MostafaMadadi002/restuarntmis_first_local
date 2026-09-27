from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from django.shortcuts import get_object_or_404
from apps.staff.models import StaffMember
from apps.staff.serializers import StaffMemberSerializer
from common.responses import api_response

class StaffMemberListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        staff = StaffMember.objects.all().order_by('id')
        return api_response(StaffMemberSerializer(staff, many=True).data)

class StaffToggleAttendanceView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, pk):
        member = get_object_or_404(StaffMember, pk=pk)
        member.is_present = not member.is_present
        member.save(update_fields=['is_present'])
        return api_response(StaffMemberSerializer(member).data, message="Attendance updated")
