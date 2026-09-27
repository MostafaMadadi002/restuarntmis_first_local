from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from apps.accounts.models import User
from apps.accounts.serializers import UserSerializer, LoginSerializer
from common.responses import api_response
from common.exceptions import BusinessLogicError

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        username = serializer.validated_data['username']
        password = serializer.validated_data['password']

        user = authenticate(username=username, password=password)
        if not user or not user.is_active:
            raise BusinessLogicError("Invalid username or password.", code="INVALID_CREDENTIALS")

        refresh = RefreshToken.for_user(user)
        return api_response({
            'user': UserSerializer(user).data,
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }
        }, message="Login successful")

class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return api_response(UserSerializer(request.user).data)

class UserListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        users = User.objects.filter(is_active=True).order_by('id')
        return api_response(UserSerializer(users, many=True).data)
