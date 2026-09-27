import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Filter,
  Flame,
  ChefHat,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  BellRing,
  Settings,
  Plus,
  Edit2,
  Trash2,
  Check,
  User,
  X,
  Search,
} from 'lucide-react';
import { Card, Button, Badge } from '../common/UI';
import { OrderData, OrderItemData, TableItem, KitchenStageConfig } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';

interface KdsViewProps {
  orders: OrderData[];
  tables?: TableItem[];
  onUpdateItemStatus: (orderId: string, itemId: string, newStatus: OrderItemData['kitchen_status']) => void;
  onCallWaiterFromKitchen?: (orderId: string, tableNumber: string, waiterName: string, dishName: string) => void;
  kitchenStages?: KitchenStageConfig[];
  onUpdateKitchenStages?: (stages: KitchenStageConfig[]) => void;
  onOpenProfile?: () => void;
}

const DEFAULT_STAGES: KitchenStageConfig[] = [
  { id: 'NEW', name: 'سفارش جدید', color: 'slate', badgeClass: 'bg-orange-50 text-orange-700 border-orange-200', orderIndex: 1 },
  { id: 'ACCEPTED', name: 'تأیید سرآشپز', color: 'blue', badgeClass: 'bg-sky-50 text-sky-700 border-sky-200', orderIndex: 2 },
  { id: 'PREPARING', name: 'در حال پخت و گریل', color: 'amber', badgeClass: 'bg-amber-50 text-amber-800 border-amber-200', orderIndex: 3 },
  { id: 'READY', name: 'آماده تحویل به سالن', color: 'emerald', badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200', orderIndex: 4 },
];

export function KdsView({
  orders,
  tables = [],
  onUpdateItemStatus,
  onCallWaiterFromKitchen,
  kitchenStages = DEFAULT_STAGES,
  onUpdateKitchenStages,
  onOpenProfile,
}: KdsViewProps) {
  const { t, isRtl, getDishName } = useLanguage();
  const [activeStation, setActiveStation] = useState<string>('ALL');

  // Called waiters records
  const [calledWaiters, setCalledWaiters] = useState<Record<string, { waiterName: string; time: string }>>({});
  const [callNotice, setCallNotice] = useState<string | null>(null);

  const stations = [
    { id: 'ALL', label: t.common.all },
    { id: 'پیتزا و فست‌فود', label: 'پیتزا و فست‌فود' },
    { id: 'غذای مخصوص', label: 'غذای مخصوص' },
    { id: 'غذاهای محلی', label: 'غذاهای محلی' },
    { id: 'دسر', label: 'دسر و سالاد' },
    { id: 'نوشیدنی‌ها', label: 'نوشیدنی‌ها' },
  ];

  // Flatten items for kitchen queue
  const kitchenItems = orders.flatMap((order) => {
    const tableObj = tables.find((t) => t.id === order.table_id || String(t.table_number) === String(order.table_number));
    const assignedWaiter =
      order.waiter_name ||
      tableObj?.assigned_waiter_name ||
      tableObj?.waiter_name ||
      'فرهاد انوری (گارسون موظف)';

    return order.items.map((item) => {
      let itemStation = 'پیتزا و فست‌فود';
      if (item.name.includes('قابلی') || item.name.includes('منتو') || item.name.includes('محلی')) itemStation = 'غذاهای محلی';
      else if (item.name.includes('کباب') || item.name.includes('استیک')) itemStation = 'غذای مخصوص';
      else if (item.name.includes('پیتزا') || item.name.includes('برگر') || item.name.includes('سیب')) itemStation = 'پیتزا و فست‌فود';
      else if (item.name.includes('دسر') || item.name.includes('کیک') || item.name.includes('سالاد')) itemStation = 'دسر';
      else if (item.name.includes('آب') || item.name.includes('دوغ') || item.name.includes('نوشیدنی')) itemStation = 'نوشیدنی‌ها';

      return {
        ...item,
        orderId: order.id,
        orderNumber: order.order_number,
        tableNumber: order.table_number,
        orderTime: order.created_at,
        station: itemStation,
        waiterName: assignedWaiter,
      };
    });
  });

  const filteredItems = kitchenItems.filter((i) => {
    if (activeStation === 'ALL') return true;
    return i.station === activeStation;
  });

  const [kitchenViewMode, setKitchenViewMode] = useState<'ACTIVE' | 'SERVED'>('ACTIVE');
  const [servedSearch, setServedSearch] = useState<string>('');

  const activeKitchenItems = filteredItems.filter((i) => i.kitchen_status !== 'SERVED');
  const servedItems = filteredItems.filter((i) => i.kitchen_status === 'SERVED');
  const displayedServedItems = servedItems.filter((i) =>
    i.name.toLowerCase().includes(servedSearch.toLowerCase()) ||
    String(i.tableNumber).includes(servedSearch) ||
    i.waiterName.toLowerCase().includes(servedSearch.toLowerCase())
  );

  const handleCallWaiter = (
    orderId: string,
    itemId: string,
    tableNum: string,
    waiterName: string,
    dishName: string
  ) => {
    const key = `${orderId}-${itemId}`;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setCalledWaiters((prev) => ({
      ...prev,
      [key]: { waiterName, time: nowTime },
    }));

    if (onCallWaiterFromKitchen) {
      onCallWaiterFromKitchen(orderId, tableNum, waiterName, dishName);
    }

    setCallNotice(`فراخوان گارسون «${waiterName}» برای میز ${tableNum} (${dishName}) ارسال شد.`);
    setTimeout(() => setCallNotice(null), 4000);
  };

  const nextStatusMap: Record<OrderItemData['kitchen_status'], OrderItemData['kitchen_status']> = {
    NEW: 'ACCEPTED',
    ACCEPTED: 'PREPARING',
    PREPARING: 'READY',
    READY: 'SERVED',
    SERVED: 'SERVED',
  };

  const nextStatusButtonLabel: Record<OrderItemData['kitchen_status'], string> = {
    NEW: 'تأیید سفارش',
    ACCEPTED: 'شروع پخت 🔥',
    PREPARING: 'آماده تحویل ✓',
    READY: 'تحویل به گارسون',
    SERVED: 'تکمیل شده',
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="bg-white p-6 md:p-8 border border-stone-100 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shadow-xs">
              <ChefHat className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black text-stone-900 tracking-tight">
              {t.kds.title}
            </h1>
          </div>
          <p className="text-xs text-stone-400 font-medium">
            صف هوشمند آماده‌سازی، وضعیت خط پخت، فراخوان گارسون و پیگیری لحظه‌ای
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-3">
          <div className="bg-stone-50 p-1 rounded-2xl flex items-center border border-stone-200">
            <button
              onClick={() => setKitchenViewMode('ACTIVE')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                kitchenViewMode === 'ACTIVE'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xs'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>خط پخت فعال ({activeKitchenItems.length})</span>
            </button>

            <button
              onClick={() => setKitchenViewMode('SERVED')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                kitchenViewMode === 'SERVED'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xs'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>سرو شده ({servedItems.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Station Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {stations.map((st) => {
          const count = kitchenItems.filter(
            (i) => (st.id === 'ALL' || i.station === st.id) && i.kitchen_status !== 'SERVED'
          ).length;

          return (
            <button
              key={st.id}
              onClick={() => setActiveStation(st.id)}
              className={`px-4 py-2 rounded-full whitespace-nowrap text-xs font-bold transition-all border flex items-center gap-2 ${
                activeStation === st.id
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-transparent shadow-xs'
                  : 'bg-white text-stone-600 border-stone-200 hover:border-orange-200'
              }`}
            >
              <span>{st.label}</span>
              {count > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    activeStation === st.id ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {callNotice && (
        <div className="p-4 bg-orange-50 border border-orange-200 text-orange-800 text-xs rounded-2xl flex items-center justify-between shadow-xs animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <BellRing className="w-5 h-5 text-orange-600 animate-bounce shrink-0" />
            <span className="font-bold">{callNotice}</span>
          </div>
          <button onClick={() => setCallNotice(null)} className="p-1 hover:bg-orange-100 rounded-lg text-orange-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* VIEW 1: ACTIVE PIPELINE COLUMNS */}
      {kitchenViewMode === 'ACTIVE' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-start">
          {DEFAULT_STAGES.map((stage) => {
            const statusKey = stage.id as OrderItemData['kitchen_status'];
            const colItems = activeKitchenItems.filter((i) => i.kitchen_status === statusKey);

            return (
              <div key={stage.id} className="space-y-4 bg-stone-50/50 p-4 rounded-3xl border border-stone-200/60 min-h-[500px]">
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 border-b border-stone-200 px-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-stone-900">{stage.name}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-white text-stone-600 border border-stone-200 text-xs font-bold shadow-xs">
                    {colItems.length}
                  </span>
                </div>

                {colItems.length === 0 ? (
                  <div className="py-16 text-center">
                    <p className="text-xs font-bold text-stone-300">سفارشی در این مرحله نیست</p>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {colItems.map((item) => {
                      const callKey = `${item.orderId}-${item.id}`;
                      const isCalled = Boolean(calledWaiters[callKey]);

                      return (
                        <div
                          key={item.id}
                          className="bg-white rounded-3xl p-5 border border-stone-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:border-orange-200 hover:shadow-md transition-all space-y-3.5 group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-black text-xs bg-orange-50 text-orange-600 border border-orange-200 px-2.5 py-1 rounded-xl">
                              میز {item.tableNumber}
                            </span>
                            <div className="flex items-center gap-1 text-[10px] text-stone-400 font-medium">
                              <Clock className="w-3 h-3" />
                              <span>{item.orderTime || 'هم‌اکنون'}</span>
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="w-6 h-6 rounded-lg bg-stone-100 flex items-center justify-center font-black text-stone-900 text-xs shrink-0">
                                {item.quantity}×
                              </span>
                              <h4 className="font-bold text-stone-900 text-sm leading-tight group-hover:text-orange-600 transition-colors">
                                {getDishName(item)}
                              </h4>
                            </div>
                            {item.notes && (
                              <p className="text-[11px] text-orange-600 bg-orange-50/60 p-2 rounded-xl border border-orange-100 font-medium mt-2">
                                یادداشت: {item.notes}
                              </p>
                            )}
                          </div>

                          <div className="text-[10px] font-bold text-stone-400 flex items-center justify-between pt-1 border-t border-stone-100">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" /> {item.waiterName?.split(' ')[0]}
                            </span>
                            <span className="bg-stone-50 px-2 py-0.5 rounded-md text-stone-500">{item.station}</span>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 pt-1">
                            <Button
                              variant="primary"
                              size="sm"
                              className="w-full rounded-2xl font-bold py-2 text-xs shadow-xs"
                              onClick={() => onUpdateItemStatus(item.orderId, item.id, nextStatusMap[statusKey])}
                            >
                              {nextStatusButtonLabel[statusKey]}
                            </Button>

                            {statusKey === 'READY' && (
                              <button
                                type="button"
                                onClick={() => handleCallWaiter(item.orderId, item.id, item.tableNumber, item.waiterName, item.name)}
                                className={`p-2 rounded-xl border transition-all text-xs font-bold shrink-0 ${
                                  isCalled
                                    ? 'bg-orange-50 text-orange-600 border-orange-200'
                                    : 'bg-white text-stone-500 border-stone-200 hover:border-orange-300 hover:text-orange-600 shadow-xs'
                                }`}
                                title="فراخوان گارسون"
                              >
                                <BellRing className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* VIEW 2: SERVED ARCHIVE */
        <Card className="border-stone-100 bg-white rounded-3xl shadow-xs overflow-hidden">
          <div className="p-6 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-50/50">
            <div>
              <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>آرشیو غذاهای تحویل‌داده‌شده</span>
              </h3>
              <p className="text-xs text-stone-400 mt-0.5">فهرست اقلامی که مراحل پخت آن‌ها پایان یافته و به مهمان تحویل شده است</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-full border border-stone-200 w-64 shadow-xs">
                <Search className="w-3.5 h-3.5 text-stone-400" />
                <input
                  type="text"
                  placeholder="جستجو در سفارش‌های سرو شده..."
                  value={servedSearch}
                  onChange={(e) => setServedSearch(e.target.value)}
                  className="bg-transparent border-none outline-none w-full text-xs font-bold text-stone-900 placeholder-stone-400"
                />
              </div>
            </div>
          </div>

          <div className="p-6">
            {displayedServedItems.length === 0 ? (
              <div className="py-16 text-center">
                <CheckCircle2 className="w-10 h-10 text-stone-200 mx-auto mb-2" />
                <p className="text-xs font-bold text-stone-400">موردی یافت نشد.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {displayedServedItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-white border border-stone-100 rounded-3xl space-y-3 shadow-xs hover:border-orange-200 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs bg-stone-100 text-stone-700 px-2 py-0.5 rounded-lg">
                        میز {item.tableNumber}
                      </span>
                      <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    <h4 className="font-bold text-xs text-stone-900">{getDishName(item)}</h4>

                    <div className="pt-2 border-t border-stone-100 flex justify-between items-center text-[10px] font-bold text-stone-400">
                      <span>تعداد: {item.quantity}</span>
                      <span>{item.orderTime}</span>
                    </div>

                    <div className="flex justify-between items-center pt-1 text-[10px]">
                      <span className="text-stone-400 font-medium">{item.waiterName?.split(' ')[0]}</span>
                      <button
                        type="button"
                        onClick={() => onUpdateItemStatus(item.orderId, item.id, 'READY')}
                        className="text-orange-600 hover:text-orange-700 font-bold flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        بازگردانی به خط پخت
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
