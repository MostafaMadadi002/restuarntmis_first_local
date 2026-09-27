import React, { useState } from 'react';
import {
  CreditCard,
  Plus,
  Trash2,
  DollarSign,
  Receipt,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { Card, Button, Badge } from '../common/UI';
import { useLanguage } from '../../i18n/LanguageContext';

import { MenuItemData, TableItem, OrderData } from '../../types';

interface SplitPayment {
  id: string;
  name: string;
  amount: number;
  method: 'cash' | 'card' | 'online';
  paid: boolean;
}

interface SplitBillViewProps {
  table?: TableItem;
  orderTotal?: number;
  tableNumber?: string | number;
  onComplete?: () => void;
  onClose?: () => void;
  onSuccessPayment?: () => void;
}

export const SplitBillView: React.FC<SplitBillViewProps> = ({
  table,
  orderTotal: initialOrderTotal,
  tableNumber: initialTableNumber,
  onComplete,
  onClose,
  onSuccessPayment,
}) => {
  const { t, formatPrice } = useLanguage();
  const orderTotal = initialOrderTotal ?? table?.current_bill_total ?? (table as any)?.bill_total ?? (table as any)?.current_total ?? 120;
  const tableNumber = initialTableNumber ?? table?.table_number ?? '4';
  const [splits, setSplits] = useState<SplitPayment[]>([
    { id: '1', name: 'مشتری ۱ (نفر اول)', amount: orderTotal / 2, method: 'cash', paid: false },
    { id: '2', name: 'مشتری ۲ (نفر دوم)', amount: orderTotal / 2, method: 'card', paid: false },
  ]);

  const [customCount, setCustomCount] = useState<number>(2);

  const totalAssigned = splits.reduce((acc, s) => acc + s.amount, 0);
  const remaining = orderTotal - totalAssigned;
  const allPaid = splits.every((s) => s.paid);

  const handleEqualSplit = (count: number) => {
    setCustomCount(count);
    const amountPerPerson = Math.floor(orderTotal / count);
    const remainder = orderTotal - amountPerPerson * count;

    const newSplits: SplitPayment[] = Array.from({ length: count }, (_, i) => ({
      id: String(i + 1),
      name: `نفر ${i + 1}`,
      amount: i === 0 ? amountPerPerson + remainder : amountPerPerson,
      method: 'cash',
      paid: false,
    }));
    setSplits(newSplits);
  };

  const handleAddSplit = () => {
    const newId = String(Date.now());
    setSplits([
      ...splits,
      {
        id: newId,
        name: `سهم پرداختی ${splits.length + 1}`,
        amount: remaining > 0 ? remaining : 0,
        method: 'cash',
        paid: false,
      },
    ]);
  };

  const handleRemoveSplit = (id: string) => {
    if (splits.length <= 1) return;
    setSplits(splits.filter((s) => s.id !== id));
  };

  const handleAmountChange = (id: string, newAmount: number) => {
    setSplits(splits.map((s) => (s.id === id ? { ...s, amount: Math.max(0, newAmount) } : s)));
  };

  const handleMethodChange = (id: string, method: 'cash' | 'card' | 'online') => {
    setSplits(splits.map((s) => (s.id === id ? { ...s, method } : s)));
  };

  const togglePaid = (id: string) => {
    setSplits(splits.map((s) => (s.id === id ? { ...s, paid: !s.paid } : s)));
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-orange-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-600 shadow-sm">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
              تفکیک و تسویه چندگانه فاکتور (Split Bill)
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
              میز شماره {tableNumber} • تسویه دُنگی یا پرداخت در چند درگاه مختلف
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {onClose && (
            <Button
              variant="outline"
              onClick={onClose}
              className="rounded-2xl border-orange-200 text-slate-700 hover:bg-orange-50/50"
            >
              انصراف و بازگشت
            </Button>
          )}
          <Button
            onClick={() => handleEqualSplit(2)}
            variant="outline"
            className="rounded-2xl border-orange-200 text-orange-600 hover:bg-orange-50 flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            تقسیم مساوی ۲ نفره
          </Button>
        </div>
      </div>

      {/* Bill Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 rounded-3xl border-orange-100/60 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400">کل مبلغ سفارش</p>
            <p className="text-2xl font-black text-slate-800 mt-1">{formatPrice(orderTotal)}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700">
            <Receipt className="w-6 h-6" />
          </div>
        </Card>

        <Card className="p-5 rounded-3xl border-orange-100/60 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400">مجموع سهم‌های تعیین‌شده</p>
            <p
              className={`text-2xl font-black mt-1 ${
                Math.abs(remaining) < 0.01
                  ? 'text-emerald-600'
                  : remaining > 0
                  ? 'text-amber-600'
                  : 'text-red-600'
              }`}
            >
              {formatPrice(totalAssigned)}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600">
            <DollarSign className="w-6 h-6" />
          </div>
        </Card>

        <Card
          className={`p-5 rounded-3xl border shadow-sm flex items-center justify-between ${
            Math.abs(remaining) < 0.01
              ? 'bg-emerald-50/50 border-emerald-200'
              : remaining > 0
              ? 'bg-amber-50/50 border-amber-200'
              : 'bg-red-50/50 border-red-200'
          }`}
        >
          <div>
            <p className="text-xs font-bold text-slate-500">
              {Math.abs(remaining) < 0.01
                ? 'تطابق کامل حساب'
                : remaining > 0
                ? 'مبلغ باقیمانده بدون سهم'
                : 'مبلغ مازاد (بیش از فاکتور)'}
            </p>
            <p
              className={`text-2xl font-black mt-1 ${
                Math.abs(remaining) < 0.01
                  ? 'text-emerald-700'
                  : remaining > 0
                  ? 'text-amber-700'
                  : 'text-red-700'
              }`}
            >
              {Math.abs(remaining) < 0.01 ? 'تراز صفر ✓' : formatPrice(Math.abs(remaining))}
            </p>
          </div>
          <div
            className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${
              Math.abs(remaining) < 0.01
                ? 'bg-white border-emerald-300 text-emerald-600'
                : 'bg-white border-amber-300 text-amber-600'
            }`}
          >
            {Math.abs(remaining) < 0.01 ? (
              <CheckCircle2 className="w-6 h-6" />
            ) : (
              <RotateCcw className="w-6 h-6" />
            )}
          </div>
        </Card>
      </div>

      {/* Quick split buttons */}
      <div className="bg-white p-4 rounded-3xl border border-orange-100 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">تقسیم سریع به:</span>
          {[2, 3, 4, 5, 6].map((num) => (
            <button
              key={num}
              onClick={() => handleEqualSplit(num)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                customCount === num
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-orange-50 hover:text-orange-600 border border-slate-100'
              }`}
            >
              {num} سهم مساوی
            </button>
          ))}
        </div>

        <Button
          onClick={handleAddSplit}
          variant="outline"
          className="rounded-2xl border-orange-200 text-orange-600 hover:bg-orange-50 text-xs font-bold flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          افزودن سهم دلخواه
        </Button>
      </div>

      {/* Splits List */}
      <div className="space-y-3">
        {splits.map((s, index) => (
          <div
            key={s.id}
            className={`p-5 rounded-3xl border transition-all ${
              s.paid
                ? 'bg-emerald-50/40 border-emerald-200'
                : 'bg-white border-orange-100/70 hover:border-orange-200 shadow-sm'
            }`}
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center font-black text-sm ${
                    s.paid
                      ? 'bg-emerald-500 text-white'
                      : 'bg-orange-100 text-orange-700'
                  }`}
                >
                  {index + 1}
                </div>
                <input
                  type="text"
                  value={s.name}
                  onChange={(e) =>
                    setSplits(
                      splits.map((item) =>
                        item.id === s.id ? { ...item, name: e.target.value } : item
                      )
                    )
                  }
                  className="font-bold text-slate-800 text-sm bg-transparent border-b border-transparent hover:border-slate-200 focus:border-orange-500 focus:outline-none px-1"
                />
                {s.paid && (
                  <Badge variant="success" className="bg-emerald-100 text-emerald-800 border-none font-bold text-xs">
                    پرداخت شده
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Amount Input */}
                <div className="flex items-center gap-1 bg-slate-50 border border-slate-200/80 rounded-2xl px-3 py-1.5">
                  <span className="text-xs font-bold text-slate-400">$</span>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={s.amount}
                    onChange={(e) => handleAmountChange(s.id, Number(e.target.value))}
                    disabled={s.paid}
                    className="w-24 text-sm font-black text-slate-800 bg-transparent focus:outline-none text-left"
                  />
                </div>

                {/* Method selector */}
                <div className="flex rounded-2xl bg-slate-100/80 p-1 border border-slate-200/60">
                  <button
                    onClick={() => handleMethodChange(s.id, 'cash')}
                    disabled={s.paid}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                      s.method === 'cash'
                        ? 'bg-white text-slate-800 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    نقدی
                  </button>
                  <button
                    onClick={() => handleMethodChange(s.id, 'card')}
                    disabled={s.paid}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                      s.method === 'card'
                        ? 'bg-white text-slate-800 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    پوز / کارت
                  </button>
                  <button
                    onClick={() => handleMethodChange(s.id, 'online')}
                    disabled={s.paid}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                      s.method === 'online'
                        ? 'bg-white text-slate-800 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    آنلاین
                  </button>
                </div>

                {/* Mark as paid button */}
                <button
                  onClick={() => togglePaid(s.id)}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    s.paid
                      ? 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700'
                      : 'bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200/80'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {s.paid ? 'ثبت پرداخت شد' : 'تأیید وصول'}
                </button>

                {/* Remove button */}
                {splits.length > 1 && !s.paid && (
                  <button
                    onClick={() => handleRemoveSplit(s.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Final Action */}
      <div className="bg-white p-6 rounded-3xl border border-orange-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-slate-400">وضعیت نهایی پرداخت فاکتور</p>
          <p className="text-sm font-bold text-slate-800 mt-1">
            {allPaid && Math.abs(remaining) < 0.01
              ? '✓ تمام مبالغ به‌طور کامل تسویه شدند'
              : 'چند سهم هنوز تسویه نشده یا مبالغ با جمع کل همخوانی ندارند'}
          </p>
        </div>

        <Button
          onClick={() => {
            if (onComplete) onComplete();
            if (onSuccessPayment) onSuccessPayment();
          }}
          disabled={!allPaid || Math.abs(remaining) >= 0.01}
          className="rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-8 py-3.5 font-black text-sm shadow-[0_4px_16px_rgba(249,115,22,0.25)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <ShieldCheck className="w-5 h-5" />
          تکمیل نهایی و بستن فاکتور میز {tableNumber}
        </Button>
      </div>
    </div>
  );
};
