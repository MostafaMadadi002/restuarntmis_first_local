from rest_framework import permissions

class IsStaffUser(permissions.BasePermission):
    """Allows access only to authenticated restaurant staff users."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_active)

class IsSuperAdminOrManager(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and
            request.user.role in ['SUPER_ADMIN', 'MANAGER']
        )

class IsCashierOrAbove(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and
            request.user.role in ['SUPER_ADMIN', 'MANAGER', 'CASHIER']
        )

class IsKitchenOrStaff(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and
            request.user.role in ['SUPER_ADMIN', 'MANAGER', 'KITCHEN', 'WAITER']
        )

class IsGuestAuthenticated(permissions.BasePermission):
    """Checks whether the request is made by a verified QR customer guest session."""
    def has_permission(self, request, view):
        return hasattr(request, 'guest_session') and request.guest_session is not None
