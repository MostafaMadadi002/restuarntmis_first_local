import React, { useState } from 'react';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChefHat,
  Search,
  Filter,
  Layers,
  List,
  CreditCard,
  User,
  Coffee,
  Check,
  ChevronDown,
  ArrowRight,
} from 'lucide-react';
import { Card, Button, Badge } from '../common/UI';
import { OrderData, OrderItemData, TableItem } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';

interface OrdersViewProps {
  orders: OrderData[];
  tables?: TableItem[];
  onNavigateToPos?: () => void;
  onSelectTableForPos?: (tableId: number) => void;
}

export function OrdersView({
  orders,
  tables = [],
  onNavigateToPos,
  onSelectTableForPos,
}: OrdersViewProps) {
  const { t, isRtl, formatPrice, getDishName } = useLanguage();
  const [viewMode, setViewMode] = useState<'BY_TABLE' | 'TIMELINE'>('BY_TABLE');
  const [searchTable, setSearchTable] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');

  const getSourceLabel = (source: string) => {
    if (source === 'CUSTOMER_QR') return 'مشتری سر میز (QR)';
    if (source === 'WAITER') return 'گارسون سالن';
    return 'صندوقدار (POS)';
  };

  const getKitchenStatusBadge = (status: OrderItemData['kitchen_status']) => {
    switch (status) {
      case 'NEW':
        return <span className="bg-orange-50 text-orange-700 border border-orange-200 px-2.5 py-0.5 rounded-full text-[11px] font-bold">در انتظار (جدید)</span>;
      case 'ACCEPTED':
        return <span className="bg-sky-50 text-sky-700 border border-sky-200 px-2.5 py-0.5 rounded-full text-[11px] font-bold">تأیید سرآشپز</span>;
      case 'PREPARING':
        return <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full text-[11px] font-bold">در حال پخت 🔥</span>;
      case 'READY':
        return <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[11px] font-bold">آماده تحویل ✓</span>;
      case 'SERVED':
        return <span className="bg-stone-100 text-stone-600 border border-stone-200 px-2.5 py-0.5 rounded-full text-[11px] font-bold">سرو شده سر میز</span>;
      default:
        return <span className="bg-stone-100 text-stone-600 px-2.5 py-0.5 rounded-full text-[11px] font-bold">{status}</span>;
    }
  };

  // Group orders by table_number
  const tableNumbersSet = Array.from(new Set(orders.map((o) => String(o.table_number))));

  const tableGroups = tableNumbersSet.map((tblNum) => {
    const tableOrders = orders.filter((o) => String(o.table_number) === tblNum);
    const tableObj = tables.find((t) => String(t.table_number) === tblNum);

    const allItems = tableOrders.flatMap((o) =>
      o.items.map((i) => ({ ...i, orderId: o.id, orderNumber: o.order_number, orderTime: o.created_at, source: o.source }))
    );

    const activeItems = allItems.filter((i) => i.kitchen_status !== 'SERVED');
    const completedItems = allItems.filter((i) => i.kitchen_status === 'SERVED');

    const totalTableAmount = allItems.reduce((acc, i) => acc + (i.subtotal || i.unit_price * i.quantity), 0);
    const assignedWaiter =
      tableObj?.assigned_waiter_name ||
      tableObj?.waiter_name ||
      tableOrders[0]?.waiter_name ||
      'فرهاد انوری';

    return {
      tableNumber: tblNum,
      tableId: tableObj?.id || tableOrders[0]?.table_id || 1,
      section: tableObj?.section_name || tableObj?.section || 'سالن اصلی',
      ordersCount: tableOrders.length,
      assignedWaiter,
      totalAmount: totalTableAmount,
      activeItems,
      completedItems,
      hasActiveOrders: activeItems.length > 0,
      tableOrders,
    };
  });

  const filteredGroups = tableGroups.filter((g) => {
    const matchesSearch =
      searchTable.trim() === '' ||
      g.tableNumber.includes(searchTable.trim()) ||
      g.assignedWaiter.includes(searchTable.trim()) ||
      g.section.includes(searchTable.trim());

    if (statusFilter === 'ACTIVE') return matchesSearch && g.hasActiveOrders;
    if (statusFilter === 'COMPLETED') return matchesSearch && !g.hasActiveOrders;
    return matchesSearch;
  });

  return (
    <div className="space-y-8 pb-10">
      {/* Header and Controls */}
      <div className="bg-white p-6 md:p-8 border border-stone-100 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shadow-xs">
              <ClipboardList className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black text-stone-900 tracking-tight">
              {t.orders.title}
            </h1>
          </div>
          <p className="text-xs text-stone-400 font-medium">
            مدیریت هوشمند و لحظه‌ای سفارش‌های فعال و تکمیل‌شده رستوران بر اساس میز و زمان
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* View Mode Toggle */}
          <div className="bg-stone-50 p-1 rounded-2xl flex items-center border border-stone-200">
            <button
              onClick={() => setViewMode('BY_TABLE')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'BY_TABLE' 
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xs' 
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>دسته‌بندی میز</span>
            </button>
            <button
              onClick={() => setViewMode('TIMELINE')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'TIMELINE' 
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xs' 
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <List className="w-4 h-4" />
              <span>فهرست زمانی</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-full border border-stone-200 focus-within:border-orange-500 flex-1 max-w-md transition-all shadow-xs">
          <Search className="w-4 h-4 text-stone-400 shrink-0" />
          <input
            type="text"
            placeholder="جستجوی شماره میز، نام گارسون یا سالن..."
            value={searchTable}
            onChange={(e) => setSearchTable(e.target.value)}
            className="bg-transparent border-none outline-none w-full text-stone-900 placeholder-stone-400 font-bold text-xs"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'ALL', label: `همه (${tableGroups.length})` },
            { id: 'ACTIVE', label: `در حال آماده‌سازی (${tableGroups.filter((g) => g.hasActiveOrders).length})`, color: 'bg-orange-500' },
            { id: 'COMPLETED', label: `تکمیل شده (${tableGroups.filter((g) => !g.hasActiveOrders).length})`, color: 'bg-emerald-500' },
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setStatusFilter(filter.id as any)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all border flex items-center gap-1.5 ${
                statusFilter === filter.id
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-transparent shadow-xs'
                  : 'bg-white text-stone-600 border-stone-200 hover:border-orange-200'
              }`}
            >
              {filter.color && (
                <div className={`w-1.5 h-1.5 rounded-full ${filter.color} ${statusFilter === filter.id ? 'bg-white' : ''}`} />
              )}
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content: Grouped by Table View */}
      {viewMode === 'BY_TABLE' ? (
        <div className="space-y-6">
          {filteredGroups.length === 0 ? (
            <div className="p-16 text-center bg-white border border-stone-100 rounded-3xl shadow-xs">
              <ClipboardList className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <h3 className="text-base font-black text-stone-800 mb-1">نتیجه‌ای یافت نشد</h3>
              <p className="text-xs font-medium text-stone-400">
                میزی با این مشخصات در فهرست سفارشات پیدا نشد.
              </p>
            </div>
          ) : (
            filteredGroups.map((group) => (
              <Card
                key={group.tableNumber}
                className="p-0 overflow-hidden border-stone-100 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.02)] rounded-3xl hover:border-orange-200 transition-all"
              >
                {/* Table Group Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-stone-50/50 border-b border-stone-100">
                  <div className="flex items-center gap-3.5">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl flex flex-col items-center justify-center shadow-xs text-white">
                        <span className="text-[8px] font-black uppercase tracking-tighter opacity-80">میز</span>
                        <span className="text-lg font-black leading-none">{group.tableNumber}</span>
                      </div>
                      <div className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${group.hasActiveOrders ? 'bg-orange-500 animate-pulse' : 'bg-emerald-500'}`} />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-black text-base text-stone-900">بخش {group.section}</h3>
                        {group.hasActiveOrders ? (
                          <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                            در حال آماده‌سازی
                          </span>
                        ) : (
                          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                            تحویل داده شد
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-medium text-stone-400 flex items-center gap-2">
                        <span className="flex items-center gap-1"><User className="w-3 h-3" /> {group.assignedWaiter}</span>
                        <span className="w-1 h-1 rounded-full bg-stone-200" />
                        <span>{group.ordersCount} سفارش</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-5">
                    <div className="text-left">
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">جمع فاکتور</span>
                      <span className="text-lg font-black text-orange-600 tracking-tight">
                        {formatPrice(group.totalAmount)}
                      </span>
                    </div>

                    {onSelectTableForPos && (
                      <Button
                        variant="primary"
                        size="sm"
                        className="rounded-xl shadow-xs"
                        onClick={() => onSelectTableForPos(group.tableId)}
                        icon={CreditCard}
                      >
                        تسویه حساب
                      </Button>
                    )}
                  </div>
                </div>

                {/* Sub-sections: Active Orders vs Completed Orders */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-stone-100">
                  {/* Left Box: Active Orders */}
                  <div className="p-6 bg-white space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-orange-500" />
                        <span className="text-xs font-black text-stone-900">در حال پخت و آماده‌سازی</span>
                      </div>
                      <span className="bg-stone-50 text-stone-500 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                        {group.activeItems.length} قلم
                      </span>
                    </div>

                    {group.activeItems.length === 0 ? (
                      <div className="py-8 text-center">
                        <p className="text-xs font-medium text-stone-400">
                          همه اقلام با موفقیت آماده و تحویل شده‌اند.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {group.activeItems.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-stone-50/60 rounded-2xl border border-stone-100 flex items-center justify-between hover:bg-white transition-all"
                          >
                            <div className="flex-1">
                              <div className="font-bold text-stone-900 text-xs flex items-center gap-2">
                                <span className="w-5 h-5 rounded-md bg-white border border-stone-200 flex items-center justify-center text-[10px] font-black">
                                  {item.quantity}
                                </span>
                                {getDishName(item)}
                              </div>
                              <div className="text-[10px] text-stone-400 mt-1 flex flex-wrap items-center gap-2">
                                <span>صندلی {item.seat_number}</span>
                                <span>•</span>
                                <span>ساعت {item.orderTime}</span>
                                {item.notes && <span className="text-orange-600 font-medium">({item.notes})</span>}
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-1 ml-3">
                              <span className="font-black text-stone-900 text-xs">
                                {formatPrice(item.subtotal || item.unit_price * item.quantity)}
                              </span>
                              {getKitchenStatusBadge(item.kitchen_status)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right Box: Completed & Served Orders */}
                  <div className="p-6 bg-stone-50/20 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-black text-stone-900">سرو شده سر میز</span>
                      </div>
                      <span className="bg-white text-stone-500 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-stone-200">
                        {group.completedItems.length} قلم
                      </span>
                    </div>

                    {group.completedItems.length === 0 ? (
                      <div className="py-8 text-center">
                        <p className="text-xs font-medium text-stone-400">
                          هنوز آیتمی از این میز تحویل داده نشده است.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {group.completedItems.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-white rounded-2xl border border-stone-100 flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center text-[10px] font-black">
                                {item.quantity}
                              </div>
                              <div>
                                <span className="font-bold text-stone-800 text-xs">{getDishName(item)}</span>
                                <span className="text-[10px] text-stone-400 block mt-0.5">صندلی #{item.seat_number}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="font-black text-stone-900 text-xs">
                                {formatPrice(item.subtotal || item.unit_price * item.quantity)}
                              </span>
                              <div className="p-1 bg-emerald-50 text-emerald-600 rounded-full">
                                <Check className="w-3 h-3" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      ) : (
        /* Timeline Mode */
        <div className="space-y-4">
          {orders.map((ord) => (
            <Card key={ord.id} className="p-6 border-stone-100 bg-white rounded-3xl shadow-xs space-y-4 hover:border-orange-200 transition-all">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-xs text-white">
                    <span className="font-black text-sm">#{ord.order_number}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-black text-stone-900 text-sm">
                        {t.orders.table} {ord.table_number}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        ord.status === 'CONFIRMED'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {ord.status === 'CONFIRMED' ? 'در جریان' : 'تکمیل شده'}
                      </span>
                    </div>
                    <div className="text-xs font-medium text-stone-400 flex items-center gap-2">
                      <span>{getSourceLabel(ord.source)}</span>
                      <span>•</span>
                      <span>{ord.waiter_name || 'پرسنل سالن'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-600">
                  <Clock className="w-3.5 h-3.5 text-orange-500" />
                  <span>{ord.created_at}</span>
                </div>
              </div>

              {/* Order Items Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {ord.items.map((item) => (
                  <div key={item.id} className="p-3 bg-stone-50/60 rounded-2xl border border-stone-100 text-xs flex justify-between items-center">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-md bg-white border border-stone-200 flex items-center justify-center font-black text-xs">
                        {item.quantity}
                      </div>
                      <div>
                        <div className="font-bold text-stone-900">{getDishName(item)}</div>
                        <div className="text-[10px] text-stone-400 mt-0.5">
                          صندلی {item.seat_number} • {item.kitchen_status}
                        </div>
                      </div>
                    </div>
                    <span className="font-black text-stone-900">{formatPrice(item.subtotal || item.unit_price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-stone-100 flex justify-between items-center">
                <span className="text-xs font-bold text-stone-400">جمع کل سفارش:</span>
                <span className="font-black text-orange-600 text-base">
                  {formatPrice(ord.items.reduce((acc, i) => acc + (i.subtotal || i.unit_price * i.quantity), 0))}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
