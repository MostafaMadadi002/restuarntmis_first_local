import React, { useState } from 'react';
import {
  Server,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Terminal,
  ExternalLink,
  X,
  Database,
  Wifi,
  Copy,
  Check,
} from 'lucide-react';
import { Button, Card, Badge } from './UI';
import { api } from '../../services/api';
import { useLanguage } from '../../i18n/LanguageContext';

interface BackendStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: 'CONNECTED' | 'DISCONNECTED' | 'CHECKING';
  message: string;
  onRecheck: () => void;
}

export function BackendStatusModal({
  isOpen,
  onClose,
  status,
  message,
  onRecheck,
}: BackendStatusModalProps) {
  const { isRtl } = useLanguage();
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await api.checkHealth();
      if (res.isConnected) {
        setTestResult('اتصال به سرور جنگو با موفقیت تأیید شد (Django REST API 200 OK)');
      } else {
        setTestResult(`عدم پاسخ‌دهی سرور روی پورت ۸۰۰۰: ${res.message || 'Connection Refused'}`);
      }
      onRecheck();
    } catch (err: any) {
      setTestResult(`خطای اتصال: ${err?.message}`);
    } finally {
      setTesting(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const commands = [
    { title: '۱. ساخت محیط مجازی و ورود به پوشه بک‌اند', cmd: 'cd backend\npython3 -m venv venv\nsource venv/bin/activate  # در ویندوز: venv\\Scripts\\activate' },
    { title: '۲. نصب بسته‌های پایتون و جنگو', cmd: 'pip install -r requirements.txt' },
    { title: '۳. آماده‌سازی دیتابیس و اعمال مایگریشن‌ها', cmd: 'python manage.py makemigrations accounts restaurants tables catalog orders kitchen inventory recipes purchasing finance crm loyalty marketing operations staff devices audit reports\npython manage.py migrate' },
    { title: '۴. تزریق داده‌های نمونه و منوی رستوران آریانا', cmd: 'python manage.py seed_demo_data' },
    { title: '۵. اجرای سرور روی پورت ۸۰۰۰ (شبکه محلی)', cmd: 'python manage.py runserver 0.0.0.0:8000' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${status === 'CONNECTED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {isRtl ? 'وضعیت اتصال به سرور محلی (Django Backend)' : 'Local Server Connection Status'}
              </h3>
              <p className="text-xs text-slate-500">
                {isRtl ? 'پایگاه داده جنگو، رست‌فریمورک و ارتباط فرانت به بک‌اند' : 'Django DB, REST Framework & Front-to-Back Sync'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Status Box */}
          <div className={`p-4 rounded-xl border flex items-start justify-between gap-3 ${
            status === 'CONNECTED'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            <div className="flex items-start gap-3">
              {status === 'CONNECTED' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-700 mt-0.5 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-700 mt-0.5 shrink-0" />
              )}
              <div>
                <div className="font-bold text-sm">
                  {status === 'CONNECTED'
                    ? (isRtl ? 'سرور محلی جنگو متصل و فعال است' : 'Django Local Server Connected')
                    : (isRtl ? 'در حال اجرای مستقل (Standby / Offline Local Mode)' : 'Running in Offline / Standby Mode')}
                </div>
                <div className="text-xs mt-1 text-slate-600">
                  {status === 'CONNECTED'
                    ? (isRtl ? 'تمام عملیات سفارش، صندوق، فاکتور و انبار بلادرنگ در پایگاه داده جنگو ثبت می‌گردند.' : 'All operations are persisting directly to your Django backend.')
                    : (isRtl ? 'فرانت‌ند به درستی کانفیگ شده و به پورت ۸۰۰۰ پروکسی شده است. برای اتصال زنده، سرور جنگو را روی سیستم خود راه‌اندازی نمایید.' : 'Frontend is configured to proxy /api to port 8000. Launch Django server on your local machine to connect.')}
                </div>
                {message && (
                  <div className="mt-2 text-[11px] font-mono bg-white/70 px-2.5 py-1 rounded border border-slate-200 text-slate-700">
                    {message}
                  </div>
                )}
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleTest}
              disabled={testing}
              icon={RefreshCw}
              className={`shrink-0 ${testing ? 'animate-spin' : ''}`}
            >
              {isRtl ? 'تست مجدد اتصال' : 'Test Connection'}
            </Button>
          </div>

          {testResult && (
            <div className={`p-3 rounded-lg border text-xs font-mono ${
              testResult.includes('موفقیت') || testResult.includes('200')
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}>
              {testResult}
            </div>
          )}

          {/* Setup Guide for Local Machine */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
            <div className="flex items-center gap-2 font-bold text-slate-800 mb-2">
              <Terminal className="w-4 h-4 text-emerald-700" />
              <span>{isRtl ? 'راهنمای اجرای سرور جنگو روی کامپیوتر شما (Local System)' : 'How to Run Django Backend Locally'}</span>
            </div>
            <p className="text-slate-600 mb-3 text-[11px]">
              {isRtl
                ? 'برای اینکه فرانت‌ند و بک‌اند کاملاً به هم متصل شوند و روی سیستم شخصی‌تان تست کنید، مراحل زیر را در ترمینال سیستم خود اجرا فرمایید:'
                : 'Run the following commands in your local terminal to start the backend on your machine:'}
            </p>

            <div className="space-y-2.5">
              {commands.map((step, idx) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-lg p-2.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1">
                    <span>{step.title}</span>
                    <button
                      onClick={() => copyToClipboard(step.cmd, idx)}
                      className="text-slate-400 hover:text-slate-700 p-1 rounded flex items-center gap-1 text-[10px]"
                      title="کپی دستور"
                    >
                      {copiedIndex === idx ? (
                        <span className="text-emerald-700 flex items-center gap-1 font-bold">
                          <Check className="w-3 h-3" /> کپی شد
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Copy className="w-3 h-3" /> کپی
                        </span>
                      )}
                    </button>
                  </div>
                  <pre className="bg-slate-900 text-emerald-400 p-2 rounded text-[11px] font-mono overflow-x-auto text-left" dir="ltr">
                    {step.cmd}
                  </pre>
                </div>
              ))}
            </div>
          </div>

          {/* Useful URLs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <a
              href="http://localhost:8000/admin/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-700" />
                <div>
                  <div className="font-bold text-slate-800">{isRtl ? 'پنل ادمین جنگو' : 'Django Admin Panel'}</div>
                  <div className="text-[10px] text-slate-400 font-mono">http://localhost:8000/admin/</div>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>

            <a
              href="http://localhost:8000/api/v1/health/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Wifi className="w-4 h-4 text-emerald-700" />
                <div>
                  <div className="font-bold text-slate-800">{isRtl ? 'تست سلامت REST API' : 'Health Check API'}</div>
                  <div className="text-[10px] text-slate-400 font-mono">http://localhost:8000/api/v1/health/</div>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            {isRtl ? 'نام کاربری ادمین پیش‌فرض: admin / رمز: admin123' : 'Default Admin: admin / admin123'}
          </span>
          <Button variant="primary" size="sm" onClick={onClose}>
            {isRtl ? 'بستن' : 'Close'}
          </Button>
        </div>
      </div>
    </div>
  );
}
