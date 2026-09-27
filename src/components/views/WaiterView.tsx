import React, { useState } from 'react';
import {
  Utensils,
  Plus,
  Clock,
  User,
  CheckCircle2,
  BellRing,
  UserPlus,
  Send,
  Coffee,
  AlertCircle,
  CreditCard,
  Edit2,
  Trash2,
  Minus,
  X,
  Filter,
  UserCheck,
} from 'lucide-react';
import { Card, Button, Badge } from '../common/UI';
import { TableItem, MenuItemData, CustomerRequestItem, OrderData, OrderItemData } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';

interface WaiterViewProps {
  tables: TableItem[];
  menuItems: MenuItemData[];
  customerRequests: CustomerRequestItem[];
  orders?: OrderData[];
  currentWaiterName?: string;
  onResolveRequest: (reqId: string) => void;
  onSendWaiterOrder: (tableId: number, guestName: string, items: { menuItem: MenuItemData; seat: number; qty: number }[]) => void;
  onUpdateOrderItem?: (orderId: string, itemId: string, deltaQty: number, notes?: string) => void;
  onCancelOrderItem?: (orderId: string, itemId: string) => void;
  onCancelWholeOrder?: (orderId: string) => void;
  onOpenSplitBill: (table: TableItem) => void;
  onChangeTableStatus: (tableId: number, status: TableItem['status']) => void;
  onOpenProfile?: () => void;
}

export function WaiterView({
  tables,
  menuItems,
  customerRequests,
  orders = [],
  currentWaiterName = 'فرهاد انوری',
  onResolveRequest,
  onSendWaiterOrder,
  onUpdateOrderItem,
  onCancelOrderItem,
  onCancelWholeOrder,
  onOpenSplitBill,
  onChangeTableStatus,
  onOpenProfile,
}: WaiterViewProps) {
  const { t, isRtl, formatPrice, getDishName } = useLanguage();
  const [tableFilterMode, setTableFilterMode] = useState<'MY_TABLES' | 'ALL'>('MY_TABLES');
  const [selectedTable, setSelectedTable] = useState<TableItem | null>(null);
  const [guestName, setGuestName] = useState<string>('');
  const [waiterCart, setWaiterCart] = useState<{ menuItem: MenuItemData; seat: number; qty: number }[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<number>(1);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  // Edit item in active order modal state
  const [editingItemData, setEditingItemData] = useState<{
    orderId: string;
    item: OrderItemData;
    quantity: number;
    notes: string;
  } | null>(null);

  const [notice, setNotice] = useState<string | null>(null);

  // Filter tables: "MY_TABLES" vs "ALL"
  const visibleTables = tables.filter((tItem) => {
    if (tableFilterMode === 'ALL') return true;
    const isAssigned =
      tItem.assigned_waiter_name === currentWaiterName ||
      tItem.waiter_name === currentWaiterName ||
      !tItem.assigned_waiter_name;
    return isAssigned;
  });

  // Set initial selected table if not set
  React.useEffect(() => {
    if (!selectedTable && visibleTables.length > 0) {
      setSelectedTable(visibleTables[0]);
    }
  }, [visibleTables, selectedTable]);

  const categories = [
    { id: 'ALL', label: t.common.all },
    { id: 'غذاهای محلی', label: t.kds.localStation },
    { id: 'غذای مخصوص', label: t.kds.grillStation },
    { id: 'فست‌فود', label: t.kds.fastfoodStation },
    { id: 'دسر', label: t.kds.dessertStation },
    { id: 'نوشیدنی‌ها', label: t.kds.drinksStation },
    { id: 'پکیج‌های ویژه', label: 'پکیج‌های ویژه' },
  ];

  const pendingRequests = customerRequests.filter((r) => r.status === 'PENDING');

  const filteredItems = menuItems.filter((i) =>
    activeCategory === 'ALL' ? true : i.category_name === activeCategory
  );

  // Active orders for the currently selected table
  const selectedTableOrders = selectedTable
    ? orders.filter(
        (o) => (o.table_id === selectedTable.id || o.table_number === selectedTable.table_number) && o.status !== 'COMPLETED'
      )
    : [];

  const addItemToCart = (item: MenuItemData) => {
    const existing = waiterCart.find((c) => c.menuItem.id === item.id && c.seat === selectedSeat);
    if (existing) {
      setWaiterCart(waiterCart.map((c) => (c === existing ? { ...c, qty: c.qty + 1 } : c)));
    } else {
      setWaiterCart([...waiterCart, { menuItem: item, seat: selectedSeat, qty: 1 }]);
    }
  };

  const submitOrder = () => {
    if (!selectedTable || waiterCart.length === 0) return;
    onSendWaiterOrder(selectedTable.id, guestName || t.roles.CUSTOMER.title, waiterCart);
    setWaiterCart([]);
    setGuestName('');
    setNotice(`سفارش جدید با ${waiterCart.length} قلم به آشپزخانه ارسال شد.`);
    setTimeout(() => setNotice(null), 3500);
  };

  const handleSaveItemEdit = () => {
    if (!editingItemData) return;
    if (onUpdateOrderItem) {
      onUpdateOrderItem(
        editingItemData.orderId,
        editingItemData.item.id,
        editingItemData.quantity - editingItemData.item.quantity,
        editingItemData.notes
      );
    }
    setNotice('تغییرات سفارش با موفقیت اعمال گردید.');
    setEditingItemData(null);
    setTimeout(() => setNotice(null), 3000);
  };

  const handleCancelItem = (orderId: string, itemId: string, itemName: string) => {
    if (window.confirm(`آیا از لغو آیتم «${itemName}» اطمینان دارید؟`)) {
      if (onCancelOrderItem) {
        onCancelOrderItem(orderId, itemId);
      }
      setNotice(`آیتم ${itemName} با موفقیت از سفارش لغو گردید.`);
      setTimeout(() => setNotice(null), 3000);
    }
  };

  const handleCancelOrder = (orderId: string, orderNumber: string) => {
    if (window.confirm(`آیا از لغو کل سفارش شماره #${orderNumber} اطمینان دارید؟`)) {
      if (onCancelWholeOrder) {
        onCancelWholeOrder(orderId);
      }
      setNotice(`کل سفارش #${orderNumber} لغو شد.`);
      setTimeout(() => setNotice(null), 3000);
    }
  };

  const statusText: Record<string, string> = {
    AVAILABLE: t.tables.available,
    OCCUPIED: t.tables.occupied,
    RESERVED: t.tables.reserved,
    CLEANING: t.tables.cleaning,
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Waiter Task Header */}
      <div className="bg-white p-6 md:p-8 border border-stone-100 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shadow-xs">
              <UserCheck className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black text-stone-900 tracking-tight">
              {t.waiter.title}
            </h1>
          </div>
          <p className="text-xs text-stone-400 font-medium max-w-md">
            ثبت سریع سفارش سر میز، نظارت بر وضعیت میزها و پاسخ‌گویی به درخواست‌های مهمانان
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Table filter toggle */}
          <div className="bg-stone-50 p-1 rounded-2xl flex items-center border border-stone-200">
            <button
              onClick={() => setTableFilterMode('MY_TABLES')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                tableFilterMode === 'MY_TABLES'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/25'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              میزهای من ({tables.filter((t) => t.assigned_waiter_name === currentWaiterName || t.waiter_name === currentWaiterName).length})
            </button>
            <button
              onClick={() => setTableFilterMode('ALL')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                tableFilterMode === 'ALL'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/25'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              همه میزها ({tables.length})
            </button>
          </div>

          {/* Pending Requests Alert Pill */}
          {pendingRequests.length > 0 && (
            <div className="flex items-center gap-2.5 bg-orange-50 border border-orange-200 px-4 py-2 rounded-2xl text-xs text-orange-700 font-bold animate-pulse">
              <BellRing className="w-4 h-4 text-orange-600" />
              <span>{pendingRequests.length} فراخوانی سر میز</span>
            </div>
          )}
        </div>
      </div>

      {notice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-2xl flex items-center justify-between shadow-xs animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="font-bold">{notice}</span>
          </div>
          <button onClick={() => setNotice(null)} className="p-1 hover:bg-emerald-100 rounded-lg text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Real-time Customer Requests Strip */}
      {pendingRequests.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-ping"></div>
            <h3 className="text-xs font-black text-stone-700 uppercase tracking-wider">درخواست‌های فعال مهمانان</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="p-4 bg-white border border-orange-100 rounded-2xl flex items-center justify-between shadow-xs hover:border-orange-300 transition-all"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-orange-50 text-orange-600 border border-orange-200 px-2 py-0.5 rounded-lg text-[10px] font-black">
                      {t.orders.table} {req.table_number}
                    </span>
                    <span className="font-bold text-xs text-stone-900">{req.label}</span>
                  </div>
                  <span className="text-[10px] text-stone-400 font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {req.created_at}
                  </span>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  className="rounded-xl shadow-xs"
                  onClick={() => onResolveRequest(req.id)}
                >
                  پاسخ دادم
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid: Tables Selector + Fast Order Entry & Order Edit */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Tables Grid */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Utensils className="w-4 h-4 text-orange-500" />
              <h2 className="text-base font-black text-stone-900">
                {tableFilterMode === 'MY_TABLES' ? 'میزهای من' : 'همه میزها'}
              </h2>
            </div>
            <span className="text-[11px] font-bold text-stone-400 bg-stone-100 px-2.5 py-0.5 rounded-full">
              {visibleTables.length} میز
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
            {visibleTables.map((tItem) => {
              const isSelected = selectedTable?.id === tItem.id;
              const isOccupied = tItem.status === 'OCCUPIED';

              return (
                <div
                  key={tItem.id}
                  onClick={() => setSelectedTable(tItem)}
                  className={`p-4 rounded-3xl border cursor-pointer transition-all flex flex-col justify-between min-h-[140px] ${
                    isRtl ? 'text-right' : 'text-left'
                  } ${
                    isSelected
                      ? 'border-orange-500 bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/25 scale-[1.02]'
                      : isOccupied
                      ? 'border-orange-200 bg-orange-50/20 hover:border-orange-300'
                      : 'border-stone-100 bg-white hover:border-stone-200 shadow-xs'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className={`font-black text-base ${isSelected ? 'text-white' : 'text-stone-900'}`}>
                      میز {tItem.table_number}
                    </span>
                    <div
                      className={`w-2 h-2 rounded-full ${
                        isSelected ? 'bg-white' : isOccupied ? 'bg-orange-500 animate-pulse' : 'bg-emerald-500'
                      }`}
                    />
                  </div>
                  
                  <div className={`text-[10px] font-bold mb-3 ${isSelected ? 'text-white/80' : 'text-stone-400'}`}>
                    {tItem.section_name || tItem.section} • {tItem.capacity} نفره
                  </div>

                  {isOccupied && (
                    <div className={`mt-auto pt-2 border-t ${isSelected ? 'border-white/20' : 'border-stone-100'} flex justify-between text-[11px] font-black`}>
                      <span className={isSelected ? 'text-white' : 'text-orange-600'}>
                        {formatPrice(tItem.current_bill_total || 0)}
                      </span>
                      <span className={isSelected ? 'text-white/70' : 'text-stone-400'}>
                        {tItem.session_started_at || 'فعال'}
                      </span>
                    </div>
                  )}

                  {!isOccupied && !isSelected && (
                    <div className="mt-auto pt-2 border-t border-stone-100 text-[10px] font-bold text-emerald-600">
                      {statusText[tItem.status] || tItem.status}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Table Status Quick Switcher */}
          {selectedTable && (
            <Card className="p-6 border-stone-100 rounded-3xl shadow-xs bg-white space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-stone-900 text-sm">وضعیت میز {selectedTable.table_number}</h3>
                  <p className="text-xs text-stone-400 mt-0.5">{selectedTable.section_name || selectedTable.section}</p>
                </div>
                {selectedTable.assigned_waiter_name && (
                  <Badge variant="neutral" className="px-2.5 py-0.5 text-xs font-bold">
                    {selectedTable.assigned_waiter_name}
                  </Badge>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-2.5">
                {(['AVAILABLE', 'OCCUPIED', 'RESERVED', 'CLEANING'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => onChangeTableStatus(selectedTable.id, st)}
                    className={`py-2 px-3 rounded-2xl text-xs font-bold border transition-all ${
                      selectedTable.status === st
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-transparent shadow-xs'
                        : 'bg-white text-stone-600 border-stone-200 hover:border-orange-200'
                    }`}
                  >
                    {statusText[st] || st}
                  </button>
                ))}
              </div>

              {selectedTable.status === 'OCCUPIED' && (
                <Button
                  variant="outline"
                  size="md"
                  className="w-full rounded-2xl font-bold border-stone-200 text-stone-800 hover:border-orange-300"
                  onClick={() => onOpenSplitBill(selectedTable)}
                  icon={CreditCard}
                >
                  تقسیم و تسویه دنگی
                </Button>
              )}
            </Card>
          )}

          {/* Active Orders of this Table (Edit & Cancel Support) */}
          {selectedTable && (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-black text-stone-700 uppercase tracking-wider">
                  سفارش‌های فعال میز ({selectedTableOrders.length})
                </h3>
              </div>

              {selectedTableOrders.length === 0 ? (
                <div className="bg-white border border-stone-100 rounded-3xl p-6 text-center shadow-xs">
                  <Coffee className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-stone-400">
                    هنوز سفارشی برای این میز ثبت نشده است.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[380px] overflow-y-auto no-scrollbar">
                  {selectedTableOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="bg-white border border-stone-100 rounded-3xl p-4 shadow-xs space-y-3"
                    >
                      <div className="flex justify-between items-center pb-2 border-b border-stone-100">
                        <div className="flex items-center gap-2">
                          <span className="font-black bg-orange-50 text-orange-600 px-2 py-0.5 rounded-lg text-[10px]">
                            #{ord.order_number}
                          </span>
                          <span className="text-stone-400 font-bold text-[10px]">{ord.created_at}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCancelOrder(ord.id, ord.order_number)}
                          className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                          title="لغو کامل سفارش"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="space-y-2">
                        {ord.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-2.5 bg-stone-50/60 rounded-2xl border border-stone-100 group hover:bg-white hover:border-orange-100 transition-all"
                          >
                            <div className="flex-1">
                              <div className="font-bold text-stone-900 text-xs flex items-center gap-2">
                                <span className="w-5 h-5 rounded-md bg-white border border-stone-200 flex items-center justify-center text-[10px] font-black">
                                  {item.quantity}
                                </span>
                                {getDishName(item)}
                              </div>
                              <div className="text-[10px] text-stone-400 mt-0.5 flex items-center gap-2">
                                <span>صندلی #{item.seat_number}</span>
                                <span className="text-orange-600 font-medium">({item.kitchen_status})</span>
                                {item.notes && <span className="text-stone-500">"{item.notes}"</span>}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="font-black text-stone-900 text-xs">
                                {formatPrice(item.subtotal || item.unit_price * item.quantity)}
                              </span>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() =>
                                    setEditingItemData({
                                      orderId: ord.id,
                                      item: item,
                                      quantity: item.quantity,
                                      notes: item.notes || '',
                                    })
                                  }
                                  className="p-1 text-stone-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleCancelItem(ord.id, item.id, item.name)}
                                  className="p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Fast Waiter Order Registration */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="p-6 md:p-8 border-stone-100 rounded-3xl shadow-xs bg-white space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-5">
              <div>
                <h3 className="text-lg font-black text-stone-900">
                  ثبت سفارش جدید • میز {selectedTable?.table_number || '—'}
                </h3>
                <p className="text-xs text-stone-400 font-medium mt-0.5">افزودن آیتم‌های منو به سبد میز</p>
              </div>

              {/* Seat Selector */}
              <div className="flex items-center gap-1.5 bg-stone-50 p-1 rounded-2xl border border-stone-200">
                <span className="text-[10px] font-bold text-stone-400 px-2">{t.pos.seatLabel}:</span>
                {[1, 2, 3, 4, 5, 6].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSeat(s)}
                    className={`w-8 h-8 rounded-xl text-xs font-black transition-all ${
                      selectedSeat === s 
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xs scale-105' 
                        : 'text-stone-600 hover:bg-white'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Customer Name Note */}
            <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 flex items-center gap-3 focus-within:border-orange-500 focus-within:bg-white transition-all">
              <UserPlus className="w-4 h-4 text-stone-400 shrink-0" />
              <input
                type="text"
                placeholder="نام مهمان یا یادداشت سفارش (اختیاری)..."
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="bg-transparent border-none outline-none w-full text-stone-900 placeholder-stone-400 font-bold text-xs"
              />
            </div>

            {/* Categories */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveCategory(c.id)}
                  className={`px-3.5 py-1.5 rounded-full whitespace-nowrap text-xs font-bold transition-all border ${
                    activeCategory === c.id
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-transparent shadow-xs'
                      : 'bg-white text-stone-600 border-stone-200 hover:border-orange-200'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Menu Items Fast Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 max-h-[380px] overflow-y-auto pr-1 no-scrollbar">
              {filteredItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => addItemToCart(item)}
                  className="p-3.5 bg-white border border-stone-100 hover:border-orange-300 rounded-3xl text-right transition-all flex flex-col justify-between shadow-xs hover:shadow-md group relative"
                >
                  <div className="w-full">
                    <div className="font-bold text-xs text-stone-900 leading-tight mb-1 line-clamp-1">
                      {getDishName(item)}
                    </div>
                    {item.is_package && (
                      <span className="inline-block text-[9px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-md font-bold">
                        پکیج ویژه
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between w-full">
                    <span className="font-black text-orange-600 text-xs">{formatPrice(item.price)}</span>
                    <div className="w-7 h-7 rounded-xl bg-orange-50 text-orange-600 group-hover:bg-gradient-to-r group-hover:from-orange-500 group-hover:to-amber-500 group-hover:text-white flex items-center justify-center transition-colors shadow-xs">
                      <Plus className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Waiter Cart */}
            <div className="border-t border-stone-100 pt-5 space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <h4 className="font-black text-stone-800 text-xs uppercase tracking-wider">سبد سفارش جدید</h4>
                  <Badge variant="neutral">{waiterCart.length} قلم</Badge>
                </div>
              </div>

              {waiterCart.length === 0 ? (
                <div className="p-8 border-2 border-dashed border-stone-200 rounded-3xl text-center">
                  <p className="text-xs font-bold text-stone-400">
                    روی هر غذا کلیک کنید تا به سفارش این میز اضافه شود.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-44 overflow-y-auto pr-1 no-scrollbar">
                  {waiterCart.map((c, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-stone-50/70 border border-stone-200 rounded-2xl flex items-center justify-between hover:bg-white transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center text-xs font-black">
                          {c.qty}×
                        </div>
                        <div>
                          <span className="font-bold text-stone-900 text-xs">{getDishName(c.menuItem)}</span>
                          <span className="text-[10px] text-stone-400 block font-medium">صندلی #{c.seat}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-black text-stone-900 text-xs">
                          {formatPrice(c.qty * c.menuItem.price)}
                        </span>
                        <button
                          onClick={() => {
                            const updated = [...waiterCart];
                            updated.splice(idx, 1);
                            setWaiterCart(updated);
                          }}
                          className="p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {waiterCart.length > 0 && (
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-stone-100">
                  <div>
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">مجموع سفارش</span>
                    <span className="font-black text-orange-600 text-xl tracking-tight">
                      {formatPrice(waiterCart.reduce((acc, c) => acc + c.qty * c.menuItem.price, 0))}
                    </span>
                  </div>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={submitOrder}
                    icon={Send}
                    className="w-full sm:w-auto px-6 py-3 rounded-2xl shadow-md shadow-orange-500/20 font-bold text-sm"
                  >
                    ارسال سفارش به آشپزخانه
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Edit Order Item Modal */}
      {editingItemData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-xl border border-stone-100 p-6 max-w-sm w-full space-y-6">
            <div className="flex justify-between items-center border-b border-stone-100 pb-4">
              <div>
                <h4 className="font-black text-base text-stone-900 leading-tight">
                  {editingItemData.item.name}
                </h4>
                <p className="text-[11px] text-stone-400 font-medium">ویرایش تعداد و توضیحات پخت</p>
              </div>
              <button onClick={() => setEditingItemData(null)} className="p-1.5 hover:bg-stone-100 rounded-xl transition-colors">
                <X className="w-4 h-4 text-stone-400" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-2">تعداد سفارش</label>
                <div className="flex items-center justify-center gap-6 bg-stone-50 p-4 rounded-2xl border border-stone-200">
                  <button
                    onClick={() =>
                      setEditingItemData({
                        ...editingItemData,
                        quantity: Math.max(1, editingItemData.quantity - 1),
                      })
                    }
                    className="w-10 h-10 rounded-xl bg-white border border-stone-200 shadow-xs flex items-center justify-center font-black text-base hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all"
                  >
                    -
                  </button>
                  <span className="font-black text-2xl text-stone-900 w-10 text-center">
                    {editingItemData.quantity}
                  </span>
                  <button
                    onClick={() =>
                      setEditingItemData({
                        ...editingItemData,
                        quantity: editingItemData.quantity + 1,
                      })
                    }
                    className="w-10 h-10 rounded-xl bg-white border border-stone-200 shadow-xs flex items-center justify-center font-black text-base hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-2">یادداشت آشپزخانه</label>
                <textarea
                  rows={2}
                  value={editingItemData.notes}
                  onChange={(e) =>
                    setEditingItemData({
                      ...editingItemData,
                      notes: e.target.value,
                    })
                  }
                  placeholder="مثلاً: سس اضافه، بدون پیاز..."
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:border-orange-500 focus:bg-white transition-all text-xs font-bold text-stone-900 placeholder-stone-400"
                />
              </div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <Button 
                variant="outline" 
                size="md" 
                onClick={() => setEditingItemData(null)}
                className="w-full rounded-2xl font-bold py-2.5"
              >
                انصراف
              </Button>
              <Button 
                variant="primary" 
                size="md" 
                onClick={handleSaveItemEdit}
                className="w-full rounded-2xl font-bold py-2.5"
              >
                ذخیره تغییرات
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
