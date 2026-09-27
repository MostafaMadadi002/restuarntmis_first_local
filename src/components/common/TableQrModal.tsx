import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  Printer,
  Copy,
  Check,
  ExternalLink,
  X,
  Wifi,
  Sparkles,
  Layers,
  UtensilsCrossed,
  ArrowRight,
} from 'lucide-react';
import { TableItem } from '../../types';

interface TableQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  tables: TableItem[];
  selectedTableId?: number;
  onSelectTable?: (tableId: number) => void;
}

export function TableQrModal({
  isOpen,
  onClose,
  tables,
  selectedTableId = 1,
  onSelectTable,
}: TableQrModalProps) {
  const [activeTableId, setActiveTableId] = useState<number>(selectedTableId);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [allQrCodes, setAllQrCodes] = useState<Record<number, string>>({});
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'SINGLE' | 'ALL_STANDS'>('SINGLE');
  const printContainerRef = useRef<HTMLDivElement>(null);

  // Sync active table if prop changes
  useEffect(() => {
    if (selectedTableId) {
      setActiveTableId(selectedTableId);
    }
  }, [selectedTableId]);

  const currentTable = tables.find((t) => t.id === activeTableId) || tables[0] || {
    id: 1,
    table_number: '1',
    section: 'سالن اصلی',
    capacity: 4,
  };

  // Base URL calculation (works in dev and production)
  const baseUrl = typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.host}`
    : 'http://localhost:3000';

  const tableMenuUrl = `${baseUrl}/?table=${currentTable.table_number}`;

  // Generate QR for the selected single table
  useEffect(() => {
    if (!isOpen) return;

    QRCode.toDataURL(tableMenuUrl, {
      width: 280,
      margin: 2,
      color: {
        dark: '#064e3b', // Deep emerald
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    })
      .then((url) => setQrCodeUrl(url))
      .catch((err) => console.error('Failed to generate table QR', err));
  }, [isOpen, tableMenuUrl, activeTableId]);

  // Generate QR codes for ALL tables when switching to ALL_STANDS tab
  useEffect(() => {
    if (!isOpen || activeTab !== 'ALL_STANDS') return;

    const generateAll = async () => {
      const codeMap: Record<number, string> = {};
      for (const t of tables) {
        try {
          const url = `${baseUrl}/?table=${t.table_number}`;
          const qr = await QRCode.toDataURL(url, {
            width: 200,
            margin: 1.5,
            color: { dark: '#064e3b', light: '#ffffff' },
            errorCorrectionLevel: 'M',
          });
          codeMap[t.id] = qr;
        } catch (e) {
          console.error(e);
        }
      }
      setAllQrCodes(codeMap);
    };

    generateAll();
  }, [isOpen, activeTab, tables, baseUrl]);

  const handleCopyLink = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(tableMenuUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    const targetEl = activeTab === 'SINGLE'
      ? document.querySelector('.printable-stand-card')
      : document.querySelector('.printable-stands-grid');

    if (!targetEl) {
      window.print();
      return;
    }

    try {
      const existing = document.getElementById('modal-print-frame');
      if (existing) existing.remove();

      const iframe = document.createElement('iframe');
      iframe.id = 'modal-print-frame';
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

      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html dir="rtl" lang="fa">
        <head>
          <meta charset="utf-8">
          <title>چاپ کارت استند میز ${currentTable.table_number}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;600;700;800;900&display=swap" rel="stylesheet">
          <style>
            @page { size: auto; margin: 8mm; }
            * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Vazirmatn', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
            body {
              background: #ffffff !important;
              color: #0f172a !important;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              padding: 12px;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .printable-stand-card {
              width: 360px !important;
              max-width: 95% !important;
              margin: 0 auto !important;
              border: 3px solid #064e3b !important;
              border-radius: 22px !important;
              padding: 24px !important;
              text-align: center !important;
              background: #ffffff !important;
              box-shadow: none !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            .printable-stand-card img {
              max-width: 210px !important;
              height: auto !important;
              display: block !important;
              margin: 10px auto !important;
            }
            .printable-stands-grid {
              display: grid !important;
              grid-template-columns: repeat(2, 1fr) !important;
              gap: 8mm !important;
              width: 100% !important;
            }
            .printable-stand-item {
              border: 2px solid #064e3b !important;
              border-radius: 16px !important;
              padding: 14px !important;
              text-align: center !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              background: #ffffff !important;
            }
          </style>
        </head>
        <body>
          ${targetEl.outerHTML}
        </body>
        </html>
      `);
      doc.close();

      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch (err) {
          console.warn('Iframe print fallback to window.print', err);
          window.print();
        }
      }, 300);
    } catch (e) {
      console.warn('Iframe print error', e);
      window.print();
    }
  };

  const handleOpenTableMenu = () => {
    if (onSelectTable) {
      onSelectTable(currentTable.id);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden text-right">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-xs">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-800">
                ایستگاه تولید بارکد QR میزها
              </h2>
              <p className="text-xs text-slate-500">
                تولید، اسکن و چاپ استند بارکد برای تک‌تک میزهای رستوران
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab switch */}
            <div className="bg-slate-200/80 p-0.5 rounded-lg flex items-center text-xs">
              <button
                onClick={() => setActiveTab('SINGLE')}
                className={`px-3 py-1.5 rounded-md font-bold transition-all ${
                  activeTab === 'SINGLE'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                میز تکی
              </button>
              <button
                onClick={() => setActiveTab('ALL_STANDS')}
                className={`px-3 py-1.5 rounded-md font-bold transition-all flex items-center gap-1 ${
                  activeTab === 'ALL_STANDS'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>همه میزها (۱ تا {tables.length})</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5" ref={printContainerRef}>
          {activeTab === 'SINGLE' ? (
            <>
              {/* Table Selector Pill Strip */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">
                  انتخاب شماره میز برای مشاهده و صدور QR:
                </label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {tables.map((tbl) => (
                    <button
                      key={tbl.id}
                      onClick={() => setActiveTableId(tbl.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        activeTableId === tbl.id
                          ? 'bg-emerald-800 text-white shadow-xs scale-105'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      میز {tbl.table_number}
                    </button>
                  ))}
                </div>
              </div>

              {/* Main QR Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center bg-gradient-to-br from-emerald-50/50 to-slate-50 p-5 rounded-2xl border border-emerald-100">
                {/* Visual Stand Card (Printable) */}
                <div className="printable-stand-card bg-white rounded-xl p-5 border border-slate-200 shadow-sm text-center flex flex-col items-center justify-center space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-black text-emerald-900 bg-emerald-100/80 px-3 py-1 rounded-full">
                    <UtensilsCrossed className="w-3.5 h-3.5" />
                    <span>رستوران آریا گریل</span>
                  </div>

                  <div className="relative p-2 bg-white rounded-lg border-2 border-dashed border-emerald-200">
                    {qrCodeUrl && qrCodeUrl.trim() !== '' ? (
                      <img
                        src={qrCodeUrl}
                        alt={`QR Code Table ${currentTable.table_number}`}
                        className="w-48 h-48 object-contain"
                      />
                    ) : (
                      <div className="w-48 h-48 flex items-center justify-center text-xs text-slate-400">
                        در حال تولید بارکد...
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="text-lg font-black text-slate-800">
                      میز شماره {currentTable.table_number}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      {currentTable.section || 'سالن اصلی'} • ظرفیت {currentTable.capacity} نفر
                    </div>
                  </div>

                  <p className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 font-medium max-w-xs">
                    📱 دوربین گوشی خود را روی این بارکد بگیرید تا منو و سفارش سر میز باز شود
                  </p>
                </div>

                {/* Details & Actions */}
                <div className="space-y-4">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500">لینک اختصاصی سفارش این میز:</span>
                    <div className="mt-1 flex items-center gap-1.5 p-2 bg-white rounded-lg border border-slate-200 text-xs font-mono text-slate-700" dir="ltr">
                      <span className="truncate flex-1">{tableMenuUrl}</span>
                      <button
                        onClick={handleCopyLink}
                        className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800 shrink-0"
                        title="کپی لینک"
                      >
                        {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs space-y-1">
                    <div className="font-bold flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>نحوه عملکرد در شبکه داخلی:</span>
                    </div>
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      با اسکن این کد، مهمان مستقیماً به صفحه سفارش <strong>میز {currentTable.table_number}</strong> متصل می‌شود و هر درخواستی (آب، گارسون، سفارش غذا، تسویه دُنگی) ثبت کند بلافاصله با برچسب <strong>میز {currentTable.table_number}</strong> در مانیتور آشپزخانه و تبلت گارسون اعلام می‌گردد.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 pt-2">
                    <button
                      onClick={handleOpenTableMenu}
                      className="w-full py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>مشاهده و تست منوی مهمان (میز {currentTable.table_number})</span>
                    </button>

                    <button
                      onClick={handlePrint}
                      className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                    >
                      <Printer className="w-4 h-4 text-slate-600" />
                      <span>چاپ استند رومیزی (میز {currentTable.table_number})</span>
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* ALL TABLES STANDS PRINT GRID */
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="text-xs text-slate-600">
                  نمایش و چاپ تمامی استندهای رومیزی رستوران (مجموعاً {tables.length} میز)
                </div>
                <button
                  onClick={handlePrint}
                  className="py-1.5 px-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>چاپ یکجای همه استندها</span>
                </button>
              </div>

              <div className="printable-stands-grid grid grid-cols-2 sm:grid-cols-3 gap-3">
                {tables.map((t) => (
                  <div
                    key={t.id}
                    className="printable-stand-item p-3 bg-white border border-slate-200 rounded-xl text-center space-y-2 hover:border-emerald-500 transition-colors shadow-2xs"
                  >
                    <div className="text-xs font-black text-slate-800">
                      میز شماره {t.table_number}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {t.section || 'سالن اصلی'}
                    </div>

                    <div className="flex justify-center p-1 bg-slate-50 rounded-lg">
                      {allQrCodes[t.id] && allQrCodes[t.id].trim() !== '' ? (
                        <img
                          src={allQrCodes[t.id]}
                          alt={`QR Table ${t.table_number}`}
                          className="w-28 h-28 object-contain"
                        />
                      ) : (
                        <div className="w-28 h-28 flex items-center justify-center text-[10px] text-slate-400">
                          ...
                        </div>
                      )}
                    </div>

                    <div className="pt-1 flex gap-1">
                      <button
                        onClick={() => {
                          setActiveTableId(t.id);
                          setActiveTab('SINGLE');
                        }}
                        className="flex-1 py-1 text-[10px] bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-bold"
                      >
                        مشاهده تکی
                      </button>
                      <button
                        onClick={() => {
                          if (onSelectTable) onSelectTable(t.id);
                          onClose();
                        }}
                        className="py-1 px-2 text-[10px] bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded font-bold"
                        title="تست مستقیم منوی این میز"
                      >
                        تست
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">
            💡 نکته: برای پرینت، کلید میانبر <kbd className="px-1.5 py-0.5 bg-white border rounded text-[11px] font-mono">Ctrl+P</kbd> را نیز می‌توانید بزنید.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold transition-colors"
          >
            بستن پنجره
          </button>
        </div>
      </div>
    </div>
  );
}
