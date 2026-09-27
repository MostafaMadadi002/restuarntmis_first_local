import React, { useState } from 'react';
import {
  Bell,
  Menu,
  Search,
  Wifi,
  User,
  LogOut,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Info,
  Calendar,
  Layers,
  Globe,
  ShoppingCart,
  Settings,
} from 'lucide-react';
import { Role, NotificationItem } from '../../types';
import { Badge } from '../common/UI';
import { LanguageCode } from '../views/SettingsView';
import { TRANSLATIONS } from '../../i18n/translations';

interface TopbarProps {
  onToggleSidebar: () => void;
  userRole: Role;
  onChangeRole: (role: Role) => void;
  notifications: NotificationItem[];
  onOpenNotification: (item: NotificationItem) => void;
  activeView: string;
  lang?: LanguageCode;
  onLanguageChange?: (lang: LanguageCode) => void;
  backendStatus?: 'CONNECTED' | 'DISCONNECTED' | 'CHECKING';
  backendMessage?: string;
  onOpenBackendModal?: () => void;
  userName?: string;
  onOpenProfile?: () => void;
  onLogout?: () => void;
  isSuperUser?: boolean;
}

export function Topbar({
  onToggleSidebar,
  userRole,
  onChangeRole,
  notifications,
  onOpenNotification,
  activeView,
  lang = 'fa',
  onLanguageChange,
  backendStatus = 'CONNECTED',
  backendMessage = '',
  onOpenBackendModal,
  userName,
  onOpenProfile,
  onLogout,
  isSuperUser = false,
}: TopbarProps) {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const t = TRANSLATIONS[lang] || TRANSLATIONS.fa;
  const unreadCount = notifications.filter((n) => !n.read).length;

  const roleLabels = t.roles;

  const langNames: Record<LanguageCode, { label: string; flag: string }> = {
    fa: { label: 'فارسی / دری', flag: '🇦🇫' },
    ps: { label: 'پښتو', flag: '🇦🇫' },
    en: { label: 'English', flag: '🌐' },
  };

  return (
    <header className="h-20 bg-white border-b border-slate-50 px-6 lg:px-10 flex items-center justify-between sticky top-0 z-30 shadow-[0_4px_20px_rgb(0,0,0,0.01)] backdrop-blur-xl bg-white/80">
      {/* Search / Mobile Toggle */}
      <div className="flex items-center gap-6">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2.5 text-slate-500 hover:text-slate-900 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-all"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <div className="hidden sm:flex items-center gap-3 bg-slate-50/80 rounded-2xl px-5 py-2.5 w-80 group border border-transparent focus-within:border-slate-200 focus-within:bg-white focus-within:shadow-xl focus-within:shadow-slate-200/50 transition-all">
          <Search className="w-4.5 h-4.5 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            className="bg-transparent border-none outline-none w-full text-slate-900 placeholder-slate-400 text-sm font-medium"
          />
        </div>
      </div>

      {/* Action Buttons: Language Switcher, Role Switcher, Notifications */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Quick Language Switcher Dropdown in Topbar */}
        <div className="relative">
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-50 border border-transparent hover:border-slate-100 hover:bg-white text-[13px] text-slate-700 font-bold transition-all"
            title="Change Language"
          >
            <span>{langNames[lang].flag}</span>
            <span className="hidden md:inline">{langNames[lang].label}</span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {showLangMenu && (
            <div className="absolute left-0 mt-3 w-48 bg-white border border-slate-100 rounded-3xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
              <div className="px-5 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-60">
                System Language
              </div>
              {(['fa', 'ps', 'en'] as LanguageCode[]).map((l) => (
                <button
                  key={l}
                  onClick={() => {
                    if (onLanguageChange) onLanguageChange(l);
                    setShowLangMenu(false);
                  }}
                  className={`w-full text-right px-5 py-3 text-sm flex items-center justify-between hover:bg-slate-50 transition-colors ${
                    lang === l ? 'text-slate-900 font-black' : 'text-slate-500'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span>{langNames[l].flag}</span>
                    <span>{langNames[l].label}</span>
                  </span>
                  {lang === l && <CheckCircle2 className="w-4 h-4 text-slate-900" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Local Network & Backend Connection Indicator */}
        <button
          onClick={onOpenBackendModal}
          className={`flex items-center gap-2.5 text-[11px] px-4 py-2 rounded-2xl font-black transition-all border shadow-sm ${
            backendStatus === 'CONNECTED'
              ? 'text-emerald-700 bg-emerald-50 border-emerald-100 hover:bg-emerald-100'
              : backendStatus === 'CHECKING'
              ? 'text-sky-700 bg-sky-50 border-sky-100 hover:bg-sky-100'
              : 'text-amber-800 bg-amber-50 border-amber-100 hover:bg-amber-100'
          }`}
        >
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              backendStatus === 'CONNECTED'
                ? 'bg-emerald-600 animate-pulse'
                : backendStatus === 'CHECKING'
                ? 'bg-sky-500 animate-ping'
                : 'bg-amber-500'
            }`}
          ></span>
          <span className="hidden sm:inline uppercase tracking-tight">
            {backendStatus === 'CONNECTED'
              ? (lang === 'en' ? 'Live System Connected' : 'ارتباط زنده فعال است')
              : backendStatus === 'CHECKING'
              ? (lang === 'en' ? 'Authenticating...' : 'در حال بررسی...')
              : (lang === 'en' ? 'Local Mode' : 'حالت لوکال')}
          </span>
        </button>

        {/* Cart Icon Button matching user mockup */}
        <button
          onClick={onOpenProfile}
          className="relative p-2.5 text-stone-500 hover:text-stone-900 bg-stone-50 hover:bg-stone-100 rounded-2xl transition-all"
          title="Orders Cart"
        >
          <ShoppingCart className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 text-white rounded-full text-[9px] font-black flex items-center justify-center">
            2
          </span>
        </button>

        {/* Settings Button matching user mockup */}
        <button
          onClick={onOpenProfile}
          className="p-2.5 text-stone-500 hover:text-stone-900 bg-stone-50 hover:bg-stone-100 rounded-2xl transition-all"
          title="Settings & Profile"
        >
          <Settings className="w-5 h-5" />
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="relative p-2.5 text-stone-500 hover:text-stone-900 bg-stone-50 hover:bg-stone-100 rounded-2xl transition-all"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute left-0 mt-3 w-96 bg-white border border-slate-100 rounded-[32px] shadow-2xl py-4 z-50 animate-in fade-in zoom-in-95 duration-200">
              <div className="px-6 py-2 border-b border-slate-50 flex items-center justify-between mb-2">
                <span className="text-sm font-black text-slate-900 tracking-tight">{t.operationsAlerts}</span>
                <Badge variant="success" className="text-[10px]">
                  {unreadCount} New
                </Badge>
              </div>
              <div className="max-h-80 overflow-y-auto no-scrollbar">
                {notifications.length === 0 ? (
                  <div className="px-6 py-10 text-center text-slate-400 text-xs font-medium">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        onOpenNotification(n);
                        setShowNotifMenu(false);
                      }}
                      className={`px-6 py-4 cursor-pointer hover:bg-slate-50 transition-colors border-l-4 ${
                        !n.read ? 'border-slate-900 bg-slate-50/30' : 'border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-black text-slate-900">{n.title}</span>
                        <span className="text-[10px] text-slate-400 font-bold">{n.time}</span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Identity / Role & Logout */}
        <div className="flex items-center gap-2">
          {isSuperUser ? (
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-3 bg-white hover:bg-slate-50 border border-slate-100 rounded-2xl px-4 py-2 transition-all shadow-sm"
              >
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-400 to-rose-400 p-0.5 shadow-sm overflow-hidden flex items-center justify-center shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face"
                    alt="User Avatar"
                    className="w-full h-full rounded-[14px] object-cover"
                  />
                </div>
                <div className="hidden sm:block leading-none text-right">
                  <div className="text-xs font-black text-slate-900 tracking-tight">{roleLabels[userRole].title}</div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">Super User</div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 ml-1" />
              </button>

              {showRoleMenu && (
                <div className="absolute left-0 mt-3 w-64 bg-white border border-slate-100 rounded-3xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-6 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-60">
                    Switch View
                  </div>
                  {(['MANAGER', 'WAITER', 'CASHIER', 'KITCHEN'] as Role[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        onChangeRole(r);
                        setShowRoleMenu(false);
                      }}
                      className={`w-full text-right px-6 py-3 text-sm flex items-center justify-between hover:bg-slate-50 transition-colors ${
                        userRole === r ? 'text-slate-900 font-black' : 'text-slate-500'
                      }`}
                    >
                      <span>{roleLabels[r].title}</span>
                      <Badge variant="neutral" className="text-[8px] opacity-70">{roleLabels[r].badge}</Badge>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3 bg-white border border-slate-100 rounded-2xl px-4 py-2 text-right shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center text-sm font-black">
                {(userName || roleLabels[userRole].title).charAt(0)}
              </div>
              <div className="leading-none text-right">
                <div className="text-xs font-black text-slate-900 tracking-tight">{userName || roleLabels[userRole].title}</div>
                <div className="text-[10px] text-slate-400 font-bold mt-1 uppercase">{roleLabels[userRole].title}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
