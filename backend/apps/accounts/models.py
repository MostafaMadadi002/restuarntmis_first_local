from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils.translation import gettext_lazy as _

class UserRole(models.TextChoices):
    SUPER_ADMIN = 'SUPER_ADMIN', _('Super Admin')
    MANAGER = 'MANAGER', _('Manager')
    CASHIER = 'CASHIER', _('Cashier')
    WAITER = 'WAITER', _('Waiter')
    KITCHEN = 'KITCHEN', _('Kitchen Chef')
    INVENTORY_MANAGER = 'INVENTORY_MANAGER', _('Inventory Manager')
    STAFF = 'STAFF', _('General Staff')

class UserManager(BaseUserManager):
    def create_user(self, username, phone=None, password=None, **extra_fields):
        if not username:
            raise ValueError('Username is required')
        extra_fields.setdefault('is_active', True)
        user = self.model(username=username, phone=phone, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, username, phone=None, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', UserRole.SUPER_ADMIN)
        return self.create_user(username, phone, password, **extra_fields)

class User(AbstractUser):
    phone = models.CharField(max_length=20, unique=True, null=True, blank=True)
    role = models.CharField(max_length=30, choices=UserRole.choices, default=UserRole.STAFF)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    class Meta:
        db_table = 'accounts_users'
        indexes = [
            models.Index(fields=['phone']),
            models.Index(fields=['role']),
        ]

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
