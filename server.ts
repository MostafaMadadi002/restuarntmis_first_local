import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const DB_FILE = path.resolve(__dirname, 'data', 'app_db.json');

// Ensure data folder exists
const dataDir = path.resolve(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initial Clean Default State
const DEFAULT_INITIAL_STATE = {
  settings: {
    restaurant_name: 'پیتزا هات و آریا گریل',
    currency: '$',
    loyalty_points_unit: 'امتیاز',
    superuser_username: 'admin',
    superuser_password: 'admin',
    wifi_ssid: 'PizzaHut_Guest_WiFi',
    wifi_password: 'pizzahut_guest',
  },
  tables: [
    {
      id: 1,
      table_number: '01',
      name_label: 'میز ۱ (سالن VIP)',
      section_name: 'سالن VIP',
      section: 'VIP',
      capacity: 4,
      status: 'AVAILABLE',
      current_bill_total: 0,
      assigned_waiter_id: 3,
      assigned_waiter_name: 'فرهاد انوری',
    },
    {
      id: 2,
      table_number: '02',
      name_label: 'میز ۲ (سالن اصلی)',
      section_name: 'سالن اصلی',
      section: 'MAIN',
      capacity: 2,
      status: 'OCCUPIED',
      current_bill_total: 120,
      session_started_at: '۱۰ دقیقه پیش',
      assigned_waiter_id: 3,
      assigned_waiter_name: 'فرهاد انوری',
    },
    {
      id: 3,
      table_number: '03',
      name_label: 'میز ۳ (تراس روباز)',
      section_name: 'تراس',
      section: 'TERRACE',
      capacity: 6,
      status: 'OCCUPIED',
      current_bill_total: 70,
      session_started_at: '۲۵ دقیقه پیش',
      assigned_waiter_id: 3,
      assigned_waiter_name: 'فرهاد انوری',
    },
    {
      id: 4,
      table_number: '04',
      name_label: 'میز ۴ (سالن اصلی)',
      section_name: 'سالن اصلی',
      section: 'MAIN',
      capacity: 4,
      status: 'AVAILABLE',
      current_bill_total: 0,
      assigned_waiter_id: 3,
      assigned_waiter_name: 'فرهاد انوری',
    },
    {
      id: 5,
      table_number: '05',
      name_label: 'میز ۵ (بخش خانوادگی)',
      section_name: 'خانوادگی',
      section: 'FAMILY',
      capacity: 8,
      status: 'RESERVED',
      current_bill_total: 0,
    },
    {
      id: 6,
      table_number: '06',
      name_label: 'میز ۶ (فضای باز)',
      section_name: 'فضای باز',
      section: 'TERRACE',
      capacity: 2,
      status: 'CLEANING',
      current_bill_total: 0,
    },
  ],
  menuItems: [
    {
      id: 1,
      name: 'Neapolitan Pizza.',
      name_en: 'Neapolitan Pizza.',
      name_ps: 'نیپولیټن پیزا',
      description: 'پیتزای اصیل ایتالیایی با خمیر نازک ناپولیتن، پنیر موزارلا تازه بوفالو، ریحان خوش‌عطر و سس گوجه فرنگی سنتی',
      price: 50,
      category_id: 1,
      category_name: 'Pizza',
      image: '/src/assets/images/neapolitan_pizza_1790494621915.jpg',
      is_available: true,
      station: 'پیتزا و فست‌فود',
      rating: 4.5,
      rating_count: 25,
      loyalty_points_reward: 15,
    },
    {
      id: 2,
      name: 'California Pizza.',
      name_en: 'California Pizza.',
      name_ps: 'کالیفورنیا پیزا',
      description: 'پیتزای مدرن کالیفرنیایی با سینه مرغ گریل شده، فلفل دلمه‌ای رنگی، سبزیجات تازه معطر و پنیر گودا',
      price: 80,
      category_id: 1,
      category_name: 'Pizza',
      image: '/src/assets/images/california_pizza_1790494635802.jpg',
      is_available: true,
      station: 'پیتزا و فست‌فود',
      rating: 4.3,
      rating_count: 20,
      loyalty_points_reward: 20,
    },
    {
      id: 3,
      name: 'Sicilian Pizza.',
      name_en: 'Sicilian Pizza.',
      name_ps: 'سیسیلی پیزا',
      description: 'پیتزای ضخیم و کرانچی سبک سیسیل با کناره‌های ترد طلایی، سس مارینارا دست‌ساز و پنیر پارمزان و موزارلا کشسانی',
      price: 70,
      category_id: 1,
      category_name: 'Pizza',
      image: '/src/assets/images/sicilian_pizza_1790494650212.jpg',
      is_available: true,
      station: 'پیتزا و فست‌فود',
      rating: 4.2,
      rating_count: 23,
      loyalty_points_reward: 18,
    },
    {
      id: 4,
      name: 'Starbuck salad',
      name_en: 'Starbuck salad',
      name_ps: 'سټاربک سلاد',
      description: 'سالاد گاردن تازه و رژیمی با کاهو پیچ فرانسوی، فیله مرغ تنوری، گوجه گیلاسی، زیتون سیاه و سس مخصوص',
      price: 20,
      category_id: 2,
      category_name: 'Salad',
      image: '/src/assets/images/dish_dessert_cake_1790490513891.jpg',
      is_available: true,
      station: 'سالاد و پیش‌غذا',
      rating: 4.6,
      rating_count: 18,
      loyalty_points_reward: 8,
    },
    {
      id: 5,
      name: 'برگر زغالی رویال',
      name_en: 'Royal Charcoal Burger',
      name_ps: 'رویال سکاره برګر',
      description: 'گوشت تازه گوساله، پنیر گودا، سس مخصوص و نان بریوش',
      price: 45,
      category_id: 3,
      category_name: 'Burger',
      image: '/src/assets/images/dish_special_burger_1790490488737.jpg',
      is_available: true,
      station: 'پیتزا و فست‌فود',
      rating: 4.8,
      rating_count: 86,
      loyalty_points_reward: 12,
    },
    {
      id: 6,
      name: 'موهیتو نعناع و لیمو',
      name_en: 'Fresh Mojito',
      name_ps: 'تازه موهیتو',
      description: 'ترکیب خنک نعناع تازه، لیمو ترش و یخ فراوان',
      price: 15,
      category_id: 4,
      category_name: 'Drinks',
      image: '/src/assets/images/dish_luxury_drink_1790490501557.jpg',
      is_available: true,
      station: 'کافه و بار',
      rating: 4.7,
      rating_count: 52,
      loyalty_points_reward: 5,
    },
    {
      id: 7,
      name: 'کیک شکلاتی لاوا',
      name_en: 'Chocolate Lava Cake',
      name_ps: 'شکلاتی لاوا کیک',
      description: 'کیک گرم با مغز شکلات روان و یک اسکوپ بستنی وانیلی',
      price: 25,
      category_id: 5,
      category_name: 'Desserts',
      image: '/src/assets/images/dish_dessert_cake_1790490513891.jpg',
      is_available: true,
      station: 'کافه و بار',
      rating: 4.9,
      rating_count: 41,
      loyalty_points_reward: 8,
    }
  ],
  staff: [
    {
      id: 1,
      name: 'مصطفی مددی',
      role: 'MANAGER',
      employee_code: 'admin',
      phone: '09120000000',
      attendance_status: 'PRESENT',
      password: 'admin',
      shift: 'MORNING',
      work_hours: '۰۸:۰۰ الی ۱۶:۰۰',
    },
    {
      id: 2,
      name: 'الهام حسینی',
      role: 'CASHIER',
      employee_code: 'cashier1',
      phone: '09121111111',
      attendance_status: 'PRESENT',
      password: '123',
      shift: 'MORNING',
      work_hours: '۰۸:۰۰ الی ۱۶:۰۰',
    },
    {
      id: 3,
      name: 'فرهاد انوری',
      role: 'WAITER',
      employee_code: 'waiter1',
      phone: '09122222222',
      attendance_status: 'PRESENT',
      password: '123',
      shift: 'MORNING',
      work_hours: '۰۸:۰۰ الی ۱۶:۰۰',
    },
    {
      id: 4,
      name: 'استاد نادر کریمی',
      role: 'KITCHEN',
      employee_code: 'chef1',
      phone: '09123333333',
      attendance_status: 'PRESENT',
      password: '123',
      shift: 'MORNING',
      work_hours: '۰۸:۰۰ الی ۱۶:۰۰',
    }
  ],
  customers: [
    {
      id: 1,
      name: 'Jamsed Jhon',
      phone: '01845723022573',
      tier: 'GOLD',
      loyalty_points: 420,
      total_spend: 1840,
      orders_count: 14,
      address: 'Karang Teagha Hils',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
    },
    {
      id: 2,
      name: 'Mojamil Haqe',
      phone: '01976892045091',
      tier: 'SILVER',
      loyalty_points: 210,
      total_spend: 960,
      orders_count: 7,
      address: 'Mohonpur tajmohol',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    },
    {
      id: 3,
      name: 'Mahfuza Joha',
      phone: '017234819012',
      tier: 'GOLD',
      loyalty_points: 650,
      total_spend: 2400,
      orders_count: 22,
      address: 'Karang Teagha Hils',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
    },
    {
      id: 4,
      name: 'Junaki Islam',
      phone: '018991204851',
      tier: 'SILVER',
      loyalty_points: 190,
      total_spend: 780,
      orders_count: 5,
      address: 'Karang Teagha Hils',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face',
    }
  ],
  tierBenefits: [
    { tier: 'BRONZE', title: 'برنزی', discount_percent: 0, free_perk: 'بدون مزایا', min_spend: 0, required_points: 0, badge_color: 'bg-amber-100 text-amber-900 border-amber-300' },
    { tier: 'SILVER', title: 'نقره‌ای', discount_percent: 5, free_perk: '۵٪ تخفیف', min_spend: 500, required_points: 200, badge_color: 'bg-slate-200 text-slate-800 border-slate-400' },
    { tier: 'GOLD', title: 'طلایی', discount_percent: 10, free_perk: '۱۰٪ تخفیف', min_spend: 1500, required_points: 500, badge_color: 'bg-yellow-100 text-yellow-900 border-yellow-400' },
    { tier: 'PLATINUM', title: 'پلاتینیوم', discount_percent: 15, free_perk: '۱۵٪ تخفیف', min_spend: 5000, required_points: 1200, badge_color: 'bg-purple-100 text-purple-900 border-purple-400' },
  ],
  orders: [
    {
      id: 'ORD-101',
      order_number: '01845723022573',
      table_id: 1,
      table_number: '01',
      source: 'CUSTOMER_QR',
      status: 'COMPLETED',
      created_at: '۱۴:۲۰',
      customer_name: 'Jamsed Jhon',
      customer_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
      address: 'Karang Teagha Hils',
      items: [
        {
          id: 'oi-1',
          menu_item_id: 1,
          name: 'Neapolitan Pizza.',
          seat_number: 1,
          quantity: 1,
          unit_price: 50,
          subtotal: 50,
          course: 'COURSE_1',
          kitchen_status: 'SERVED',
          station: 'پیتزا و فست‌فود',
        },
        {
          id: 'oi-2',
          menu_item_id: 4,
          name: 'Salad Meat',
          seat_number: 1,
          quantity: 1,
          unit_price: 70,
          subtotal: 70,
          course: 'COURSE_1',
          kitchen_status: 'SERVED',
          station: 'سالاد و پیش‌غذا',
        }
      ]
    },
    {
      id: 'ORD-102',
      order_number: '01976892045091',
      table_id: 2,
      table_number: '02',
      source: 'WAITER',
      status: 'CONFIRMED',
      created_at: '۱۴:۳۵',
      customer_name: 'Mojamil Haqe',
      customer_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      address: 'Mohonpur tajmohol',
      items: [
        {
          id: 'oi-3',
          menu_item_id: 2,
          name: 'California Pizza.',
          seat_number: 1,
          quantity: 1,
          unit_price: 80,
          subtotal: 80,
          course: 'COURSE_1',
          kitchen_status: 'PREPARING',
          station: 'پیتزا و فست‌فود',
        },
        {
          id: 'oi-4',
          menu_item_id: 4,
          name: 'Salad Vowl',
          seat_number: 1,
          quantity: 1,
          unit_price: 40,
          subtotal: 40,
          course: 'COURSE_1',
          kitchen_status: 'READY',
          station: 'سالاد و پیش‌غذا',
        }
      ]
    },
    {
      id: 'ORD-103',
      order_number: '01784910248102',
      table_id: 3,
      table_number: '03',
      source: 'POS',
      status: 'CONFIRMED',
      created_at: '۱۴:۵۰',
      customer_name: 'Mahfuza Joha',
      customer_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
      address: 'Karang Teagha Hils',
      items: [
        {
          id: 'oi-5',
          menu_item_id: 3,
          name: 'Sicilian Pizza.',
          seat_number: 1,
          quantity: 1,
          unit_price: 70,
          subtotal: 70,
          course: 'COURSE_1',
          kitchen_status: 'PREPARING',
          station: 'پیتزا و فست‌فود',
        }
      ]
    }
  ],
  inventory: [
    { id: 1, name: 'پنیر موزارلا تازه ایتالیایی', category: 'مواد اولیه', current_stock: 14.5, unit: 'کیلوگرم', minimum_stock: 5, status: 'HEALTHY' },
    { id: 2, name: 'آرد پیتزا دو صفر', category: 'مواد خشک', current_stock: 42, unit: 'کیلوگرم', minimum_stock: 10, status: 'HEALTHY' },
    { id: 3, name: 'سس گوجه سنتی مارینارا', category: 'سس و چاشنی', current_stock: 8.2, unit: 'لیتر', minimum_stock: 3, status: 'HEALTHY' },
    { id: 4, name: 'فیله مرغ تازه گریل', category: 'پروتئین', current_stock: 3.0, unit: 'کیلوگرم', minimum_stock: 5, status: 'LOW' },
  ],
  customerRequests: [],
  devices: [],
  receipts: [
    {
      id: 'REC-1001',
      order_number: '01845723022573',
      table_number: '01',
      payment_method: 'نقدی',
      discount: 0,
      grand_total: 120,
      timestamp: '2026-09-27T14:25:00.000Z',
    }
  ],
  announcements: [],
  activeBroadcast: null,
};

// Load or initialize DB
function loadDb(): any {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading DB_FILE, creating fresh default:', err);
  }
  saveDb(DEFAULT_INITIAL_STATE);
  return DEFAULT_INITIAL_STATE;
}

function saveDb(data: any): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing DB_FILE:', err);
  }
}

// In-Memory Database synchronized with file
let dbState = loadDb();

// SSE Clients for instant real-time synchronization across devices (WiFi/LAN)
const sseClients: Set<Response> = new Set();

function broadcastEvent(eventType: string, payload: any) {
  const message = `event: ${eventType}\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(message);
    } catch {
      sseClients.delete(client);
    }
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // CORS for local development & LAN mobile connections
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Guest-Token');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    next();
  });

  // Track connected device
  app.use((req, res, next) => {
    const tableParam = req.query.table || req.query.tableId;
    const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '192.168.10.x';
    const userAgent = req.headers['user-agent'] || 'Browser';

    if (tableParam && req.path === '/') {
      const tblNum = String(tableParam);
      const existing = dbState.devices.find((d: any) => d.connected_table_number === tblNum);
      if (!existing) {
        const newDev = {
          id: `dev-${Date.now()}`,
          name: `دستگاه مهمان (میز ${tblNum})`,
          type: 'GUEST_MOBILE',
          ip_address: clientIp.includes('::') ? '192.168.10.' + Math.floor(100 + Math.random() * 80) : clientIp,
          assigned_to: `نشست مهمان میز ${tblNum}`,
          status: 'ONLINE',
          last_active: 'هم‌اکنون',
          connected_table_number: tblNum,
        };
        dbState.devices.unshift(newDev);
        saveDb(dbState);
        broadcastEvent('device_connected', { message: `دستگاه جدید از میز ${tblNum} متصل شد.` });
      }
    }
    next();
  });

  // --- API Endpoints ---

  // Update Settings
  app.post('/api/v1/settings', (req, res) => {
    const newSettings = req.body;
    dbState.settings = { ...dbState.settings, ...newSettings };
    saveDb(dbState);
    broadcastEvent('state_updated', { keys: ['settings'] });
    res.json({ success: true, data: dbState.settings });
  });

  // Update Announcements
  app.post('/api/v1/announcements', (req, res) => {
    const newAnn = req.body;
    dbState.announcements = newAnn;
    saveDb(dbState);
    broadcastEvent('state_updated', { keys: ['announcements'] });
    res.json({ success: true, data: dbState.announcements });
  });

  // Health
  app.get('/api/v1/health', (req, res) => {
    res.json({ success: true, isConnected: true, message: 'Local Fullstack Express running', timestamp: new Date().toISOString() });
  });

  // Django REST Endpoints Support
  app.get(['/api/v1/tables', '/api/v1/tables/'], (req, res) => res.json(dbState.tables));
  app.get('/api/v1/tables/:pk', (req, res) => {
    const table = dbState.tables.find((t: any) => String(t.id) === String(req.params.pk));
    if (table) return res.json(table);
    res.status(404).json({ detail: 'Not found' });
  });
  app.all(['/api/v1/tables/:pk/status', '/api/v1/tables/:pk/status/'], (req, res) => {
    const table = dbState.tables.find((t: any) => String(t.id) === String(req.params.pk));
    if (table) {
      if (req.body.status) table.status = req.body.status;
      saveDb(dbState);
      broadcastEvent('state_updated', { keys: ['tables'] });
      return res.json(table);
    }
    res.status(404).json({ detail: 'Not found' });
  });

  app.get(['/api/v1/catalog/items', '/api/v1/catalog/items/'], (req, res) => res.json(dbState.menuItems));
  app.get(['/api/v1/catalog/categories', '/api/v1/catalog/categories/'], (req, res) => res.json([
    { id: 1, name: 'Pizza', title: 'پیتزا' },
    { id: 2, name: 'Salad', title: 'سالاد' },
    { id: 3, name: 'Burger', title: 'برگر' },
    { id: 4, name: 'Drinks', title: 'نوشیدنی' },
    { id: 5, name: 'Desserts', title: 'دسر' },
  ]));
  app.get(['/api/v1/catalog/stations', '/api/v1/catalog/stations/'], (req, res) => res.json([
    { id: 1, name: 'پیتزا و فست‌فود' },
    { id: 2, name: 'سالاد و پیش‌غذا' },
    { id: 3, name: 'کافه و بار' },
  ]));
  app.post(['/api/v1/catalog/items/:pk/toggle', '/api/v1/catalog/items/:pk/toggle/'], (req, res) => {
    const item = dbState.menuItems.find((i: any) => String(i.id) === String(req.params.pk));
    if (item) {
      item.is_available = !item.is_available;
      saveDb(dbState);
      broadcastEvent('state_updated', { keys: ['menuItems'] });
      return res.json(item);
    }
    res.status(404).json({ detail: 'Not found' });
  });

  app.get(['/api/v1/inventory/items', '/api/v1/inventory/items/'], (req, res) => res.json(dbState.inventory));
  app.post(['/api/v1/inventory/adjust', '/api/v1/inventory/adjust/'], (req, res) => {
    const { item_id, quantity, reason } = req.body;
    const inv = dbState.inventory.find((i: any) => String(i.id) === String(item_id));
    if (inv) {
      inv.current_stock = Math.max(0, (inv.current_stock || 0) + Number(quantity));
      saveDb(dbState);
      broadcastEvent('state_updated', { keys: ['inventory'] });
      return res.json({ success: true, data: inv });
    }
    res.status(404).json({ detail: 'Item not found' });
  });

  app.get(['/api/v1/crm/customers', '/api/v1/crm/customers/'], (req, res) => res.json(dbState.customers));
  app.post(['/api/v1/crm/feedback', '/api/v1/crm/feedback/'], (req, res) => {
    res.json({ success: true, message: 'بازخورد شما با موفقیت ثبت شد.' });
  });

  app.get(['/api/v1/staff', '/api/v1/staff/'], (req, res) => res.json(dbState.staff));
  app.get(['/api/v1/devices', '/api/v1/devices/'], (req, res) => res.json(dbState.devices));
  app.post(['/api/v1/devices/broadcast', '/api/v1/devices/broadcast/'], (req, res) => {
    const broadcastData = req.body;
    dbState.activeBroadcast = broadcastData.activeBroadcast || broadcastData.message || null;
    saveDb(dbState);
    broadcastEvent('state_updated', { keys: ['activeBroadcast'] });
    res.json({ success: true, message: 'Broadcast dispatched' });
  });

  app.get(['/api/v1/reports/summary', '/api/v1/reports/summary/'], (req, res) => {
    const todayTotal = dbState.receipts.reduce((acc: number, r: any) => acc + (r.grand_total || r.grandTotal || 0), 0);
    res.json({
      success: true,
      total_sales: todayTotal,
      orders_count: dbState.orders.length,
      receipts_count: dbState.receipts.length,
      active_tables: dbState.tables.filter((t: any) => t.status === 'OCCUPIED').length,
    });
  });

  // Full State Get
  app.get('/api/v1/state', (req, res) => {
    res.json({ success: true, data: dbState });
  });

  // Full / Partial State Save
  app.post('/api/v1/state', (req, res) => {
    const updates = req.body;
    dbState = { ...dbState, ...updates };
    saveDb(dbState);
    broadcastEvent('state_updated', { keys: Object.keys(updates) });
    res.json({ success: true, message: 'Saved successfully', data: dbState });
  });

  // Authentication for Superuser and Staff
  app.post(['/api/v1/auth/login', '/api/v1/auth/login/'], (req, res) => {
    const { username, password, employee_code, role } = req.body;

    // Superuser check
    if (
      (username === dbState.settings.superuser_username || username === 'admin') &&
      (password === dbState.settings.superuser_password || password === 'admin')
    ) {
      res.json({
        success: true,
        user: {
          id: 0,
          name: 'مدیر کل سیستم (Superuser)',
          role: 'MANAGER',
          is_superuser: true,
          token: `super-jwt-${Date.now()}`,
        },
      });
      return;
    }

    // Staff member check
    const matchedStaff = dbState.staff.find(
      (s: any) =>
        (s.employee_code === employee_code || s.name === username || String(s.id) === String(username)) &&
        (!s.password || s.password === password)
    );

    if (matchedStaff) {
      res.json({
        success: true,
        user: {
          id: matchedStaff.id,
          name: matchedStaff.name,
          role: matchedStaff.role,
          employee_code: matchedStaff.employee_code,
          photo: matchedStaff.photo,
          token: `staff-jwt-${matchedStaff.id}-${Date.now()}`,
        },
      });
      return;
    }

    res.status(401).json({
      success: false,
      message: 'نام کاربری یا رمز عبور اشتباه است.',
    });
  });

  // Reset Clean (Superuser Clean Database Wipe)
  app.post('/api/v1/reset-clean', (req, res) => {
    const { superuser_password } = req.body;
    if (superuser_password !== dbState.settings.superuser_password && superuser_password !== 'admin') {
      res.status(403).json({ success: false, message: 'رمز عبور مدیر کل صحیح نمی‌باشد.' });
      return;
    }

    // Reset clean slate
    dbState = {
      ...DEFAULT_INITIAL_STATE,
      orders: [],
      customerRequests: [],
      receipts: [],
      devices: [],
    };
    saveDb(dbState);
    broadcastEvent('clean_reset', { message: 'سیستم با داده‌های خام راه‌اندازی شد.' });
    res.json({ success: true, message: 'تمامی اطلاعات پاک‌سازی و سیستم از نو راه‌اندازی گردید.' });
  });

  // Customer Request (Call Waiter, Water, Bill...)
  app.get(['/api/v1/operations/requests', '/api/v1/operations/requests/'], (req, res) => res.json(dbState.customerRequests || []));
  app.post(['/api/v1/customer-requests', '/api/v1/operations/requests', '/api/v1/operations/requests/'], (req, res) => {
    const { table_id, table_number, type, label, assigned_waiter } = req.body;
    const newReq = {
      id: `req-${Date.now()}`,
      table_id: Number(table_id),
      table_number: String(table_number),
      type: type || 'CALL_WAITER',
      label: label || `درخواست مهمان سر میز ${table_number}`,
      status: 'PENDING',
      created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      assigned_waiter: assigned_waiter || 'فرهاد انوری',
    };

    dbState.customerRequests = [newReq, ...(dbState.customerRequests || [])];
    saveDb(dbState);
    broadcastEvent('customer_request', newReq);
    res.json({ success: true, data: newReq });
  });

  // Place Order (Guest or Waiter)
  app.get(['/api/v1/orders', '/api/v1/orders/'], (req, res) => res.json(dbState.orders || []));
  app.post(['/api/v1/orders', '/api/v1/orders/'], (req, res) => {
    const { table_id, table_number, source, items, waiter_name, guest_info } = req.body;
    const targetTable = dbState.tables.find((t: any) => t.id === Number(table_id) || t.table_number === String(table_number));

    // Handle guest registration/update if info provided
    if (guest_info && guest_info.phone) {
      let customer = dbState.customers.find((c: any) => c.phone === guest_info.phone);
      if (!customer) {
        customer = {
          id: Date.now(),
          name: guest_info.name || 'مشتری جدید',
          phone: guest_info.phone,
          points: 0,
          visits: 0,
          total_spend: 0,
          tier: 'BRONZE',
          last_visit: 'هم‌اکنون',
        };
        dbState.customers.push(customer);
      } else {
        if (guest_info.name) customer.name = guest_info.name;
        customer.last_visit = 'هم‌اکنون';
      }
    }

    const totalAmount = items.reduce((acc: number, item: any) => acc + (item.unit_price || item.price || 0) * (item.quantity || item.qty || 1), 0);

    const formattedItems = items.map((item: any, idx: number) => ({
      id: `item-${Date.now()}-${idx}`,
      menu_item_id: item.menu_item_id || item.id,
      name: item.name,
      quantity: item.quantity || item.qty || 1,
      unit_price: item.unit_price || item.price || 0,
      subtotal: (item.unit_price || item.price || 0) * (item.quantity || item.qty || 1),
      seat_number: item.seat_number || item.seat || 1,
      course: 'COURSE_2',
      kitchen_status: 'NEW',
      notes: item.notes,
    }));

    // Find existing active order for this table to merge if possible
    const existingOrder = dbState.orders.find((o: any) => 
      o.table_id === (targetTable?.id || Number(table_id)) && 
      o.status !== 'COMPLETED' && 
      o.status !== 'CANCELLED'
    );

    let finalOrder;
    if (existingOrder && source === 'CUSTOMER_QR') {
      // Append items to existing order for cleaner tracking
      existingOrder.items = [...existingOrder.items, ...formattedItems];
      finalOrder = existingOrder;
    } else {
      // Create new order
      const newOrder = {
        id: `ORD-${Date.now().toString().slice(-4)}`,
        order_number: Date.now().toString().slice(-4),
        table_id: targetTable?.id || Number(table_id) || 1,
        table_number: targetTable?.table_number || String(table_number),
        source: source || 'CUSTOMER_QR',
        status: 'CONFIRMED',
        created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        items: formattedItems,
        waiter_name: waiter_name || targetTable?.assigned_waiter_name || 'سیستم',
      };
      dbState.orders = [newOrder, ...(dbState.orders || [])];
      finalOrder = newOrder;
    }

    // Update table bill total and occupied status
    if (targetTable) {
      targetTable.status = 'OCCUPIED';
      targetTable.current_bill_total = (targetTable.current_bill_total || 0) + totalAmount;
      if (!targetTable.session_started_at) {
        targetTable.session_started_at = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      // Only increment guest count if it's a new session
      if (!existingOrder) {
        targetTable.guest_count = Number(targetTable.guest_count || 0) + 1;
      }
    }

    saveDb(dbState);
    broadcastEvent('order_placed', finalOrder);
    broadcastEvent('state_updated', { keys: ['orders', 'tables', 'customers'] });
    res.json({ success: true, data: finalOrder });
  });

  // Settle Bill & Deposit Loyalty Points
  app.post(['/api/v1/settle-bill', '/api/v1/finance/payments', '/api/v1/finance/payments/'], (req, res) => {
    const { receipt, table_id, customer_phone, points_used } = req.body;

    // Calculate earned points from items if not provided
    let totalPointsEarned = 0;
    if (receipt && receipt.items) {
      receipt.items.forEach((item: any) => {
        // Find menu item to get its specific loyalty reward
        const menuItem = dbState.menuItems.find((mi: any) => mi.id === item.menu_item_id);
        const rewardPerUnit = menuItem?.loyalty_points_reward ?? 10;
        totalPointsEarned += rewardPerUnit * (item.quantity || 1);
      });
    }

    // Award loyalty points to customer
    if (customer_phone) {
      let customer = dbState.customers.find((c: any) => c.phone === customer_phone);
      if (customer) {
        customer.points = Math.max(0, (customer.points || 0) + totalPointsEarned - (points_used || 0));
        customer.visits = (customer.visits || 0) + 1;
        customer.total_spend = (customer.total_spend || 0) + (receipt.grandTotal || receipt.grand_total || 0);
        customer.last_visit = 'امروز';
      }
    }

    // Save receipt to reports
    const finalReceipt = { 
      ...receipt, 
      points_earned: totalPointsEarned,
      points_used: points_used || 0,
      timestamp: new Date().toISOString()
    };
    dbState.receipts = [finalReceipt, ...(dbState.receipts || [])];

    // Mark all orders for this table as COMPLETED and link to receipt
    dbState.orders = dbState.orders.map((o: any) => 
      o.table_id === Number(table_id) && o.status !== 'COMPLETED'
        ? { ...o, status: 'COMPLETED', receipt_id: finalReceipt.id }
        : o
    );

    // Reset table status
    const targetTable = dbState.tables.find((t: any) => t.id === Number(table_id));
    if (targetTable) {
      targetTable.status = 'AVAILABLE';
      targetTable.current_bill_total = 0;
      targetTable.session_started_at = null;
      targetTable.guest_count = 0;
    }

    saveDb(dbState);
    broadcastEvent('bill_settled', { table_id, receipt: finalReceipt });
    broadcastEvent('state_updated', { keys: ['customers', 'tables', 'receipts', 'orders'] });
    res.json({ success: true, message: 'صورتحساب تسویه و رسید ذخیره شد.', receipt: finalReceipt });
  });

  // Get Receipts for Reports
  app.get(['/api/v1/receipts', '/api/v1/receipts/'], (req, res) => {
    res.json({ success: true, data: dbState.receipts || [] });
  });

  // Resolve Customer Request
  app.all(['/api/v1/customer-requests/:id', '/api/v1/operations/requests/:id/resolve', '/api/v1/operations/requests/:id/resolve/'], (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const reqItem = (dbState.customerRequests || []).find((r: any) => String(r.id) === String(id));
    if (reqItem) {
      reqItem.status = status || 'RESOLVED';
      saveDb(dbState);
      broadcastEvent('customer_request_updated', reqItem);
      res.json({ success: true, data: reqItem });
      return;
    }
    res.status(404).json({ success: false, message: 'درخواست یافت نشد.' });
  });

  // Kitchen Tickets
  app.get(['/api/v1/kitchen/tickets', '/api/v1/kitchen/tickets/'], (req, res) => {
    const active = (dbState.orders || []).filter((o: any) => o.status !== 'COMPLETED' && o.status !== 'CANCELLED');
    res.json(active);
  });

  // Update Kitchen Item Status
  app.all(['/api/v1/kitchen/items/:pk/status', '/api/v1/kitchen/items/:pk/status/', '/api/v1/orders/:orderId/items/:itemId'], (req, res) => {
    const pk = req.params.pk || req.params.itemId;
    const { kitchen_status, status } = req.body;
    const targetStatus = kitchen_status || status || 'READY';

    for (const order of dbState.orders || []) {
      const item = order.items?.find((i: any) => String(i.id) === String(pk) || String(i.menu_item_id) === String(pk));
      if (item) {
        item.kitchen_status = targetStatus;
        saveDb(dbState);
        broadcastEvent('order_item_updated', { itemId: pk, kitchen_status: targetStatus });
        return res.json({ success: true, data: item });
      }
    }
    res.status(404).json({ success: false, message: 'آیتم آشپزخانه یافت نشد.' });
  });

  // Toggle Block Device
  app.all(['/api/v1/devices/toggle-block', '/api/v1/devices/:pk/toggle-block', '/api/v1/devices/:pk/toggle-block/'], (req, res) => {
    const deviceId = req.params.pk || req.body.deviceId;
    const dev = (dbState.devices || []).find((d: any) => String(d.id) === String(deviceId));
    if (dev) {
      dev.status = dev.status === 'BLOCKED' ? 'ONLINE' : 'BLOCKED';
      saveDb(dbState);
      broadcastEvent('device_updated', dev);
      res.json({ success: true, data: dev });
      return;
    }
    res.status(404).json({ success: false, message: 'دستگاه یافت نشد.' });
  });

  // Clock In / Clock Out / Toggle Attendance
  app.all(['/api/v1/attendance', '/api/v1/staff/:pk/toggle-attendance', '/api/v1/staff/:pk/toggle-attendance/'], (req, res) => {
    const staff_id = req.params.pk || req.body.staff_id;
    const { status, check_in_time } = req.body;
    const staffMember = dbState.staff.find((s: any) => String(s.id) === String(staff_id));
    if (staffMember) {
      staffMember.attendance_status = status || (staffMember.attendance_status === 'PRESENT' ? 'ABSENT' : 'PRESENT');
      if (check_in_time) staffMember.check_in_time = check_in_time;
      saveDb(dbState);
      broadcastEvent('attendance_updated', staffMember);
      res.json({ success: true, data: staffMember });
      return;
    }
    res.status(404).json({ success: false, message: 'کارمند یافت نشد.' });
  });

  // Server-Sent Events (SSE) for Real-Time Instant Live Updates across all devices
  app.get('/api/v1/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    sseClients.add(res);
    
    // Heartbeat to keep connection alive on local networks
    const heartbeat = setInterval(() => {
      res.write(': heartbeat\n\n');
    }, 15000);

    // Initial ping
    res.write(`event: connected\ndata: ${JSON.stringify({ status: 'live' })}\n\n`);

    req.on('close', () => {
      clearInterval(heartbeat);
      sseClients.delete(res);
    });
  });

  // Mount Vite or serve static
  if (process.env.NODE_ENV === 'production' && fs.existsSync(path.resolve(__dirname, 'dist'))) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Restaurant Full-Stack Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
