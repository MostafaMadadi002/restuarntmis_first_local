import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  Settings as SettingsIcon,
  Globe,
  Store,
  Wifi,
  Database,
  Lock,
  CheckCircle2,
  Save,
  Printer,
  QrCode as QrCodeIcon,
  Languages,
  Smartphone,
  Copy,
  ExternalLink,
  ShieldCheck,
  Eye,
  RefreshCw,
  Sparkles,
  Layers,
  Check,
  Award,
  Gift,
  User,
} from 'lucide-react';
import { Card, Button, Badge } from '../common/UI';
import { TableItem, LoyaltyTierBenefit } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';

export type LanguageCode = 'fa' | 'ps' | 'en';

interface SettingsViewProps {
  currentLang?: LanguageCode;
  onLanguageChange?: (lang: LanguageCode) => void;
  tables?: TableItem[];
  tierBenefits?: LoyaltyTierBenefit[];
  onUpdateTierBenefits?: (updated: LoyaltyTierBenefit[]) => void;
  settings?: any;
  onSaveSettings?: (newSettings: any) => Promise<void>;
  onCleanReset?: (password: string) => Promise<void>;
}

export function SettingsView({
  currentLang = 'fa',
  onLanguageChange,
  tables = [],
  tierBenefits,
  onUpdateTierBenefits,
  settings,
  onSaveSettings,
  onCleanReset,
}: SettingsViewProps) {
  const { t, lang, setLang, isRtl } = useLanguage();

  // Restaurant info & dynamic points unit
  const [restaurantName, setRestaurantName] = useState(settings?.restaurant_name || 'رستوران سنتی و مدرن آریا گریل');
  const [currency, setCurrency] = useState(settings?.currency || 'AFN');
  const [loyaltyPointsUnit, setLoyaltyPointsUnit] = useState(settings?.loyalty_points_unit || 'سکه');
  const [superuserUsername, setSuperuserUsername] = useState(settings?.superuser_username || 'admin');
  const [superuserPassword, setSuperuserPassword] = useState(settings?.superuser_password || 'admin');
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>(lang || currentLang);
  const [savedNotice, setSavedNotice] = useState(false);
  const [wipeModalOpen, setWipeModalOpen] = useState(false);
  const [wipePasswordInput, setWipePasswordInput] = useState('');
  const [wipeNotice, setWipeNotice] = useState<string | null>(null);

  // Synchronize with incoming settings prop
  useEffect(() => {
    if (settings) {
      if (settings.restaurant_name) setRestaurantName(settings.restaurant_name);
      if (settings.currency) setCurrency(settings.currency);
      if (settings.loyalty_points_unit) setLoyaltyPointsUnit(settings.loyalty_points_unit);
      if (settings.superuser_username) setSuperuserUsername(settings.superuser_username);
      if (settings.superuser_password) setSuperuserPassword(settings.superuser_password);
      if (settings.wifi_ssid) setWifiSsid(settings.wifi_ssid);
      if (settings.wifi_password) setWifiPassword(settings.wifi_password);
    }
  }, [settings]);

  // Synchronize when lang changes
  useEffect(() => {
    setSelectedLanguage(lang);
  }, [lang]);

  // WiFi & Guest Portal Configuration
  const [wifiSsid, setWifiSsid] = useState('Aria_Grill_Guest');
  const [wifiPassword, setWifiPassword] = useState('AriaGuest2026');
  const [wifiEncryption, setWifiEncryption] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');

  // Dynamic host URL for real working QR codes (defaults to actual browser URL)
  const getLivePortalUrl = () => {
    if (typeof window !== 'undefined' && window.location.origin) {
      return window.location.origin;
    }
    return 'http://localhost:3000';
  };

  const [portalUrl, setPortalUrl] = useState<string>(getLivePortalUrl);
  const [selectedTableNumber, setSelectedTableNumber] = useState<string>(() => {
    if (tables && tables.length > 0) return String(tables[0].table_number);
    return '1';
  });
  const [includeTableInRedirect, setIncludeTableInRedirect] = useState(true);
  const [isPrintingBatch, setIsPrintingBatch] = useState(false);

  // Available table list (1..12 or dynamic tables)
  const availableTableNumbers = tables && tables.length > 0
    ? tables.map((t) => String(t.table_number))
    : ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

  // Mode: 1) Combined (WiFi Connect & Auto-Redirect), 2) Direct WiFi only, 3) Direct Menu URL only
  const [qrType, setQrType] = useState<'WIFI_REDIRECT' | 'WIFI_ONLY' | 'MENU_URL'>('WIFI_REDIRECT');

  // Generated QR Data URL
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState(false);
  const printAreaRef = useRef<HTMLDivElement>(null);

  // Calculate target redirect URL
  const targetMenuUrl = includeTableInRedirect
    ? `${portalUrl}/?table=${selectedTableNumber}`
    : `${portalUrl}/`;

  // Standard WiFi Connection String (MECARD / WIFI format supported natively by iOS and Android camera apps)
  const wifiConnectString = wifiEncryption === 'nopass'
    ? `WIFI:S:${wifiSsid};;`
    : `WIFI:S:${wifiSsid};T:${wifiEncryption};P:${wifiPassword};;`;

  // Generate QR code whenever settings change
  useEffect(() => {
    let payload = '';
    if (qrType === 'WIFI_ONLY') {
      payload = wifiConnectString;
    } else if (qrType === 'MENU_URL') {
      payload = targetMenuUrl;
    } else {
      payload = targetMenuUrl;
    }

    QRCode.toDataURL(payload, {
      width: 320,
      margin: 1.5,
      color: {
        dark: '#064e3b',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    })
      .then((url) => {
        setQrCodeDataUrl(url);
      })
      .catch((err) => {
        console.error('QR code generation failed', err);
      });
  }, [qrType, wifiSsid, wifiPassword, wifiEncryption, targetMenuUrl]);

  // Helper to print isolated content using a dedicated hidden iframe
  const printIsolatedHtml = (contentHtml: string, pageTitle: string = 'کارت استند رومیزی') => {
    try {
      const existing = document.getElementById('table-stand-print-frame');
      if (existing) existing.remove();

      const iframe = document.createElement('iframe');
      iframe.id = 'table-stand-print-frame';
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
          <title>${pageTitle}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;600;700;800;900&display=swap" rel="stylesheet">
          <style>
            @page {
              size: auto;
              margin: 8mm;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
              font-family: 'Vazirmatn', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            }
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
            .isolated-print-grid {
              display: grid !important;
              grid-template-columns: repeat(2, 1fr) !important;
              gap: 8mm !important;
              width: 100% !important;
            }
            .batch-card-item {
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
          ${contentHtml}
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
      console.warn('Iframe print setup failed, using window.print()', e);
      window.print();
    }
  };

  // Handle isolated clean print for current table stand (ONLY the stand card prints)
  const handlePrint = () => {
    const cardEl = printAreaRef.current;
    if (!cardEl) return;

    // 1. Mount isolated clone on document body as fallback
    const existing = document.getElementById('isolated-print-card');
    if (existing) existing.remove();

    const clone = cardEl.cloneNode(true) as HTMLElement;
    clone.id = 'isolated-print-card';
    document.body.appendChild(clone);
    document.body.classList.add('is-printing-card');

    const cleanup = () => {
      document.body.classList.remove('is-printing-card');
      const node = document.getElementById('isolated-print-card');
      if (node) node.remove();
      window.removeEventListener('afterprint', cleanup);
    };

    window.addEventListener('afterprint', cleanup);

    // 2. Trigger print directly using the dedicated isolated iframe
    printIsolatedHtml(cardEl.outerHTML, `کارت استند رومیزی میز شماره ${selectedTableNumber} - ${restaurantName}`);
  };

  // Handle batch printing for all tables (1 to 12)
  const handlePrintAllTables = async () => {
    setIsPrintingBatch(true);
    try {
      let cardsHtml = '<div class="isolated-print-grid">';

      for (const tNum of availableTableNumbers) {
        const url = `${portalUrl}/?table=${tNum}`;
        const qr = await QRCode.toDataURL(url, {
          width: 220,
          margin: 1.5,
          color: { dark: '#064e3b', light: '#ffffff' },
          errorCorrectionLevel: 'M',
        });

        cardsHtml += `
          <div class="batch-card-item">
            <div style="border-bottom: 2px solid #064e3b; padding-bottom: 6px; margin-bottom: 8px; text-align: center;">
              <div style="font-weight: 900; font-size: 13px; color: #0f172a;">${restaurantName}</div>
              <div style="display: inline-block; margin-top: 4px; background: #064e3b; color: #fff; font-size: 11px; font-weight: bold; padding: 2px 12px; border-radius: 9999px;">
                میز اختصاصی شماره ${tNum}
              </div>
            </div>
            <div style="text-align: center; margin-bottom: 6px;">
              <img src="${qr}" style="width: 160px; height: 160px; margin: 0 auto; display: block;" alt="Table ${tNum}" />
            </div>
            <div style="font-size: 10px; font-weight: bold; color: #064e3b; text-align: center; margin-bottom: 4px;">
              دوربین گوشی را بگیرید تا منوی میز باز شود
            </div>
            <div style="font-size: 9px; color: #64748b; font-family: monospace; text-align: center; word-break: break-all;" dir="ltr">
              ${url}
            </div>
          </div>
        `;
      }

      cardsHtml += '</div>';

      printIsolatedHtml(cardsHtml, `استندهای بارکد تمامی میزها (۱ تا ${availableTableNumbers.length}) - ${restaurantName}`);
      setIsPrintingBatch(false);
    } catch (err) {
      console.error('Failed to batch print tables', err);
      setIsPrintingBatch(false);
    }
  };

  // Keyboard shortcut listener for Ctrl+P / Cmd+P
  useEffect(() => {
    const handleBeforePrint = () => {
      const cardEl = printAreaRef.current;
      if (!cardEl) return;
      if (!document.getElementById('isolated-print-card')) {
        const clone = cardEl.cloneNode(true) as HTMLElement;
        clone.id = 'isolated-print-card';
        document.body.appendChild(clone);
        document.body.classList.add('is-printing-card');
      }
    };

    const handleAfterPrint = () => {
      document.body.classList.remove('is-printing-card');
      const node = document.getElementById('isolated-print-card');
      if (node) node.remove();
    };

    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);
    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
      handleAfterPrint();
    };
  }, []);

  const handleSelectLang = (newLang: LanguageCode) => {
    setSelectedLanguage(newLang);
    setLang(newLang);
    if (onLanguageChange) {
      onLanguageChange(newLang);
    }
  };

  const handleSave = async () => {
    setLang(selectedLanguage);
    if (onLanguageChange) {
      onLanguageChange(selectedLanguage);
    }
    if (onSaveSettings) {
      await onSaveSettings({
        restaurant_name: restaurantName,
        currency,
        loyalty_points_unit: loyaltyPointsUnit,
        superuser_username: superuserUsername,
        superuser_password: superuserPassword,
        wifi_ssid: wifiSsid,
        wifi_password: wifiPassword,
      });
    }
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3500);
  };

  const handleExecuteWipe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onCleanReset) return;
    try {
      await onCleanReset(wipePasswordInput);
      setWipeNotice('تمامی اطلاعات و سفارش‌های ماک با موفقیت پاک‌سازی و دیتابیس تمیز گردید.');
      setWipeModalOpen(false);
      setWipePasswordInput('');
      setTimeout(() => setWipeNotice(null), 4000);
    } catch (err: any) {
      alert(err?.message || 'خطا در پاک‌سازی دیتابیس');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(targetMenuUrl);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <>
    <div className="space-y-10 pb-10">
      {/* Top Header */}
      <div className="bg-white p-8 border border-slate-50 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg shadow-slate-200">
              <SettingsIcon className="w-6 h-6" />
            </div>
            <span>{t.settings.title}</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            {t.settings.subtitle}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="primary" size="lg" onClick={handleSave} icon={Save} className="px-8 shadow-xl shadow-slate-200">
            {t.settings.saveChanges}
          </Button>
        </div>
      </div>

      {savedNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-900 text-sm rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <span className="font-bold">تنظیمات و زبان سیستم در پایگاه داده محلی ذخیره گردید.</span>
        </div>
      )}

      {/* Grid: Settings Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (Settings: Language & Identity) - 5 Cols */}
        <div className="lg:col-span-5 space-y-5">
          {/* Language Settings Card */}
          <Card className="p-8 border-slate-50 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                  <Languages className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">{t.settings.languageSetting}</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">{t.settings.selectLanguage}</p>
                </div>
              </div>
              <Badge variant="emerald" className="bg-slate-900 text-white border-transparent px-3 py-1">
                {selectedLanguage === 'fa' ? 'فارسی / دری' : selectedLanguage === 'ps' ? 'پښتو' : 'English'}
              </Badge>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {[
                { id: 'fa', label: 'فارسی / دری', sub: 'پیش‌فرض افغانستان', icon: '🇦🇫' },
                { id: 'ps', label: 'پښتو', sub: 'ملی افغانستان', icon: '🇦🇫' },
                { id: 'en', label: 'English', sub: 'International', icon: '🌐' }
              ].map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => handleSelectLang(l.id as any)}
                  className={`group p-5 rounded-[20px] border text-right transition-all flex items-center justify-between gap-4 ${
                    selectedLanguage === l.id
                      ? 'border-slate-900 bg-slate-900 text-white shadow-xl shadow-slate-200'
                      : 'border-slate-100 bg-white hover:border-slate-200 text-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl grayscale group-hover:grayscale-0 transition-all">{l.icon}</span>
                    <div className="text-right">
                      <div className="text-sm font-black">{l.label}</div>
                      <div className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${selectedLanguage === l.id ? 'text-white/60' : 'text-slate-400'}`}>
                        {l.sub}
                      </div>
                    </div>
                  </div>
                  {selectedLanguage === l.id && <Check className="w-5 h-5 text-emerald-400" />}
                </button>
              ))}
            </div>
          </Card>

          {/* Restaurant Identity */}
          <Card className="p-8 border-slate-50 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">{t.settings.generalSettings}</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">شناسه رستوران و واحد پولی</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">{t.settings.restaurantName}</label>
                <input
                  type="text"
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-800 focus:bg-white focus:border-slate-900 transition-all outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">{t.settings.currencySetting}</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:border-slate-900 transition-all outline-none"
                  >
                    <option value="AFN">افغانی (AFN)</option>
                    <option value="USD">دلار (USD)</option>
                    <option value="EUR">یورو (EUR)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">واحد امتیاز</label>
                  <input
                    type="text"
                    value={loyaltyPointsUnit}
                    onChange={(e) => setLoyaltyPointsUnit(e.target.value)}
                    placeholder="سکه"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-800 focus:bg-white focus:border-slate-900 transition-all outline-none"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Super User Account */}
          <Card className="p-8 border-slate-50 shadow-[0_8px_30px_rgb(0,0,0,0.02)] bg-slate-900">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white tracking-tight">حساب مدیریت کل</h3>
                  <p className="text-xs text-white/40 font-bold uppercase tracking-wider mt-0.5">Root Administrator Access</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block px-1">نام کاربری</label>
                  <input
                    type="text"
                    value={superuserUsername}
                    onChange={(e) => setSuperuserUsername(e.target.value)}
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm font-black text-white focus:bg-white/10 focus:border-white/20 transition-all outline-none font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block px-1">رمز عبور</label>
                  <input
                    type="password"
                    value={superuserPassword}
                    onChange={(e) => setSuperuserPassword(e.target.value)}
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm font-black text-white focus:bg-white/10 focus:border-white/20 transition-all outline-none font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setWipeModalOpen(true)}
                  className="w-full rounded-xl border-white/10 text-rose-400 hover:bg-rose-500 hover:text-white hover:border-rose-500 font-black"
                >
                  پاک‌سازی کامل دیتابیس
                </Button>
              </div>
            </div>
          </Card>

          {/* Local Network Info */}
          <Card className="p-8 border-slate-50 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                <Wifi className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">شبکه محلی</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">اتصال داخلی و امنیت</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-5 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white hover:border-slate-900 transition-all cursor-default">
                <span className="text-sm font-bold text-slate-500">آدرس سرور مرکزی</span>
                <span className="font-mono font-black text-slate-900">192.168.10.10:3000</span>
              </div>
              <div className="flex justify-between items-center p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                <span className="text-sm font-bold text-emerald-700">وضعیت اینترنت</span>
                <Badge variant="success" className="rounded-full px-4 font-black">آفلاین و Local-First</Badge>
              </div>
            </div>
          </Card>

          {/* Loyalty Tier Benefits */}
          <Card className="p-8 border-slate-50 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">باشگاه مشتریان</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">مزایای سطوح وفاداری</p>
                </div>
              </div>
              <Badge variant="emerald" className="bg-emerald-900 text-white rounded-full font-black">Admin Config</Badge>
            </div>

            <div className="space-y-4">
              {(tierBenefits || [
                { tier: 'GOLD', title: 'رده طلایی (Gold VIP)', discount_percent: 10, free_perk: 'یک نوشیدنی رایگان + اولویت رزرو', required_points: 500 },
                { tier: 'SILVER', title: 'رده نقره‌ای (Silver)', discount_percent: 5, free_perk: 'دسر ماهانه رایگان', required_points: 200 },
                { tier: 'PLATINUM', title: 'رده پلاتینیوم (Platinum)', discount_percent: 15, free_perk: 'پذیرایی VIP', required_points: 1200 },
              ]).map((tb) => (
                <div key={tb.tier} className="p-5 bg-white border border-slate-100 rounded-2xl space-y-3 hover:border-slate-900 transition-all group">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-slate-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      {tb.title}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
                        {tb.required_points} PT
                      </span>
                      <span className="font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100 text-[10px]">
                        {tb.discount_percent}٪ OFF
                      </span>
                    </div>
                  </div>
                  <div className="text-xs font-bold text-slate-400 group-hover:text-slate-600 transition-colors flex items-center gap-2">
                    <Gift className="w-3.5 h-3.5" />
                    {tb.free_perk}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-50">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">پیش‌نمایش پروفایل</span>
              <div className="p-4 bg-slate-900 rounded-[24px] flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white border border-white/10">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-black text-white text-sm">احمدرضا محمدی</div>
                    <div className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-0.5">سطح طلایی • 0912</div>
                  </div>
                </div>
                <div className="px-4 py-2 bg-white/10 rounded-xl border border-white/10 text-emerald-400 font-mono font-black text-xs">
                  640 PT
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Print QR Code Section - 7 Cols */}
        <div className="lg:col-span-7 space-y-5">
          {/* QR Code Section */}
          <Card className="p-8 border-slate-50 shadow-[0_8px_30px_rgb(0,0,0,0.02)] h-full flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-6 border-b border-slate-50 gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-900 text-white flex items-center justify-center shadow-lg shadow-emerald-100">
                  <QrCodeIcon className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">{t.settings.wifiQrSection}</h2>
                  <p className="text-sm text-slate-500 mt-0.5 font-medium">هدایت هوشمند مهمانان به منوی سفارشات</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="md"
                  onClick={handlePrintAllTables}
                  icon={Layers}
                  disabled={isPrintingBatch}
                  className="rounded-xl font-black"
                >
                  {isPrintingBatch ? 'در حال آماده‌سازی...' : 'چاپ دسته‌ای تمام میزها'}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">حالت عملکرد بارکد</label>
                  <div className="flex flex-col gap-2">
                    {[
                      { id: 'WIFI_REDIRECT', label: 'ترکیبی وای‌فای + منو', icon: Sparkles, color: 'text-emerald-500' },
                      { id: 'WIFI_ONLY', label: 'فقط اتصال WiFi', icon: Wifi, color: 'text-blue-500' },
                      { id: 'MENU_URL', label: 'فقط ورود به منو', icon: ExternalLink, color: 'text-slate-500' }
                    ].map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setQrType(type.id as any)}
                        className={`p-4 rounded-2xl border text-right transition-all flex items-center justify-between gap-4 ${
                          qrType === type.id
                            ? 'border-slate-900 bg-slate-50 shadow-sm'
                            : 'border-slate-100 bg-white hover:border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <type.icon className={`w-5 h-5 ${type.color}`} />
                          <span className="text-sm font-black text-slate-900">{type.label}</span>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${qrType === type.id ? 'border-slate-900 bg-slate-900' : 'border-slate-200'}`}>
                          {qrType === type.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">{t.settings.wifiSsid}</label>
                    <input
                      type="text"
                      value={wifiSsid}
                      onChange={(e) => setWifiSsid(e.target.value)}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-800 focus:bg-white focus:border-slate-900 transition-all outline-none font-mono"
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">{t.settings.wifiPassword}</label>
                    <input
                      type="text"
                      value={wifiPassword}
                      onChange={(e) => setWifiPassword(e.target.value)}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-800 focus:bg-white focus:border-slate-900 transition-all outline-none font-mono"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="space-y-3 p-6 bg-slate-50 rounded-[24px] border border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-black text-slate-900">انتخاب شماره میز</label>
                    <Badge variant="emerald" className="bg-emerald-900 text-white border-transparent px-3">میز {selectedTableNumber}</Badge>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {availableTableNumbers.slice(0, 12).map((tblNum) => (
                      <button
                        key={tblNum}
                        type="button"
                        onClick={() => setSelectedTableNumber(tblNum)}
                        className={`w-10 h-10 rounded-xl text-xs font-black transition-all flex items-center justify-center ${
                          selectedTableNumber === tblNum
                            ? 'bg-slate-900 text-white shadow-lg'
                            : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-400 hover:text-slate-900'
                        }`}
                      >
                        {tblNum}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center p-8 bg-slate-50/50 rounded-[32px] border-2 border-dashed border-slate-200 text-center space-y-6">
                <div className="bg-white p-8 rounded-[40px] shadow-2xl shadow-slate-200/50 relative group flex items-center justify-center min-w-[220px] min-h-[220px]">
                  <div className="absolute inset-0 bg-emerald-500/5 rounded-[40px] group-hover:scale-110 transition-transform duration-500" />
                  {qrCodeDataUrl ? (
                    <img
                      src={qrCodeDataUrl}
                      alt="QR Preview"
                      className="w-48 h-48 relative z-10"
                    />
                  ) : (
                    <div className="w-48 h-48 flex items-center justify-center text-xs text-slate-400 relative z-10">
                      در حال تولید بارکد...
                    </div>
                  )}
                </div>

                <div className="space-y-4 max-w-xs mx-auto">
                  <h4 className="text-lg font-black text-slate-900 tracking-tight">آماده برای چاپ و نصب</h4>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    این بارکد را چاپ کرده و بر روی میز {selectedTableNumber} قرار دهید تا مشتریان به راحتی سفارش دهند.
                  </p>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handlePrint}
                    icon={Printer}
                    className="w-full rounded-2xl bg-slate-900 shadow-xl shadow-slate-200"
                  >
                    چاپ تک میز {selectedTableNumber}
                  </Button>
                </div>
              </div>
            </div>
          </Card>

            {/* Printable Preview Card (What actually prints) */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-emerald-800" />
                  <span>پیش‌نمایش استند رومیزی آماده چاپ (فقط این کارت در پرینتر چاپ می‌شود):</span>
                </span>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  بارکد واقعی و فعال میز {selectedTableNumber}
                </span>
              </div>

              {/* Printable Table Stand Area */}
              <div
                ref={printAreaRef}
                className="printable-stand-card bg-white border-2 border-emerald-900 rounded-3xl p-6 text-center shadow-lg max-w-sm mx-auto relative overflow-hidden ring-4 ring-emerald-900/5 transition-all"
              >
                {/* Top Banner */}
                <div className="border-b-2 border-emerald-900/20 pb-3 mb-4">
                  <div className="w-11 h-11 mx-auto rounded-2xl bg-emerald-800 text-white flex items-center justify-center font-black text-xl mb-1.5 shadow-sm">
                    آ
                  </div>
                  <h3 className="font-black text-slate-900 text-base">{restaurantName}</h3>
                  <div className="inline-block mt-1.5 bg-emerald-950 text-white text-[11px] font-black px-3.5 py-1 rounded-full shadow-xs">
                    میز اختصاصی شماره {selectedTableNumber}
                  </div>
                </div>

                {/* Instructions */}
                <p className="text-xs font-bold text-emerald-900 mb-2">
                  برای مشاهده منو و ثبت سفارش دوربین گوشی خود را بگیرید:
                </p>

                {/* Actual Generated QR Code Image */}
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 inline-block shadow-inner mb-3">
                  {qrCodeDataUrl ? (
                    <img
                      src={qrCodeDataUrl}
                      alt={`QR Code Table ${selectedTableNumber}`}
                      className="w-48 h-48 mx-auto"
                    />
                  ) : (
                    <div className="w-48 h-48 flex items-center justify-center text-xs text-slate-400">
                      در حال تولید بارکد...
                    </div>
                  )}
                </div>

                {/* WiFi Credentials Box */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1.5 text-right">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">وای‌فای رایگان مهمان:</span>
                    <span className="font-mono font-bold text-slate-900">{wifiSsid}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">رمز عبور وای‌فای:</span>
                    <span className="font-mono font-bold text-emerald-800">{wifiPassword}</span>
                  </div>
                </div>

                {/* Live Real URL Display */}
                <div className="mt-2 text-[10px] text-slate-500 font-mono break-all dir-ltr" dir="ltr">
                  {targetMenuUrl}
                </div>

                <div className="mt-2 text-[10px] text-slate-400 font-medium">
                  اتصال مستقیم به سرور رستوران • بارکد واقعی میز {selectedTableNumber}
                </div>
              </div>

              {/* Bottom Print Buttons */}
              <div className="mt-4 flex items-center justify-center gap-3">
                <Button
                  variant="primary"
                  size="md"
                  onClick={handlePrint}
                  icon={Printer}
                  className="font-bold shadow-md"
                >
                  چاپ کارت استند میز شماره {selectedTableNumber}
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  onClick={handlePrintAllTables}
                  icon={Layers}
                  disabled={isPrintingBatch}
                  className="font-bold"
                >
                  {isPrintingBatch ? 'در حال آماده‌سازی...' : `چاپ یکجای همه میزها (۱ تا ${availableTableNumbers.length})`}
                </Button>
              </div>
            </div>
        </div>
      </div>

      {/* Super User Database Wipe Clean Modal */}
      {wipeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-4 bg-rose-900 text-white flex items-center justify-between">
              <span className="text-xs font-bold">تأیید شروع از صفر و پاک‌سازی کامل دیتابیس</span>
              <button onClick={() => setWipeModalOpen(false)} className="text-white/80 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleExecuteWipe} className="p-5 space-y-3.5 text-xs">
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-950 rounded-xl leading-relaxed">
                هشدار: با انجام این عملیات، تمامی سفارش‌های تستی، فاکتورهای آزمایشی و درخواست‌ها حذف شده و دیتابیس سیستم به حالت خام و بدون ماک دیتا ریست می‌شود.
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  رمز عبور سوپریوزر (admin) جهت تأیید نهایی:
                </label>
                <input
                  type="password"
                  value={wipePasswordInput}
                  onChange={(e) => setWipePasswordInput(e.target.value)}
                  placeholder="admin"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none font-mono font-bold"
                  required
                />
              </div>

              <div className="pt-2 flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setWipeModalOpen(false)} className="flex-1">
                  انصراف
                </Button>
                <Button type="submit" variant="danger" size="sm" className="flex-1 font-bold">
                  پاک‌سازی و راه‌اندازی از صفر
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
