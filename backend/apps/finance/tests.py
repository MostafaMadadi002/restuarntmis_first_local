from decimal import Decimal
from django.test import TestCase
from django.contrib.auth import get_user_model
from apps.restaurants.models import Restaurant, Section
from apps.tables.models import Table, TableSession, TableStatus, TableSessionStatus
from apps.catalog.models import MenuItem, Category
from apps.orders.models import Order, OrderItem, OrderStatus
from apps.finance.models import Bill, BillStatus, PaymentMethod, PayerType
from apps.finance.services import FinanceService
from common.exceptions import OverpaymentError

User = get_user_model()

class SplitBillTestCase(TestCase):
    def setUp(self):
        self.restaurant = Restaurant.objects.create(name="Aryana Grill", slug="aryana-grill", currency="AFN")
        self.section = Section.objects.create(restaurant=self.restaurant, name="Main Hall", code="MAIN")
        self.table = Table.objects.create(restaurant=self.restaurant, section=self.section, table_number="12")
        self.session = TableSession.objects.create(restaurant=self.restaurant, table=self.table, status=TableSessionStatus.ACTIVE)
        
        self.category = Category.objects.create(restaurant=self.restaurant, name="Dishes", slug="dishes")
        self.item_burger = MenuItem.objects.create(restaurant=self.restaurant, category=self.category, name="Burger Combo", base_price=Decimal("250.00"))
        self.item_pizza = MenuItem.objects.create(restaurant=self.restaurant, category=self.category, name="Pizza Special", base_price=Decimal("300.00"))
        self.item_water = MenuItem.objects.create(restaurant=self.restaurant, category=self.category, name="Mineral Water", base_price=Decimal("50.00"))

        # Order 1: 4 friends at Table 12
        self.order = Order.objects.create(
            order_number="ORD-101",
            restaurant=self.restaurant,
            table_session=self.session,
            status=OrderStatus.CONFIRMED
        )
        # Seat 1: 250
        OrderItem.objects.create(order=self.order, menu_item=self.item_burger, seat_number=1, quantity=Decimal("1.000"), unit_price_at_order=Decimal("250.00"), subtotal=Decimal("250.00"))
        # Seat 2: 300
        OrderItem.objects.create(order=self.order, menu_item=self.item_pizza, seat_number=2, quantity=Decimal("1.000"), unit_price_at_order=Decimal("300.00"), subtotal=Decimal("300.00"))
        # Seat 3: 50
        OrderItem.objects.create(order=self.order, menu_item=self.item_water, seat_number=3, quantity=Decimal("1.000"), unit_price_at_order=Decimal("50.00"), subtotal=Decimal("50.00"))
        # Seat 4: 0 (ordered nothing)

    def test_split_bill_exact_scenario(self):
        """
        Tests the 600 AFN 4-person split scenario:
        Person 1 pays 250 AFN
        Person 2 pays 300 AFN
        Person 3 pays 50 AFN
        Total paid = 600 AFN, Remaining = 0 AFN, Status = PAID
        """
        bill = FinanceService.generate_bill_for_session(self.session)
        self.assertEqual(bill.total_amount, Decimal("600.00"))
        self.assertEqual(bill.remaining_amount, Decimal("600.00"))

        # Payment 1 (Seat 1)
        FinanceService.process_payment(bill.id, Decimal("250.00"), PaymentMethod.CASH, PayerType.SEAT, seat_number=1)
        bill.refresh_from_db()
        self.assertEqual(bill.paid_amount, Decimal("250.00"))
        self.assertEqual(bill.remaining_amount, Decimal("350.00"))
        self.assertEqual(bill.status, BillStatus.PARTIALLY_PAID)

        # Payment 2 (Seat 2)
        FinanceService.process_payment(bill.id, Decimal("300.00"), PaymentMethod.CARD, PayerType.SEAT, seat_number=2)
        bill.refresh_from_db()
        self.assertEqual(bill.paid_amount, Decimal("550.00"))
        self.assertEqual(bill.remaining_amount, Decimal("50.00"))

        # Payment 3 (Seat 3)
        FinanceService.process_payment(bill.id, Decimal("50.00"), PaymentMethod.CASH, PayerType.SEAT, seat_number=3)
        bill.refresh_from_db()
        self.assertEqual(bill.paid_amount, Decimal("600.00"))
        self.assertEqual(bill.remaining_amount, Decimal("0.00"))
        self.assertEqual(bill.status, BillStatus.PAID)

        # Ensure session closed and table turned to CLEANING
        self.session.refresh_from_db()
        self.assertEqual(self.session.status, TableSessionStatus.CLOSED)
        self.table.refresh_from_db()
        self.assertEqual(self.table.status, TableStatus.CLEANING)

    def test_overpayment_rejected(self):
        """
        Tests that an overpayment of 250 + 300 + 100 (= 650 on a 600 bill)
        is rejected with OverpaymentError.
        """
        bill = FinanceService.generate_bill_for_session(self.session)
        FinanceService.process_payment(bill.id, Decimal("250.00"), PaymentMethod.CASH)
        FinanceService.process_payment(bill.id, Decimal("300.00"), PaymentMethod.CASH)
        
        # Remaining is now 50. Attempting to pay 100 must raise OverpaymentError
        with self.assertRaises(OverpaymentError):
            FinanceService.process_payment(bill.id, Decimal("100.00"), PaymentMethod.CASH)
