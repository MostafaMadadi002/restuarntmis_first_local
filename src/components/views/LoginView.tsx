import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  ShieldCheck,
  UserCheck,
  Lock,
  User,
  UtensilsCrossed,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Smartphone,
  Eye,
  EyeOff,
  ChefHat,
  Receipt,
  QrCode,
  Copy,
  Check,
  ExternalLink,
  Info,
} from 'lucide-react';
import { StaffData, Role, TableItem } from '../../types';
import loginBanner from '../../assets/images/restaurant_login_banner_1790498468969.jpg';

interface LoginViewProps {
  staffList: StaffData[];
  tables: TableItem[];
  onLoginSuperuser: (username: string, pass: string) => Promise<boolean>;
  onLoginStaff: (staffMember: StaffData, pass: string) => Promise<boolean>;
  onGuestEnter: (tableNumber?: number) => void;
  restaurantName?: string;
  pointsUnit?: string;
  defaultTab?: 'STAFF' | 'SUPERUSER' | 'GUEST';
}

export function LoginView({
  staffList,
  tables,
  onLoginSuperuser,
  onLoginStaff,
  onGuestEnter,
  restaurantName = 'پیتزا هات و آریا گریل',
  pointsUnit = 'امتیاز',
  defaultTab = 'SUPERUSER',
}: LoginViewProps) {
  const [tab, setTab] = useState<'STAFF' | 'SUPERUSER' | 'GUEST'>(defaultTab);

  // Superuser inputs
  const [superUsername, setSuperUsername] = useState('admin');
  const [superPassword, setSuperPassword] = useState('admin');
  const [superShowPass, setSuperShowPass] = useState(false);

  // Staff inputs
  const [selectedStaffId, setSelectedStaffId] = useState<number>(staffList[0]?.id || 1);
  const [staffPassword, setStaffPassword] = useState('123');
  const [staffShowPass, setStaffShowPass] = useState(false);

  // Guest inputs & QR generation
  const [guestTableId, setGuestTableId] = useState<number>(tables[0]?.id || 1);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Status & loading
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Synchronize selected staff if list updates
  useEffect(() => {
    if (staffList && staffList.length > 0) {
      const exists = staffList.find((s) => s.id === selectedStaffId);
      if (!exists) {
        setSelectedStaffId(staffList[0].id);
        setStaffPassword(staffList[0].role === 'MANAGER' ? 'admin' : '123');
      }
    }
  }, [staffList, selectedStaffId]);

  // Handle staff selection change
  const handleSelectStaff = (id: number) => {
    setSelectedStaffId(id);
    const s = staffList.find((item) => item.id === id);
    if (s) {
      setStaffPassword(s.role === 'MANAGER' ? 'admin' : '123');
    }
    setErrorMsg(null);
  };

  // Generate QR code for the selected guest table
  useEffect(() => {
    const selectedTable = tables.find((t) => t.id === guestTableId) || tables[0] || {
      id: 1,
      table_number: '01',
    };

    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const tableUrl = `${origin}/?table=${selectedTable.table_number || selectedTable.id}`;

    QRCode.toDataURL(tableUrl, {
      width: 200,
      margin: 2,
      color: {
        dark: '#1c1917',
        light: '#ffffff',
      },
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch((err) => console.error('QR code generation error:', err));
  }, [guestTableId, tables]);

  const handleSuperuserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    try {
      const ok = await onLoginSuperuser(superUsername.trim(), superPassword.trim());
      if (!ok) {
        setErrorMsg('نام کاربری یا کلمه عبور مدیر کل اشتباه است.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'خطا در برقراری ارتباط با سیستم.');
    } finally {
      setLoading(false);
    }
  };

  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const targetStaff = staffList.find((s) => s.id === Number(selectedStaffId));
    if (!targetStaff) {
      setErrorMsg('لطفاً یکی از همکاران را انتخاب کنید.');
      return;
    }
    setLoading(true);
    try {
      const ok = await onLoginStaff(targetStaff, staffPassword.trim());
      if (!ok) {
        setErrorMsg('رمز عبور همکار نادرست است. (رمز مدیر: admin و سایر پرسنل: 123)');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'خطا در ورود به پایانه همکار.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    const selectedTable = tables.find((t) => t.id === guestTableId) || tables[0];
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const tableNum = selectedTable?.table_number || '01';
    const url = `${origin}/?table=${tableNum}`;
    navigator.clipboard?.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const getRoleLabel = (role: Role) => {
    switch (role) {
      case 'MANAGER':
        return 'مدیر سالن';
      case 'CASHIER':
        return 'صندوق‌دار';
      case 'WAITER':
        return 'مهماندار / گارسون';
      case 'KITCHEN':
        return 'سرآشپز / آشپزخانه';
      default:
        return 'همکار';
    }
  };

  const getRoleIcon = (role: Role) => {
    switch (role) {
      case 'MANAGER':
        return ShieldCheck;
      case 'CASHIER':
        return Receipt;
      case 'WAITER':
        return UtensilsCrossed;
      case 'KITCHEN':
        return ChefHat;
      default:
        return UserCheck;
    }
  };

  const currentStaff = staffList.find((s) => s.id === selectedStaffId) || staffList[0];
  const CurrentStaffIcon = currentStaff ? getRoleIcon(currentStaff.role) : UserCheck;

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#FBFBFA] flex items-center justify-center p-4 selection:bg-orange-500 selection:text-white"
    >
      {/* Subtle Background Glows matching the app's warm theme */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[45%] h-[45%] bg-amber-100/40 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[45%] h-[45%] bg-orange-100/30 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-[480px] relative z-10 py-6 sm:py-10 space-y-6">
        {/* Main Card with Restaurant Banner and App Theme */}
        <div className="bg-white border border-stone-200/80 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.06)] overflow-hidden transition-all">
          {/* 1. Sleek Food Image Header Banner */}
          <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-stone-900">
            <img
              src={loginBanner}
              alt={restaurantName}
              className="w-full h-full object-cover object-center filter brightness-[0.92]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

            {/* Restaurant Title Over Image */}
            <div className="absolute bottom-4 right-5 left-5 text-white flex items-end justify-between">
              <div>
                <span className="inline-block text-[11px] font-bold text-amber-300 bg-black/40 backdrop-blur-md px-2.5 py-0.5 rounded-full mb-1.5 border border-white/10">
                  سیستم مدیریت و سفارش‌گیری
                </span>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight drop-shadow-sm">
                  {restaurantName}
                </h1>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-amber-300 shadow-lg">
                <UtensilsCrossed className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* 2. Clean Role Selection Tabs (Main App Theme) */}
            <div className="bg-stone-100 p-1.5 rounded-2xl flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setTab('SUPERUSER');
                  setErrorMsg(null);
                }}
                className={`flex-1 py-2.5 px-2 rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 text-xs font-bold ${
                  tab === 'SUPERUSER'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-orange-500" />
                <span>مدیر سیستم</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTab('STAFF');
                  setErrorMsg(null);
                }}
                className={`flex-1 py-2.5 px-2 rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 text-xs font-bold ${
                  tab === 'STAFF'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <UserCheck className="w-4 h-4 text-amber-500" />
                <span>کادر پرسنلی</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTab('GUEST');
                  setErrorMsg(null);
                }}
                className={`flex-1 py-2.5 px-2 rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 text-xs font-bold ${
                  tab === 'GUEST'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <QrCode className="w-4 h-4 text-emerald-600" />
                <span>مهمان (با QR)</span>
              </button>
            </div>

            {/* Error Message Box */}
            {errorMsg && (
              <div className="p-3.5 bg-rose-50 border border-rose-200/80 rounded-2xl text-rose-700 text-xs font-bold flex items-center gap-2.5 animate-in fade-in">
                <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                <span className="flex-1">{errorMsg}</span>
              </div>
            )}

            {/* TAB 1: SUPERUSER LOGIN FORM */}
            {tab === 'SUPERUSER' && (
              <form onSubmit={handleSuperuserSubmit} className="space-y-5">
                <div className="space-y-1">
                  <h3 className="text-base font-black text-stone-900">ورود مدیر کل سیستم</h3>
                  <p className="text-xs text-stone-500 font-medium">
                    دسترسی به تمامی بخش‌ها: آمار فروش، منو، پرسنل، انبار و تنظیمات
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700 block">
                      نام کاربری مدیر
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={superUsername}
                        onChange={(e) => setSuperUsername(e.target.value)}
                        placeholder="admin"
                        className="w-full pr-11 pl-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-sm font-bold text-stone-900 placeholder:text-stone-400 transition-all text-left dir-ltr"
                        required
                      />
                      <User className="w-4 h-4 text-stone-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700 block">
                      رمز عبور مدیر
                    </label>
                    <div className="relative">
                      <input
                        type={superShowPass ? 'text' : 'password'}
                        value={superPassword}
                        onChange={(e) => setSuperPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pr-11 pl-11 py-3 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-sm font-bold text-stone-900 placeholder:text-stone-400 transition-all text-left dir-ltr"
                        required
                      />
                      <Lock className="w-4 h-4 text-stone-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <button
                        type="button"
                        onClick={() => setSuperShowPass(!superShowPass)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition-colors"
                        tabIndex={-1}
                      >
                        {superShowPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quick Hint */}
                <div className="p-2.5 bg-amber-50/70 border border-amber-200/60 rounded-xl text-[11px] text-amber-800 flex items-center justify-between font-medium">
                  <div className="flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>نام کاربری و رمز پیش‌فرض:</span>
                  </div>
                  <span className="font-mono font-bold bg-white px-2 py-0.5 rounded-md border border-amber-200 text-stone-800">
                    admin / admin
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-bold text-sm shadow-md shadow-orange-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <span>{loading ? 'در حال بررسی اطلاعات...' : 'ورود به پنل مدیریت'}</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* TAB 2: STAFF PORTAL FORM */}
            {tab === 'STAFF' && (
              <form onSubmit={handleStaffSubmit} className="space-y-5">
                <div className="space-y-1">
                  <h3 className="text-base font-black text-stone-900">ورود همکاران رستوران</h3>
                  <p className="text-xs text-stone-500 font-medium">
                    انتخاب نام همکار جهت بازگشایی پایانه مربوطه (گارسون، صندوق یا سرآشپز)
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700 block">
                      انتخاب نام همکار
                    </label>
                    <div className="relative">
                      <select
                        value={selectedStaffId}
                        onChange={(e) => handleSelectStaff(Number(e.target.value))}
                        className="w-full pr-11 pl-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-sm font-bold text-stone-900 transition-all appearance-none cursor-pointer"
                      >
                        {staffList.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} — {getRoleLabel(s.role)} ({s.employee_code})
                          </option>
                        ))}
                      </select>
                      <CurrentStaffIcon className="w-4 h-4 text-orange-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-stone-700 block">
                        رمز عبور یا کد پین همکار
                      </label>
                      <span className="text-[10px] text-stone-400 font-medium">
                        (رمز پرسنل: 123 یا رمز مدیر: admin)
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type={staffShowPass ? 'text' : 'password'}
                        value={staffPassword}
                        onChange={(e) => setStaffPassword(e.target.value)}
                        placeholder="••••"
                        className="w-full pr-11 pl-11 py-3 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-sm font-bold text-stone-900 placeholder:text-stone-400 transition-all text-left dir-ltr"
                        required
                      />
                      <KeyRound className="w-4 h-4 text-stone-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <button
                        type="button"
                        onClick={() => setStaffShowPass(!staffShowPass)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition-colors"
                        tabIndex={-1}
                      >
                        {staffShowPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Selected staff role summary card */}
                {currentStaff && (
                  <div className="p-3 bg-stone-50 border border-stone-200/80 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                        <CurrentStaffIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-stone-900">{currentStaff.name}</p>
                        <p className="text-[10px] text-stone-500">{getRoleLabel(currentStaff.role)}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono font-bold bg-white px-2 py-0.5 rounded-lg border border-stone-200 text-stone-700">
                      {currentStaff.employee_code}
                    </span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-6 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-sm shadow-md shadow-stone-900/10 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <span>{loading ? 'در حال برقراری اتصال...' : 'ورود و بازگشایی پایانه'}</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* TAB 3: GUEST LOGIN (WITH TABLE QR CODE) */}
            {tab === 'GUEST' && (
              <div className="space-y-5">
                <div className="space-y-1 text-center">
                  <h3 className="text-base font-black text-stone-900">
                    ورود مهمان و منوی هوشمند با QR
                  </h3>
                  <p className="text-xs text-stone-500 font-medium max-w-sm mx-auto">
                    مهمانان می‌توانند با اسکن بارکد QR روی میز خود با موبایل، فوراً منو را مشاهده و سفارش ثبت نمایند.
                  </p>
                </div>

                {/* QR Code Card */}
                <div className="p-4 bg-stone-50 border border-stone-200/80 rounded-2xl flex flex-col items-center justify-center space-y-3">
                  <div className="bg-white p-3 rounded-2xl shadow-sm border border-stone-100 flex items-center justify-center">
                    {qrCodeDataUrl ? (
                      <img
                        src={qrCodeDataUrl}
                        alt="بارکد منوی میز"
                        className="w-40 h-40 object-contain rounded-lg"
                      />
                    ) : (
                      <div className="w-40 h-40 flex items-center justify-center text-stone-300">
                        <QrCode className="w-12 h-12 animate-pulse" />
                      </div>
                    )}
                  </div>

                  {/* Table Selection for Demo & Testing */}
                  <div className="w-full space-y-2 pt-1">
                    <label className="text-xs font-bold text-stone-600 block text-center">
                      انتخاب شماره میز جهت تست و اسکن:
                    </label>
                    <div className="flex flex-wrap justify-center gap-1.5 max-h-24 overflow-y-auto p-1">
                      {tables.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setGuestTableId(t.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            guestTableId === t.id
                              ? 'bg-orange-500 text-white shadow-xs'
                              : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                          }`}
                        >
                          میز {t.table_number}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Copy Link or Direct Open */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">لینک کپی شد</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-stone-500" />
                        <span>کپی لینک میز</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => onGuestEnter(guestTableId)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-600/20"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>ورود مستقیم به منو</span>
                  </button>
                </div>

                {/* Loyalty Info Banner */}
                <div className="p-3 bg-emerald-50 border border-emerald-200/60 rounded-2xl flex items-center gap-2.5 text-emerald-800 text-xs font-medium">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    سیستم پاداش فعال: مهمانان با ثبت هر سفارش، {pointsUnit} وفاداری دریافت خواهند کرد.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quiet Minimal Footer */}
        <div className="text-center space-y-2">
          <p className="text-[11px] font-bold text-stone-400">
            سامانه یکپارچه هوشمند رستوران و پایانه فروشگاهی
          </p>
          <div className="flex items-center justify-center gap-4 text-[10px] text-stone-400 font-medium">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              سرور محلی فعال
            </span>
            <span>•</span>
            <span>نسخه ۲.۵</span>
          </div>
        </div>
      </div>
    </div>
  );
}
