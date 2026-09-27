from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from apps.crm.models import Customer, Feedback
from apps.crm.serializers import CustomerSerializer, FeedbackSerializer
from common.responses import api_response

class CustomerListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        customers = Customer.objects.select_related('loyalty_account').order_by('-total_spend')
        return api_response(CustomerSerializer(customers[:50], many=True).data)

    def post(self, request):
        serializer = CustomerSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        customer = serializer.save()
        return api_response(CustomerSerializer(customer).data, message="Customer registered")

class FeedbackCreateView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = FeedbackSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        feedback = serializer.save()
        return api_response(FeedbackSerializer(feedback).data, message="Guest feedback recorded")
