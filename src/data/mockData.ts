import {
  TableItem,
  MenuItemData,
  OrderData,
  InventoryItemData,
  CustomerData,
  StaffData,
  NotificationItem,
  DeviceItem,
  CustomerRequestItem,
  LoyaltyTierBenefit,
  KitchenStageConfig,
  BroadcastMessage,
} from '../types';

export const INITIAL_TABLES: TableItem[] = [];

export const INITIAL_MENU_ITEMS: MenuItemData[] = [];

export const INITIAL_LOYALTY_TIERS: LoyaltyTierBenefit[] = [
  { tier: 'BRONZE', title: 'برنزی', discount_percent: 0, free_perk: 'بدون مزایا', min_spend: 0, required_points: 0, badge_color: 'bg-amber-100 text-amber-900 border-amber-300' },
  { tier: 'SILVER', title: 'نقره‌ای', discount_percent: 5, free_perk: '۵٪ تخفیف', min_spend: 1500, required_points: 200, badge_color: 'bg-slate-200 text-slate-800 border-slate-400' },
  { tier: 'GOLD', title: 'طلایی', discount_percent: 10, free_perk: '۱۰٪ تخفیف', min_spend: 4000, required_points: 500, badge_color: 'bg-yellow-100 text-yellow-900 border-yellow-400' },
  { tier: 'PLATINUM', title: 'پلاتینیوم', discount_percent: 15, free_perk: '۱۵٪ تخفیف', min_spend: 10000, required_points: 1200, badge_color: 'bg-purple-100 text-purple-900 border-purple-400' },
];

export const INITIAL_KITCHEN_STAGES: KitchenStageConfig[] = [
  { id: 'NEW', name: 'سفارش جدید', color: 'slate', badgeClass: 'bg-slate-100 text-slate-800 border-slate-300', orderIndex: 1 },
  { id: 'ACCEPTED', name: 'تایید سرآشپز', color: 'blue', badgeClass: 'bg-blue-100 text-blue-800 border-blue-300', orderIndex: 2 },
  { id: 'PREPARING', name: 'در حال پخت و آماده‌سازی', color: 'amber', badgeClass: 'bg-amber-100 text-amber-800 border-amber-300', orderIndex: 3 },
  { id: 'READY', name: 'آماده تحویل گارسون', color: 'emerald', badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300', orderIndex: 4 },
  { id: 'SERVED', name: 'سرو شده سر میز', color: 'indigo', badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-300', orderIndex: 5 },
];

export const INITIAL_BROADCASTS: BroadcastMessage[] = [];

export const INITIAL_DEVICES: DeviceItem[] = [];

export const INITIAL_REQUESTS: CustomerRequestItem[] = [];

export const INITIAL_ORDERS: OrderData[] = [];

export const INITIAL_INVENTORY: InventoryItemData[] = [];

export const INITIAL_CUSTOMERS: CustomerData[] = [];

export const INITIAL_STAFF: StaffData[] = [
  { 
    id: 1, 
    name: 'مدیر اصلی', 
    role: 'MANAGER', 
    employee_code: 'admin', 
    phone: '0000000000', 
    attendance_status: 'PRESENT', 
    check_in_time: '۰۸:۰۰', 
    assigned_sections: 'کل مجموعه',
    password: 'admin'
  },
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];
