from decimal import Decimal
from django.db import transaction
from django.utils import timezone
from apps.finance.models import Bill, Payment, BillStatus, PaymentMethod, PayerType
from apps.tables.services import TableSessionService
from common.exceptions import OverpaymentError, BusinessLogicError
from common.utils.decimal_math import to_money

class FinanceService:
    @staticmethod
    def generate_bill_for_session(table_session) -> Bill:
        """
        Calculates total from all confirmed orders and creates or updates the Bill.
        """
        with transaction.atomic():
            bill, created = Bill.objects.select_for_update().get_or_create(
                table_session=table_session,
                restaurant=table_session.restaurant,
                defaults={
                    'bill_number': f"BILL-{table_session.table.table_number}-{int(timezone.now().timestamp())}",
                    'subtotal': Decimal('0.00'),
                    'total_amount': Decimal('0.00'),
                    'paid_amount': Decimal('0.00'),
                    'remaining_amount': Decimal('0.00')
                }
            )

            # Sum item subtotals from all confirmed orders in this table session
            total_subtotal = Decimal('0.00')
            for order in table_session.orders.filter(status__in=['CONFIRMED', 'COMPLETED']):
                for item in order.items.all():
                    total_subtotal += to_money(item.subtotal)

            bill.subtotal = total_subtotal
            bill.total_amount = total_subtotal - bill.discount_total + bill.tax_service_total
            bill.remaining_amount = bill.total_amount - bill.paid_amount
            
            if bill.remaining_amount <= Decimal('0.00') and bill.total_amount > Decimal('0.00'):
                bill.status = BillStatus.PAID
            elif bill.paid_amount > Decimal('0.00'):
                bill.status = BillStatus.PARTIALLY_PAID
            else:
                bill.status = BillStatus.OPEN

            bill.save()
            return bill

    @staticmethod
    def process_payment(bill_id: int, amount: Decimal, payment_method: str, payer_type: str = PayerType.FULL_TABLE, seat_number: int = None, actor=None, idempotency_key: str = None) -> Payment:
        """
        Atomically executes payment for a bill, preventing overpayments,
        supporting Split Bill by Seat, Custom Amount, or Full Bill.
        When paid in full, triggers session closing and sets table to CLEANING.
        """
        with transaction.atomic():
            # Idempotency check
            if idempotency_key:
                existing_payment = Payment.objects.filter(idempotency_key=idempotency_key).first()
                if existing_payment:
                    return existing_payment

            bill = Bill.objects.select_for_update().get(id=bill_id)
            pay_amount = to_money(amount)

            if pay_amount <= Decimal('0.00'):
                raise BusinessLogicError("Payment amount must be greater than zero.")

            if pay_amount > bill.remaining_amount:
                raise OverpaymentError(bill_remaining=bill.remaining_amount, attempted_payment=pay_amount)

            payment = Payment.objects.create(
                bill=bill,
                amount=pay_amount,
                payment_method=payment_method,
                payer_type=payer_type,
                seat_number=seat_number,
                actor=actor,
                idempotency_key=idempotency_key or f"PAY-{timezone.now().timestamp()}"
            )

            bill.paid_amount += pay_amount
            bill.remaining_amount -= pay_amount

            if bill.remaining_amount <= Decimal('0.00'):
                bill.status = BillStatus.PAID
                bill.save(update_fields=['paid_amount', 'remaining_amount', 'status'])
                # Bill fully settled -> close table session
                TableSessionService.close_session_and_clean_table(bill.table_session.id)
            else:
                bill.status = BillStatus.PARTIALLY_PAID
                bill.save(update_fields=['paid_amount', 'remaining_amount', 'status'])

            return payment
