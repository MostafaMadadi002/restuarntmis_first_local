import React, { useState } from 'react';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  User,
  Coffee,
  Check,
  Receipt,
  Printer,
  DollarSign,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Clock,
  Percent,
  Layers,
  X,
  Utensils,
} from 'lucide-react';
import { Card, Button, Badge } from '../common/UI';
import { MenuItemData, TableItem, OrderData, OrderItemData, CustomerData, LoyaltyTierBenefit } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';

interface PosViewProps {
  menuItems: MenuItemData[];
  tables: TableItem[];
  orders?: OrderData[];
  initialTable?: TableItem | null;
  customers?: CustomerData[];
  tierBenefits?: LoyaltyTierBenefit[];
  onSettleBill?: (tableId: number, paymentMethod: string, discount: number, finalTotal: number, receipt?: any) => void;
  onSendOrder?: (tableId: number, items: { menuItem: MenuItemData; seat: number; qty: number; notes: string }[]) => void;
  onGoToSplitBill: (table: TableItem) => void;
  onOpenProfile?: () => void;
}

export function PosView({
  menuItems,
  tables,
  orders = [],
  initialTable,
  customers = [],
  tierBenefits = [],
  onSettleBill,
  onGoToSplitBill,
  onOpenProfile,
}: PosViewProps) {
  const { t, isRtl, formatPrice, getDishName } = useLanguage();
  const [selectedTableId, setSelectedTableId] = useState<number>(initialTable?.id || tables[1]?.id || tables[0]?.id || 1);
  const [paymentMethod, setPaymentMethod] = useState<'CASH'>('CASH');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [cashTendered, setCashTendered] = useState<string>('');

  // Payment receipt modal state
  const [receiptModalOpen, setReceiptModalOpen] = useState<boolean>(false);
  const [lastReceiptData, setLastReceiptData] = useState<{
    receiptNumber: string;
    date: string;
    time: string;
    tableNumber: string;
    waiterName: string;
    cashierName: string;
    items: OrderItemData[];
    subtotal: number;
    discountAmount: number;
    grandTotal: number;
    paymentMethod: string;
  } | null>(null);

  const selectedTable = tables.find((tItem) => tItem.id === selectedTableId) || tables[0];

  // Active orders for this table
  const activeOrdersForTable = orders.filter(
    (o) => (o.table_id === selectedTable?.id || String(o.table_number) === String(selectedTable?.table_number)) && o.status !== 'COMPLETED'
  );

  // All ordered items from active orders
  const activeItems: OrderItemData[] = activeOrdersForTable.flatMap((o) => o.items);

  // Subtotal calculation
  const subtotal = activeItems.length > 0
    ? activeItems.reduce((acc, i) => acc + (i.subtotal || i.unit_price * i.quantity), 0)
    : (selectedTable?.current_bill_total || 0);

  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const grandTotal = Math.max(0, subtotal - discountAmount);

  // Cash change calculation
  const cashNum = Number(cashTendered) || 0;
  const changeDue = Math.max(0, cashNum - grandTotal);

  const handleSettleAndReceipt = () => {
    const receiptNum = `REC-${Date.now().toString().slice(-6)}`;
    const now = new Date();
    const dateStr = now.toLocaleDateString('fa-IR');
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const waiterName = selectedTable?.assigned_waiter_name || selectedTable?.waiter_name || 'فرهاد انوری';

    const receiptPayload = {
      receiptNumber: receiptNum,
      date: dateStr,
      time: timeStr,
      tableNumber: selectedTable?.table_number || '1',
      waiterName,
      cashierName: 'صندوقدار مرکزی',
      items: activeItems.length > 0 ? activeItems : [
        {
          id: 'item-1',
          menu_item_id: 1,
          name: 'سفارش میز ' + selectedTable.table_number,
          seat_number: 1,
          quantity: 1,
          unit_price: subtotal,
          subtotal: subtotal,
          course: 'COURSE_2' as const,
          kitchen_status: 'SERVED' as const,
        },
      ],
      subtotal,
      discountAmount,
      grandTotal,
      paymentMethod: 'پرداخت نقدی (وجه نقد)',
      pointsEarned: Math.round(grandTotal * 0.05),
    };

    setLastReceiptData(receiptPayload);
    setReceiptModalOpen(true);

    if (onSettleBill && selectedTable) {
      onSettleBill(selectedTable.id, 'CASH', discountAmount, grandTotal, receiptPayload);
    }
  };

  const handlePrintReceipt = () => {
    if (!lastReceiptData) return;
    try {
      const existing = document.getElementById('isolated-receipt-print-frame');
      if (existing) existing.remove();

      const iframe = document.createElement('iframe');
      iframe.id = 'isolated-receipt-print-frame';
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.style.opacity = '0';
      iframe.style.pointerEvents = 'none';

      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document;
      if (!doc) {
        window.print();
        return;
      }

      const itemsHtml = lastReceiptData.items
        .map(
          (item: any) => `
        <div style="display:flex; justify-content:space-between; margin-bottom:4px; font-size:11px;">
          <span>${item.quantity}× ${item.name}</span>
          <span style="font-weight:bold;">$${item.subtotal || item.unit_price * item.quantity}</span>
        </div>`
        )
        .join('');

      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html dir="${isRtl ? 'rtl' : 'ltr'}">
        <head>
          <meta charset="utf-8">
          <title>فاکتور ${lastReceiptData.receiptNumber}</title>
          <style>
            @page { size: 80mm auto; margin: 4mm; }
            body { font-family: system-ui, -apple-system, sans-serif; font-size: 11px; color: #111; margin: 0; padding: 10px; line-height: 1.4; width: 280px; }
            .center { text-align: center; }
            .dashed { border-bottom: 1px dashed #777; margin: 8px 0; }
            .row { display: flex; justify-content: space-between; margin-bottom: 3px; }
            .bold { font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="center">
            <h2 style="margin:0 0 4px 0; font-size:15px; font-weight:900;">Pizza Hut & Aria Grill</h2>
            <div style="font-size:10px; color:#555;">کابل، کوچه اعیان‌نشین، سالن مرکزی</div>
            <div style="font-size:10px; margin-top:4px;">شماره فاکتور: <strong>${lastReceiptData.receiptNumber}</strong></div>
            <div style="font-size:9px; color:#555;">تاریخ: ${lastReceiptData.date} • ساعت: ${lastReceiptData.time}</div>
          </div>
          <div class="dashed"></div>
          <div class="row">
            <span>شماره میز: <strong>${lastReceiptData.tableNumber}</strong></span>
            <span>گارسون: ${lastReceiptData.waiterName}</span>
          </div>
          <div class="dashed"></div>
          <div>${itemsHtml}</div>
          <div class="dashed"></div>
          <div class="row">
            <span>جمع جزء:</span>
            <span>$${lastReceiptData.subtotal}</span>
          </div>
          ${lastReceiptData.discountAmount > 0 ? `
          <div class="row" style="color:#b45309;">
            <span>تخفیف:</span>
            <span>-$${lastReceiptData.discountAmount}</span>
          </div>` : ''}
          <div class="row bold" style="font-size:13px; margin-top:4px;">
            <span>مبلغ پرداخت‌شده:</span>
            <span>$${lastReceiptData.grandTotal}</span>
          </div>
          <div class="row" style="font-size:10px; color:#555; margin-top:3px;">
            <span>روش تسویه:</span>
            <span>پرداخت نقدی</span>
          </div>
          <div class="dashed"></div>
          <div class="center" style="font-size:10px; color:#555; margin-top:6px;">
            از خرید و اعتماد شما سپاسگزاریم!<br/>
            <strong>نوش جان!</strong>
          </div>
        </body>
        </html>
      `);
      doc.close();

      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      }, 250);
    } catch (err) {
      console.error('Print error, falling back to window.print', err);
      window.print();
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 pb-10">
      {/* Left Column: Tables with Active Bills Selection */}
      <div className="flex-1 flex flex-col bg-white border border-stone-100 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
        {/* Top Header */}
        <div className="p-6 border-b border-stone-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shadow-xs">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-stone-900 tracking-tight">
                {isRtl ? 'صندوق و تسویه فاکتور' : 'Checkout & Settlement'}
              </h2>
              <p className="text-xs text-stone-400 font-medium">
                {isRtl ? 'مدیریت صورتحساب، تخفیف و تسویه نقدی' : 'Live settlement & table billing'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onGoToSplitBill(selectedTable)}
              icon={Layers}
              className="rounded-full"
            >
              {isRtl ? 'تسویه اشتراکی دنگی' : 'Split Bill'}
            </Button>

            <div className="flex items-center gap-2 bg-stone-50 px-3 py-1.5 rounded-2xl border border-stone-200">
              <span className="text-[11px] font-bold text-stone-400">
                {isRtl ? 'میز انتخابی:' : 'Table:'}
              </span>
              <select
                value={selectedTableId}
                onChange={(e) => setSelectedTableId(Number(e.target.value))}
                className="text-xs font-black bg-transparent text-stone-900 outline-none"
              >
                {tables.map((tItem) => (
                  <option key={tItem.id} value={tItem.id}>
                    میز {tItem.table_number} ({tItem.section_name || tItem.section || 'سالن'})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table Selector Grid: Visual Tiles of Active Tables */}
        <div className="px-6 py-3 bg-stone-50/40 border-b border-stone-100 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-3">
            {tables.map((tItem) => {
              const isSelected = selectedTableId === tItem.id;
              const hasBalance = (tItem.current_bill_total || 0) > 0 || tItem.status === 'OCCUPIED';

              return (
                <button
                  key={tItem.id}
                  onClick={() => setSelectedTableId(tItem.id)}
                  className={`px-4 py-3 rounded-2xl border text-right transition-all flex flex-col justify-between shrink-0 min-w-[130px] ${
                    isSelected
                      ? 'border-orange-500 bg-gradient-to-r from-orange-500 to-rose-400 text-white shadow-md shadow-orange-500/25 scale-[1.02]'
                      : hasBalance
                      ? 'border-orange-200 bg-white hover:border-orange-300'
                      : 'border-stone-100 bg-white hover:border-stone-200'
                  }`}
                >
                  <div className="flex justify-between items-center w-full mb-1">
                    <span className={`font-black text-xs tabular-nums ${isSelected ? 'text-white' : 'text-stone-900'}`}>
                      میز {tItem.table_number}
                    </span>
                    <div
                      className={`w-2 h-2 rounded-full ${
                        isSelected ? 'bg-white' : hasBalance ? 'bg-orange-500 animate-pulse' : 'bg-emerald-500'
                      }`}
                    />
                  </div>
                  <div className={`text-sm font-black tabular-nums ${isSelected ? 'text-white' : 'text-stone-900'}`}>
                    ${(tItem.current_bill_total || 0).toLocaleString()}
                  </div>
                  <div className={`text-[10px] font-medium truncate max-w-[90px] mt-0.5 ${isSelected ? 'text-white/80' : 'text-stone-400'}`}>
                    {tItem.assigned_waiter_name?.split(' ')[0] || 'بدون گارسون'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Detailed Items of the Selected Table Order */}
        <div className="flex-1 p-6 overflow-y-auto no-scrollbar space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-stone-400 uppercase tracking-wider">
              {isRtl ? `اقلام سفارش • میز ${selectedTable.table_number}` : `Order Items • Table ${selectedTable.table_number}`}
            </h3>
            <Badge variant="neutral">
              {activeItems.length} {isRtl ? 'قلم' : 'Items'}
            </Badge>
          </div>

          {activeItems.length === 0 && subtotal === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-stone-50 text-stone-300 flex items-center justify-center">
                <Coffee className="w-8 h-8 text-stone-300" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-black text-stone-400">
                  {isRtl ? 'هیچ فاکتور فعالی برای این میز نیست' : 'No Active Balance'}
                </p>
                <p className="text-xs text-stone-400 font-medium">
                  {isRtl ? 'این میز هم‌اکنون خالی است یا سفارش تسویه نشده ندارد.' : 'This table is currently free.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {activeItems.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-white border border-stone-100 rounded-2xl flex items-center justify-between group hover:border-orange-100 hover:shadow-md hover:shadow-orange-500/5 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 font-black text-sm flex items-center justify-center tabular-nums">
                      {item.quantity}×
                    </div>
                    <div>
                      <div className="font-black text-stone-900 text-sm tracking-tight">{getDishName(item)}</div>
                      <div className="text-[11px] text-stone-400 font-medium mt-0.5 flex items-center gap-2">
                        <span className="tabular-nums">قیمت واحد: ${item.unit_price}</span>
                        <div className="w-1 h-1 rounded-full bg-stone-200" />
                        <span>صندلی #{item.seat_number || 1}</span>
                        {item.notes && (
                          <>
                            <div className="w-1 h-1 rounded-full bg-stone-200" />
                            <span className="text-orange-600 font-medium">"{item.notes}"</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className="font-black text-stone-900 text-base tabular-nums">
                    ${(item.subtotal || item.unit_price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}

              {activeItems.length === 0 && subtotal > 0 && (
                <div className="p-5 bg-gradient-to-r from-orange-500 to-rose-400 text-white rounded-2xl flex items-center justify-between shadow-md shadow-orange-500/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                      <Layers className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-black text-sm">مبلغ بدهی ثبت‌شده میز</div>
                      <p className="text-[11px] text-white/80">ثبت مستقیم در سیستم</p>
                    </div>
                  </div>
                  <span className="font-black text-xl tabular-nums">
                    ${subtotal.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Checkout, Discounts, Payment Method & Receipt Generator */}
      <div className="w-full lg:w-[380px] bg-white border border-stone-100 rounded-3xl flex flex-col justify-between overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
        {/* Header */}
        <div className="p-6 border-b border-stone-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-xl text-stone-900 tracking-tight">
                {isRtl ? 'تسویه و پرداخت' : 'Checkout'}
              </h3>
              <p className="text-xs text-stone-400 font-medium mt-0.5">
                {isRtl ? 'محاسبه تخفیف و ثبت وجه' : 'Calculation & Tender'}
              </p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Payment Configuration */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto no-scrollbar">
          {/* Discount & Loyalty Tier */}
          <section className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-black text-stone-500 flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-orange-500" />
                {isRtl ? 'تخفیف مشتری / باشگاه وفاداری' : 'Loyalty Discount'}
              </label>
              <Badge variant="amber" size="sm">{discountPercent}%</Badge>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[0, 5, 10, 15].map((pct) => (
                <button
                  key={pct}
                  onClick={() => setDiscountPercent(pct)}
                  className={`py-2.5 rounded-xl font-black text-xs border transition-all tabular-nums ${
                    discountPercent === pct
                      ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                      : 'bg-white text-stone-600 border-stone-200 hover:border-orange-200'
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </section>

          {/* Cash Payment Method Notice */}
          <div className="p-4 bg-orange-50/60 border border-orange-100 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-black text-xs text-orange-950 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-orange-600" />
                {isRtl ? 'پرداخت نقدی (Cash Only)' : 'Cash Payment Only'}
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-[11px] text-orange-800/80 font-medium leading-relaxed">
              {isRtl
                ? 'امتیاز وفاداری پس از ثبت موفقیت‌آمیز فاکتور به مشتری واریز می‌گردد.'
                : 'Points will be credited automatically after payment.'}
            </p>
          </div>

          {/* Cash Tendered Input */}
          <section className="space-y-3">
            <label className="text-xs font-black text-stone-500 block">
              {isRtl ? 'وجه دریافتی از مشتری:' : 'Cash Received'}
            </label>
            <div className="relative">
              <input
                type="number"
                placeholder={String(grandTotal)}
                value={cashTendered}
                onChange={(e) => setCashTendered(e.target.value)}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-black text-lg tabular-nums transition-all"
              />
              <div className={`absolute top-1/2 -translate-y-1/2 text-stone-400 font-bold text-xs ${isRtl ? 'left-4' : 'right-4'}`}>
                $
              </div>
            </div>
            
            {cashNum > 0 && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex justify-between items-center animate-in slide-in-from-top-1">
                <span className="text-xs font-bold text-emerald-800">
                  {isRtl ? 'باقیمانده بازگشتی به مشتری:' : 'Change Due'}
                </span>
                <span className="text-base font-black text-emerald-600 tabular-nums">
                  ${changeDue.toLocaleString()}
                </span>
              </div>
            )}
          </section>
        </div>

        {/* Grand Total & Final Settle Button */}
        <div className="p-6 border-t border-stone-100 space-y-4 bg-stone-50/40">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-stone-400">{isRtl ? 'جمع جزء:' : 'Subtotal'}</span>
              <span className="font-black text-stone-900 tabular-nums">${subtotal.toLocaleString()}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between items-center text-xs text-orange-600">
                <span className="font-bold">{isRtl ? `تخفیف (${discountPercent}%):` : `Discount (${discountPercent}%):`}</span>
                <span className="font-black tabular-nums">-${discountAmount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-3 border-t border-stone-200">
              <span className="text-sm font-black text-stone-900">{isRtl ? 'مجموع قابل پرداخت:' : 'Grand Total'}</span>
              <span className="text-2xl font-black text-orange-600 tabular-nums">
                ${grandTotal.toLocaleString()}
              </span>
            </div>
          </div>

          <button
            disabled={grandTotal <= 0}
            onClick={handleSettleAndReceipt}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-sm shadow-md shadow-orange-500/25 active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <Receipt className="w-4 h-4" />
            <span>{isRtl ? 'تسویه و چاپ فاکتور' : 'Settle & Print Receipt'}</span>
          </button>
        </div>
      </div>

      {/* Official Payment Receipt Modal */}
      {receiptModalOpen && lastReceiptData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-stone-100 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header Actions */}
            <div className="p-6 bg-gradient-to-r from-orange-500 to-rose-500 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-black tracking-tight">{isRtl ? 'پرداخت با موفقیت انجام شد' : 'Payment Success'}</h3>
                  <p className="text-[10px] text-white/80">{isRtl ? 'رسید دیجیتال صادر شد' : 'Receipt generated successfully'}</p>
                </div>
              </div>
              <button
                onClick={() => setReceiptModalOpen(false)}
                className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Thermal Receipt Card */}
            <div className="p-6 bg-stone-50/50">
              <div id="printable-receipt-slip" className="bg-white p-6 rounded-2xl shadow-xs border border-stone-100 space-y-4">
                {/* Receipt Header */}
                <div className="text-center space-y-1">
                  <h3 className="font-black text-lg text-stone-900 tracking-tight">Pizza Hut & Aria Grill</h3>
                  <p className="text-[10px] text-stone-400">کوچه اعیان‌نشین، سالن مرکزی</p>
                  <div className="text-[10px] font-bold text-stone-500 pt-1">
                    شماره فاکتور: <span className="font-mono">{lastReceiptData.receiptNumber}</span>
                  </div>
                </div>

                {/* Table & Waiter Info */}
                <div className="grid grid-cols-2 gap-2 py-3 border-y border-stone-100 text-xs">
                  <div className="text-center">
                    <span className="text-[10px] text-stone-400 block">شماره میز</span>
                    <span className="font-black text-stone-900">{lastReceiptData.tableNumber}</span>
                  </div>
                  <div className="text-center border-l border-stone-100">
                    <span className="text-[10px] text-stone-400 block">گارسون</span>
                    <span className="font-black text-stone-900 truncate">{lastReceiptData.waiterName}</span>
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-2 text-xs">
                  {lastReceiptData.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span className="text-stone-700">
                        {item.quantity}× {item.name}
                      </span>
                      <span className="font-bold text-stone-900 tabular-nums">
                        ${item.subtotal || item.unit_price * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="pt-3 border-t border-stone-100 space-y-1 text-xs">
                  <div className="flex justify-between text-stone-500">
                    <span>جمع جزء:</span>
                    <span className="tabular-nums">${lastReceiptData.subtotal}</span>
                  </div>
                  {lastReceiptData.discountAmount > 0 && (
                    <div className="flex justify-between text-orange-600">
                      <span>تخفیف:</span>
                      <span className="tabular-nums">-${lastReceiptData.discountAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-black text-sm text-stone-900 pt-2 border-t border-stone-100">
                    <span>مبلغ پرداخت‌شده:</span>
                    <span className="tabular-nums text-orange-600">${lastReceiptData.grandTotal}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex gap-3">
                <button
                  onClick={handlePrintReceipt}
                  className="flex-1 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>{isRtl ? 'چاپ فاکتور فیزیکی' : 'Print Receipt'}</span>
                </button>
                <button
                  onClick={() => setReceiptModalOpen(false)}
                  className="px-5 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition-all"
                >
                  {isRtl ? 'بستن' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
