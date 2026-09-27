import React, { useState } from 'react';
import {
  Boxes,
  AlertTriangle,
  Plus,
  ArrowDownRight,
  TrendingDown,
  Sparkles,
  Search,
  CheckCircle2,
} from 'lucide-react';
import { Card, Button, Badge } from '../common/UI';
import { InventoryItemData } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';

interface InventoryViewProps {
  inventory: InventoryItemData[];
  onSimulateUsage: (itemId: number, amount: number) => void;
}

export function InventoryView({ inventory, onSimulateUsage }: InventoryViewProps) {
  const { t, isRtl, formatPrice } = useLanguage();
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'HEALTHY' | 'LOW' | 'OUT'>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filtered = inventory.filter((item) => {
    const matchesFilter = filterStatus === 'ALL' || item.status === filterStatus;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalValue = inventory.reduce((acc, i) => acc + i.current_stock * i.cost_per_unit, 0);
  const lowCount = inventory.filter((i) => i.status !== 'HEALTHY').length;

  const statusFilterButtons = [
    { id: 'ALL', label: t.common.all },
    { id: 'HEALTHY', label: t.inventory.healthy },
    { id: 'LOW', label: t.inventory.lowStock },
    { id: 'OUT', label: t.inventory.criticalStock },
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="bg-white p-6 md:p-8 border border-stone-100 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shadow-xs">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-stone-900 tracking-tight">
              {t.inventory.title}
            </h1>
            <p className="text-xs text-stone-400 font-medium">
              {t.inventory.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="md"
            onClick={() => onSimulateUsage(1, 0.15)}
            icon={TrendingDown}
            className="rounded-2xl font-bold border-stone-200"
          >
            {t.inventory.reorderBtn}
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            className="rounded-2xl font-bold shadow-md shadow-orange-500/20"
          >
            افزودن اقلام انبار
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="p-6 border-stone-100 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.02)] rounded-3xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-stone-400 uppercase">ارزش کل موجودی</span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-stone-900 tracking-tight">
            {formatPrice(Math.round(totalValue))}
          </div>
          <p className="text-[11px] font-medium text-stone-400 mt-1">بر اساس هزینه میانگین واحد انبار</p>
        </Card>

        <Card className="p-6 border-stone-100 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.02)] rounded-3xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-stone-400 uppercase">{t.inventory.criticalStock}</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600 tracking-tight">
            {lowCount} <span className="text-xs font-bold text-stone-400">قلم کالا</span>
          </div>
          <p className="text-[11px] font-medium text-rose-500 mt-1">{t.dashboard.criticalLow}</p>
        </Card>

        <Card className="p-6 border-stone-100 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.02)] rounded-3xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-stone-400 uppercase">تعداد اقلام ثبت‌شده</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-stone-900 tracking-tight">
            {inventory.length} <span className="text-xs font-bold text-stone-400">آیتم فعال</span>
          </div>
          <p className="text-[11px] font-medium text-emerald-600 mt-1">پایش لحظه‌ای مصرف با فاکتور</p>
        </Card>
      </div>

      {/* Filter and Table */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {statusFilterButtons.map((st) => (
            <button
              key={st.id}
              onClick={() => setFilterStatus(st.id as any)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                filterStatus === st.id
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-transparent shadow-xs'
                  : 'bg-white text-stone-600 border-stone-200 hover:border-orange-200'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-stone-200 focus-within:border-orange-500 w-full sm:w-64 shadow-xs">
          <Search className="w-4 h-4 text-stone-400 shrink-0" />
          <input
            type="text"
            placeholder="جستجوی اقلام انبار..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs font-bold outline-none bg-transparent text-stone-900 placeholder-stone-400"
          />
        </div>
      </div>

      <Card className="border-stone-100 bg-white shadow-xs rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className={`w-full ${isRtl ? 'text-right' : 'text-left'}`}>
            <thead>
              <tr className="bg-stone-50/70 text-[11px] font-bold text-stone-400 uppercase border-b border-stone-100">
                <th className="px-6 py-4">نام کالا / مواد اولیه</th>
                <th className="px-6 py-4">دسته‌بندی</th>
                <th className="px-6 py-4">موجودی فعلی</th>
                <th className="px-6 py-4">حداقل مجاز</th>
                <th className="px-6 py-4">هزینه واحد</th>
                <th className="px-6 py-4">وضعیت انبار</th>
                <th className="px-6 py-4 text-center">مصرف دستی</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-stone-900">
                    {item.name}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-stone-700 bg-stone-100 px-2.5 py-0.5 rounded-full text-[11px]">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-black text-stone-900">
                    {item.current_stock} {item.base_unit}
                  </td>
                  <td className="px-6 py-4 font-bold text-stone-400">
                    {item.minimum_stock} {item.base_unit}
                  </td>
                  <td className="px-6 py-4 font-bold text-stone-700">
                    {formatPrice(item.cost_per_unit)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      item.status === 'HEALTHY'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : item.status === 'LOW'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {item.status === 'HEALTHY' ? 'کافی' : item.status === 'LOW' ? 'کمبود' : 'بحرانی'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => onSimulateUsage(item.id, 1)}
                      className="px-3 py-1 bg-stone-50 border border-stone-200 rounded-xl text-stone-700 hover:border-orange-300 hover:text-orange-600 transition-all font-bold text-[11px]"
                    >
                      کاهش ۱ {item.base_unit}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
