import React, { useState } from 'react';
import {
  Calendar,
  Download,
  Filter,
  TrendingUp,
  DollarSign,
  Utensils,
  Clock,
  ArrowUpRight,
  Receipt,
  Printer,
  Search,
  Eye,
  CheckCircle2,
  X,
  Sparkles,
} from 'lucide-react';
import { Card, Button, Badge, EmptyState } from '../common/UI';
import { useLanguage } from '../../i18n/LanguageContext';

interface ReportsViewProps {
  receipts?: any[];
}

export function ReportsView({ receipts = [] }: ReportsViewProps) {
  const { t, isRtl, formatPrice } = useLanguage();
  const [activeTab, setActiveTab] = useState<'METRICS' | 'RECEIPTS'>('METRICS');
  const [dateRange, setDateRange] = useState<'TODAY' | 'YESTERDAY' | 'WEEK' | 'MONTH'>('TODAY');
  const [receiptSearch, setReceiptSearch] = useState<string>('');
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);

  const dateRangeButtons = [
    { id: 'TODAY', label: 'امروز' },
    { id: 'YESTERDAY', label: 'دیروز' },
    { id: 'WEEK', label: 'این هفته' },
    { id: 'MONTH', label: 'این ماه' },
  ];

  const filteredReceipts = receipts.filter((r) => {
    const q = receiptSearch.toLowerCase();
    const rNum = String(r.receiptNumber || r.receipt_number || '').toLowerCase();
    const tNum = String(r.tableNumber || r.table_number || '').toLowerCase();
    const wName = String(r.waiterName || r.waiter_name || '').toLowerCase();
    return rNum.includes(q) || tNum.includes(q) || wName.includes(q);
  });

  const todayTotalSales = receipts.reduce((acc, r) => acc + (r.grandTotal || r.grand_total || 0), 0) || 1240;
  const totalDiscount = receipts.reduce((acc, r) => acc + (r.discountAmount || r.discount_amount || 0), 0) || 68;
  const avgOrderValue = receipts.length > 0 ? Math.round(todayTotalSales / receipts.length) : 38;

  const handlePrintReceiptSlip = (rec: any) => {
    try {
      const existing = document.getElementById('reports-receipt-print-frame');
      if (existing) existing.remove();

      const iframe = document.createElement('iframe');
      iframe.id = 'reports-receipt-print-frame';
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

      const itemsList = rec.items || [];
      const itemsHtml = itemsList
        .map(
          (item: any) => `
        <div style="display:flex; justify-content:space-between; margin-bottom:4px; font-size:11px;">
          <span>${item.quantity || item.qty || 1}× ${item.name}</span>
          <span style="font-weight:bold;">$${item.subtotal || item.unit_price * (item.quantity || 1)}</span>
        </div>`
        )
        .join('');

      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html dir="${isRtl ? 'rtl' : 'ltr'}">
        <head>
          <meta charset="utf-8">
          <title>چاپ مجدد فاکتور ${rec.receiptNumber || rec.receipt_number}</title>
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
            <div style="font-size:10px; color:#555;">سالن مرکزی رستوران</div>
            <div style="font-size:10px; margin-top:4px;">شماره فاکتور: <strong>${rec.receiptNumber || rec.receipt_number}</strong></div>
            <div style="font-size:9px; color:#555;">تاریخ: ${rec.date || rec.created_at} • ساعت: ${rec.time || ''}</div>
          </div>
          <div class="dashed"></div>
          <div class="row">
            <span>شماره میز: <strong>${rec.tableNumber || rec.table_number}</strong></span>
            <span>گارسون: ${rec.waiterName || rec.waiter_name || 'پرسنل سالن'}</span>
          </div>
          <div class="dashed"></div>
          <div>${itemsHtml}</div>
          <div class="dashed"></div>
          <div class="row">
            <span>جمع جزء:</span>
            <span>$${rec.subtotal}</span>
          </div>
          ${(rec.discountAmount || rec.discount_amount || 0) > 0 ? `
          <div class="row" style="color:#b45309;">
            <span>تخفیف وفاداری:</span>
            <span>-$${rec.discountAmount || rec.discount_amount}</span>
          </div>` : ''}
          <div class="row bold" style="font-size:13px; margin-top:4px;">
            <span>مبلغ پرداخت‌شده:</span>
            <span>$${rec.grandTotal || rec.grand_total}</span>
          </div>
          <div class="row" style="font-size:10px; color:#555; margin-top:3px;">
            <span>روش تسویه:</span>
            <span>پرداخت نقدی</span>
          </div>
          <div class="dashed"></div>
          <div class="center" style="font-size:10px; color:#555; margin-top:6px;">
            از اعتماد شما سپاسگزاریم!<br/>
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
      console.error('Print error', err);
      window.print();
    }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header and Top Tabs */}
      <div className="bg-white p-6 md:p-8 border border-stone-100 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shadow-xs">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black text-stone-900 tracking-tight">{t.reports.title}</h1>
          </div>
          <p className="text-xs text-stone-400 font-medium">
            گزارشات مالی، فروش روزانه، سودآوری و آرشیو فاکتورهای چاپی تسویه‌شده
          </p>
        </div>

        {/* Tab Switcher: Analytics vs Printed Receipts */}
        <div className="flex items-center p-1 bg-stone-50 rounded-2xl border border-stone-200">
          <button
            onClick={() => setActiveTab('METRICS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'METRICS'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>آمار و فروش</span>
          </button>

          <button
            onClick={() => setActiveTab('RECEIPTS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'RECEIPTS'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>آرشیو فاکتورها ({receipts.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'METRICS' ? (
        <>
          {/* Date Range Selector */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white px-6 py-4 rounded-3xl border border-stone-100 shadow-xs gap-4">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-orange-500" />
              <span className="text-xs font-black text-stone-800">بازه زمانی گزارش:</span>
            </div>
            
            <div className="flex items-center gap-1.5 bg-stone-50 p-1 rounded-2xl border border-stone-200">
              {dateRangeButtons.map((range) => (
                <button
                  key={range.id}
                  onClick={() => setDateRange(range.id as any)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    dateRange === range.id
                      ? 'bg-white text-orange-600 shadow-xs'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <Card className="p-6 bg-white border-stone-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] rounded-3xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-stone-400 uppercase">{t.reports.todaySales}</span>
                <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-stone-900 tracking-tight">
                {formatPrice(todayTotalSales)}
              </div>
              <p className="text-[11px] font-medium text-emerald-600 mt-1">مجموع فروش فاکتورها</p>
            </Card>

            <Card className="p-6 bg-white border-stone-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] rounded-3xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-stone-400 uppercase">تخفیفات وفاداری</span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-amber-600 tracking-tight">
                {formatPrice(totalDiscount)}
              </div>
              <p className="text-[11px] font-medium text-stone-400 mt-1">کسر شده برای مشتریان ویژه</p>
            </Card>

            <Card className="p-6 bg-white border-stone-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] rounded-3xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-stone-400 uppercase">میانگین هر فاکتور</span>
                <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                  <Utensils className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-stone-900 tracking-tight">
                {formatPrice(avgOrderValue)}
              </div>
              <p className="text-[11px] font-medium text-stone-400 mt-1">ارزش میانگین خرید هر میز</p>
            </Card>

            <Card className="p-6 bg-white border-stone-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] rounded-3xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-stone-400 uppercase">تعداد کل فاکتورها</span>
                <div className="w-8 h-8 rounded-xl bg-stone-100 text-stone-600 flex items-center justify-center">
                  <Receipt className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-stone-900 tracking-tight">
                {receipts.length || 32} <span className="text-xs font-bold text-stone-400">فاکتور</span>
              </div>
              <p className="text-[11px] font-medium text-stone-400 mt-1">تسویه شده در سامانه</p>
            </Card>
          </div>

          {/* Top Selling Dishes Table */}
          <Card className="overflow-hidden border-stone-100 bg-white shadow-xs rounded-3xl">
            <div className="p-6 border-b border-stone-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h2 className="text-base font-black text-stone-900">{t.reports.topSellingDishes}</h2>
                <p className="text-xs text-stone-400 mt-0.5">پرفروش‌ترین غذاهای رستوران و حاشیه سود</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className={`w-full ${isRtl ? 'text-right' : 'text-left'}`}>
                <thead>
                  <tr className="bg-stone-50/70 text-[11px] font-bold text-stone-400 uppercase border-b border-stone-100">
                    <th className="px-6 py-4">{t.menu.itemName}</th>
                    <th className="px-6 py-4">{t.menu.category}</th>
                    <th className="px-6 py-4 text-center">{t.common.quantity}</th>
                    <th className="px-6 py-4">{t.menu.price}</th>
                    <th className="px-6 py-4">{t.common.total}</th>
                    <th className="px-6 py-4 text-center">{t.reports.profitMargin}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-xs">
                  {[
                    { name: 'پیتزا ناپولیتن تنوری', cat: 'پیتزا و فست‌فود', qty: 54, price: 14.5, total: 783, margin: '68%' },
                    { name: 'پیتزا کالیفرنیا چیکن', cat: 'پیتزا و فست‌فود', qty: 42, price: 16.0, total: 672, margin: '65%' },
                    { name: 'پیتزا سیسیلی گوشت و قارچ', cat: 'پیتزا و فست‌فود', qty: 38, price: 15.5, total: 589, margin: '70%' },
                    { name: 'سالاد استارباکس کینوا', cat: 'دسر و سالاد', qty: 29, price: 12.0, total: 348, margin: '74%' },
                    { name: 'کباب کوبیده سنتی مخصوص', cat: 'غذای مخصوص', qty: 25, price: 18.0, total: 450, margin: '62%' },
                  ].map((dish, i) => (
                    <tr key={i} className="hover:bg-stone-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-stone-900">{dish.name}</td>
                      <td className="px-6 py-4">
                        <span className="bg-stone-100 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-stone-600">
                          {dish.cat}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-stone-700">{dish.qty}</td>
                      <td className="px-6 py-4 font-bold text-stone-600">{formatPrice(dish.price)}</td>
                      <td className="px-6 py-4 font-black text-orange-600">{formatPrice(dish.total)}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold">
                          <ArrowUpRight className="w-3 h-3" />
                          {dish.margin}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      ) : (
        /* ARCHIVE OF SETTLED PRINTED INVOICES */
        <div className="space-y-6">
          <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-full border border-stone-200 focus-within:border-orange-500 max-w-md shadow-xs">
            <Search className="w-4 h-4 text-stone-400 shrink-0" />
            <input
              type="text"
              value={receiptSearch}
              onChange={(e) => setReceiptSearch(e.target.value)}
              placeholder="جستجو در فاکتورها (شماره، میز، گارسون...)"
              className="w-full text-xs font-bold outline-none bg-transparent text-stone-900 placeholder-stone-400"
            />
          </div>

          <Card className="overflow-hidden border-stone-100 bg-white shadow-xs rounded-3xl">
            {filteredReceipts.length === 0 ? (
              <EmptyState
                icon={Receipt}
                title="هیچ فاکتوری یافت نشد"
                description="نتیجه‌ای برای جستجوی شما پیدا نکردیم."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className={`w-full ${isRtl ? 'text-right' : 'text-left'}`}>
                  <thead>
                    <tr className="bg-stone-50/70 text-[11px] font-bold text-stone-400 uppercase border-b border-stone-100">
                      <th className="px-6 py-4">شماره فاکتور</th>
                      <th className="px-6 py-4">تاریخ و ساعت</th>
                      <th className="px-6 py-4">میز</th>
                      <th className="px-6 py-4">گارسون</th>
                      <th className="px-6 py-4">مبلغ نهایی</th>
                      <th className="px-6 py-4">روش پرداخت</th>
                      <th className="px-6 py-4 text-center">عملیات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-xs">
                    {filteredReceipts.map((rec, idx) => (
                      <tr key={idx} className="hover:bg-stone-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-stone-900">
                          {rec.receiptNumber || rec.receipt_number || `#${idx + 1}`}
                        </td>
                        <td className="px-6 py-4 text-stone-500">
                          {rec.date || rec.created_at} {rec.time ? `• ${rec.time}` : ''}
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-orange-50 text-orange-600 border border-orange-200 px-2 py-0.5 rounded-lg text-xs font-bold">
                            میز {rec.tableNumber || rec.table_number}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-stone-700">
                          {rec.waiterName || rec.waiter_name || 'پرسنل سالن'}
                        </td>
                        <td className="px-6 py-4 font-black text-orange-600">
                          {formatPrice(rec.grandTotal || rec.grand_total || 0)}
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                            پرداخت نقدی
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setSelectedReceipt(rec)}
                              className="p-1.5 rounded-xl border border-stone-200 text-stone-400 hover:text-orange-600 hover:border-orange-300 transition-all shadow-xs"
                              title="مشاهده جزئیات"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePrintReceiptSlip(rec)}
                              icon={Printer}
                              className="rounded-xl text-xs font-bold"
                            >
                              چاپ مجدد
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Invoice Details Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-xl border border-stone-100 w-full max-w-sm overflow-hidden p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2.5">
                <Receipt className="w-5 h-5 text-orange-500" />
                <h3 className="text-base font-black text-stone-900">
                  فاکتور {selectedReceipt.receiptNumber || selectedReceipt.receipt_number}
                </h3>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="p-1 rounded-xl text-stone-400 hover:text-stone-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-400">میز:</span>
                <span className="font-bold text-stone-900">میز {selectedReceipt.tableNumber || selectedReceipt.table_number}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-400">تاریخ:</span>
                <span className="font-bold text-stone-900">{selectedReceipt.date || selectedReceipt.created_at}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-400">گارسون:</span>
                <span className="font-bold text-stone-900">{selectedReceipt.waiterName || selectedReceipt.waiter_name}</span>
              </div>

              <div className="pt-2">
                <span className="font-bold text-stone-600 block mb-2">اقلام سفارش:</span>
                <div className="space-y-1.5 max-h-36 overflow-y-auto no-scrollbar">
                  {(selectedReceipt.items || []).map((it: any, i: number) => (
                    <div key={i} className="flex justify-between text-[11px] p-2 bg-stone-50 rounded-xl">
                      <span>{it.quantity || it.qty || 1}× {it.name}</span>
                      <span className="font-bold">{formatPrice(it.subtotal || it.unit_price * (it.quantity || 1))}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 space-y-1">
                <div className="flex justify-between font-bold text-sm">
                  <span>مبلغ پرداختی:</span>
                  <span className="text-orange-600 font-black">{formatPrice(selectedReceipt.grandTotal || selectedReceipt.grand_total || 0)}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <Button
                variant="outline"
                size="md"
                className="flex-1 rounded-2xl font-bold"
                onClick={() => setSelectedReceipt(null)}
              >
                بستن
              </Button>
              <Button
                variant="primary"
                size="md"
                className="flex-1 rounded-2xl font-bold"
                onClick={() => handlePrintReceiptSlip(selectedReceipt)}
                icon={Printer}
              >
                چاپ
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
