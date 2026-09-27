from django.urls import path
from apps.accounts.views import LoginView, MeView, UserListView

urlpatterns = [
    path('login/', LoginView.as_view(), name='auth_login'),
    path('me/', MeView.as_view(), name='auth_me'),
    path('users/', UserListView.as_view(), name='auth_users'),
]
