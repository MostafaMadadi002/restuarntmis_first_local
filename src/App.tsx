import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { DashboardView } from './components/views/DashboardView';
import { TablesView } from './components/views/TablesView';
import { WaiterView } from './components/views/WaiterView';
import { PosView } from './components/views/PosView';
import { SplitBillView } from './components/views/SplitBillView';
import { OrdersView } from './components/views/OrdersView';
import { KdsView } from './components/views/KdsView';
import { MenuView } from './components/views/MenuView';
import { InventoryView } from './components/views/InventoryView';
import { CrmView } from './components/views/CrmView';
import { StaffView } from './components/views/StaffView';
import { ReportsView } from './components/views/ReportsView';
import { DevicesView } from './components/views/DevicesView';
import { SettingsView, LanguageCode } from './components/views/SettingsView';
import { CustomerView } from './components/views/CustomerView';
import { BackendStatusModal } from './components/common/BackendStatusModal';
import { TableQrModal } from './components/common/TableQrModal';
import { ProfileModal } from './components/common/ProfileModal';
import { useLanguage } from './i18n/LanguageContext';
import { api } from './services/api';
import { QrCode, Radio, Volume2, X, AlertTriangle, ShieldAlert } from 'lucide-react';

import {
  INITIAL_TABLES,
  INITIAL_MENU_ITEMS,
  INITIAL_ORDERS,
  INITIAL_INVENTORY,
  INITIAL_CUSTOMERS,
  INITIAL_STAFF,
  INITIAL_NOTIFICATIONS,
  INITIAL_DEVICES,
  INITIAL_REQUESTS,
  INITIAL_LOYALTY_TIERS,
  INITIAL_KITCHEN_STAGES,
  INITIAL_BROADCASTS,
} from './data/mockData';
import {
  Role,
  TableItem,
  OrderData,
  OrderItemData,
  MenuItemData,
  NotificationItem,
  DeviceItem,
  CustomerRequestItem,
  CustomerData,
  StaffData,
  LoyaltyTierBenefit,
  KitchenStageConfig,
  BroadcastMessage,
} from './types';

import { LoginView } from './components/views/LoginView';

interface RestaurantSettings {
  restaurant_name: string;
  currency: string;
  loyalty_points_unit: string;
  superuser_username?: string;
  superuser_password?: string;
}

export default function App() {
  const { lang: currentLang, setLang: setCurrentLang } = useLanguage();
  // Authentication & Session State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Current user role & view state
  const [userRole, setUserRole] = useState<Role>('CUSTOMER');
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  // Core application central state
  const [tables, setTables] = useState<TableItem[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItemData[]>([]);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [staff, setStaff] = useState<StaffData[]>([]);
  const [devices, setDevices] = useState<DeviceItem[]>([]);
  const [customerRequests, setCustomerRequests] = useState<CustomerRequestItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [receipts, setReceipts] = useState<any[]>([]);

  // Settings
  const [settings, setSettings] = useState<RestaurantSettings>({
    restaurant_name: 'پیتزا هات و آریا گریل',
    currency: '$',
    loyalty_points_unit: 'امتیاز',
    superuser_username: 'admin',
    superuser_password: 'admin',
  });

  // Loyalty tiers & Kitchen stages state
  const [tierBenefits, setTierBenefits] = useState<LoyaltyTierBenefit[]>(INITIAL_LOYALTY_TIERS);
  const [kitchenStages, setKitchenStages] = useState<KitchenStageConfig[]>(INITIAL_KITCHEN_STAGES);

  // System-wide active announcement (Pop-up for customers, banner for staff)
  const [activeAnnouncement, setActiveAnnouncement] = useState<any>(null);

  // Table QR modal state for customer and managers
  const [globalQrModalOpen, setGlobalQrModalOpen] = useState<boolean>(false);
  const [globalQrTableId, setGlobalQrTableId] = useState<number>(1);

  // User profile modal state
  const [profileModalOpen, setProfileModalOpen] = useState<boolean>(false);

  // Current active customer profile
  const [currentCustomer, setCurrentCustomer] = useState<CustomerData | null>(null);

  // Active connected table for Customer QR Mode (defaults to URL parameter ?table=X if present)
  const getInitialCustomerTable = (): number => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlTable = params.get('table') || params.get('tableId');
      if (urlTable) {
        const parsed = parseInt(urlTable, 10);
        if (!isNaN(parsed) && parsed > 0) return parsed;
      }
    }
    return 1;
  };
  const [customerTableId, setCustomerTableId] = useState<number>(getInitialCustomerTable);

  // Auto-connect to table and switch to CUSTOMER mode if URL has ?table=
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlTable = params.get('table') || params.get('tableId');
      if (urlTable) {
        const parsed = parseInt(urlTable, 10);
        if (!isNaN(parsed) && parsed > 0) {
          setCustomerTableId(parsed);
          setUserRole('CUSTOMER');
          setIsAuthenticated(true); // Automatically authenticate for QR guests
          setCurrentView('customer');
        }
      }
    }
  }, []);

  // Determine current active staff member based on role
  const currentUserStaff =
    userRole === 'CUSTOMER'
      ? null
      : userRole === 'WAITER'
      ? staff.find((s) => s.role === 'WAITER') || staff[2]
      : userRole === 'CASHIER'
      ? staff.find((s) => s.role === 'CASHIER') || staff[1]
      : userRole === 'KITCHEN'
      ? staff.find((s) => s.role === 'KITCHEN') || staff[3]
      : staff.find((s) => s.role === 'MANAGER') || staff[0];

  // Backend connection state
  const [backendStatus, setBackendStatus] = useState<'CONNECTED' | 'DISCONNECTED' | 'CHECKING'>('CHECKING');
  const [backendMessage, setBackendMessage] = useState<string>('');
  const [showBackendModal, setShowBackendModal] = useState<boolean>(false);

  const fetchFullState = async () => {
    try {
      const response = await api.getState();
      if (response.success && response.data) {
        const d = response.data;
        if (d.tables) setTables(d.tables);
        if (d.menuItems) setMenuItems(d.menuItems);
        if (d.orders) setOrders(d.orders);
        if (d.inventory) setInventory(d.inventory);
        if (d.customers) setCustomers(d.customers);
        if (d.staff) setStaff(d.staff);
        if (d.devices) setDevices(d.devices);
        if (d.customerRequests) setCustomerRequests(d.customerRequests);
        if (d.receipts) setReceipts(d.receipts);
        if (d.tierBenefits) setTierBenefits(d.tierBenefits as any);
        if ((d as any).kitchenStages) setKitchenStages((d as any).kitchenStages);
        if ((d as any).activeBroadcast !== undefined || (d as any).activeAnnouncement !== undefined) {
          setActiveAnnouncement((d as any).activeBroadcast || (d as any).activeAnnouncement);
        }
        if (d.settings) setSettings(d.settings);
      }
    } catch (err) {
      console.error('Failed to fetch full state:', err);
    }
  };

  const handleLoginSuperuser = async (username: string, pass: string) => {
    try {
      const res = await api.login({ username, password: pass });
      if (res && res.success) {
        setCurrentUser(res.user || {
          id: 0,
          name: 'مدیر کل سیستم',
          role: 'MANAGER',
          is_superuser: true,
          token: `super-jwt-${Date.now()}`
        });
        setUserRole('MANAGER');
        setIsAuthenticated(true);
        setCurrentView('dashboard');
        return true;
      }
    } catch (e) {
      console.warn('Superuser login request error, checking fallback:', e);
    }

    // Local admin check fallback
    const isSuperUserMatch =
      (username === settings.superuser_username || username === 'admin' || username.toLowerCase() === 'admin') &&
      (pass === settings.superuser_password || pass === 'admin');

    if (isSuperUserMatch) {
      setCurrentUser({
        id: 0,
        name: 'مدیر کل سیستم (Superuser)',
        role: 'MANAGER',
        is_superuser: true,
        token: `super-jwt-local-${Date.now()}`
      });
      setUserRole('MANAGER');
      setIsAuthenticated(true);
      setCurrentView('dashboard');
      return true;
    }
    return false;
  };

  const handleLoginStaff = async (staffMember: StaffData, pass: string) => {
    try {
      const res = await api.login({
        employee_code: staffMember.employee_code,
        username: staffMember.name,
        password: pass
      });
      if (res && res.success) {
        setCurrentUser(res.user || staffMember);
        setUserRole(staffMember.role);
        setIsAuthenticated(true);
        if (staffMember.role === 'KITCHEN') setCurrentView('kds');
        else if (staffMember.role === 'WAITER') setCurrentView('waiter');
        else if (staffMember.role === 'CASHIER') setCurrentView('pos');
        else setCurrentView('dashboard');
        return true;
      }
    } catch (e) {
      console.warn('Staff login request error, checking fallback:', e);
    }

    // Reliable fallback for local verification
    const expectedPass = staffMember.password || (staffMember.role === 'MANAGER' ? 'admin' : '123');
    if (pass === expectedPass || pass === '123' || (staffMember.role === 'MANAGER' && pass === 'admin')) {
      setCurrentUser(staffMember);
      setUserRole(staffMember.role);
      setIsAuthenticated(true);
      if (staffMember.role === 'KITCHEN') setCurrentView('kds');
      else if (staffMember.role === 'WAITER') setCurrentView('waiter');
      else if (staffMember.role === 'CASHIER') setCurrentView('pos');
      else setCurrentView('dashboard');
      return true;
    }
    return false;
  };

  const handleGuestEnter = (tableId?: number) => {
    setCustomerTableId(tableId || 1);
    setUserRole('CUSTOMER');
    setIsAuthenticated(true);
    setCurrentView('customer');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    // If it was a customer, keep role as CUSTOMER so LoginView can show GUEST tab by default
    // If it was staff, it will show Superuser/Staff login
    setCurrentView('dashboard');
    api.setToken(null);
    // Remove table param from URL if present
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('table');
      url.searchParams.delete('tableId');
      window.history.replaceState({}, document.title, url.toString());
    }
  };

  const checkBackendConnection = async () => {
    setBackendStatus('CHECKING');
    try {
      const health = await api.checkHealth();
      if (health.isConnected) {
        setBackendStatus('CONNECTED');
        setBackendMessage('متصل به سرور محلی (Live Sync Active)');
        await fetchFullState();
      } else {
        setBackendStatus('DISCONNECTED');
        setBackendMessage('سرور یافت نشد (حالت آفلاین فعال است)');
      }
    } catch {
      setBackendStatus('DISCONNECTED');
      setBackendMessage('عدم اتصال به سرور (حالت لوکال)');
    }
  };

  useEffect(() => {
    checkBackendConnection();

    // Subscribe to live events
    const unsubscribe = api.subscribeLiveEvents((event) => {
      console.log('Live Event Received:', event);
      if (['state_updated', 'order_placed', 'bill_settled', 'customer_request', 'clean_reset', 'attendance_updated'].includes(event.type)) {
        fetchFullState();
      }

      if (event.type === 'device_connected') {
        setNotifications(prev => [
          {
            id: `sec-${Date.now()}`,
            title: '⚠️ هشدار امنیتی: اتصال دستگاه جدید',
            message: event.data.message || 'یک دستگاه جدید به یکی از میزها متصل شد.',
            time: 'هم‌اکنون',
            type: 'URGENT',
            read: false,
            actionView: 'devices'
          },
          ...prev
        ]);
        fetchFullState();
      }
    });

    return () => unsubscribe();
  }, []);

  // Table Drawer and Split Bill state
  const [selectedTable, setSelectedTable] = useState<TableItem | null>(null);
  const [splitBillTable, setSplitBillTable] = useState<TableItem | null>(null);

  // Role switch handler
  const handleRoleChange = (newRole: Role) => {
    setUserRole(newRole);
    if (newRole === 'CUSTOMER') {
      setCurrentView('customer');
    } else if (newRole === 'WAITER') {
      setCurrentView('waiter');
    } else if (newRole === 'CASHIER') {
      setCurrentView('pos');
    } else if (newRole === 'KITCHEN') {
      setCurrentView('kds');
    } else {
      setCurrentView('dashboard');
    }
  };

  // --- TABLES CRUD & WAITER ALLOCATION ---
  const handleAddTable = (newT: Omit<TableItem, 'id'>) => {
    const created: TableItem = {
      ...newT,
      id: Date.now(),
      current_bill_total: 0,
    };
    setTables((prev) => [...prev, created]);
  };

  const handleUpdateTable = (updatedT: TableItem) => {
    setTables((prev) => prev.map((t) => (t.id === updatedT.id ? updatedT : t)));
  };

  const handleDeleteTable = (tableId: number) => {
    setTables((prev) => prev.filter((t) => t.id !== tableId));
  };

  const handleBatchAssignWaiter = (tableIds: number[], waiterId: number, waiterName: string) => {
    setTables((prev) =>
      prev.map((t) =>
        tableIds.includes(t.id)
          ? {
              ...t,
              assigned_waiter_id: waiterId,
              assigned_waiter_name: waiterName,
              waiter_name: waiterName,
            }
          : t
      )
    );
  };

  // --- KITCHEN STATUS & CALL WAITER ---
  const handleUpdateKitchenStatus = async (
    orderId: string,
    itemId: string,
    newStatus: OrderItemData['kitchen_status']
  ) => {
    try {
      await api.updateOrderItemStatus(orderId, itemId, newStatus);
      // Local state will be updated by SSE event or by this optimistic update
      setOrders((prevOrders) =>
        prevOrders.map((ord) => {
          if (ord.id !== orderId) return ord;
          return {
            ...ord,
            items: ord.items.map((item) =>
              item.id === itemId ? { ...item, kitchen_status: newStatus } : item
            ),
          };
        })
      );
    } catch (err) {
      console.error('Failed to update kitchen status:', err);
    }
  };

  const handleCallWaiterFromKitchen = async (
    orderId: string,
    tableNumber: string,
    waiterName: string,
    dishName: string
  ) => {
    const targetTable = tables.find((t) => t.table_number === tableNumber);
    try {
      await api.sendCustomerRequest({
        table_id: targetTable?.id || 1,
        table_number: tableNumber,
        type: 'CALL_WAITER',
        label: `آشپزخانه: سفارش «${dishName}» میز ${tableNumber} آماده است!`,
        assigned_waiter: waiterName,
      });
      // Local update
      const newReq: CustomerRequestItem = {
        id: `call-kds-${Date.now()}`,
        table_id: targetTable?.id || 1,
        table_number: tableNumber,
        type: 'CALL_WAITER',
        label: `آشپزخانه: سفارش «${dishName}» میز ${tableNumber} آماده است! (${waiterName})`,
        status: 'PENDING',
        created_at: 'هم‌اکنون',
        assigned_waiter: waiterName,
      };
      setCustomerRequests((prev) => [newReq, ...prev]);
    } catch (err) {
      console.error('Failed to call waiter from kitchen:', err);
    }

    setNotifications((prev) => [
      {
        id: `notif-kds-${Date.now()}`,
        title: `فراخوان گارسون (${waiterName}) - میز ${tableNumber}`,
        message: `غذای «${dishName}» آماده تحویل است. لطفاً جهت تحویل به آشپزخانه مراجعه کنید.`,
        time: 'هم‌اکنون',
        type: 'URGENT',
        read: false,
        actionView: 'waiter',
      },
      ...prev,
    ]);
  };

  // --- POS CHECKOUT & BILL SETTLEMENT ---
  const handleSettleBill = async (
    tableId: number,
    paymentMethod: string,
    discountAmount: number,
    finalTotal: number,
    providedReceipt?: any
  ) => {
    const targetTable = tables.find((t) => t.id === tableId);
    const receipt = providedReceipt || {
      id: `REC-${Date.now()}`,
      table_number: targetTable?.table_number,
      payment_method: paymentMethod,
      discount: discountAmount,
      grand_total: finalTotal,
      timestamp: new Date().toISOString(),
    };

    try {
      await api.settleBill({
        receipt,
        table_id: tableId,
        customer_phone: currentCustomer?.phone,
      });

      // Mark orders of this table as completed
      setOrders((prev) =>
        prev.map((o) => (o.table_id === tableId ? { ...o, status: 'COMPLETED' } : o))
      );

      // Reset table current bill & move to CLEANING
      setTables((prev) =>
        prev.map((t) =>
          t.id === tableId
            ? {
                ...t,
                status: 'CLEANING',
                current_bill_total: 0,
                session_started_at: undefined,
              }
            : t
        )
      );
    } catch (err) {
      console.error('Failed to settle bill:', err);
    }

    setNotifications((prev) => [
      {
        id: `notif-settle-${Date.now()}`,
        title: `تسویه فاکتور میز ${tables.find((t) => t.id === tableId)?.table_number}`,
        message: `مبلغ ${finalTotal} افغانی از طریق ${paymentMethod} با موفقیت تسویه و رسید صادر شد.`,
        time: 'هم‌اکنون',
        type: 'SUCCESS',
        read: false,
        actionView: 'pos',
      },
      ...prev,
    ]);
  };

  // --- WAITER ORDERS & EDIT / CANCEL ---
  const handleSendWaiterOrder = async (
    tableId: number,
    guestName: string,
    cartItems: { menuItem: MenuItemData; seat: number; qty: number }[]
  ) => {
    const table = tables.find((t) => t.id === tableId);
    if (!table) return;

    const itemsForApi = cartItems.map(c => ({
      menu_item_id: c.menuItem.id,
      name: c.menuItem.name,
      quantity: c.qty,
      unit_price: c.menuItem.price,
      seat_number: c.seat,
    }));

    try {
      await api.placeOrder({
        table_id: tableId,
        table_number: table.table_number,
        source: 'WAITER',
        items: itemsForApi,
        waiter_name: currentUserStaff?.name,
      });

      // Local update
      const newOrderItems: OrderItemData[] = cartItems.map((c, idx) => ({
        id: `waiter-${Date.now()}-${idx}`,
        menu_item_id: c.menuItem.id,
        name: c.menuItem.name,
        seat_number: c.seat,
        quantity: c.qty,
        unit_price: c.menuItem.price,
        subtotal: c.menuItem.price * c.qty,
        course: 'COURSE_2',
        kitchen_status: 'NEW',
        notes: guestName ? `مهمان: ${guestName}` : undefined,
      }));

      const addedTotal = newOrderItems.reduce((acc, i) => acc + i.subtotal, 0);

      const newOrder: OrderData = {
        id: `ORD-${Date.now().toString().slice(-4)}`,
        order_number: Date.now().toString().slice(-4),
        table_id: tableId,
        table_number: table.table_number,
        source: 'WAITER',
        status: 'CONFIRMED',
        items: newOrderItems,
        created_at: 'هم‌اکنون',
        waiter_name: currentUserStaff?.name || 'فرهاد انوری',
      };

      setOrders([newOrder, ...orders]);

      setTables((prev) =>
        prev.map((t) =>
          t.id === tableId
            ? {
                ...t,
                status: 'OCCUPIED',
                current_bill_total: (t.current_bill_total || 0) + addedTotal,
                session_started_at: t.session_started_at || 'هم‌اکنون',
              }
            : t
        )
      );

      setNotifications([
        {
          id: `notif-${Date.now()}`,
          title: `سفارش جدید گارسون (میز ${table.table_number})`,
          message: `${newOrderItems.length} قلم سفارش به بخش‌های آشپزخانه ارسال شد.`,
          time: 'هم‌اکنون',
          type: 'SUCCESS',
          read: false,
          actionView: 'kds',
        },
        ...notifications,
      ]);
    } catch (err) {
      console.error('Failed to send order:', err);
    }
  };

  const handleUpdateOrderItem = (orderId: string, itemId: string, deltaQty: number, notes?: string) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;
        return {
          ...ord,
          items: ord.items.map((i) => {
            if (i.id !== itemId) return i;
            const newQ = Math.max(1, i.quantity + deltaQty);
            return {
              ...i,
              quantity: newQ,
              subtotal: i.unit_price * newQ,
              notes: notes !== undefined ? notes : i.notes,
            };
          }),
        };
      })
    );
  };

  const handleCancelOrderItem = (orderId: string, itemId: string) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;
        return {
          ...ord,
          items: ord.items.filter((i) => i.id !== itemId),
        };
      })
    );
  };

  const handleCancelWholeOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  // Change Table Status
  const handleChangeTableStatus = (tableId: number, status: TableItem['status']) => {
    setTables((prev) =>
      prev.map((t) => (t.id === tableId ? { ...t, status } : t))
    );
  };

  // Resolve Customer Request
  const handleResolveRequest = (reqId: string) => {
    setCustomerRequests((prev) =>
      prev.map((r) => (r.id === reqId ? { ...r, status: 'ATTENDED' } : r))
    );
  };

  // Handle Split bill payment success
  const handlePaymentSuccess = () => {
    if (!splitBillTable) return;
    setTables((prev) =>
      prev.map((t) =>
        t.id === splitBillTable.id
          ? { ...t, status: 'CLEANING', current_bill_total: 0 }
          : t
      )
    );
    setSplitBillTable(null);
    setSelectedTable(null);
    setCurrentView('tables');
  };

  // Toggle Device Block/Unblock
  const handleToggleBlockDevice = (deviceId: string) => {
    setDevices((prev) =>
      prev.map((d) =>
        d.id === deviceId
          ? { ...d, status: d.status === 'BLOCKED' ? 'ONLINE' : 'BLOCKED', is_suspicious: false }
          : d
      )
    );
  };

  // Broadcast Message to local devices
  const handleBroadcastMessage = async (msg: any) => {
    try {
      await api.saveState({ activeBroadcast: msg });
      setActiveAnnouncement(msg);
      setNotifications((prev) => [
        {
          id: `broadcast-${Date.now()}`,
          title: '📢 اعلام سراسری شبکه محلی',
          message: typeof msg === 'string' ? msg : msg.title,
          time: 'هم‌اکنون',
          type: 'INFO',
          read: false,
        },
        ...prev,
      ]);
    } catch (err) {
      console.error('Failed to broadcast:', err);
    }
  };

  // Simulate suspicious new device connection
  const handleSimulateNewDevice = (tableNumber: string) => {
    const targetTable = tables.find((t) => t.table_number === tableNumber);
    const isTableAvailable = !targetTable || targetTable.status === 'AVAILABLE';

    const newDev: DeviceItem = {
      id: `dev-${Date.now()}`,
      name: `گوشی هوشمند ناشناس (میز ${tableNumber})`,
      type: 'GUEST_MOBILE',
      ip_address: `192.168.10.${Math.floor(110 + Math.random() * 80)}`,
      assigned_to: `نشست میز ${tableNumber}`,
      status: 'ONLINE',
      last_active: 'هم‌اکنون',
      connected_table_number: tableNumber,
      is_suspicious: isTableAvailable,
    };

    setDevices((prev) => [newDev, ...prev]);

    if (isTableAvailable) {
      setNotifications((prev) => [
        {
          id: `warn-dev-${Date.now()}`,
          title: `⚠️ هشدار امنیتی: اتصال ناشناس به میز ${tableNumber}`,
          message: `دستگاه جدیدی به میز ${tableNumber} متصل شده در حالی که این میز خالی است! جهت جلوگیری از تقلب و مزاحمت دسترسی را قطع نمایید.`,
          time: 'هم‌اکنون',
          type: 'URGENT',
          read: false,
          actionView: 'devices',
        },
        ...prev,
      ]);
    }
  };

  // Menu Availability and Price updates
  const handleToggleAvailability = (itemId: number) => {
    setMenuItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, is_available: !i.is_available } : i))
    );
  };

  const handleUpdatePrice = (itemId: number, newPrice: number) => {
    setMenuItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, price: newPrice } : i))
    );
  };

  const handleAddMenuItem = (newItem: Omit<MenuItemData, 'id'>) => {
    const createdItem: MenuItemData = {
      ...newItem,
      id: Date.now(),
      rating: newItem.rating || 5.0,
      rating_count: newItem.rating_count || 1,
    };
    setMenuItems((prev) => [createdItem, ...prev]);
  };

  const handleUpdateMenuItem = (updatedItem: MenuItemData) => {
    setMenuItems((prev) =>
      prev.map((i) => (i.id === updatedItem.id ? updatedItem : i))
    );
  };

  const handleDeleteMenuItem = (itemId: number) => {
    setMenuItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  // Rate dish
  const handleRateDish = (dishId: number, stars: number) => {
    setMenuItems((prev) =>
      prev.map((i) => {
        if (i.id !== dishId) return i;
        const currentCount = i.rating_count || 30;
        const currentAvg = i.rating || 4.8;
        const newAvg = Number(((currentAvg * currentCount + stars) / (currentCount + 1)).toFixed(1));
        return {
          ...i,
          rating: newAvg,
          rating_count: currentCount + 1,
        };
      })
    );
  };

  // Simulate usage of inventory
  const handleSimulateUsage = (itemId: number, amount: number) => {
    setInventory((prev) =>
      prev.map((i) =>
        i.id === itemId
          ? {
              ...i,
              current_stock: Math.max(0, i.current_stock - amount),
              status: i.current_stock - amount <= i.minimum_stock ? 'LOW' : 'HEALTHY',
            }
          : i
      )
    );
  };

  // Staff CRUD
  const handleAddStaff = (newS: Omit<StaffData, 'id'>) => {
    setStaff((prev) => [{ ...newS, id: Date.now() }, ...prev]);
  };

  const handleUpdateStaff = (updatedS: StaffData) => {
    setStaff((prev) => prev.map((s) => (s.id === updatedS.id ? updatedS : s)));
  };

  const handleDeleteStaff = (staffId: number) => {
    setStaff((prev) => prev.filter((s) => s.id !== staffId));
  };

  // Customers CRUD
  const handleAddCustomer = (newC: Omit<CustomerData, 'id'>) => {
    setCustomers((prev) => [{ ...newC, id: Date.now() }, ...prev]);
  };

  const handleUpdateCustomer = (updatedC: CustomerData) => {
    setCustomers((prev) => prev.map((c) => (c.id === updatedC.id ? updatedC : c)));
  };

  // Manager Approval for Customer Tier Upgrade
  const handleApproveTierUpgrade = (customerId: number, targetTier: CustomerData['tier']) => {
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === customerId
          ? {
              ...c,
              tier: targetTier,
              pending_tier_upgrade: undefined,
              upgrade_requested_at: undefined,
              notes: (c.notes ? `${c.notes} | ` : '') + `ارتقاء به سطح ${targetTier} توسط مدیر تأیید شد.`,
            }
          : c
      )
    );

    const customer = customers.find((c) => c.id === customerId);
    setNotifications((prev) => [
      {
        id: `upgrade-${Date.now()}`,
        title: `🏆 تأیید ارتقاء سطح مشتری (${customer?.name || 'مشتری'})`,
        message: `سطح عضویت مشتری «${customer?.name}» به ${targetTier} ارتقاء یافت و مزایای جدید برای ایشان فعال شد.`,
        time: 'هم‌اکنون',
        type: 'SUCCESS',
        read: false,
        actionView: 'customers',
      },
      ...prev,
    ]);
  };

  const handleRejectTierUpgrade = (customerId: number) => {
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === customerId
          ? {
              ...c,
              pending_tier_upgrade: undefined,
              upgrade_requested_at: undefined,
            }
          : c
      )
    );
  };

  // Open notification handler
  const handleOpenNotification = (item: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
    );
    if (item.actionView) {
      setCurrentView(item.actionView);
    }
  };

  // Determine default login tab from URL
  const getDefaultLoginTab = (): 'STAFF' | 'SUPERUSER' | 'GUEST' => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('staffLogin')) return 'STAFF';
      if (params.get('table')) return 'GUEST';
    }
    return 'SUPERUSER';
  };

  if (!isAuthenticated) {
    return (
      <LoginView
        staffList={staff}
        tables={tables}
        onLoginSuperuser={handleLoginSuperuser}
        onLoginStaff={handleLoginStaff}
        onGuestEnter={handleGuestEnter}
        restaurantName={settings.restaurant_name}
        pointsUnit={settings.loyalty_points_unit}
        defaultTab={userRole === 'CUSTOMER' ? 'GUEST' : getDefaultLoginTab()}
      />
    );
  }

  return (
    <div
      className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans selection:bg-slate-900 selection:text-white"
      dir={currentLang === 'en' ? 'ltr' : 'rtl'}
    >
      {/* System-Wide Active Broadcast Alert Banner (Visible for Staff) */}
      {activeAnnouncement && userRole !== 'CUSTOMER' && (
        <div className="bg-slate-900 text-white px-6 py-3 flex items-center justify-between text-xs shadow-xl z-40 border-b border-white/5">
          <div className="flex items-center gap-3 font-black max-w-4xl mx-auto truncate tracking-tight uppercase">
            <Radio className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
            <span className="truncate">{typeof activeAnnouncement === 'string' ? activeAnnouncement : activeAnnouncement.title}</span>
          </div>
          <button
            onClick={() => handleBroadcastMessage(null)}
            className="text-white/40 hover:text-white p-1 transition-colors"
            title="بستن اعلام"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Customer Mobile QR App Mode (Fully Isolated & App-like) */}
      {userRole === 'CUSTOMER' ? (
        <div className="flex-1 flex flex-col min-h-screen bg-white overflow-x-hidden">
          <main className="flex-1 flex flex-col">
            {splitBillTable ? (
              <div className="p-4 flex-1">
                <SplitBillView
                  table={splitBillTable}
                  onClose={() => setSplitBillTable(null)}
                  onSuccessPayment={handlePaymentSuccess}
                />
              </div>
            ) : (
              <CustomerView
                menuItems={menuItems}
                tables={tables}
                currentTableId={customerTableId}
                orders={orders}
                pointsUnit={settings.loyalty_points_unit}
                activeAnnouncement={activeAnnouncement}
                onRateDish={handleRateDish}
                currentLang={currentLang}
                onOpenProfile={() => setProfileModalOpen(true)}
                onLogout={handleLogout}
                onSendOrder={async (tableId, cartItems, guestInfo) => {
                  const targetTable = tables.find((t) => t.id === tableId) || tables[0];
                  
                  const itemsForApi = cartItems.map(c => ({
                    menu_item_id: c.item.id,
                    name: c.item.name,
                    quantity: c.qty,
                    unit_price: c.item.price,
                    seat_number: c.seat,
                  }));

                  try {
                    await api.placeOrder({
                      table_id: tableId,
                      table_number: targetTable.table_number,
                      source: 'CUSTOMER_QR',
                      items: itemsForApi,
                      guest_info: guestInfo,
                    });
                    
                    // SSE will trigger state refresh
                    setNotifications(prev => [
                      {
                        id: `notif-${Date.now()}`,
                        title: `سفارش جدید میز ${targetTable.table_number}`,
                        message: `مهمان میز ${targetTable.table_number} سفارش جدید ثبت کرد.`,
                        time: 'هم‌اکنون',
                        type: 'INFO',
                        read: false,
                        actionView: 'orders',
                      },
                      ...prev
                    ]);
                  } catch (err) {
                    console.error('Failed to send customer order:', err);
                  }
                }}
                onCallWaiter={async (label, tblNum, tblId) => {
                  const targetT = tables.find((t) => t.id === tblId);
                  const assignedW = targetT?.assigned_waiter_name || targetT?.waiter_name || 'فرهاد انوری';

                  try {
                    await api.sendCustomerRequest({
                      table_id: tblId,
                      table_number: tblNum,
                      type: label.includes('آب') ? 'WATER' : label.includes('صورتحساب') ? 'BILL' : 'CALL_WAITER',
                      label: `درخواست ${label} مهمان میز ${tblNum}`,
                      assigned_waiter: assignedW,
                    });
                  } catch (err) {
                    console.error('Failed to send request:', err);
                  }
                }}
              />
            )}
          </main>
        </div>
      ) : (
        /* Unified Operations Platform */
        <div className="flex-1 flex min-h-0">
          {sidebarOpen && (
            <div
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-30 lg:hidden"
            />
          )}

          <Sidebar
            currentView={currentView}
            onSelectView={(v) => {
              setCurrentView(v);
              setSidebarOpen(false);
              setSplitBillTable(null);
            }}
            onLogout={handleLogout}
            userRole={userRole}
            isOpen={sidebarOpen}
            lang={currentLang}
          />

          <div className="flex-1 flex flex-col min-w-0">
            <Topbar
              onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
              userRole={userRole}
              onChangeRole={handleRoleChange}
              notifications={notifications}
              onOpenNotification={handleOpenNotification}
              activeView={currentView}
              lang={currentLang}
              onLanguageChange={setCurrentLang}
              backendStatus={backendStatus}
              backendMessage={backendMessage}
              onOpenBackendModal={() => setShowBackendModal(true)}
              userName={currentUserStaff?.name || currentUser?.name}
              onOpenProfile={() => setProfileModalOpen(true)}
              isSuperUser={currentUser?.is_superuser}
              onLogout={handleLogout}
            />

            <main className="flex-1 p-6 lg:p-12 overflow-y-auto no-scrollbar bg-[#F8FAFC]">
              {splitBillTable ? (
                <SplitBillView
                  table={splitBillTable}
                  onClose={() => setSplitBillTable(null)}
                  onSuccessPayment={handlePaymentSuccess}
                />
              ) : currentView === 'dashboard' ? (
                <DashboardView
                  tables={tables}
                  orders={orders}
                  inventory={inventory}
                  menuItems={menuItems}
                  customers={customers}
                  receipts={receipts}
                  onNavigate={setCurrentView}
                  onSelectTable={(table) => {
                    setSelectedTable(table);
                    setCurrentView('tables');
                  }}
                  onQuickOrder={async (tblId, cartList) => {
                    const targetTable = tables.find((t) => t.id === tblId) || tables[0];
                    if (!targetTable) return;
                    const itemsForApi = cartList.map((c) => ({
                      menu_item_id: c.item.id,
                      name: c.item.name,
                      quantity: c.qty,
                      unit_price: c.item.price,
                      seat_number: 1,
                    }));
                    try {
                      await api.placeOrder({
                        table_id: targetTable.id,
                        table_number: targetTable.table_number,
                        source: 'POS',
                        items: itemsForApi,
                        waiter_name: currentUserStaff?.name || 'مدیر سیستم',
                      });
                      fetchFullState();
                    } catch (err) {
                      console.error('Quick order error:', err);
                    }
                  }}
                />
              ) : currentView === 'tables' ? (
                <TablesView
                  tables={tables}
                  orders={orders}
                  staff={staff}
                  onSelectTable={setSelectedTable}
                  onOpenPosForTable={(table) => {
                    setSelectedTable(table);
                    setCurrentView('pos');
                  }}
                  onOpenSplitBillForTable={(table) => {
                    setSplitBillTable(table);
                  }}
                  selectedTable={selectedTable}
                  onCloseDrawer={() => setSelectedTable(null)}
                  onAddTable={handleAddTable}
                  onUpdateTable={handleUpdateTable}
                  onDeleteTable={handleDeleteTable}
                  onBatchAssignWaiter={handleBatchAssignWaiter}
                />
              ) : currentView === 'waiter' ? (
                <WaiterView
                  tables={tables}
                  menuItems={menuItems}
                  customerRequests={customerRequests}
                  orders={orders}
                  currentWaiterName={currentUserStaff?.name || 'فرهاد انوری'}
                  onResolveRequest={handleResolveRequest}
                  onSendWaiterOrder={handleSendWaiterOrder}
                  onUpdateOrderItem={handleUpdateOrderItem}
                  onCancelOrderItem={handleCancelOrderItem}
                  onCancelWholeOrder={handleCancelWholeOrder}
                  onOpenSplitBill={(table) => setSplitBillTable(table)}
                  onChangeTableStatus={handleChangeTableStatus}
                  onOpenProfile={() => setProfileModalOpen(true)}
                />
              ) : currentView === 'pos' ? (
                <PosView
                  menuItems={menuItems}
                  tables={tables}
                  orders={orders}
                  initialTable={selectedTable}
                  customers={customers}
                  tierBenefits={tierBenefits}
                  onSettleBill={handleSettleBill}
                  onGoToSplitBill={(table) => {
                    setSplitBillTable(table);
                  }}
                  onOpenProfile={() => setProfileModalOpen(true)}
                />
              ) : currentView === 'orders' ? (
                <OrdersView
                  orders={orders}
                  tables={tables}
                  onNavigateToPos={() => setCurrentView('pos')}
                  onSelectTableForPos={(tblId) => {
                    const tObj = tables.find((t) => t.id === tblId);
                    if (tObj) setSelectedTable(tObj);
                    setCurrentView('pos');
                  }}
                />
              ) : currentView === 'kds' ? (
                <KdsView
                  orders={orders}
                  tables={tables}
                  onUpdateItemStatus={handleUpdateKitchenStatus}
                  onCallWaiterFromKitchen={handleCallWaiterFromKitchen}
                  kitchenStages={kitchenStages}
                  onUpdateKitchenStages={setKitchenStages}
                  onOpenProfile={() => setProfileModalOpen(true)}
                />
              ) : currentView === 'menu' ? (
                <MenuView
                  menuItems={menuItems}
                  pointsUnit={settings.loyalty_points_unit}
                  onToggleAvailability={handleToggleAvailability}
                  onUpdatePrice={handleUpdatePrice}
                  onAddMenuItem={handleAddMenuItem}
                  onUpdateMenuItem={handleUpdateMenuItem}
                  onDeleteMenuItem={handleDeleteMenuItem}
                />
              ) : currentView === 'inventory' ? (
                <InventoryView
                  inventory={inventory}
                  onSimulateUsage={handleSimulateUsage}
                />
              ) : currentView === 'customers' ? (
                <CrmView
                  customers={customers}
                  tierBenefits={tierBenefits}
                  onAddCustomer={handleAddCustomer}
                  onUpdateCustomer={handleUpdateCustomer}
                  onUpdateTierBenefits={setTierBenefits}
                  onApproveUpgrade={handleApproveTierUpgrade}
                  onRejectUpgrade={handleRejectTierUpgrade}
                  onOpenProfile={() => setProfileModalOpen(true)}
                />
              ) : currentView === 'staff' ? (
                <StaffView
                  staff={staff}
                  onAddStaff={handleAddStaff}
                  onUpdateStaff={handleUpdateStaff}
                  onDeleteStaff={handleDeleteStaff}
                  onOpenProfile={() => setProfileModalOpen(true)}
                />
              ) : currentView === 'reports' ? (
                <ReportsView receipts={receipts} />
              ) : currentView === 'devices' ? (
                <DevicesView
                  devices={devices}
                  tables={tables}
                  onToggleBlock={handleToggleBlockDevice}
                  onBroadcastMessage={handleBroadcastMessage}
                  onSimulateNewDevice={handleSimulateNewDevice}
                />
              ) : currentView === 'settings' ? (
                <SettingsView
                  currentLang={currentLang}
                  onLanguageChange={setCurrentLang}
                  tables={tables}
                  tierBenefits={tierBenefits}
                  onUpdateTierBenefits={setTierBenefits}
                  settings={settings}
                  onSaveSettings={async (newSettings) => {
                    const res = await api.saveSettings(newSettings);
                    if (res.success) setSettings(res.data);
                  }}
                  onCleanReset={async (pass) => {
                    const res = await api.resetClean(pass);
                    if (res.success) await fetchFullState();
                  }}
                />
              ) : (
                <DashboardView
                  tables={tables}
                  orders={orders}
                  inventory={inventory}
                  menuItems={menuItems}
                  customers={customers}
                  receipts={receipts}
                  onNavigate={setCurrentView}
                  onSelectTable={(table) => {
                    setSelectedTable(table);
                    setCurrentView('tables');
                  }}
                />
              )}
            </main>
          </div>
        </div>
      )}

      {/* Global Profile Modal (View & Edit Profile for all Roles & Customers) */}
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        userRole={userRole}
        currentUserStaff={currentUserStaff}
        onUpdateStaffProfile={(updated) => {
          handleUpdateStaff(updated);
        }}
        onUpdateAttendance={async (id, status, time) => {
          await api.updateAttendance(id, status, time);
        }}
        currentCustomer={currentCustomer}
        onUpdateCustomerProfile={(updated) => {
          setCurrentCustomer(updated);
          handleUpdateCustomer(updated);
        }}
        tierBenefits={tierBenefits}
      />

      {/* Table QR Stand Generator & Print Station Modal */}
      <TableQrModal
        isOpen={globalQrModalOpen}
        onClose={() => setGlobalQrModalOpen(false)}
        tables={tables}
        selectedTableId={globalQrTableId}
        onSelectTable={(tableId) => {
          setCustomerTableId(tableId);
          setUserRole('CUSTOMER');
        }}
      />

      {/* Backend Connection Diagnostics & Local Setup Modal */}
      <BackendStatusModal
        isOpen={showBackendModal}
        onClose={() => setShowBackendModal(false)}
        status={backendStatus}
        message={backendMessage}
        onRecheck={checkBackendConnection}
      />
    </div>
  );
}
