export type Role = 'MANAGER' | 'WAITER' | 'CASHIER' | 'KITCHEN' | 'CUSTOMER';

export interface TableItem {
  id: number;
  table_number: string;
  name_label?: string;
  section_name?: string;
  section?: string;
  capacity: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING';
  current_bill_total?: number;
  session_started_at?: string;
  guest_count?: number;
  assigned_waiter_id?: number;
  assigned_waiter_name?: string;
  waiter_name?: string;
  pos_x?: number;
  pos_y?: number;
  shape?: string;
  width?: number;
  height?: number;
}

export interface MenuItemData {
  id: number;
  name: string;
  name_ps?: string;
  name_en?: string;
  category_id: number;
  category_name: string;
  price: number;
  description: string;
  description_ps?: string;
  description_en?: string;
  is_available: boolean;
  station: string;
  rating?: number;
  rating_count?: number;
  image?: string;
  is_package?: boolean;
  package_items?: { id: number; name: string; quantity: number }[];
  loyalty_points_reward?: number; // امتیاز وفاداری اهدایی به مشتری هنگام سفارش
}

export interface DeviceItem {
  id: string;
  name: string;
  type: 'POS' | 'WAITER_TABLET' | 'KITCHEN_DISPLAY' | 'GUEST_MOBILE';
  ip_address: string;
  assigned_to: string;
  status: 'ONLINE' | 'OFFLINE' | 'BLOCKED';
  last_active: string;
  connected_table_number?: string;
  is_suspicious?: boolean;
}

export interface CustomerRequestItem {
  id: string;
  table_id: number;
  table_number: string;
  type: 'CALL_WAITER' | 'WATER' | 'CUTLERY' | 'BILL';
  label: string;
  status: 'PENDING' | 'ATTENDED';
  created_at: string;
  assigned_waiter?: string;
}

export interface OrderItemData {
  id: string;
  menu_item_id: number;
  name: string;
  seat_number: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
  course: 'COURSE_1' | 'COURSE_2' | 'COURSE_3';
  kitchen_status: 'NEW' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'SERVED';
  notes?: string;
  stage?: string;
  station?: string;
}

export interface OrderData {
  id: string;
  order_number: string;
  table_id: number;
  table_number: string;
  source: 'CUSTOMER_QR' | 'WAITER' | 'POS';
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  items: OrderItemData[];
  created_at: string;
  waiter_name?: string;
  assigned_waiter_id?: number;
  call_waiter_requested?: boolean;
  call_waiter_time?: string;
  customer_name?: string;
  customer_avatar?: string;
  address?: string;
}

export interface InventoryItemData {
  id: number;
  name: string;
  category: string;
  current_stock: number;
  minimum_stock: number;
  base_unit: string;
  cost_per_unit: number;
  status: 'HEALTHY' | 'LOW' | 'OUT';
}

export interface CustomerData {
  id: number;
  name: string;
  phone: string;
  visits: number;
  total_spend: number;
  points: number;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  pending_tier_upgrade?: 'SILVER' | 'GOLD' | 'PLATINUM';
  upgrade_requested_at?: string;
  last_visit: string;
  notes?: string;
}

export interface StaffData {
  id: number;
  name: string;
  role: Role;
  employee_code: string;
  phone: string;
  attendance_status: 'PRESENT' | 'ABSENT' | 'LATE';
  check_in_time?: string;
  assigned_sections?: string;
  photo?: string; // عکس پرسنل (مخصوص کارمندان)
  password?: string; // رمز عبور یا پین ورود کارمند
  shift?: 'MORNING' | 'EVENING' | 'NIGHT'; // شیفت کاری تعیین‌شده توسط مدیر
  work_hours?: string; // ساعت کاری (مثلاً ۰۸:۰۰ الی ۱۶:۰۰)
  monthly_attendance_summary?: {
    days_present: number;
    days_absent: number;
    days_late: number;
    total_hours: number;
    past_records?: { date: string; status: 'PRESENT' | 'ABSENT' | 'LATE'; check_in?: string; check_out?: string }[];
  };
}

export interface ReceiptRecord {
  id: string;
  receipt_number: string;
  table_id: number;
  table_number: string;
  created_at: string;
  waiter_name: string;
  cashier_name: string;
  customer_name?: string;
  customer_phone?: string;
  items: { name: string; quantity: number; unit_price: number; subtotal: number }[];
  subtotal: number;
  discount_amount: number;
  grand_total: number;
  payment_method: 'CASH';
  points_earned: number;
  points_used: number;
}

export interface CustomerAnnouncement {
  id: string;
  title: string;
  message: string;
  image_url?: string;
  action_link?: string;
  action_label?: string;
  active: boolean;
}

export interface RestaurantSettings {
  restaurant_name: string;
  currency: string;
  loyalty_points_unit: string; // نام واحد امتیاز وفاداری: سکه، الماس، امتیاز...
  superuser_username: string;
  superuser_password: string;
  wifi_ssid?: string;
  wifi_password?: string;
}

export interface LoyaltyTierBenefit {
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  title: string;
  discount_percent: number;
  free_perk: string;
  min_spend: number;
  required_points: number;
  badge_color: string;
}

export interface BroadcastMessage {
  id: string;
  title: string;
  message: string;
  sender_name: string;
  sender_role: string;
  timestamp: string;
  priority: 'INFO' | 'WARNING' | 'URGENT';
}

export interface KitchenStageConfig {
  id: string;
  name: string;
  color: string;
  badgeClass: string;
  orderIndex: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'WARNING' | 'INFO' | 'SUCCESS' | 'URGENT';
  read: boolean;
  actionView?: string;
}
