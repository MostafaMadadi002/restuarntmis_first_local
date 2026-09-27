from decimal import Decimal
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.restaurants.models import Restaurant, Section
from apps.tables.models import Table, TableStatus, TableShape
from apps.catalog.models import KitchenStation, Category, MenuItem, CourseType
from apps.inventory.models import InventoryItem, UnitType
from apps.staff.models import StaffMember, ShiftType
from apps.devices.models import ConnectedDevice, DeviceType, DeviceStatus

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds initial demonstration data for local testing'

    def handle(self, *args, **kwargs):
        self.stdout.write("Seeding restaurant data...")

        # 1. Restaurant
        restaurant, _ = Restaurant.objects.get_or_create(
            slug='ariana-restaurant',
            defaults={
                'name': 'رستوران و کافه سنتی آریانا (Ariana)',
                'address': 'کابل، شهر نو، جاده عمومی چهارراهی انصاری',
                'phone': '+93 79 123 4567',
                'currency': 'AFN',
            }
        )

        # 2. Staff / Users
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser(
                username='admin',
                phone='+93799000001',
                password='admin123',
                role='SUPER_ADMIN',
                first_name='مدیر ارشد',
                last_name='سیستم'
            )
            self.stdout.write("Created superuser: admin / admin123")

        # 3. Sections
        s_main, _ = Section.objects.get_or_create(restaurant=restaurant, code='MAIN', defaults={'name': 'سالن اصلی (Main Hall)', 'display_order': 1})
        s_vip, _ = Section.objects.get_or_create(restaurant=restaurant, code='VIP', defaults={'name': 'بخش VIP و تشریفات', 'display_order': 2})
        s_terrace, _ = Section.objects.get_or_create(restaurant=restaurant, code='TERRACE', defaults={'name': 'تراس و آلاچیق فضای باز', 'display_order': 3})

        # 4. Tables (12 tables)
        tables_def = [
            (s_main, '1', 4, TableShape.RECTANGLE, TableStatus.AVAILABLE),
            (s_main, '2', 2, TableShape.SQUARE, TableStatus.OCCUPIED),
            (s_main, '3', 6, TableShape.RECTANGLE, TableStatus.AVAILABLE),
            (s_main, '4', 4, TableShape.RECTANGLE, TableStatus.AVAILABLE),
            (s_main, '5', 4, TableShape.RECTANGLE, TableStatus.OCCUPIED),
            (s_main, '6', 2, TableShape.SQUARE, TableStatus.CLEANING),
            (s_vip, 'VIP-1', 8, TableShape.ROUND, TableStatus.RESERVED),
            (s_vip, 'VIP-2', 10, TableShape.ROUND, TableStatus.OCCUPIED),
            (s_vip, 'VIP-3', 6, TableShape.RECTANGLE, TableStatus.AVAILABLE),
            (s_terrace, 'T-1', 4, TableShape.ROUND, TableStatus.AVAILABLE),
            (s_terrace, 'T-2', 4, TableShape.ROUND, TableStatus.AVAILABLE),
            (s_terrace, 'T-3', 6, TableShape.RECTANGLE, TableStatus.OCCUPIED),
        ]

        for sec, num, cap, shape, st in tables_def:
            Table.objects.get_or_create(
                restaurant=restaurant,
                table_number=num,
                defaults={
                    'section': sec,
                    'capacity': cap,
                    'shape': shape,
                    'status': st,
                    'name_label': f"میز {num}"
                }
            )

        # 5. Kitchen Stations
        st_grill, _ = KitchenStation.objects.get_or_create(restaurant=restaurant, code='GRILL', defaults={'name': 'کباب‌پزی و منقل زغالی'})
        st_kitchen, _ = KitchenStation.objects.get_or_create(restaurant=restaurant, code='HOT_KITCHEN', defaults={'name': 'آشپزخانه غذاهای سنتی'})
        st_bar, _ = KitchenStation.objects.get_or_create(restaurant=restaurant, code='BAR', defaults={'name': 'بار نوشیدنی و کافه'})
        st_bakery, _ = KitchenStation.objects.get_or_create(restaurant=restaurant, code='BAKERY', defaults={'name': 'تنور نان و دسر'})

        # 6. Categories
        c_kebab, _ = Category.objects.get_or_create(restaurant=restaurant, slug='kebabs', defaults={'name': 'کباب‌های اصیل و ویژه', 'display_order': 1})
        c_trad, _ = Category.objects.get_or_create(restaurant=restaurant, slug='traditional', defaults={'name': 'پلو و غذاهای سنتی', 'display_order': 2})
        c_drinks, _ = Category.objects.get_or_create(restaurant=restaurant, slug='drinks', defaults={'name': 'نوشیدنی‌های طبیعی و چای', 'display_order': 3})
        c_dessert, _ = Category.objects.get_or_create(restaurant=restaurant, slug='desserts', defaults={'name': 'دسر و شیرینی‌های محلی', 'display_order': 4})

        # 7. Menu Items
        items_def = [
            (c_trad, st_kitchen, 'قابلی پلو اوزبکی شاهانه', 'برنج اعلا با گوشت بره تازه، کشمش شاهانی و خلال هویج شیرین شده', Decimal('380.00'), CourseType.COURSE_2),
            (c_trad, st_kitchen, 'منتو اصیل هراتی بخارپز (۸ عدد)', 'خمیر دست‌پیچ پر شده با گوشت چرخ‌کرده، چکه ترش، دال نخود و نعناع خشک', Decimal('280.00'), CourseType.COURSE_2),
            (c_kebab, st_grill, 'کباب چوپان شیشلیک مخصوص', 'دنده گوسفندی مزه‌دار شده در زعفران و پیاز سرخ‌شده روی منقل زغال بلوط', Decimal('450.00'), CourseType.COURSE_2),
            (c_kebab, st_grill, 'چاپلی کباب اعلا تنوری (۲ عدد)', 'گوشت گوساله چرخ‌کرده با اناردانه، گشنیز تازه، تخم مرغ و فلفل سبز تند', Decimal('280.00'), CourseType.COURSE_2),
            (c_trad, st_kitchen, 'آشک قندهاری با قرمه کوفته', 'خمیر دست‌پیچ با گندنه تازه محلی همراه با سس ماست چکیده و سیر داغ', Decimal('240.00'), CourseType.COURSE_2),
            (c_drinks, st_bar, 'دوغ سنتی مشک نعناعی', 'دوغ تازه محلی طعم‌دار شده با گلپوره، نعناع کوهی و خیار رنده‌شده', Decimal('60.00'), CourseType.COURSE_1),
            (c_drinks, st_bar, 'چای سبز هل‌دار هلالی با نبات زعفرانی', 'چای معطر هیل‌دار دم‌کشیده در سماور با نبات بلوری', Decimal('40.00'), CourseType.COURSE_3),
            (c_dessert, st_bakery, 'فرنی هل و بادام با گلاب اعلا', 'دسر سنتی نشاسته شیر غلیظ با خلال پسته، بادام و عرق گل محمدی', Decimal('90.00'), CourseType.COURSE_3),
        ]

        for cat, st, name, desc, pr, crs in items_def:
            MenuItem.objects.get_or_create(
                restaurant=restaurant,
                name=name,
                defaults={
                    'category': cat,
                    'station': st,
                    'description': desc,
                    'base_price': pr,
                    'default_course': crs,
                    'is_available': True,
                }
            )

        # 8. Inventory Items
        inv_def = [
            ('برنج باریک اصیل سیلای لکنهوی', UnitType.KG, Decimal('450.00'), Decimal('100.00'), Decimal('85.00')),
            ('گوشت ران و سرین بره تازه', UnitType.KG, Decimal('280.00'), Decimal('80.00'), Decimal('490.00')),
            ('چکه محلی اعلا و ماست چکیده', UnitType.KG, Decimal('95.00'), Decimal('30.00'), Decimal('90.00')),
            ('روغن حیوانی زرد خالص هراتی', UnitType.LITER, Decimal('60.00'), Decimal('20.00'), Decimal('340.00')),
            ('پیاز زرد محلی قندهار', UnitType.KG, Decimal('220.00'), Decimal('50.00'), Decimal('30.00')),
            ('زعفران سرگل اعلای هرات', UnitType.GRAM, Decimal('85.00'), Decimal('25.00'), Decimal('120.00')),
            ('آرد سفید دو صفر نانوایی', UnitType.KG, Decimal('18.00'), Decimal('50.00'), Decimal('45.00')),
        ]

        for iname, u, cur, mn, cst in inv_def:
            InventoryItem.objects.get_or_create(
                restaurant=restaurant,
                name=iname,
                defaults={
                    'base_unit': u,
                    'current_stock': cur,
                    'minimum_stock': mn,
                    'cost_per_unit': cst,
                }
            )

        # 9. Staff Members
        staff_def = [
            ('فرهاد رحیمی', 'EMP-101', 'سرآشپز اجرایی (Executive Chef)', '+93 79 111 2233', ShiftType.MORNING),
            ('جمشید احمدی', 'EMP-102', 'صندوقدار و حسابدار (POS Cashier)', '+93 79 222 3344', ShiftType.MORNING),
            ('نوید کریمی', 'EMP-103', 'سرپرست سالنداران (Head Waiter)', '+93 79 333 4455', ShiftType.EVENING),
            ('ذبیح‌الله نوری', 'EMP-104', 'سالندار بخش VIP (VIP Waiter)', '+93 79 444 5566', ShiftType.FULL_DAY),
            ('عمران حبیبی', 'EMP-105', 'مسئول انبار و تدارکات', '+93 79 555 6677', ShiftType.MORNING),
        ]

        for sname, scode, srole, sphone, shf in staff_def:
            StaffMember.objects.get_or_create(
                code=scode,
                defaults={
                    'restaurant': restaurant,
                    'name': sname,
                    'role': srole,
                    'phone': sphone,
                    'shift': shf,
                    'is_present': True
                }
            )

        # 10. Devices
        dev_def = [
            ('صندوق لمسی مرکزی (POS Master)', DeviceType.POS, '192.168.10.20'),
            ('تبلت همراه سالندار شماره ۱', DeviceType.WAITER_TABLET, '192.168.10.31'),
            ('تبلت همراه سالندار شماره ۲', DeviceType.WAITER_TABLET, '192.168.10.32'),
            ('نمایشگر سرآشپز آشپزخانه (KDS)', DeviceType.KITCHEN_DISPLAY, '192.168.10.40'),
            ('نمایشگر منقل کباب‌پزی (KDS 2)', DeviceType.KITCHEN_DISPLAY, '192.168.10.41'),
        ]

        for dname, dtype, dip in dev_def:
            ConnectedDevice.objects.get_or_create(
                restaurant=restaurant,
                name=dname,
                defaults={
                    'device_type': dtype,
                    'ip_address': dip,
                    'status': DeviceStatus.ONLINE,
                    'is_blocked': False
                }
            )

        self.stdout.write(self.style.SUCCESS("Demo restaurant data successfully seeded!"))
