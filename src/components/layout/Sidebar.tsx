import React, { useState } from 'react';
import {
  LayoutDashboard,
  Utensils,
  CreditCard,
  ClipboardList,
  ChefHat,
  BookOpen,
  Boxes,
  Users2,
  UserCog,
  BarChart3,
  MonitorCheck,
  Settings,
  LogOut,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { Role } from '../../types';
import { LanguageCode } from '../views/SettingsView';
import { TRANSLATIONS } from '../../i18n/translations';

interface SidebarProps {
  currentView: string;
  onSelectView: (view: string) => void;
  onLogout: () => void;
  userRole: Role;
  isOpen: boolean;
  lang?: LanguageCode;
}

export function Sidebar({
  currentView,
  onSelectView,
  onLogout,
  userRole,
  isOpen,
  lang = 'fa',
}: SidebarProps) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.fa;
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const isRtl = lang === 'fa' || lang === 'ps';

  // Navigation items matching core operations
  const navItems = [
    { id: 'dashboard', label: t.nav.dashboard, icon: LayoutDashboard, roles: ['MANAGER'] },
    { id: 'tables', label: t.nav.tables, icon: Utensils, roles: ['MANAGER', 'WAITER', 'CASHIER'] },
    { id: 'pos', label: t.nav.pos, icon: CreditCard, roles: ['MANAGER', 'CASHIER'] },
    { id: 'waiter', label: t.nav.waiter, icon: Utensils, roles: ['MANAGER', 'WAITER'] },
    { id: 'orders', label: t.nav.orders, icon: ClipboardList, roles: ['MANAGER', 'WAITER', 'CASHIER'] },
    { id: 'kds', label: t.nav.kds, icon: ChefHat, roles: ['MANAGER', 'KITCHEN'] },
    { id: 'menu', label: t.nav.menu, icon: BookOpen, roles: ['MANAGER'] },
    { id: 'inventory', label: t.nav.inventory, icon: Boxes, roles: ['MANAGER'] },
    { id: 'customers', label: t.nav.customers, icon: Users2, roles: ['MANAGER', 'CASHIER'] },
    { id: 'staff', label: t.nav.staff, icon: UserCog, roles: ['MANAGER'] },
    { id: 'reports', label: t.nav.reports, icon: BarChart3, roles: ['MANAGER'] },
    { id: 'devices', label: t.nav.devices, icon: MonitorCheck, roles: ['MANAGER'] },
    { id: 'settings', label: t.nav.settings, icon: Settings, roles: ['MANAGER'] },
  ];

  const visibleItems = navItems.filter((item) => item.roles.includes(userRole));

  return (
    <aside
      className={`fixed lg:static top-0 ${isRtl ? 'right-0 border-l' : 'left-0 border-r'} h-full ${
        isExpanded ? 'w-64' : 'w-20'
      } bg-white border-stone-100 z-40 flex flex-col justify-between transition-all duration-300 ease-in-out shadow-[0_10px_35px_-8px_rgba(0,0,0,0.03)] ${
        isOpen
          ? 'translate-x-0'
          : isRtl
          ? 'translate-x-full lg:translate-x-0'
          : '-translate-x-full lg:translate-x-0'
      }`}
    >
      {/* Top: Brand Logo matching the user's mockup (circle with verified badge) */}
      <div className="flex flex-col items-center pt-5 pb-3">
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="relative cursor-pointer group flex items-center justify-center"
          title={isExpanded ? 'Collapse Menu' : 'Expand Menu'}
        >
          {/* Logo badge in vibrant pizza/grill tones */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 p-0.5 shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
              <span className="text-orange-600 font-black text-sm tracking-tighter uppercase">
                {lang === 'en' ? 'PIZZA' : 'آریا'}
              </span>
            </div>
          </div>
          {/* Verified Teal Checkmark Badge like the user's image */}
          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-teal-500 text-white flex items-center justify-center border-2 border-white shadow-xs">
            <CheckCircle2 className="w-2.5 h-2.5" />
          </div>
        </div>

        {isExpanded && (
          <div className="mt-3 text-center px-4 animate-in fade-in duration-200">
            <h2 className="text-sm font-black text-stone-900 tracking-tight leading-tight">
              {t.restaurantTitle}
            </h2>
            <p className="text-[10px] text-orange-500 font-bold uppercase tracking-widest mt-0.5">
              {t.localSystem}
            </p>
          </div>
        )}
      </div>

      {/* Navigation Icons Dock */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 no-scrollbar flex flex-col items-center">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id)}
              title={item.label}
              className={`group relative flex items-center ${
                isExpanded ? 'w-full justify-start px-4' : 'w-12 justify-center'
              } h-12 rounded-2xl transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-orange-500 to-rose-400 text-white shadow-md shadow-orange-500/25 scale-[1.02]'
                  : 'text-stone-400 hover:text-stone-800 hover:bg-stone-50'
              }`}
            >
              <Icon
                className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-white' : 'text-stone-400 group-hover:text-stone-700'
                }`}
              />

              {isExpanded && (
                <span
                  className={`mx-3 text-[13px] font-bold tracking-tight truncate ${
                    isActive ? 'text-white' : 'text-stone-600'
                  }`}
                >
                  {item.label}
                </span>
              )}

              {/* Tooltip in compact mode */}
              {!isExpanded && (
                <span
                  className={`absolute ${
                    isRtl ? 'right-14' : 'left-14'
                  } px-2.5 py-1 bg-stone-900 text-white text-xs font-bold rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap shadow-lg`}
                >
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Area: Expand toggle + Logout Button */}
      <div className="p-3 border-t border-stone-100 flex flex-col items-center space-y-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="hidden lg:flex w-10 h-8 items-center justify-center rounded-xl text-stone-400 hover:text-stone-800 hover:bg-stone-50 transition-colors"
          title={isExpanded ? 'Collapse' : 'Expand'}
        >
          {isRtl ? (
            isExpanded ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />
          ) : isExpanded ? (
            <ChevronLeft className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>

        <button
          onClick={onLogout}
          className={`flex items-center ${
            isExpanded ? 'w-full justify-start px-4' : 'w-12 justify-center'
          } h-12 rounded-2xl text-stone-400 hover:text-rose-500 hover:bg-rose-50 transition-all duration-200 group`}
          title={lang === 'fa' ? 'خروج از سیستم' : lang === 'ps' ? 'وتل' : 'Logout'}
        >
          <LogOut className="w-5 h-5 shrink-0 transition-transform group-hover:rotate-12" />
          {isExpanded && (
            <span className="mx-3 text-[13px] font-bold text-rose-500 tracking-tight">
              {lang === 'fa' ? 'خروج' : lang === 'ps' ? 'وتل' : 'Logout'}
            </span>
          )}
        </button>
      </div>
    </aside>
  );
}
