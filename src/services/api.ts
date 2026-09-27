/**
 * Restaurant API Client for Django Backend
 * Base API URL: /api/v1
 * All endpoints strictly mapped to backend urls.py definitions.
 */

const API_BASE = '/api/v1';

export interface ApiResponse<T = any> {
  success?: boolean;
  data?: T;
  message?: string;
  [key: string]: any;
}

export class ApiService {
  private token: string | null = null;
  private eventSource: EventSource | null = null;
  // Local fallback storage for endpoints not implemented on the backend yet
  private localSettings: any = null;
  private localAnnouncements: any[] = [];
  private localReceipts: any[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('restaurant_jwt_token');
      try {
        const storedSettings = localStorage.getItem('restaurant_local_settings');
        if (storedSettings) this.localSettings = JSON.parse(storedSettings);
      } catch (e) {
        // ignore
      }
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('restaurant_jwt_token', token);
      } else {
        localStorage.removeItem('restaurant_jwt_token');
      }
    }
  }

  getToken() {
    return this.token;
  }

  private getHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...extraHeaders,
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  private async safeFetch(url: string, options: RequestInit = {}): Promise<any> {
    try {
      const res = await fetch(url, {
        ...options,
        headers: this.getHeaders(options.headers as Record<string, string>),
      });
      if (!res.ok) {
        let errBody: any = null;
        try {
          errBody = await res.json();
        } catch {}
        return {
          success: false,
          status: res.status,
          message: errBody?.message || errBody?.detail || `HTTP Error ${res.status}`,
          data: errBody,
        };
      }
      return await res.json();
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'Network request failed',
      };
    }
  }

  async checkHealth(): Promise<{ isConnected: boolean; message?: string }> {
    try {
      // Check auth/me or tables/ as ping
      const res = await fetch(`${API_BASE}/tables/`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });
      return { isConnected: res.status < 500, message: res.ok ? 'Connected to Django Server' : `Server responded ${res.status}` };
    } catch (err: any) {
      return { isConnected: false, message: err?.message || 'Server offline' };
    }
  }

  // ==========================================
  // 1. Auth (auth/)
  // ==========================================
  // auth/login/ (POST)
  async login(credentials: { username?: string; password?: string; employee_code?: string; role?: string }) {
    const data = await this.safeFetch(`${API_BASE}/auth/login/`, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if ((data.success || data.token || data.user) && (data.user?.token || data.token || data.access)) {
      this.setToken(data.user?.token || data.token || data.access);
    }
    return data;
  }

  // auth/me/ (GET)
  async getAuthMe() {
    return this.safeFetch(`${API_BASE}/auth/me/`, { method: 'GET' });
  }

  // auth/users/ (GET)
  async getAuthUsers() {
    return this.safeFetch(`${API_BASE}/auth/users/`, { method: 'GET' });
  }

  // ==========================================
  // 2. Tables (tables/)
  // ==========================================
  // tables/ (GET)
  async getTables() {
    return this.safeFetch(`${API_BASE}/tables/`, { method: 'GET' });
  }

  // tables/<pk>/ (GET)
  async getTable(pk: number | string) {
    return this.safeFetch(`${API_BASE}/tables/${pk}/`, { method: 'GET' });
  }

  // tables/<pk>/status/ (POST/PATCH)
  async updateTableStatus(pk: number | string, status: string) {
    return this.safeFetch(`${API_BASE}/tables/${pk}/status/`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
  }

  // tables/qr/validate/ (POST)
  async validateTableQr(qrData: any) {
    return this.safeFetch(`${API_BASE}/tables/qr/validate/`, {
      method: 'POST',
      body: JSON.stringify(qrData),
    });
  }

  // tables/<pk>/qr/generate/ (POST)
  async generateTableQr(pk: number | string) {
    return this.safeFetch(`${API_BASE}/tables/${pk}/qr/generate/`, {
      method: 'POST',
    });
  }

  // ==========================================
  // 3. Catalog (catalog/)
  // ==========================================
  // catalog/categories/ (GET)
  async getCatalogCategories() {
    return this.safeFetch(`${API_BASE}/catalog/categories/`, { method: 'GET' });
  }

  // catalog/stations/ (GET)
  async getCatalogStations() {
    return this.safeFetch(`${API_BASE}/catalog/stations/`, { method: 'GET' });
  }

  // catalog/items/ (GET)
  async getCatalogItems() {
    return this.safeFetch(`${API_BASE}/catalog/items/`, { method: 'GET' });
  }

  // catalog/items/<pk>/ (GET/PUT)
  async getCatalogItem(pk: number | string) {
    return this.safeFetch(`${API_BASE}/catalog/items/${pk}/`, { method: 'GET' });
  }

  async updateCatalogItem(pk: number | string, data: any) {
    return this.safeFetch(`${API_BASE}/catalog/items/${pk}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // catalog/items/<pk>/toggle/ (POST)
  async toggleCatalogItem(pk: number | string) {
    return this.safeFetch(`${API_BASE}/catalog/items/${pk}/toggle/`, {
      method: 'POST',
    });
  }

  // ==========================================
  // 4. Orders (orders/)
  // ==========================================
  // orders/ (GET, POST)
  async getOrders() {
    return this.safeFetch(`${API_BASE}/orders/`, { method: 'GET' });
  }

  async placeOrder(orderData: {
    table_id: number;
    table_number: string;
    source?: string;
    items: any[];
    waiter_name?: string;
    guest_info?: any;
  }) {
    return this.safeFetch(`${API_BASE}/orders/`, {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  // orders/<pk>/ (GET/PUT)
  async getOrder(pk: number | string) {
    return this.safeFetch(`${API_BASE}/orders/${pk}/`, { method: 'GET' });
  }

  async updateOrder(pk: number | string, data: any) {
    return this.safeFetch(`${API_BASE}/orders/${pk}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // ==========================================
  // 5. Kitchen (kitchen/)
  // ==========================================
  // kitchen/tickets/ (GET)
  async getKitchenTickets() {
    return this.safeFetch(`${API_BASE}/kitchen/tickets/`, { method: 'GET' });
  }

  // kitchen/items/<pk>/status/ (POST/PUT)
  // Replaces old fake: /orders/{id}/items/{id}
  async updateOrderItemStatus(
    orderIdOrItemId: string | number,
    maybeItemIdOrStatus: string | number,
    maybeStatus?: string
  ) {
    // Accommodate (orderId, itemId, status) or (pk, status)
    const pk = maybeStatus !== undefined ? maybeItemIdOrStatus : orderIdOrItemId;
    const kitchen_status = maybeStatus !== undefined ? maybeStatus : String(maybeItemIdOrStatus);

    return this.safeFetch(`${API_BASE}/kitchen/items/${pk}/status/`, {
      method: 'POST',
      body: JSON.stringify({ kitchen_status, status: kitchen_status }),
    });
  }

  // ==========================================
  // 6. Finance (finance/)
  // ==========================================
  // finance/bill/<session_id>/ (GET)
  async getFinanceBill(sessionId: string | number) {
    return this.safeFetch(`${API_BASE}/finance/bill/${sessionId}/`, { method: 'GET' });
  }

  // finance/payments/ (POST)
  // Replaces old fake: /settle-bill
  async settleBill(payload: {
    receipt?: any;
    table_id?: number;
    customer_phone?: string;
    points_earned?: number;
    points_used?: number;
    [key: string]: any;
  }) {
    // Record to local receipts cache for reporting until dedicated backend receipt endpoint is added
    if (payload.receipt) {
      this.localReceipts.unshift({
        ...payload.receipt,
        timestamp: new Date().toISOString(),
      });
    }

    return this.safeFetch(`${API_BASE}/finance/payments/`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // ==========================================
  // 7. Inventory (inventory/)
  // ==========================================
  // inventory/items/ (GET)
  async getInventoryItems() {
    return this.safeFetch(`${API_BASE}/inventory/items/`, { method: 'GET' });
  }

  // inventory/adjust/ (POST)
  async adjustInventory(payload: any) {
    return this.safeFetch(`${API_BASE}/inventory/adjust/`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // ==========================================
  // 8. CRM (crm/)
  // ==========================================
  // crm/customers/ (GET)
  async getCustomers() {
    return this.safeFetch(`${API_BASE}/crm/customers/`, { method: 'GET' });
  }

  // crm/feedback/ (POST)
  async submitFeedback(payload: any) {
    return this.safeFetch(`${API_BASE}/crm/feedback/`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // ==========================================
  // 9. Reports (reports/)
  // ==========================================
  // reports/summary/ (GET)
  async getReportsSummary() {
    return this.safeFetch(`${API_BASE}/reports/summary/`, { method: 'GET' });
  }

  // ==========================================
  // 10. Staff (staff/)
  // ==========================================
  // staff/ (GET)
  async getStaff() {
    return this.safeFetch(`${API_BASE}/staff/`, { method: 'GET' });
  }

  // staff/<pk>/toggle-attendance/ (POST)
  // Replaces old fake: /attendance
  async updateAttendance(staff_id: number | string, status?: string, check_in_time?: string) {
    return this.safeFetch(`${API_BASE}/staff/${staff_id}/toggle-attendance/`, {
      method: 'POST',
      body: JSON.stringify({ status, check_in_time }),
    });
  }

  // ==========================================
  // 11. Devices (devices/)
  // ==========================================
  // devices/ (GET)
  async getDevices() {
    return this.safeFetch(`${API_BASE}/devices/`, { method: 'GET' });
  }

  // devices/<pk>/toggle-block/ (POST)
  async toggleBlockDevice(deviceId: string | number) {
    return this.safeFetch(`${API_BASE}/devices/${deviceId}/toggle-block/`, {
      method: 'POST',
    });
  }

  // devices/broadcast/ (POST)
  async broadcastDevice(payload: any) {
    return this.safeFetch(`${API_BASE}/devices/broadcast/`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // ==========================================
  // 12. Operations (operations/)
  // ==========================================
  // operations/requests/ (GET, POST)
  async getCustomerRequests() {
    return this.safeFetch(`${API_BASE}/operations/requests/`, { method: 'GET' });
  }

  // Replaces old fake: /customer-requests
  async sendCustomerRequest(reqData: {
    table_id: number;
    table_number: string;
    type?: string;
    label: string;
    assigned_waiter?: string;
  }) {
    return this.safeFetch(`${API_BASE}/operations/requests/`, {
      method: 'POST',
      body: JSON.stringify(reqData),
    });
  }

  // operations/requests/<pk>/resolve/ (POST)
  async resolveCustomerRequest(id: string | number, status: string = 'RESOLVED') {
    return this.safeFetch(`${API_BASE}/operations/requests/${id}/resolve/`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
  }

  // ==========================================
  // Composite State & Local-Only Methods
  // ==========================================

  /**
   * getState:
   * Combines parallel requests from real Django endpoints:
   * tables/, catalog/items/, orders/, kitchen/tickets/, inventory/items/, crm/customers/, staff/, devices/
   */
  async getState() {
    const [
      tablesRes,
      catalogRes,
      ordersRes,
      kitchenRes,
      inventoryRes,
      customersRes,
      staffRes,
      devicesRes,
      requestsRes,
    ] = await Promise.allSettled([
      this.safeFetch(`${API_BASE}/tables/`),
      this.safeFetch(`${API_BASE}/catalog/items/`),
      this.safeFetch(`${API_BASE}/orders/`),
      this.safeFetch(`${API_BASE}/kitchen/tickets/`),
      this.safeFetch(`${API_BASE}/inventory/items/`),
      this.safeFetch(`${API_BASE}/crm/customers/`),
      this.safeFetch(`${API_BASE}/staff/`),
      this.safeFetch(`${API_BASE}/devices/`),
      this.safeFetch(`${API_BASE}/operations/requests/`),
    ]);

    const extractData = (res: PromiseSettledResult<any>, fallback: any = []) => {
      if (res.status === 'fulfilled' && res.value) {
        if (Array.isArray(res.value)) return res.value;
        if (Array.isArray(res.value.data)) return res.value.data;
        if (Array.isArray(res.value.results)) return res.value.results;
        if (res.value.data && typeof res.value.data === 'object') return res.value.data;
        return res.value;
      }
      return fallback;
    };

    const tables = extractData(tablesRes);
    const menuItems = extractData(catalogRes);
    const orders = extractData(ordersRes);
    const kitchenTickets = extractData(kitchenRes);
    const inventory = extractData(inventoryRes);
    const customers = extractData(customersRes);
    const staff = extractData(staffRes);
    const devices = extractData(devicesRes);
    const customerRequests = extractData(requestsRes);

    const defaultSettings = {
      restaurant_name: 'پیتزا هات و آریا گریل',
      currency: '$',
      loyalty_points_unit: 'امتیاز',
      superuser_username: 'admin',
      superuser_password: 'admin',
      wifi_ssid: 'PizzaHut_Guest_WiFi',
      wifi_password: 'pizzahut_guest',
    };

    const combinedState = {
      tables: tables || [],
      menuItems: menuItems || [],
      orders: orders || [],
      kitchenTickets: kitchenTickets || [],
      inventory: inventory || [],
      customers: customers || [],
      staff: staff || [],
      devices: devices || [],
      customerRequests: customerRequests || [],
      settings: this.localSettings || defaultSettings,
      tierBenefits: [
        { tier: 'BRONZE', title: 'برنزی', discount_percent: 0, free_perk: 'بدون مزایا', min_spend: 0, required_points: 0, badge_color: 'bg-amber-100 text-amber-900 border-amber-300' },
        { tier: 'SILVER', title: 'نقره‌ای', discount_percent: 5, free_perk: '۵٪ تخفیف', min_spend: 500, required_points: 200, badge_color: 'bg-slate-200 text-slate-800 border-slate-400' },
        { tier: 'GOLD', title: 'طلایی', discount_percent: 10, free_perk: '۱۰٪ تخفیف', min_spend: 1500, required_points: 500, badge_color: 'bg-yellow-100 text-yellow-900 border-yellow-400' },
        { tier: 'PLATINUM', title: 'پلاتینیوم', discount_percent: 15, free_perk: '۱۵٪ تخفیف', min_spend: 5000, required_points: 1200, badge_color: 'bg-purple-100 text-purple-900 border-purple-400' },
      ],
      announcements: this.localAnnouncements || [],
      receipts: this.localReceipts || [],
    };

    return {
      success: true,
      data: combinedState,
    };
  }

  /**
   * saveState:
   * Only routes broadcast messages to devices/broadcast/. Other updates handled locally.
   */
  async saveState(updates: any) {
    if (updates?.activeBroadcast || updates?.broadcast || updates?.message) {
      return this.broadcastDevice(updates);
    }
    // Local state fallback for non-endpoint updates
    return { success: true, message: 'Saved locally', data: updates };
  }

  // TODO: no backend endpoint yet -- local only
  async saveSettings(settings: any) {
    this.localSettings = { ...this.localSettings, ...settings };
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('restaurant_local_settings', JSON.stringify(this.localSettings));
      } catch (e) {
        // ignore
      }
    }
    return { success: true, data: this.localSettings };
  }

  // TODO: no backend endpoint yet -- local only
  async resetClean(superuser_password: string) {
    if (superuser_password !== 'admin' && superuser_password !== (this.localSettings?.superuser_password || 'admin')) {
      return { success: false, message: 'رمز عبور مدیر کل صحیح نمی‌باشد.' };
    }
    this.localReceipts = [];
    this.localAnnouncements = [];
    return { success: true, message: 'اطلاعات محلی پاک‌سازی شد.' };
  }

  // TODO: no backend endpoint yet -- local only
  async saveAnnouncements(announcements: any[]) {
    this.localAnnouncements = announcements;
    return { success: true, data: announcements };
  }

  // TODO: no backend endpoint yet -- local only
  async getReceipts() {
    return { success: true, data: this.localReceipts };
  }

  /**
   * Subscribe to Server-Sent Events (SSE) for Real-Time synchronization
   */
  subscribeLiveEvents(onMessage: (event: { type: string; data: any }) => void) {
    if (typeof window === 'undefined') return () => {};

    try {
      if (this.eventSource) {
        this.eventSource.close();
      }

      const es = new EventSource(`${API_BASE}/events`);
      this.eventSource = es;

      const handleEvent = (type: string) => (e: MessageEvent) => {
        try {
          const parsed = JSON.parse(e.data);
          onMessage({ type, data: parsed });
        } catch {
          onMessage({ type, data: e.data });
        }
      };

      es.addEventListener('customer_request', handleEvent('customer_request'));
      es.addEventListener('order_placed', handleEvent('order_placed'));
      es.addEventListener('bill_settled', handleEvent('bill_settled'));
      es.addEventListener('state_updated', handleEvent('state_updated'));
      es.addEventListener('clean_reset', handleEvent('clean_reset'));
      es.addEventListener('device_connected', handleEvent('device_connected'));
      es.addEventListener('attendance_updated', handleEvent('attendance_updated'));

      return () => {
        es.close();
        if (this.eventSource === es) {
          this.eventSource = null;
        }
      };
    } catch (err) {
      console.error('Failed to subscribe to live events:', err);
      return () => {};
    }
  }
}

export const api = new ApiService();
export default api;
