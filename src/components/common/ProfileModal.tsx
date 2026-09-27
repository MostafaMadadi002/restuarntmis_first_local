import React, { useState, useEffect } from 'react';
import {
  User,
  X,
  CheckCircle2,
  Phone,
  Shield,
  Award,
  Sparkles,
  Gift,
  Clock,
  Edit2,
  Calendar,
} from 'lucide-react';
import { Button, Card, Badge } from './UI';
import { Role, StaffData, CustomerData, LoyaltyTierBenefit } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: Role;
  currentUserStaff?: StaffData | null;
  onUpdateStaffProfile?: (updated: StaffData) => void;
  onUpdateAttendance?: (staff_id: number, status: string, check_in_time?: string) => Promise<void>;
  currentCustomer?: CustomerData | null;
  onUpdateCustomerProfile?: (updated: CustomerData) => void;
  tierBenefits?: LoyaltyTierBenefit[];
}

export function ProfileModal({
  isOpen,
  onClose,
  userRole,
  currentUserStaff,
  onUpdateStaffProfile,
  onUpdateAttendance,
  currentCustomer,
  onUpdateCustomerProfile,
  tierBenefits = [],
}: ProfileModalProps) {
  const { t, isRtl, formatPrice } = useLanguage();

  // Staff state
  const [staffName, setStaffName] = useState(currentUserStaff?.name || '');
  const [staffPhone, setStaffPhone] = useState(currentUserStaff?.phone || '');
  const [staffSections, setStaffSections] = useState(currentUserStaff?.assigned_sections || '');

  // Customer state
  const [customerName, setCustomerName] = useState(currentCustomer?.name || 'مهمان گرامی');
  const [customerPhone, setCustomerPhone] = useState(currentCustomer?.phone || '09120000000');
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  useEffect(() => {
    if (currentUserStaff) {
      setStaffName(currentUserStaff.name);
      setStaffPhone(currentUserStaff.phone);
      setStaffSections(currentUserStaff.assigned_sections || '');
    }
  }, [currentUserStaff]);

  useEffect(() => {
    if (currentCustomer) {
      setCustomerName(currentCustomer.name);
      setCustomerPhone(currentCustomer.phone);
    }
  }, [currentCustomer]);

  if (!isOpen) return null;

  const isCustomer = userRole === 'CUSTOMER';

  const customerTierBenefit = tierBenefits.find(
    (b) => b.tier === (currentCustomer?.tier || 'GOLD')
  );

  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserStaff || !onUpdateStaffProfile) return;
    onUpdateStaffProfile({
      ...currentUserStaff,
      name: staffName.trim() || currentUserStaff.name,
      phone: staffPhone.trim() || currentUserStaff.phone,
      assigned_sections: staffSections.trim() || currentUserStaff.assigned_sections,
    });
    setSavedNotice('اطلاعات پروفایل شما با موفقیت بروزرسانی شد.');
    setTimeout(() => {
      setSavedNotice(null);
      onClose();
    }, 1200);
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdateCustomerProfile) return;
    const baseCust: CustomerData = currentCustomer || {
      id: 999,
      name: customerName,
      phone: customerPhone,
      visits: 4,
      total_spend: 1850,
      points: 190,
      tier: 'GOLD',
      last_visit: 'امروز',
    };

    onUpdateCustomerProfile({
      ...baseCust,
      name: customerName.trim() || 'مهمان آریا گریل',
      phone: customerPhone.trim() || '09120000000',
    });
    setSavedNotice('پروفایل مشتری با موفقیت ذخیره شد.');
    setTimeout(() => {
      setSavedNotice(null);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div
        className="bg-white rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] border border-slate-100 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Modal Header */}
        <div className="relative p-8 overflow-hidden">
          {/* Abstract background element */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl" />
          
          <div className="relative flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 ring-4 ring-emerald-50/50">
                <User className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  {isCustomer ? 'پروفایل مشتری' : t.roles[userRole]?.title || userRole}
                </h3>
                <p className="text-sm text-slate-500 font-medium mt-0.5">
                  {isCustomer
                    ? 'باشگاه مشتریان و امتیازات'
                    : 'مدیریت مشخصات پرسنلی'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="px-8 pb-8 space-y-6">
          {savedNotice && (
            <div className="p-4 bg-emerald-50/50 border border-emerald-100 text-emerald-800 text-sm font-bold rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
              <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <span>{savedNotice}</span>
            </div>
          )}

          {isCustomer ? (
            /* Customer Profile */
            <div className="space-y-6">
              {/* Tier Card */}
              <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl text-white shadow-xl shadow-slate-200/50 relative overflow-hidden">
                {/* Decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
                
                <div className="relative flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                      <Award className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Membership Level</span>
                      <span className="text-sm font-black text-white">
                        {customerTierBenefit?.title || 'برنزی'}
                      </span>
                    </div>
                  </div>
                  <Badge variant="warning" className="bg-amber-400/20 text-amber-400 border-amber-400/30 px-3 py-1">
                    {currentCustomer?.tier || 'BRONZE'}
                  </Badge>
                </div>

                <div className="relative grid grid-cols-3 gap-4 mb-6">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold block">مراجعات</span>
                    <span className="text-base font-black font-mono">{currentCustomer?.visits || 0}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold block">امتیازات</span>
                    <span className="text-base font-black text-amber-400 font-mono">{currentCustomer?.points || 0}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold block">مجموع خرید</span>
                    <span className="text-base font-black font-mono">{formatPrice(currentCustomer?.total_spend || 0)}</span>
                  </div>
                </div>

                {customerTierBenefit && (
                  <div className="relative p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                    <div className="flex items-center gap-2.5 mb-2">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-black text-emerald-400">مزایای سطح شما:</span>
                    </div>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-[11px] font-bold text-slate-200">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        {customerTierBenefit.discount_percent}٪ تخفیف روی کل فاکتور
                      </li>
                      <li className="flex items-center gap-2 text-[11px] font-bold text-slate-200">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        {customerTierBenefit.free_perk}
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Form */}
              <form onSubmit={handleSaveCustomer} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-700 mx-1">
                    نام و نام خانوادگی
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-5 py-4 text-sm bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all font-bold placeholder:text-slate-300"
                    placeholder="مثال: علی محمدی"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-700 mx-1">
                    شماره موبایل
                  </label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-5 py-4 text-sm bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all font-mono font-bold text-left placeholder:text-slate-300"
                    placeholder="0912XXXXXXX"
                    dir="ltr"
                  />
                </div>

                <div className="pt-4 flex items-center gap-3">
                  <Button type="button" variant="outline" className="flex-1 rounded-2xl py-4 h-auto text-sm" onClick={onClose}>
                    انصراف
                  </Button>
                  <Button type="submit" variant="primary" className="flex-2 rounded-2xl py-4 h-auto text-sm shadow-xl shadow-emerald-500/20" icon={CheckCircle2}>
                    ذخیره اطلاعات
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            /* Staff Profile */
            <form onSubmit={handleSaveStaff} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Role</span>
                  <span className="text-sm font-black text-slate-900">{t.roles[userRole]?.title || userRole}</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Code</span>
                  <span className="text-sm font-black text-slate-900 font-mono">{currentUserStaff?.employee_code || '---'}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 mx-1">
                  نام و نام خانوادگی
                </label>
                <input
                  type="text"
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  className="w-full px-5 py-4 text-sm bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all font-bold"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 mx-1">
                  شماره تماس
                </label>
                <input
                  type="text"
                  value={staffPhone}
                  onChange={(e) => setStaffPhone(e.target.value)}
                  className="w-full px-5 py-4 text-sm bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all font-mono font-bold text-left"
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 mx-1">
                  میزها یا بخش‌های تحت مسئولیت
                </label>
                <input
                  type="text"
                  value={staffSections}
                  onChange={(e) => setStaffSections(e.target.value)}
                  className="w-full px-5 py-4 text-sm bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all font-bold"
                  placeholder="مثال: سالن اصلی، میزهای ۴-۸"
                />
              </div>

              {onUpdateAttendance && currentUserStaff && (
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-black text-slate-700 uppercase tracking-tight">حضور و غیاب امروز</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={async () => {
                        await onUpdateAttendance(currentUserStaff.id, 'PRESENT', new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
                        setSavedNotice('ساعت ورود ثبت شد');
                      }}
                      className={`py-3.5 rounded-2xl text-xs font-black transition-all duration-300 flex items-center justify-center gap-2 ${
                        currentUserStaff.attendance_status === 'PRESENT'
                          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                          : 'bg-white text-slate-600 border border-slate-200 hover:border-emerald-500 hover:text-emerald-600'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{currentUserStaff.attendance_status === 'PRESENT' ? (currentUserStaff.check_in_time || 'حاضر') : 'ثبت ورود'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        await onUpdateAttendance(currentUserStaff.id, 'ABSENT');
                        setSavedNotice('وضعیت خروج ثبت شد');
                      }}
                      className={`py-3.5 rounded-2xl text-xs font-black transition-all duration-300 flex items-center justify-center gap-2 ${
                        currentUserStaff.attendance_status === 'ABSENT'
                          ? 'bg-slate-900 text-white'
                          : 'bg-white text-slate-600 border border-slate-200 hover:border-rose-500 hover:text-rose-600'
                      }`}
                    >
                      <X className="w-4 h-4" />
                      <span>پایان شیفت</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="pt-4 flex items-center gap-3">
                <Button type="button" variant="outline" className="flex-1 rounded-2xl py-4 h-auto text-sm" onClick={onClose}>
                  انصراف
                </Button>
                <Button type="submit" variant="primary" className="flex-2 rounded-2xl py-4 h-auto text-sm shadow-xl shadow-emerald-500/20" icon={CheckCircle2}>
                  ذخیره تغییرات
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
