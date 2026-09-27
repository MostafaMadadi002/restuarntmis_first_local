from decimal import Decimal
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger(__name__)

class BusinessLogicError(Exception):
    """Base exception for business logic validation errors."""
    def __init__(self, message: str, code: str = "BUSINESS_ERROR", details: dict = None):
        super().__init__(message)
        self.message = message
        self.code = code
        self.details = details or {}

class InsufficientStockError(BusinessLogicError):
    def __init__(self, item_name: str, requested: Decimal, available: Decimal):
        super().__init__(
            message=f"Stock insufficient for '{item_name}'. Required: {requested}, Available: {available}",
            code="INSUFFICIENT_STOCK",
            details={"item": item_name, "requested": str(requested), "available": str(available)}
        )

class OverpaymentError(BusinessLogicError):
    def __init__(self, bill_remaining: Decimal, attempted_payment: Decimal):
        super().__init__(
            message=f"Payment amount ({attempted_payment}) exceeds bill balance ({bill_remaining}).",
            code="OVERPAYMENT_NOT_ALLOWED",
            details={"remaining": str(bill_remaining), "attempted": str(attempted_payment)}
        )

class TableSessionActiveConflictError(BusinessLogicError):
    def __init__(self, table_number: str):
        super().__init__(
            message=f"Table {table_number} already has an active session.",
            code="TABLE_SESSION_CONFLICT",
            details={"table_number": table_number}
        )

class InvalidQRError(BusinessLogicError):
    def __init__(self, reason: str = "Invalid or expired QR code"):
        super().__init__(
            message=reason,
            code="INVALID_QR_TOKEN"
        )

def custom_exception_handler(exc, context):
    """Formats DRF errors into standard API JSON format."""
    response = exception_handler(exc, context)

    if isinstance(exc, BusinessLogicError):
        return Response({
            "success": False,
            "error": {
                "code": exc.code,
                "message": exc.message,
                "details": exc.details
            }
        }, status=status.HTTP_400_BAD_REQUEST)

    if response is not None:
        return Response({
            "success": False,
            "error": {
                "code": f"HTTP_{response.status_code}",
                "message": "Validation or HTTP Error occurred.",
                "details": response.data
            }
        }, status=response.status_code)

    logger.error("Unhandled server error: %s", exc, exc_info=True)
    return Response({
        "success": False,
        "error": {
            "code": "INTERNAL_SERVER_ERROR",
            "message": "An unexpected error occurred on the local server.",
            "details": str(exc) if hasattr(exc, '__str__') else {}
        }
    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
