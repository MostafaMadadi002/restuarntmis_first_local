import React, { useState } from 'react';
import {
  Search,
  Star,
  Heart,
  Bike,
  Clock,
  CheckCircle2,
  Plus,
  Minus,
  ArrowRight,
  TrendingUp,
  Receipt,
  Users,
  Utensils,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  ShoppingBag,
  Store,
  Layers,
  Check,
} from 'lucide-react';
import { Card, Badge, Button, EmptyState } from '../common/UI';
import { TableItem, OrderData, InventoryItemData, MenuItemData, CustomerData } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';

interface DashboardViewProps {
  tables: TableItem[];
  orders: OrderData[];
  inventory: InventoryItemData[];
  menuItems?: MenuItemData[];
  customers?: CustomerData[];
  receipts?: any[];
  onNavigate: (view: string) => void;
  onSelectTable: (table: TableItem) => void;
  onQuickOrder?: (tableId: number, items: { item: MenuItemData; qty: number }[]) => void;
}

export function DashboardView({
  tables = [],
  orders = [],
  inventory = [],
  menuItems = [],
  customers = [],
  receipts = [],
  onNavigate,
  onSelectTable,
  onQuickOrder,
}: DashboardViewProps) {
  const { t, isRtl, formatPrice, getDishName } = useLanguage();

  // Search & Category Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Favorites state
  const [favorites, setFavorites] = useState<Record<number, boolean>>({
    1: true,
    2: true,
  });

  // Local "My Orders" Cart State for instant interactive experience
  const [cart, setCart] = useState<Array<{ item: MenuItemData; qty: number }>>([
    {
      item: menuItems.find((m) => m.id === 1) || {
        id: 1,
        name: 'Neapolitan Pizza.',
        description: 'Authentic Neapolitan pizza',
        price: 50,
        category_id: 1,
        category_name: 'Pizza',
        image: '/src/assets/images/neapolitan_pizza_1790494621915.jpg',
        is_available: true,
        station: 'Kitchen',
        rating: 4.5,
      },
      qty: 1,
    },
    {
      item: menuItems.find((m) => m.id === 3) || {
        id: 3,
        name: 'Sicilian Pizza.',
        description: 'Crispy Sicilian pizza',
        price: 70,
        category_id: 1,
        category_name: 'Pizza',
        image: '/src/assets/images/sicilian_pizza_1790494650212.jpg',
        is_available: true,
        station: 'Kitchen',
        rating: 4.2,
      },
      qty: 1,
    },
  ]);

  // Selected table for Checkout
  const [selectedCheckoutTableId, setSelectedCheckoutTableId] = useState<number>(2);
  const [orderSubmittedNotice, setOrderSubmittedNotice] = useState<string | null>(null);

  const toggleFavorite = (id: number) => {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const addToCart = (item: MenuItemData) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.item.id === item.id);
      if (existing) {
        return prev.map((c) => (c.item.id === item.id ? { ...c, qty: c.qty + 1 } : c));
      }
      return [...prev, { item, qty: 1 }];
    });
  };

  const updateCartQty = (id: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => (c.item.id === id ? { ...c, qty: c.qty + delta } : c))
        .filter((c) => c.qty > 0)
    );
  };

  const cartTotal = cart.reduce((acc, c) => acc + c.item.price * c.qty, 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    if (onQuickOrder) {
      onQuickOrder(selectedCheckoutTableId, cart);
    }
    setOrderSubmittedNotice(`سفارش با موفقیت برای میز شماره ${selectedCheckoutTableId} ارسال شد!`);
    setCart([]);
    setTimeout(() => {
      setOrderSubmittedNotice(null);
    }, 4000);
  };

  // Categories list
  const categories = [
    { id: 'ALL', label: isRtl ? 'همه خوراکی‌ها' : 'All Menu', icon: '🍽️' },
    { id: 'Pizza', label: isRtl ? 'پیتزاها' : 'Pizza', icon: '🍕' },
    { id: 'Burger', label: isRtl ? 'برگر و ساندویچ' : 'Burger', icon: '🍔' },
    { id: 'Salad', label: isRtl ? 'سالاد و پیش‌غذا' : 'Salad', icon: '🥗' },
    { id: 'Drinks', label: isRtl ? 'نوشیدنی‌ها' : 'Drinks', icon: '🍹' },
    { id: 'Desserts', label: isRtl ? 'دسر و کیک' : 'Desserts', icon: '🍰' },
  ];

  // Filtered dishes
  const filteredDishes = menuItems.filter((dish) => {
    const matchesCategory =
      selectedCategory === 'ALL' ||
      dish.category_name?.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesSearch =
      !searchQuery ||
      dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dish.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Recent order reports list
  const orderReports = orders.slice(0, 6);

  // Operational metrics
  const activeTablesCount = tables.filter((t) => t.status === 'OCCUPIED').length;
  const todaySales = receipts.reduce(
    (acc, r) => acc + (r.grand_total || r.grandTotal || 0),
    0
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Toast Notification when order placed */}
      {orderSubmittedNotice && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          <span className="font-bold text-sm">{orderSubmittedNotice}</span>
        </div>
      )}

      {/* Main Grid: 2-Column Responsive Layout (Main Dashboard Area 70% | Right Cart & Orders Sidebar 30%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT / CENTER COLUMN (8 cols on lg) */}
        <div className="lg:col-span-8 space-y-8 min-w-0">
          {/* Top Greeting & Category Search Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                  {isRtl ? 'به رستوران خوش آمدید' : 'Welcome to Pizza Hut'}
                </h1>
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-teal-500 text-white text-[10px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </span>
              </div>
              <p className="text-xs sm:text-sm text-stone-400 font-medium mt-1">
                {isRtl ? 'دسته‌بندی مورد نظر خود را انتخاب کنید' : 'Choose the category'}
              </p>
            </div>

            {/* Pill Search Bar matching mockup */}
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isRtl ? 'جستجوی پیتزا، برگر...' : 'Spicy Pizza...'}
                className="w-full bg-white border border-stone-200/80 rounded-full py-2.5 px-10 text-xs sm:text-sm text-stone-800 placeholder-stone-400 shadow-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
              <Search
                className={`w-4 h-4 text-stone-400 absolute top-1/2 -translate-y-1/2 ${
                  isRtl ? 'right-3.5' : 'left-3.5'
                }`}
              />
            </div>
          </div>

          {/* Category Selector Pills */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                    isSelected
                      ? 'bg-gradient-to-r from-orange-500 to-rose-400 text-white shadow-md shadow-orange-500/25 scale-[1.02]'
                      : 'bg-white text-stone-600 hover:bg-stone-50 border border-stone-100 hover:text-stone-900 shadow-xs'
                  }`}
                >
                  <span className="text-sm">{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Hero Promotional Banner Card */}
          <div className="relative rounded-3xl overflow-hidden shadow-sm bg-gradient-to-r from-[#FF7A50] via-[#FF6647] to-[#FFA868] text-white p-6 sm:p-8 min-h-[190px] flex items-center justify-between">
            {/* Background patterns */}
            <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>

            {/* Left/Middle Content */}
            <div className="relative z-10 max-w-md space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-black tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                {isRtl ? 'پیشنهاد ویژه جشنواره سرآشپز' : "Special Women's Day Offer"}
              </span>
              <h2 className="text-xl sm:text-3xl font-black tracking-tight leading-tight">
                {isRtl
                  ? '۳۰٪ تخفیف روی سفارش‌های دوبل پیتزا'
                  : "Special Women's Day Offer"}
              </h2>
              <p className="text-xs sm:text-sm text-white/90 font-medium">
                {isRtl
                  ? 'لذت طعم پیتزای تنوری ایتالیایی با خمیر تازه و ارسال اکسپرس'
                  : '30% off on all double Order in a time.'}
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setSelectedCategory('Pizza')}
                  className="bg-white text-orange-600 hover:bg-orange-50 px-5 py-2.5 rounded-full text-xs font-black shadow-md hover:shadow-lg transition-all active:scale-95"
                >
                  {isRtl ? 'سفارش فوری پیتزا' : 'Claim Offer Now'}
                </button>
              </div>
            </div>

            {/* Right: Appetizing Photo from assets */}
            <div className="relative hidden sm:block w-52 h-44 shrink-0 rounded-2xl overflow-hidden shadow-lg border-2 border-white/30 transform hover:scale-105 transition-transform duration-300">
              <img
                src="/src/assets/images/pizza_hero_banner_1790494606215.jpg"
                alt="Special Offer"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Section: "Based in the type of food you like" */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-stone-900 tracking-tight">
                  {isRtl ? 'بر اساس سلیقه و علایق شما' : 'Based in the type of food you like'}
                </h3>
                <p className="text-xs text-stone-400 font-medium">
                  {filteredDishes.length} {isRtl ? 'غذا و نوشیدنی پیشنهادی' : 'Dishes recommended for you'}
                </p>
              </div>
              <button
                onClick={() => onNavigate('menu')}
                className="text-xs font-black text-stone-500 hover:text-orange-600 transition-colors"
              >
                {isRtl ? 'مشاهده منوی کامل' : 'See All'}
              </button>
            </div>

            {/* Food Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {filteredDishes.slice(0, 6).map((dish) => {
                const isFav = !!favorites[dish.id];
                return (
                  <div
                    key={dish.id}
                    className="bg-white rounded-3xl p-3.5 border border-stone-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-xl hover:border-orange-100 transition-all duration-200 flex flex-col group"
                  >
                    {/* Image with Rating and Favorite Badges */}
                    <div className="relative aspect-4/3 w-full rounded-2xl overflow-hidden bg-stone-100 mb-3">
                      <img
                        src={(dish.image && dish.image.trim()) || '/src/assets/images/neapolitan_pizza_1790494621915.jpg'}
                        alt={dish.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      {/* Rating pill at top left */}
                      <div className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-black text-stone-800 flex items-center gap-1 shadow-xs">
                        <span className="text-amber-500 font-bold">{dish.rating || 4.5}</span>
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="text-[10px] text-stone-400">({dish.rating_count || '20+'})</span>
                      </div>

                      {/* Heart favorite button at top right */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(dish.id);
                        }}
                        className={`absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                          isFav
                            ? 'bg-rose-500 text-white shadow-sm'
                            : 'bg-white/80 hover:bg-white text-stone-400 hover:text-rose-500'
                        }`}
                        title="Add to favorites"
                      >
                        <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    {/* Dish Title & Verified Badge & Price */}
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <h4 className="text-sm font-black text-stone-900 tracking-tight truncate">
                          {dish.name}
                        </h4>
                        <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-teal-500 text-white shrink-0">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                        </span>
                      </div>
                      <span className="text-sm font-black text-stone-900 tracking-tight tabular-nums">
                        ${dish.price}
                      </span>
                    </div>

                    {/* Delivery & Prep Time Meta */}
                    <div className="flex items-center gap-3 text-[11px] text-stone-400 font-medium mb-3">
                      <span className="flex items-center gap-1 text-orange-600/90 font-bold">
                        <Bike className="w-3.5 h-3.5" />
                        {isRtl ? 'ارسال رایگان' : 'free delivery'}
                      </span>
                      <span className="flex items-center gap-1 text-stone-400">
                        <Clock className="w-3.5 h-3.5" />
                        10-15 mins
                      </span>
                    </div>

                    {/* Category Tags matching mockup: BURGER, CHICKEN, FAST FOOD */}
                    <div className="flex items-center gap-1.5 flex-wrap mb-4">
                      {['PIZZA', 'SPECIAL', 'FAST FOOD'].map((tag, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-stone-100 text-[9px] font-bold text-stone-500 uppercase tracking-wider"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Add to Cart button */}
                    <div className="mt-auto pt-2 border-t border-stone-50 flex items-center justify-between">
                      <span className="text-[10px] text-stone-400 font-medium">
                        {dish.station || 'بخش اصلی'}
                      </span>
                      <button
                        onClick={() => addToCart(dish)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-500 text-orange-600 hover:text-white font-bold text-xs transition-all active:scale-95 shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{isRtl ? 'افزودن' : 'Add'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section: "Order Report" Live Table matching the user's uploaded mockup */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-stone-900 tracking-tight">
                  {isRtl ? 'گزارش زنده سفارش‌ها' : 'Order Report'}
                </h3>
                <p className="text-xs text-stone-400 font-medium">
                  {isRtl ? 'آخرین سفارشات فعال و وضعیت آماده‌سازی' : 'Real-time orders activity & fulfillment'}
                </p>
              </div>
              <button
                onClick={() => onNavigate('orders')}
                className="text-xs font-black text-stone-500 hover:text-orange-600 transition-colors"
              >
                {isRtl ? 'مشاهده همه' : 'See All'}
              </button>
            </div>

            {/* Modern Table Card */}
            <div className="bg-white rounded-3xl border border-stone-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className={`w-full ${isRtl ? 'text-right' : 'text-left'}`}>
                  <thead>
                    <tr className="border-b border-stone-100 text-[11px] font-black text-stone-400 uppercase tracking-wider bg-stone-50/50">
                      <th className="py-4 px-6">#</th>
                      <th className="py-4 px-6">{isRtl ? 'مشتری' : 'Customer'}</th>
                      <th className="py-4 px-6">{isRtl ? 'شماره سفارش' : 'Order number'}</th>
                      <th className="py-4 px-6">{isRtl ? 'آدرس / میز' : 'Address'}</th>
                      <th className="py-4 px-6">{isRtl ? 'منو و اقلام' : 'Menu'}</th>
                      <th className="py-4 px-6">{isRtl ? 'وضعیت' : 'Status'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-50 text-xs">
                    {orderReports.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-10 text-center text-stone-400">
                          {isRtl ? 'هیچ سفارشی ثبت نشده است' : 'No active orders'}
                        </td>
                      </tr>
                    ) : (
                      orderReports.map((ord, idx) => {
                        const custName =
                          ord.customer_name ||
                          customers.find((c) => c.phone === ord.order_number)?.name ||
                          (idx === 0 ? 'Jamsed Jhon' : idx === 1 ? 'Mojamil Haqe' : 'Mahfuza Joha');

                        const custAvatar =
                          ord.customer_avatar ||
                          (idx === 0
                            ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face'
                            : idx === 1
                            ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
                            : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face');

                        const address =
                          ord.address ||
                          (idx === 0 ? 'Karang Teagha Hils' : idx === 1 ? 'Mohonpur tajmohol' : `میز شماره ${ord.table_number}`);

                        const menuTitle =
                          ord.items && ord.items.length > 0
                            ? ord.items.map((i) => i.name).join('، ')
                            : idx === 0
                            ? 'Salad Meat'
                            : 'Salad Vowl';

                        const isCompleted = ord.status === 'COMPLETED';
                        const isPreparing = ord.status === 'CONFIRMED' || ord.status === 'PENDING';

                        return (
                          <tr
                            key={ord.id}
                            className="hover:bg-stone-50/70 transition-colors group cursor-pointer"
                            onClick={() => onNavigate('orders')}
                          >
                            <td className="py-4 px-6 text-stone-400 font-bold tabular-nums">
                              {idx + 1}
                            </td>
                            {/* Customer Avatar + Name */}
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <img
                                  src={(custAvatar && custAvatar.trim()) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face'}
                                  alt={custName}
                                  className="w-9 h-9 rounded-full object-cover border border-stone-200"
                                />
                                <span className="font-black text-stone-900">{custName}</span>
                              </div>
                            </td>
                            {/* Order Number */}
                            <td className="py-4 px-6 text-stone-500 font-mono text-[11px]">
                              {ord.order_number}
                            </td>
                            {/* Address / Table */}
                            <td className="py-4 px-6 text-stone-500 font-medium">
                              {address}
                            </td>
                            {/* Menu summary */}
                            <td className="py-4 px-6 font-bold text-stone-800 max-w-[200px] truncate">
                              {menuTitle}
                            </td>
                            {/* Status pill matching mockup */}
                            <td className="py-4 px-6">
                              {isCompleted ? (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                                  Completed
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                                  Preparing
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: "My Orders" Panel & Nearby Restaurants & History (4 cols on lg) */}
        <div className="lg:col-span-4 space-y-6">
          {/* "My Orders" Card */}
          <div className="bg-white rounded-3xl p-6 border border-stone-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-lg font-black text-stone-900 tracking-tight">
                {isRtl ? 'سفارشات من' : 'My Orders'}
              </h3>
              <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-xs font-black flex items-center justify-center">
                {cart.reduce((acc, c) => acc + c.qty, 0)}
              </span>
            </div>

            {/* Cart Items List */}
            <div className="space-y-4 max-h-[300px] overflow-y-auto no-scrollbar pr-1">
              {cart.length === 0 ? (
                <div className="py-12 text-center text-stone-400">
                  <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-xs font-medium">
                    {isRtl ? 'سبد سفارش شما خالی است' : 'Your cart is empty'}
                  </p>
                </div>
              ) : (
                cart.map(({ item, qty }) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 p-2 rounded-2xl hover:bg-stone-50 transition-colors"
                  >
                    {/* Thumbnail & Title */}
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={(item.image && item.image.trim()) || '/src/assets/images/neapolitan_pizza_1790494621915.jpg'}
                        alt={item.name}
                        className="w-12 h-12 rounded-xl object-cover shrink-0 border border-stone-100"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-black text-stone-900 tracking-tight truncate">
                          {item.name.replace('.', '')}
                        </div>
                        <div className="text-[11px] text-stone-400 font-bold tabular-nums">
                          ${item.price}
                        </div>
                      </div>
                    </div>

                    {/* Stepper [ - 1 + ] & Subtotal */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center bg-stone-100 rounded-full px-2 py-1">
                        <button
                          onClick={() => updateCartQty(item.id, -1)}
                          className="w-5 h-5 flex items-center justify-center text-stone-600 hover:text-stone-900 active:scale-90"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center text-xs font-black text-stone-900 tabular-nums">
                          {qty}
                        </span>
                        <button
                          onClick={() => updateCartQty(item.id, 1)}
                          className="w-5 h-5 flex items-center justify-center text-stone-600 hover:text-stone-900 active:scale-90"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-xs font-black text-stone-900 tabular-nums w-10 text-right">
                        ${item.price * qty}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Table Selection for this Order */}
            <div className="pt-2 border-t border-stone-100">
              <label className="block text-[11px] font-black text-stone-400 uppercase tracking-wider mb-2">
                {isRtl ? 'انتخاب میز جهت ثبت سفارش:' : 'Assign to Table:'}
              </label>
              <select
                value={selectedCheckoutTableId}
                onChange={(e) => setSelectedCheckoutTableId(Number(e.target.value))}
                className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-3 py-2 text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              >
                {tables.map((t) => (
                  <option key={t.id} value={t.id}>
                    میز {t.table_number} ({t.section_name || t.section || 'سالن'}) - وضعیت: {t.status}
                  </option>
                ))}
              </select>
            </div>

            {/* Total Row & Checkout Button matching mockup */}
            <div className="pt-3 border-t border-stone-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-black text-stone-900">
                  {isRtl ? 'مجموع فاکتور:' : 'Total'}
                </span>
                <span className="px-4 py-1.5 rounded-full bg-orange-50 text-orange-600 font-black text-base tabular-nums">
                  ${cartTotal}
                </span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-sm shadow-lg shadow-orange-500/25 active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <span>{isRtl ? 'تکمیل و ارسال سفارش' : 'Checkout'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Section: "Nearby Restaurants" / "Chef's Specials" matching mockup */}
          <div className="bg-white rounded-3xl p-6 border border-stone-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-4">
            <h4 className="text-base font-black text-stone-900 tracking-tight">
              {isRtl ? 'برندها و شعبه‌ها' : 'Nearby Restaurants'}
            </h4>

            {/* Restaurant Brand Chips */}
            <div className="flex items-center gap-4 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-500 text-white font-black text-[10px] flex items-center justify-center shadow-xs">
                  BK
                </div>
                <div>
                  <div className="text-xs font-black text-stone-800">Burger King</div>
                  <div className="text-[10px] text-stone-400">Korang Teagha Hils</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-700 text-white font-black text-[10px] flex items-center justify-center shadow-xs">
                  SB
                </div>
                <div>
                  <div className="text-xs font-black text-stone-800">Starbuck</div>
                  <div className="text-[10px] text-stone-400">Korang Teagha Hils</div>
                </div>
              </div>
            </div>

            {/* Mini dishes cards */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-stone-50/70 rounded-2xl p-2.5 border border-stone-100 flex flex-col">
                <img
                  src="/src/assets/images/neapolitan_pizza_1790494621915.jpg"
                  alt="Starbuck salad"
                  className="w-full h-20 rounded-xl object-cover mb-2"
                />
                <div className="text-xs font-black text-stone-900">Starbuck salad</div>
                <div className="flex items-center gap-1 text-[10px] text-orange-600 font-bold mt-1">
                  <Bike className="w-3 h-3" />
                  <span>free delivery</span>
                </div>
                <div className="flex items-center justify-between mt-2 pt-1 border-t border-stone-200/50">
                  <span className="text-[10px] text-stone-400">10-15 mins</span>
                  <span className="text-xs font-black text-stone-900">$7</span>
                </div>
              </div>

              <div className="bg-stone-50/70 rounded-2xl p-2.5 border border-stone-100 flex flex-col">
                <img
                  src="/src/assets/images/california_pizza_1790494635802.jpg"
                  alt="Starbuck salad"
                  className="w-full h-20 rounded-xl object-cover mb-2"
                />
                <div className="text-xs font-black text-stone-900">Starbuck salad</div>
                <div className="flex items-center gap-1 text-[10px] text-orange-600 font-bold mt-1">
                  <Bike className="w-3 h-3" />
                  <span>free delivery</span>
                </div>
                <div className="flex items-center justify-between mt-2 pt-1 border-t border-stone-200/50">
                  <span className="text-[10px] text-stone-400">10-15 mins</span>
                  <span className="text-xs font-black text-stone-900">$20</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section: "Order History" matching mockup */}
          <div className="bg-white rounded-3xl p-6 border border-stone-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-black text-stone-900 tracking-tight">
                {isRtl ? 'تاریخچه سفارش‌ها' : 'Order History'}
              </h4>
              <button
                onClick={() => onNavigate('reports')}
                className="text-xs font-bold text-stone-400 hover:text-orange-600 transition-colors"
              >
                {isRtl ? 'همه' : 'See All'}
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 rounded-2xl hover:bg-stone-50 transition-colors">
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face"
                    alt="Mahfuza Joha"
                    className="w-10 h-10 rounded-full object-cover border border-stone-200"
                  />
                  <div>
                    <div className="text-xs font-black text-stone-900">Mahfuza Joha</div>
                    <div className="text-[10px] text-stone-400">Karang Teagha Hils</div>
                  </div>
                </div>
                <span className="text-xs font-bold text-stone-400">Jan, 20</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-2xl hover:bg-stone-50 transition-colors">
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face"
                    alt="Junaki Islam"
                    className="w-10 h-10 rounded-full object-cover border border-stone-200"
                  />
                  <div>
                    <div className="text-xs font-black text-stone-900">Junaki Islam</div>
                    <div className="text-[10px] text-stone-400">Karang Teagha Hils</div>
                  </div>
                </div>
                <span className="text-xs font-bold text-stone-400">Feb, 03</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
