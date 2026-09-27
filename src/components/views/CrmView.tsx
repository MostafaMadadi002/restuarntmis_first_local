import React, { useState } from 'react';
import {
  Users2,
  Gift,
  Star,
  Award,
  Phone,
  Calendar,
  DollarSign,
  TrendingUp,
  Search,
  Plus,
  Edit2,
  Sparkles,
  CheckCircle2,
  X,
  FileText,
  ShieldCheck,
  Check,
  AlertCircle,
  Clock,
  User,
  Settings,
} from 'lucide-react';
import { Card, Button, Badge } from '../common/UI';
import { CustomerData, LoyaltyTierBenefit } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';

interface CrmViewProps {
  customers: CustomerData[];
  tierBenefits?: LoyaltyTierBenefit[];
  pointsUnit?: string;
  onAddCustomer?: (customer: Omit<CustomerData, 'id'>) => void;
  onUpdateCustomer?: (customer: CustomerData) => void;
  onUpdateTierBenefits?: (updatedTiers: LoyaltyTierBenefit[]) => void;
  onApproveUpgrade?: (customerId: number, targetTier: CustomerData['tier']) => void;
  onRejectUpgrade?: (customerId: number) => void;
  onOpenProfile?: () => void;
}

const DEFAULT_TIER_BENEFITS: LoyaltyTierBenefit[] = [
  {
    tier: 'BRONZE',
    title: 'برنزی (شروع عضویت)',
    discount_percent: 0,
    free_perk: 'پیش‌غذای رایگان در سفارش سوم',
    min_spend: 0,
    required_points: 0,
    badge_color: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  {
    tier: 'SILVER',
    title: 'نقره‌ای (مشتری وفادار)',
    discount_percent: 5,
    free_perk: '۵٪ تخفیف روی کل فاکتور + دسر رایگان ماهانه',
    min_spend: 50,
    required_points: 200,
    badge_color: 'bg-stone-100 text-stone-800 border-stone-300',
  },
  {
    tier: 'GOLD',
    title: 'طلایی (مشتری ویژه)',
    discount_percent: 10,
    free_perk: '۱۰٪ تخفیف فاکتور + نوشیدنی رایگان به ازای هر سفارش',
    min_spend: 150,
    required_points: 500,
    badge_color: 'bg-yellow-50 text-yellow-800 border-yellow-300',
  },
  {
    tier: 'PLATINUM',
    title: 'پلاتینیوم (مشتری VIP)',
    discount_percent: 15,
    free_perk: '۱۵٪ تخفیف کامل + پذیرایی ویژه در سالن VIP + هدیه اختصاصی تولد',
    min_spend: 300,
    required_points: 1200,
    badge_color: 'bg-purple-50 text-purple-800 border-purple-300',
  },
];

export function CrmView({
  customers,
  tierBenefits = DEFAULT_TIER_BENEFITS,
  pointsUnit = 'امتیاز',
  onAddCustomer,
  onUpdateCustomer,
  onUpdateTierBenefits,
  onApproveUpgrade,
  onRejectUpgrade,
  onOpenProfile,
}: CrmViewProps) {
  const { t, isRtl, formatPrice } = useLanguage();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [tierFilter, setTierFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'POINTS' | 'SPEND' | 'VISITS' | 'NAME'>('POINTS');

  // Customer Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerData | null>(null);
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [tier, setTier] = useState<CustomerData['tier']>('BRONZE');
  const [points, setPoints] = useState<number>(50);
  const [notes, setNotes] = useState<string>('');
  const [notice, setNotice] = useState<string | null>(null);

  // Tier Benefits Edit Modal State
  const [isTierModalOpen, setIsTierModalOpen] = useState<boolean>(false);
  const [editableTiers, setEditableTiers] = useState<LoyaltyTierBenefit[]>(tierBenefits);

  const tierBadges: Record<CustomerData['tier'], string> = {
    BRONZE: 'bg-amber-50 text-amber-800 border-amber-200',
    SILVER: 'bg-stone-100 text-stone-700 border-stone-200',
    GOLD: 'bg-yellow-50 text-yellow-800 border-yellow-300',
    PLATINUM: 'bg-purple-50 text-purple-800 border-purple-200',
  };

  const getNextTierCandidate = (c: CustomerData): CustomerData['tier'] | null => {
    if (c.pending_tier_upgrade) return c.pending_tier_upgrade;

    const platTier = tierBenefits.find((b) => b.tier === 'PLATINUM');
    const goldTier = tierBenefits.find((b) => b.tier === 'GOLD');
    const silverTier = tierBenefits.find((b) => b.tier === 'SILVER');

    if (c.tier !== 'PLATINUM' && platTier && c.points >= platTier.required_points) {
      return 'PLATINUM';
    }
    if (c.tier === 'BRONZE' || c.tier === 'SILVER') {
      if (goldTier && c.points >= goldTier.required_points) {
        return 'GOLD';
      }
    }
    if (c.tier === 'BRONZE') {
      if (silverTier && c.points >= silverTier.required_points) {
        return 'SILVER';
      }
    }
    return null;
  };

  const pendingUpgradeCustomers = customers.filter((c) => {
    const candidate = getNextTierCandidate(c);
    return candidate !== null && candidate !== c.tier;
  });

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      (c.notes && c.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTier =
      tierFilter === 'ALL'
        ? true
        : tierFilter === 'PENDING'
        ? getNextTierCandidate(c) !== null && getNextTierCandidate(c) !== c.tier
        : c.tier === tierFilter;

    return matchesSearch && matchesTier;
  });

  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    if (sortBy === 'POINTS') return (b.points || 0) - (a.points || 0);
    if (sortBy === 'SPEND') return (b.total_spend || 0) - (a.total_spend || 0);
    if (sortBy === 'VISITS') return (b.visits || 0) - (a.visits || 0);
    if (sortBy === 'NAME') return a.name.localeCompare(b.name, 'fa');
    return (b.points || 0) - (a.points || 0);
  });

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setName('');
    setPhone('');
    setTier('BRONZE');
    setPoints(50);
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: CustomerData) => {
    setEditingCustomer(c);
    setName(c.name);
    setPhone(c.phone);
    setTier(c.tier);
    setPoints(c.points);
    setNotes(c.notes || '');
    setIsModalOpen(true);
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingCustomer) {
      if (onUpdateCustomer) {
        onUpdateCustomer({
          ...editingCustomer,
          name: name.trim(),
          phone: phone.trim(),
          tier,
          points: Number(points),
          notes: notes.trim() || undefined,
        });
      }
      setNotice(`مشخصات مشتری «${name}» با موفقیت بروزرسانی شد.`);
    } else {
      if (onAddCustomer) {
        onAddCustomer({
          name: name.trim(),
          phone: phone.trim() || '09120000000',
          tier,
          points: Number(points) || 50,
          visits: 1,
          total_spend: 0,
          last_visit: 'امروز',
          notes: notes.trim() || undefined,
        });
      }
      setNotice(`مشتری جدید «${name}» در باشگاه مشتریان ثبت گردید.`);
    }

    setIsModalOpen(false);
    setTimeout(() => setNotice(null), 3500);
  };

  const handleConfirmApproval = (c: CustomerData, targetTier: CustomerData['tier']) => {
    if (onApproveUpgrade) {
      onApproveUpgrade(c.id, targetTier);
    } else if (onUpdateCustomer) {
      onUpdateCustomer({
        ...c,
        tier: targetTier,
        pending_tier_upgrade: undefined,
        notes: (c.notes ? `${c.notes} | ` : '') + `ارتقاء به سطح ${targetTier} توسط مدیر تأیید شد.`,
      });
    }
    setNotice(`ارتقاء سطح مشتری «${c.name}» به «${targetTier}» با موفقیت تأیید گردید.`);
    setTimeout(() => setNotice(null), 4000);
  };

  const handleRejectApproval = (c: CustomerData) => {
    if (onRejectUpgrade) {
      onRejectUpgrade(c.id);
    } else if (onUpdateCustomer) {
      onUpdateCustomer({
        ...c,
        pending_tier_upgrade: undefined,
      });
    }
    setNotice(`درخواست ارتقاء سطح مشتری «${c.name}» رد شد.`);
    setTimeout(() => setNotice(null), 3500);
  };

  const handleSaveTierBenefits = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateTierBenefits) {
      onUpdateTierBenefits(editableTiers);
    }
    setIsTierModalOpen(false);
    setNotice('مزایا، درصد تخفیف‌ها و امتیازات رده‌بندی ذخیره شد.');
    setTimeout(() => setNotice(null), 3500);
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="bg-white p-6 md:p-8 border border-stone-100 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shadow-xs">
              <Users2 className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black text-stone-900 tracking-tight">
              {t.crm.title}
            </h1>
          </div>
          <p className="text-xs text-stone-400 font-medium">
            مدیریت مشتریان، باشگاه وفاداری، سطوح تخفیف و امتیازات ویژه
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="md"
            onClick={() => {
              setEditableTiers(tierBenefits);
              setIsTierModalOpen(true);
            }}
            icon={Settings}
            className="rounded-2xl font-bold text-xs border-stone-200"
          >
            تنظیمات رده‌بندی
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={handleOpenAdd}
            icon={Plus}
            className="rounded-2xl font-bold shadow-md shadow-orange-500/20"
          >
            مشتری جدید
          </Button>
        </div>
      </div>

      {notice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-2xl flex items-center justify-between shadow-xs animate-in fade-in duration-300">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-bold">{notice}</span>
          </div>
          <button onClick={() => setNotice(null)} className="p-1 hover:bg-emerald-100 rounded-lg text-emerald-700">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Pending Tier Upgrades Warning */}
      {pendingUpgradeCustomers.length > 0 && (
        <div className="p-6 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-3xl shadow-lg shadow-orange-500/15">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5 pb-3 border-b border-white/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 text-white flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white tracking-tight">
                  تأیید مدیریت برای ارتقاء سطح مشتریان
                </h3>
                <p className="text-xs text-white/90 font-medium">
                  {pendingUpgradeCustomers.length} مشتری امتیاز لازم برای ورود به رده بالاتر را کسب کرده‌اند.
                </p>
              </div>
            </div>
            <span className="bg-white text-orange-600 font-bold px-3 py-1 rounded-full text-xs shadow-xs">
              اقدام لازم
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingUpgradeCustomers.map((c) => {
              const targetTier = getNextTierCandidate(c) || 'GOLD';
              const targetTierConfig = tierBenefits.find((b) => b.tier === targetTier);

              return (
                <div
                  key={c.id}
                  className="p-5 bg-white/10 border border-white/20 rounded-2xl backdrop-blur-xs flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-black text-base text-white">{c.name}</div>
                        <div className="text-[11px] text-white/80 font-medium mt-0.5">{c.phone}</div>
                      </div>
                      <div className="px-2.5 py-1 bg-white/20 rounded-xl text-white font-black text-xs">
                        {c.points} {pointsUnit}
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-2 px-3 bg-black/10 rounded-xl text-xs font-bold">
                      <span>سطح فعلی: {c.tier}</span>
                      <TrendingUp className="w-4 h-4 text-white" />
                      <span>سطح جدید: {targetTier} ({targetTierConfig?.discount_percent}% تخفیف)</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-4">
                    <button
                      onClick={() => handleConfirmApproval(c, targetTier)}
                      className="flex-1 py-2 bg-white text-orange-600 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 hover:bg-orange-50 transition-all shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>تأیید ارتقاء</span>
                    </button>
                    <button
                      onClick={() => handleRejectApproval(c)}
                      className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"
                      title="رد درخواست"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tier Benefits Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tierBenefits.map((tb) => (
          <Card
            key={tb.tier}
            className="p-5 border-stone-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-3 hover:border-orange-200 transition-all rounded-3xl bg-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-black text-stone-900">{tb.title}</div>
                <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{tb.tier}</div>
              </div>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-orange-50 text-orange-600">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-400 font-bold">تخفیف روی فاکتور:</span>
                <span className="font-black text-emerald-600">{tb.discount_percent}%</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-400 font-bold">حداقل امتیاز:</span>
                <span className="font-black text-orange-600">{tb.required_points}</span>
              </div>
            </div>

            <div className="p-2.5 bg-stone-50 rounded-2xl border border-stone-100 text-[11px] font-medium text-stone-600 leading-relaxed">
              <Gift className="w-3.5 h-3.5 mb-1 text-orange-500" />
              {tb.free_perk}
            </div>
          </Card>
        ))}
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-full border border-stone-200 focus-within:border-orange-500 w-full sm:w-80 shadow-xs">
          <Search className="w-4 h-4 text-stone-400 shrink-0" />
          <input
            type="text"
            placeholder="جستجوی نام یا شماره مشتری..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs font-bold outline-none bg-transparent text-stone-900 placeholder-stone-400"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setTierFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border ${
              tierFilter === 'ALL'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-transparent shadow-xs'
                : 'bg-white text-stone-600 border-stone-200 hover:border-orange-200'
            }`}
          >
            همه ({customers.length})
          </button>
          {['GOLD', 'PLATINUM', 'SILVER', 'BRONZE'].map((tCode) => (
            <button
              key={tCode}
              onClick={() => setTierFilter(tCode)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border ${
                tierFilter === tCode
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-transparent shadow-xs'
                  : 'bg-white text-stone-600 border-stone-200 hover:border-orange-200'
              }`}
            >
              {tCode}
            </button>
          ))}
        </div>
      </div>

      {/* Complete Customer Table */}
      <Card className="overflow-hidden border-stone-100 bg-white shadow-xs rounded-3xl">
        <div className="overflow-x-auto">
          <table className={`w-full ${isRtl ? 'text-right' : 'text-left'}`}>
            <thead>
              <tr className="bg-stone-50/70 text-[11px] font-bold text-stone-400 uppercase border-b border-stone-100">
                <th className="px-6 py-4">نام مشتری</th>
                <th className="px-6 py-4">سطح عضویت</th>
                <th className="px-6 py-4 text-center">دفعات مراجعه</th>
                <th className="px-6 py-4">مجموع خرید</th>
                <th className="px-6 py-4">امتیاز ({pointsUnit})</th>
                <th className="px-6 py-4">وضعیت</th>
                <th className="px-6 py-4 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs font-medium">
              {sortedCustomers.map((c) => {
                const nextTier = getNextTierCandidate(c);
                const hasPendingUpgrade = nextTier !== null && nextTier !== c.tier;

                return (
                  <tr
                    key={c.id}
                    className={`transition-colors ${
                      hasPendingUpgrade ? 'bg-orange-50/30 hover:bg-orange-50/50' : 'hover:bg-stone-50/50'
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-stone-900">{c.name}</div>
                          <div className="text-[10px] text-stone-400 mt-0.5">{c.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${tierBadges[c.tier]}`}>
                        {c.tier}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-stone-700">{c.visits}</td>
                    <td className="px-6 py-4 font-black text-orange-600">{formatPrice(c.total_spend)}</td>
                    <td className="px-6 py-4">
                      <span className="font-black text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-lg border border-orange-200">
                        {c.points}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {hasPendingUpgrade ? (
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-orange-600 animate-pulse">ارتقاء به {nextTier}</span>
                          <button
                            onClick={() => handleConfirmApproval(c, nextTier)}
                            className="w-7 h-7 rounded-lg bg-orange-500 text-white flex items-center justify-center shadow-xs"
                            title="تأیید ارتقاء"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-emerald-600 font-bold text-[11px] flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          فعال
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleOpenEdit(c)}
                        className="p-1.5 rounded-xl border border-stone-200 text-stone-400 hover:text-orange-600 hover:border-orange-300 transition-all shadow-xs"
                        title="ویرایش"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Edit Tier Benefits Modal */}
      {isTierModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-xl border border-stone-100 w-full max-w-xl overflow-hidden p-6 md:p-8 space-y-6 max-h-[85vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div className="flex items-center gap-2.5">
                <Settings className="w-5 h-5 text-orange-500" />
                <h3 className="text-base font-black text-stone-900">
                  تنظیمات سطوح وفاداری و درصد تخفیف
                </h3>
              </div>
              <button
                onClick={() => setIsTierModalOpen(false)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTierBenefits} className="space-y-4 text-xs">
              <div className="space-y-3">
                {editableTiers.map((tb, idx) => (
                  <div key={tb.tier} className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${tb.badge_color}`}>
                        سطح {tb.tier}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div>
                        <label className="font-bold text-stone-600 block mb-1">عنوان نمایشی</label>
                        <input
                          type="text"
                          value={tb.title}
                          onChange={(e) => {
                            const updated = [...editableTiers];
                            updated[idx].title = e.target.value;
                            setEditableTiers(updated);
                          }}
                          className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-xl outline-none focus:border-orange-500 font-bold"
                          required
                        />
                      </div>

                      <div>
                        <label className="font-bold text-stone-600 block mb-1">امتیاز لازم</label>
                        <input
                          type="number"
                          min="0"
                          value={tb.required_points}
                          onChange={(e) => {
                            const updated = [...editableTiers];
                            updated[idx].required_points = Number(e.target.value);
                            setEditableTiers(updated);
                          }}
                          className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-xl outline-none focus:border-orange-500 font-bold"
                          required
                        />
                      </div>

                      <div>
                        <label className="font-bold text-stone-600 block mb-1">تخفیف (%)</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={tb.discount_percent}
                          onChange={(e) => {
                            const updated = [...editableTiers];
                            updated[idx].discount_percent = Number(e.target.value);
                            setEditableTiers(updated);
                          }}
                          className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-xl outline-none focus:border-orange-500 font-bold"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-stone-600 block mb-1">مزیت ویژه و پاداش</label>
                      <input
                        type="text"
                        value={tb.free_perk}
                        onChange={(e) => {
                          const updated = [...editableTiers];
                          updated[idx].free_perk = e.target.value;
                          setEditableTiers(updated);
                        }}
                        className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-xl outline-none focus:border-orange-500"
                        required
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-stone-100 flex justify-end gap-2.5">
                <Button type="button" variant="outline" size="md" onClick={() => setIsTierModalOpen(false)}>
                  انصراف
                </Button>
                <Button type="submit" variant="primary" size="md" icon={CheckCircle2}>
                  ذخیره تغییرات
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-xl border border-stone-100 w-full max-w-md overflow-hidden p-6 md:p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-base font-black text-stone-900">
                {editingCustomer ? `ویرایش: ${editingCustomer.name}` : 'افزودن مشتری جدید'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-xl text-stone-400 hover:text-stone-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-stone-600 block mb-1">نام و نام خانوادگی</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: احمدرضا محمدی"
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:border-orange-500 font-bold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-stone-600 block mb-1">شماره تماس</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="09123456789"
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-600 block mb-1">سطح عضویت</label>
                  <select
                    value={tier}
                    onChange={(e) => setTier(e.target.value as CustomerData['tier'])}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:border-orange-500 font-bold"
                  >
                    <option value="BRONZE">برنزی</option>
                    <option value="SILVER">نقره‌ای (۵٪)</option>
                    <option value="GOLD">طلایی (۱۰٪)</option>
                    <option value="PLATINUM">پلاتینیوم (۱۵٪)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-600 block mb-1">امتیاز اولیه</label>
                  <input
                    type="number"
                    value={points}
                    onChange={(e) => setPoints(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:border-orange-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-600 block mb-1">یادداشت و ترجیحات غذایی</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="مثال: علاقه‌مند به پیتزا، میز دنج..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:border-orange-500 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-stone-100 flex justify-end gap-2.5">
                <Button type="button" variant="outline" size="md" onClick={() => setIsModalOpen(false)}>
                  انصراف
                </Button>
                <Button type="submit" variant="primary" size="md" icon={CheckCircle2}>
                  ذخیره مشتری
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
