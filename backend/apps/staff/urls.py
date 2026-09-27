from django.urls import path
from apps.staff.views import StaffMemberListView, StaffToggleAttendanceView

urlpatterns = [
    path('', StaffMemberListView.as_view(), name='staff_list'),
    path('<int:pk>/toggle-attendance/', StaffToggleAttendanceView.as_view(), name='staff_toggle_attendance'),
]
