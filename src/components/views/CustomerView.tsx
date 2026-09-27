import React, { useState, useEffect, useMemo } from 'react';
import {
  UtensilsCrossed,
  BellRing,
  CheckCircle2,
  Clock,
  ShoppingBag,
  Plus,
  Minus,
  Sparkles,
  Star,
  Receipt,
  User,
  Coffee,
  Heart,
  HelpCircle,
  Flame,
  Award,
  ChevronRight,
  Shield,
  X,
  BookOpen,
  ArrowLeft,
  Info,
  MapPin,
  Wifi,
  Search,
} from 'lucide-react';
import { Button, Card, Badge } from '../common/UI';
import { MenuItemData, TableItem, OrderData } from '../../types';
import { LanguageCode } from './SettingsView';

interface CustomerViewProps {
  menuItems: MenuItemData[];
  tables?: TableItem[];
  currentTableId?: number;
  orders?: OrderData[];
  pointsUnit?: string;
  activeAnnouncement?: {
    id?: string;
    title: string;
    message: string;
    image_url?: string;
    action_link?: string;
    action_label?: string;
  } | null;
  onCallWaiter: (label: string, tableNumber: string, tableId: number) => void;
  onSendOrder?: (
    tableId: number,
    cart: { item: MenuItemData; seat: number; qty: number }[],
    guestInfo?: { name: string; phone: string }
  ) => void;
  onRateDish?: (dishId: number, rating: number) => void;
  currentLang?: LanguageCode;
  onOpenProfile?: () => void;
  onLogout?: () => void;
}

export function CustomerView({
  menuItems,
  tables = [],
  currentTableId = 1,
  orders = [],
  pointsUnit = 'سکه',
  activeAnnouncement = null,
  onCallWaiter,
  onSendOrder,
  onRateDish,
  currentLang = 'fa',
  onOpenProfile,
  onLogout,
}: CustomerViewProps) {
  const [activeTab, setActiveTab] = useState<'MENU' | 'TRACKER' | 'PROFILE'>('MENU');
  const [selectedSeat, setSelectedSeat] = useState<number>(1);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [cart, setCart] = useState<{ item: MenuItemData; seat: number; qty: number }[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [requestSentNotice, setRequestSentNotice] = useState<string | null>(null);
  const [showPromoPopup, setShowPromoPopup] = useState<boolean>(Boolean(activeAnnouncement));
  const [isScrolled, setIsScrolled] = useState(false);

  // Sync scroll for header styling
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Table binding
  const currentTable = useMemo(() => {
    return tables.find((t) => t.id === currentTableId) || tables[0] || {
      id: currentTableId || 1,
      table_number: String(currentTableId || '1'),
      section: 'بخش اصلی',
      capacity: 4,
      status: 'OCCUPIED',
    };
  }, [tables, currentTableId]);

  // Orders for tracking
  const tableOrders = useMemo(() => {
    return orders.filter(
      (o) => o.table_id === currentTable.id || o.table_number === currentTable.table_number
    );
  }, [orders, currentTable]);

  // Categories extraction
  const categories = useMemo(() => {
    return ['ALL', ...Array.from(new Set(menuItems.map(i => i.category_name).filter(Boolean)))];
  }, [menuItems]);

  // Filtering logic
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory = activeCategory === 'ALL' || item.category_name === activeCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           item.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [menuItems, activeCategory, searchQuery]);

  const handleRequest = (label: string) => {
    onCallWaiter(label, currentTable.table_number, currentTable.id);
    setRequestSentNotice(`درخواست «${label}» ثبت شد. گارسون بزودی می‌آید.`);
    setTimeout(() => setRequestSentNotice(null), 3000);
  };

  const addItem = (item: MenuItemData) => {
    const existing = cart.find((c) => c.item.id === item.id && c.seat === selectedSeat);
    if (existing) {
      setCart(cart.map((c) => (c === existing ? { ...c, qty: c.qty + 1 } : c)));
    } else {
      setCart([...cart, { item, seat: selectedSeat, qty: 1 }]);
    }
  };

  const updateQty = (itemId: number, delta: number) => {
    setCart(prev => {
      const idx = prev.findIndex(c => c.item.id === itemId);
      if (idx === -1) return prev;
      const updated = [...prev];
      const newQty = updated[idx].qty + delta;
      if (newQty <= 0) {
        updated.splice(idx, 1);
      } else {
        updated[idx].qty = newQty;
      }
      return updated;
    });
  };

  const cartTotal = cart.reduce((acc, c) => acc + (c.item.price || 0) * c.qty, 0);

  const handlePlaceOrder = () => {
    if (onSendOrder && cart.length > 0) {
      onSendOrder(currentTable.id, cart);
      setCart([]);
      setActiveTab('TRACKER');
      setRequestSentNotice('سفارش شما با موفقیت ثبت شد!');
      setTimeout(() => setRequestSentNotice(null), 3000);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFDFD] pb-32 selection:bg-emerald-100">
      {/* 1. Premium App Header */}
      <header className={`sticky top-0 z-40 transition-all duration-500 ${isScrolled ? 'bg-white/80 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] py-4' : 'bg-transparent py-8'}`}>
        <div className="px-8 flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 leading-tight">
              {isScrolled ? 'آریا گریل' : 'تجربه طعم اصیل'}
            </h1>
            {!isScrolled && (
              <div className="flex items-center gap-2 mt-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  میز {currentTable.table_number} • {currentTable.section_name || 'سالن اصلی'}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => handleRequest('گارسون')}
              className="w-12 h-12 rounded-2xl bg-white shadow-xl shadow-slate-200/50 flex items-center justify-center text-slate-600 active:scale-95 transition-all border border-slate-50"
            >
              <BellRing className="w-6 h-6" />
            </button>
            <button 
              onClick={onOpenProfile}
              className="w-12 h-12 rounded-2xl bg-slate-900 shadow-xl shadow-slate-900/20 flex items-center justify-center text-white active:scale-95 transition-all"
            >
              <User className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Content Area */}
      <main className="px-8 space-y-10 animate-in fade-in duration-700">
        {/* Alerts / Notices */}
        {requestSentNotice && (
          <div className="fixed top-24 left-8 right-8 z-50 bg-slate-900 text-white p-5 rounded-[28px] shadow-2xl flex items-center justify-between animate-in slide-in-from-top-6 duration-500">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-black tracking-tight">{requestSentNotice}</span>
            </div>
            <button onClick={() => setRequestSentNotice(null)} className="p-2 opacity-40">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {activeTab === 'MENU' && (
          <>
            {/* Hero Promo Card */}
            {!searchQuery && activeAnnouncement && (
              <div className="relative h-56 w-full rounded-[40px] overflow-hidden bg-slate-900 shadow-2xl shadow-slate-200/50 group">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent z-10" />
                <img 
                  src={(activeAnnouncement.image_url && activeAnnouncement.image_url.trim()) || "/src/assets/images/dish_local_kabob_1790490473444.jpg"} 
                  alt="Special Offer" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-8 right-8 z-20 space-y-2 max-w-[80%]">
                  <Badge variant="warning" className="bg-amber-400 text-slate-900 border-none font-black text-[10px] px-3 py-1">پیشنهاد سرآشپز</Badge>
                  <h3 className="text-white text-2xl font-black leading-tight tracking-tight">{activeAnnouncement.title}</h3>
                  <p className="text-white/60 text-xs font-medium leading-relaxed">{activeAnnouncement.message}</p>
                </div>
              </div>
            )}

            {/* Quick Service Icons */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: Coffee, label: 'آب معدنی', type: 'آب' },
                { icon: UtensilsCrossed, label: 'قاشق چنگال', type: 'سرویس' },
                { icon: Receipt, label: 'فاکتور', type: 'صورتحساب' },
              ].map((action) => (
                <button
                  key={action.type}
                  onClick={() => handleRequest(action.type)}
                  className="flex flex-col items-center gap-3 p-5 rounded-[32px] bg-white border border-slate-50 shadow-sm hover:shadow-xl hover:shadow-slate-200/40 transition-all active:scale-95 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                    <action.icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter">{action.label}</span>
                </button>
              ))}
            </div>

            {/* Filter & Search Section */}
            <div className="space-y-6">
              <div className="relative group">
                <Search className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
                <input 
                  type="text" 
                  placeholder="جستجوی غذا یا نوشیدنی..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-5 pr-14 pl-6 rounded-[28px] bg-slate-100/50 border-none outline-none focus:bg-white focus:ring-4 focus:ring-slate-900/5 transition-all text-sm font-bold"
                />
              </div>

              <div className="flex items-center gap-3 overflow-x-auto pb-4 -mx-8 px-8 no-scrollbar">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-8 py-4 rounded-[24px] text-xs font-black transition-all whitespace-nowrap ${
                      activeCategory === cat 
                        ? 'bg-slate-900 text-white shadow-2xl shadow-slate-900/30 scale-105' 
                        : 'bg-white text-slate-400 border border-slate-100 hover:border-slate-300'
                    }`}
                  >
                    {cat === 'ALL' ? 'همه منو' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Premium Menu Cards */}
            <div className="grid grid-cols-1 gap-8">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <div key={item.id} className="relative bg-white rounded-[40px] border border-slate-50 p-6 flex items-center gap-6 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 group">
                    <div className="relative w-32 h-32 rounded-[32px] overflow-hidden bg-slate-100 shrink-0 shadow-lg group-hover:scale-105 transition-transform duration-700 flex items-center justify-center">
                      {item.image && item.image.trim() !== '' ? (
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <UtensilsCrossed className="w-10 h-10 text-slate-300" />
                      )}
                      <div className="absolute inset-0 bg-black/5" />
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-lg font-black text-slate-900 tracking-tight leading-tight">{item.name}</h4>
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
                            <span className="text-[11px] font-black text-slate-400">{item.rating || 4.9} ({item.rating_count || 120})</span>
                          </div>
                        </div>
                        <Badge variant="emerald" className="bg-emerald-50 text-emerald-600 border-none font-black text-[10px] px-2 py-0.5">تازه</Badge>
                      </div>
                      
                      <p className="text-xs text-slate-400 font-medium line-clamp-2 leading-relaxed">
                        {item.description || 'آماده شده با بهترین مواد اولیه تازه'}
                      </p>
                      
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-400 font-bold uppercase">قیمت</span>
                          <span className="text-xl font-black text-orange-600 tabular-nums">
                            ${Number(item.price || 0).toLocaleString()}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {cart.find(c => c.item.id === item.id) ? (
                            <div className="flex items-center gap-3 bg-orange-500 text-white rounded-2xl px-2 py-1.5 shadow-md shadow-orange-500/20">
                              <button 
                                onClick={() => updateQty(item.id, -1)}
                                className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="text-sm font-black tabular-nums">{cart.find(c => c.item.id === item.id)?.qty}</span>
                              <button 
                                onClick={() => updateQty(item.id, 1)}
                                className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => addItem(item)}
                              className="w-11 h-11 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20 active:scale-90 transition-all hover:opacity-95"
                            >
                              <Plus className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-24 text-center space-y-6">
                  <div className="w-24 h-24 rounded-[40px] bg-slate-50 flex items-center justify-center mx-auto">
                    <Search className="w-10 h-10 text-slate-200" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-900 text-lg font-black tracking-tight">چیزی پیدا نکردیم!</p>
                    <p className="text-slate-400 text-sm font-medium">کلمه دیگری را جستجو کنید</p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'TRACKER' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-10 duration-700">
            <div className="flex flex-col items-center text-center space-y-4 py-8">
              <div className="w-20 h-20 rounded-[32px] bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-xl shadow-emerald-500/10">
                <Clock className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">وضعیت میز {currentTable.table_number}</h2>
                <p className="text-sm text-slate-400 font-medium px-8 leading-relaxed">سفارشات شما به صورت زنده در شبکه محلی پایش می‌شوند</p>
              </div>
            </div>

            {tableOrders.length > 0 ? (
              <div className="space-y-6">
                {tableOrders.map(order => (
                  <div key={order.id} className="p-8 rounded-[40px] bg-white border border-slate-50 shadow-sm space-y-6 group">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-300 font-black uppercase tracking-widest">Order ID</span>
                        <span className="text-lg font-black text-slate-900 font-mono tracking-tighter">#{order.order_number}</span>
                      </div>
                      <Badge variant={order.status === 'COMPLETED' ? 'success' : 'warning'} className="rounded-2xl px-5 py-2.5 font-black text-xs border-none shadow-sm">
                        {order.status === 'COMPLETED' ? 'تحویل شد' : 'در حال آماده‌سازی'}
                      </Badge>
                    </div>

                    <div className="space-y-4">
                      {order.items.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-4 rounded-3xl bg-slate-50/50 group-hover:bg-slate-50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center font-black text-xs text-slate-400 shadow-sm">{item.quantity}×</div>
                            <span className="font-black text-slate-700 tracking-tight">{item.name}</span>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white shadow-sm border border-slate-100">
                            <div className={`w-2 h-2 rounded-full ${item.kitchen_status === 'READY' ? 'bg-emerald-500' : 'bg-amber-400'} animate-pulse`} />
                            <span className="text-[11px] font-black text-slate-500">
                              {item.kitchen_status === 'READY' ? 'آماده' : item.kitchen_status === 'PREPARING' ? 'در حال پخت' : 'تأیید شده'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {order.status !== 'COMPLETED' && (
                      <div className="pt-2">
                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-slate-900 rounded-full w-2/3 animate-progress" />
                        </div>
                        <div className="flex items-center justify-center gap-2 mt-4 opacity-50">
                          <Wifi className="w-3.5 h-3.5 text-emerald-500" />
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Sync Connected</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-24 text-center space-y-8">
                <div className="w-24 h-24 rounded-[40px] bg-slate-50 flex items-center justify-center mx-auto text-slate-200">
                  <UtensilsCrossed className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <p className="text-slate-400 text-lg font-black tracking-tight">لیست سفارشات خالی است</p>
                  <Button variant="primary" className="rounded-[24px] px-8 py-5 h-auto text-sm shadow-xl shadow-slate-900/20" onClick={() => setActiveTab('MENU')}>شروع سفارش</Button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'PROFILE' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-700">
            <div className="flex flex-col items-center py-10 relative">
              <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-transparent rounded-[60px] -z-10" />
              <div className="relative">
                <div className="w-32 h-32 rounded-[48px] bg-white flex items-center justify-center border-8 border-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.12)]">
                  <User className="w-14 h-14 text-slate-200" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-3xl bg-emerald-500 border-4 border-white flex items-center justify-center text-white shadow-xl">
                  <Shield className="w-6 h-6" />
                </div>
              </div>
              <h3 className="mt-6 text-2xl font-black text-slate-900 tracking-tight">مهمان میز {currentTable.table_number}</h3>
              <p className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Loyalty Member</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-8 rounded-[40px] bg-slate-900 text-white space-y-2 shadow-2xl shadow-slate-900/20">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Points</span>
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-black tabular-nums">۱۲۴۰</span>
                  <Sparkles className="w-5 h-5 text-amber-400" />
                </div>
              </div>
              <div className="p-8 rounded-[40px] bg-white border border-slate-50 space-y-2 shadow-sm">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tier</span>
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-black text-slate-900">VIP</span>
                  <Award className="w-6 h-6 text-amber-500" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { icon: Heart, label: 'غذاهای مورد علاقه', color: 'bg-rose-50 text-rose-600' },
                { icon: Receipt, label: 'تاریخچه سفارشات', color: 'bg-indigo-50 text-indigo-600' },
                { icon: Wifi, label: 'وای‌فای رستوران', color: 'bg-emerald-50 text-emerald-600', badge: 'متصل' },
              ].map((link) => (
                <button key={link.label} className="w-full flex items-center justify-between p-6 rounded-[32px] bg-white border border-slate-50 shadow-sm active:scale-[0.98] transition-all group">
                  <div className="flex items-center gap-5">
                    <div className={`w-12 h-12 rounded-2xl ${link.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <link.icon className="w-6 h-6" />
                    </div>
                    <span className="text-base font-black text-slate-700 tracking-tight">{link.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {link.badge && <Badge variant="emerald" className="bg-emerald-50 text-emerald-600 border-none font-black text-[10px]">{link.badge}</Badge>}
                    <ChevronRight className="w-5 h-5 text-slate-300" />
                  </div>
                </button>
              ))}
            </div>

            <button 
              onClick={onLogout}
              className="w-full py-6 text-rose-500 text-sm font-black border-2 border-rose-50 rounded-[32px] hover:bg-rose-50 active:scale-95 transition-all mt-8 uppercase tracking-widest shadow-xl shadow-rose-500/5"
            >
              Finish Session & Exit
            </button>
          </div>
        )}
      </main>

      {/* 3. Permanent Bottom App Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none px-6 pb-8">
        <div className="max-w-md mx-auto pointer-events-auto">
          {/* Active Cart Floating Bar */}
          {activeTab === 'MENU' && cart.length > 0 && (
            <div className="mb-6 animate-in slide-in-from-bottom-10 duration-700">
              <div className="bg-slate-900 text-white p-5 rounded-[32px] shadow-[0_20px_50px_rgba(15,23,42,0.4)] flex items-center justify-between">
                <div className="flex items-center gap-5 pl-2">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
                      <ShoppingBag className="w-7 h-7" />
                    </div>
                    <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-emerald-500 text-xs font-black flex items-center justify-center border-4 border-slate-900 tabular-nums shadow-lg">
                      {cart.reduce((acc, c) => acc + c.qty, 0)}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-white/60 font-bold uppercase tracking-widest">مجموع سفارش</span>
                    <span className="text-xl font-black tabular-nums tracking-tighter text-amber-300">
                      ${Number(cartTotal || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={handlePlaceOrder}
                  className="bg-emerald-500 hover:bg-emerald-400 text-white px-10 py-4 rounded-[22px] text-sm font-black active:scale-95 transition-all shadow-xl shadow-emerald-500/20"
                >
                  ثبت نهایی
                </button>
              </div>
            </div>
          )}

          {/* Navigation Bar */}
          <nav className="bg-white/80 backdrop-blur-3xl border border-white/50 rounded-[35px] p-2 flex justify-between items-center shadow-[0_20px_60px_-15px_rgba(0,0,0,0.12)]">
            {[
              { id: 'MENU', icon: BookOpen, label: 'منو' },
              { id: 'TRACKER', icon: Clock, label: 'پیگیری', count: tableOrders.some(o => o.status !== 'COMPLETED') },
              { id: 'PROFILE', icon: User, label: 'حساب' },
            ].map((nav) => (
              <button 
                key={nav.id}
                onClick={() => setActiveTab(nav.id as any)}
                className={`relative flex-1 py-4 flex flex-col items-center gap-1 transition-all duration-500 ${
                  activeTab === nav.id 
                    ? 'text-slate-900 scale-110' 
                    : 'text-slate-300 hover:text-slate-500'
                }`}
              >
                <nav.icon className={`w-7 h-7 ${activeTab === nav.id ? 'fill-slate-900/5' : ''}`} />
                <span className="text-[9px] font-black uppercase tracking-widest">{nav.label}</span>
                {nav.count && (
                  <span className="absolute top-3 right-[30%] w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-white animate-pulse shadow-sm" />
                )}
                {activeTab === nav.id && (
                  <div className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-slate-900 animate-in zoom-in" />
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* 4. Promo Popup */}
      {showPromoPopup && activeAnnouncement && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden w-full max-w-sm animate-in zoom-in-95 duration-500">
            {activeAnnouncement.image_url && activeAnnouncement.image_url.trim() !== '' && (
              <div className="h-56 relative group">
                <img src={activeAnnouncement.image_url} alt="Announcement" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <button 
                  onClick={() => setShowPromoPopup(false)}
                  className="absolute top-6 left-6 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/40 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
            <div className="p-8 space-y-4 text-right">
              <Badge variant="emerald" className="font-black text-[10px]">اطلاعیه رستوران</Badge>
              <h3 className="text-xl font-black text-slate-900 leading-tight">{activeAnnouncement.title}</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">{activeAnnouncement.message}</p>
              <div className="pt-4 flex gap-3">
                <button 
                  onClick={() => setShowPromoPopup(false)}
                  className="flex-1 py-4 bg-slate-900 text-white rounded-2xl text-sm font-black active:scale-95 transition-transform"
                >
                  متوجه شدم
                </button>
                {activeAnnouncement.action_link && (
                  <button className="flex-1 py-4 bg-slate-100 text-slate-900 rounded-2xl text-sm font-black active:scale-95 transition-transform">
                    مشاهده جزئیات
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSS Overrides for no-scrollbar and animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes progress {
          0% { transform: translateX(100%); }
          100% { transform: translateX(0%); }
        }
        .animate-progress {
          animation: progress 2s ease-in-out infinite;
        }
      `}} />
    </div>
  );
}
