from django.urls import path
from apps.crm.views import CustomerListView, FeedbackCreateView

urlpatterns = [
    path('customers/', CustomerListView.as_view(), name='customer_list'),
    path('feedback/', FeedbackCreateView.as_view(), name='feedback_create'),
]
