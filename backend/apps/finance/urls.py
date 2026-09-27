from django.urls import path
from apps.finance.views import BillForSessionView, ProcessPaymentView

urlpatterns = [
    path('bill/<int:session_id>/', BillForSessionView.as_view(), name='bill_for_session'),
    path('payments/', ProcessPaymentView.as_view(), name='process_payment'),
]
