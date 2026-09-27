from decimal import Decimal
from django.db import transaction
from django.utils import timezone
from apps.tables.models import Table, TableSession, TableStatus, TableSessionStatus
from common.exceptions import InvalidQRError, TableSessionActiveConflictError
from common.utils.qr_security import verify_and_decode_qr_token
from common.utils.decimal_math import to_money

class TableSessionService:
    @staticmethod
    def get_or_create_active_session_for_qr(signed_qr: str) -> TableSession:
        """
        Validates QR cryptographic signature, checks QR version freshness,
        and atomically retrieves or initializes the table's ACTIVE session.
        Uses select_for_update() to prevent race conditions.
        """
        payload = verify_and_decode_qr_token(signed_qr)
        restaurant_id = payload.get('r_id')
        table_id = payload.get('t_id')
        qr_version = payload.get('v')

        with transaction.atomic():
            table = Table.objects.select_for_update().get(id=table_id, restaurant_id=restaurant_id, is_active=True)
            
            # Check QR version freshness - if revoked/reprinted, reject
            if table.qr_version != qr_version:
                raise InvalidQRError("This physical QR code has been superseded by a newer version.")

            active_session = TableSession.objects.filter(
                table=table,
                status=TableSessionStatus.ACTIVE
            ).first()

            if not active_session:
                active_session = TableSession.objects.create(
                    restaurant=table.restaurant,
                    table=table,
                    status=TableSessionStatus.ACTIVE
                )
                table.status = TableStatus.OCCUPIED
                table.save(update_fields=['status'])

            return active_session

    @staticmethod
    def close_session_and_clean_table(session_id: int):
        with transaction.atomic():
            session = TableSession.objects.select_for_update().get(id=session_id)
            session.status = TableSessionStatus.CLOSED
            session.closed_at = timezone.now()
            session.save(update_fields=['status', 'closed_at'])

            table = session.table
            table.status = TableStatus.CLEANING
            table.save(update_fields=['status'])
