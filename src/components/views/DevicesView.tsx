import React, { useState } from 'react';
import {
  MonitorCheck,
  Wifi,
  Radio,
  CheckCircle2,
  Lock,
  Unlock,
  Smartphone,
  Laptop,
  Tablet,
  X,
  Send,
  Plus,
} from 'lucide-react';
import { Card, Button, Badge, EmptyState } from '../common/UI';
import { DeviceItem, TableItem } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';

interface DevicesViewProps {
  devices: DeviceItem[];
  tables?: TableItem[];
  onToggleBlock: (deviceId: string) => void;
  onBroadcastMessage: (msg: string, targetDeviceId?: string) => void;
  onSimulateNewDevice?: (tableNumber: string) => void;
}

export function DevicesView({
  devices,
  tables = [],
  onToggleBlock,
  onBroadcastMessage,
  onSimulateNewDevice,
}: DevicesViewProps) {
  const { t, isRtl } = useLanguage();
  const [broadcastText, setBroadcastText] = useState<string>('');
  const [targetDevice, setTargetDevice] = useState<string>('ALL');
  const [sentNotice, setSentNotice] = useState<string | null>(null);
  const [simTableNum, setSimTableNum] = useState<string>('3');

  const handleSend = () => {
    if (!broadcastText.trim()) return;
    onBroadcastMessage(broadcastText, targetDevice === 'ALL' ? undefined : targetDevice);
    setSentNotice(`اعلامیه با موفقیت ارسال شد.`);
    setBroadcastText('');
    setTimeout(() => setSentNotice(null), 3500);
  };

  const getDeviceIcon = (type: DeviceItem['type']) => {
    switch (type) {
      case 'POS':
        return <Laptop className="w-4 h-4 text-orange-600" />;
      case 'WAITER_TABLET':
        return <Tablet className="w-4 h-4 text-amber-600" />;
      case 'KITCHEN_DISPLAY':
        return <MonitorCheck className="w-4 h-4 text-emerald-600" />;
      default:
        return <Smartphone className="w-4 h-4 text-orange-600" />;
    }
  };

  const getDeviceTypeLabel = (type: string) => {
    switch (type) {
      case 'POS':
        return 'صندوق و حسابداری (POS)';
      case 'WAITER_TABLET':
        return 'تبلت سالندار / گارسون';
      case 'KITCHEN_DISPLAY':
        return 'نمایشگر آشپزخانه (KDS)';
      default:
        return 'گوشی مهمان (QR)';
    }
  };

  const guestTableDevices = devices.filter((d) => d.connected_table_number);

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="bg-white p-6 md:p-8 border border-stone-100 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shadow-xs">
              <MonitorCheck className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black text-stone-900 tracking-tight">
              {t.devices.title}
            </h1>
          </div>
          <p className="text-xs text-stone-400 font-medium">
            پایش دستگاه‌های متصل، اتصالات میزها و اعلام سراسری درون رستوران
          </p>
        </div>

        {/* Quick Simulation */}
        <div className="flex items-center gap-2.5 bg-stone-50 p-1.5 rounded-2xl border border-stone-200">
          <input
            type="text"
            value={simTableNum}
            onChange={(e) => setSimTableNum(e.target.value)}
            className="w-16 px-3 py-1.5 text-xs bg-white border border-stone-200 rounded-xl outline-none font-black text-center focus:border-orange-500"
            placeholder="3"
          />
          <Button
            variant="primary"
            size="sm"
            onClick={() => onSimulateNewDevice && onSimulateNewDevice(simTableNum)}
            className="rounded-xl font-bold shadow-xs text-xs"
            icon={Plus}
          >
            تست اتصال میز {simTableNum}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Simple Table Connection Status */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-6 border-stone-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] rounded-3xl bg-white">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-stone-900">وضعیت اتصالات لحظه‌ای</h3>
                  <p className="text-[11px] text-stone-400 font-bold">{guestTableDevices.length} دستگاه فعال</p>
                </div>
              </div>
            </div>

            {guestTableDevices.length === 0 ? (
              <EmptyState
                icon={Wifi}
                title="هیچ مهمانی متصل نیست"
                description="به محض اسکن QR میز توسط مهمانان، دستگاه آن‌ها در این لیست ظاهر می‌شود."
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {guestTableDevices.map((dev) => (
                  <div
                    key={dev.id}
                    className="p-4 bg-white border border-stone-100 rounded-2xl flex items-center justify-between gap-3 hover:border-orange-200 hover:shadow-xs transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="bg-orange-50 text-orange-600 border border-orange-200 text-[10px] font-bold px-2 py-0.5 rounded-lg">
                            میز {dev.connected_table_number}
                          </span>
                          <span className="text-xs font-bold text-stone-900">مهمان متصل</span>
                        </div>
                        <p className="text-[10px] text-stone-400 font-mono mt-0.5">{dev.ip_address}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onToggleBlock(dev.id)}
                      className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                        dev.status === 'BLOCKED'
                          ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                          : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                      }`}
                      title={dev.status === 'BLOCKED' ? 'آزاد کردن' : 'قطع دسترسی'}
                    >
                      {dev.status === 'BLOCKED' ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* System-wide Broadcast Message Card */}
        <div className="lg:col-span-1">
          <Card className="p-6 border-stone-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] rounded-3xl bg-white h-full space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-stone-100">
              <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                <Radio className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-stone-900">اعلام سراسری</h3>
                <p className="text-[11px] text-stone-400">ارسال پیام زنده در شبکه رستوران</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-[11px] font-bold text-stone-500 block mb-1">هدف اعلان</label>
                <select
                  value={targetDevice}
                  onChange={(e) => setTargetDevice(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-2xl font-bold text-stone-700 outline-none focus:border-orange-500"
                >
                  <option value="ALL">📢 تمام پایانه‌ها و گوشی‌ها</option>
                  {devices.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} (میز {d.connected_table_number || '—'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-500 block mb-1">متن پیام</label>
                <textarea
                  placeholder="پیام یا پیشنهاد ویژه را اینجا بنویسید..."
                  value={broadcastText}
                  onChange={(e) => setBroadcastText(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl h-24 resize-none outline-none focus:border-orange-500 text-xs font-medium"
                />
              </div>

              <Button
                variant="primary"
                size="md"
                onClick={handleSend}
                icon={Send}
                className="w-full rounded-2xl font-bold shadow-md shadow-orange-500/20"
              >
                ارسال اعلان سراسری
              </Button>

              {sentNotice && (
                <div className="p-3 bg-emerald-50 text-emerald-900 text-xs rounded-2xl border border-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-bold">{sentNotice}</span>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Full Device List */}
      <Card className="overflow-hidden border-stone-100 bg-white shadow-xs rounded-3xl">
        <div className="p-6 border-b border-stone-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-base font-black text-stone-900">فهرست پایانه‌ها و دستگاه‌ها</h2>
            <p className="text-xs text-stone-400 mt-0.5">مدیریت دستگاه‌های متصل، تبلت‌ها و صندوق</p>
          </div>
          <span className="px-3 py-1 bg-stone-100 text-stone-700 font-bold rounded-full text-xs">
            {devices.filter((d) => d.status === 'ONLINE').length} آنلاین
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className={`w-full ${isRtl ? 'text-right' : 'text-left'}`}>
            <thead>
              <tr className="bg-stone-50/70 text-[11px] font-bold text-stone-400 uppercase border-b border-stone-100">
                <th className="px-6 py-4">نام دستگاه</th>
                <th className="px-6 py-4">نوع پایانه</th>
                <th className="px-6 py-4">آدرس IP</th>
                <th className="px-6 py-4">مرتبط با</th>
                <th className="px-6 py-4">وضعیت</th>
                <th className="px-6 py-4 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs">
              {devices.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon={MonitorCheck}
                      title="شبکه خالی است"
                      description="هیچ دستگاهی در حال حاضر رجیستر نشده است."
                    />
                  </td>
                </tr>
              ) : (
                devices.map((dev) => (
                  <tr key={dev.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                          {getDeviceIcon(dev.type)}
                        </div>
                        <span className="font-bold text-stone-900">{dev.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-stone-500 font-medium">
                      {getDeviceTypeLabel(dev.type)}
                    </td>
                    <td className="px-6 py-4 font-mono text-[11px] text-stone-400">{dev.ip_address}</td>
                    <td className="px-6 py-4 font-bold text-stone-700">
                      {dev.connected_table_number ? (
                        <span className="bg-stone-100 px-2 py-0.5 rounded-lg text-xs">میز {dev.connected_table_number}</span>
                      ) : dev.assigned_to}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        dev.status === 'ONLINE'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : dev.status === 'BLOCKED'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-stone-100 text-stone-600'
                      }`}>
                        {dev.status === 'ONLINE' ? 'آنلاین' : dev.status === 'BLOCKED' ? 'مسدود' : 'آفلاین'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => onToggleBlock(dev.id)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
                          dev.status === 'BLOCKED' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                            : 'bg-white text-stone-600 border-stone-200 hover:border-orange-300 hover:text-orange-600'
                        }`}
                      >
                        {dev.status === 'BLOCKED' ? 'آزاد کردن' : 'قطع دسترسی'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
