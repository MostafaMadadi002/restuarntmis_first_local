import React, { useState, useRef, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  UserCog,
  CheckCircle2,
  Clock,
  Phone,
  Shield,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  UserCheck,
  User,
  Image as ImageIcon,
  Upload,
  Lock,
  Calendar,
  QrCode as QrCodeIcon,
  Sun,
  Sunset,
  Moon,
  FileSpreadsheet,
} from 'lucide-react';
import { Card, Button, Badge } from '../common/UI';
import { StaffData, Role } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';

interface StaffViewProps {
  staff: StaffData[];
  onAddStaff?: (newStaff: Omit<StaffData, 'id'>) => void;
  onUpdateStaff?: (updatedStaff: StaffData) => void;
  onDeleteStaff?: (staffId: number) => void;
  onOpenProfile?: () => void;
}

export function StaffView({
  staff,
  onAddStaff,
  onUpdateStaff,
  onDeleteStaff,
  onOpenProfile,
}: StaffViewProps) {
  const { t, isRtl } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingStaff, setEditingStaff] = useState<StaffData | null>(null);

  // Form Fields
  const [name, setName] = useState<string>('');
  const [role, setRole] = useState<Role>('WAITER');
  const [employeeCode, setEmployeeCode] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [attendance, setAttendance] = useState<StaffData['attendance_status']>('PRESENT');
  const [sections, setSections] = useState<string>('');
  const [photo, setPhoto] = useState<string>('');
  const [password, setPassword] = useState<string>('123');
  const [shift, setShift] = useState<'MORNING' | 'EVENING' | 'NIGHT'>('MORNING');
  const [workHours, setWorkHours] = useState<string>('۰۸:۰۰ الی ۱۶:۰۰');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Staff QR Code Modal
  const [qrModalOpen, setQrModalOpen] = useState<boolean>(false);
  const [staffQrDataUrl, setStaffQrDataUrl] = useState<string | null>(null);

  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loginUrl = `${window.location.origin}/?staffLogin=true`;
      QRCode.toDataURL(loginUrl, {
        width: 300,
        margin: 1.5,
        color: { dark: '#ea580c', light: '#ffffff' },
        errorCorrectionLevel: 'H',
      })
        .then((url) => setStaffQrDataUrl(url))
        .catch((err) => console.error(err));
    }
  }, []);

  const getRoleTitle = (r: Role) => {
    return t.roles[r]?.title || r;
  };

  const handleOpenAdd = () => {
    setEditingStaff(null);
    setName('');
    setRole('WAITER');
    setEmployeeCode(`EMP-0${staff.length + 1}`);
    setPhone('0912');
    setAttendance('PRESENT');
    setSections('میزهای سالن ۱، ۲، ۳');
    setPhoto('');
    setPassword('123');
    setShift('MORNING');
    setWorkHours('۰۸:۰۰ الی ۱۶:۰۰');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: StaffData) => {
    setEditingStaff(s);
    setName(s.name);
    setRole(s.role);
    setEmployeeCode(s.employee_code);
    setPhone(s.phone);
    setAttendance(s.attendance_status);
    setSections(s.assigned_sections || '');
    setPhoto(s.photo || '');
    setPassword(s.password || '123');
    setShift(s.shift || 'MORNING');
    setWorkHours(s.work_hours || '۰۸:۰۰ الی ۱۶:۰۰');
    setIsModalOpen(true);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhoto(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingStaff) {
      if (onUpdateStaff) {
        onUpdateStaff({
          ...editingStaff,
          name: name.trim(),
          role,
          employee_code: employeeCode.trim(),
          phone: phone.trim(),
          attendance_status: attendance,
          assigned_sections: sections.trim(),
          photo: photo || editingStaff.photo,
          password: password.trim() || '123',
          shift,
          work_hours: workHours,
        });
      }
      setNotice(`مشخصات همکار «${name}» با موفقیت به‌روزرسانی شد.`);
    } else {
      if (onAddStaff) {
        onAddStaff({
          name: name.trim(),
          role,
          employee_code: employeeCode.trim() || `EMP-0${staff.length + 1}`,
          phone: phone.trim() || '0912',
          attendance_status: attendance,
          assigned_sections: sections.trim(),
          photo,
          password: password.trim() || '123',
          shift,
          work_hours: workHours,
        });
      }
      setNotice(`همکار جدید «${name}» با موفقیت اضافه شد.`);
    }

    setIsModalOpen(false);
    setTimeout(() => setNotice(null), 3500);
  };

  const handleDelete = (s: StaffData) => {
    if (window.confirm(`آیا از حذف حساب پرسنلی «${s.name}» مطمئن هستید؟`)) {
      if (onDeleteStaff) {
        onDeleteStaff(s.id);
      }
      setNotice(`همکار «${s.name}» از لیست پرسنل حذف شد.`);
      setTimeout(() => setNotice(null), 3500);
    }
  };

  const handleToggleAttendance = (s: StaffData, newStatus: StaffData['attendance_status']) => {
    if (onUpdateStaff) {
      onUpdateStaff({
        ...s,
        attendance_status: newStatus,
      });
    }
    setNotice(`وضعیت حضور «${s.name}» به‌روز شد.`);
    setTimeout(() => setNotice(null), 3000);
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header and Action Buttons */}
      <div className="bg-white p-6 md:p-8 border border-stone-100 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shadow-xs">
              <UserCog className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black text-stone-900 tracking-tight">
              {t.staff.title}
            </h1>
          </div>
          <p className="text-xs text-stone-400 font-medium">
            مدیریت همکاران سالن، آشپزخانه و صندوق، ثبت حضور و غیاب و شیفت‌های کاری
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="md"
            onClick={() => setQrModalOpen(true)}
            icon={QrCodeIcon}
            className="rounded-2xl font-bold border-stone-200"
          >
            QR ورود پرسنل
          </Button>

          <Button 
            variant="primary" 
            size="md" 
            onClick={handleOpenAdd} 
            icon={Plus} 
            className="rounded-2xl font-bold shadow-md shadow-orange-500/20"
          >
            افزودن همکار جدید
          </Button>
        </div>
      </div>

      {notice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-2xl flex items-center justify-between shadow-xs animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-bold">{notice}</span>
          </div>
          <button onClick={() => setNotice(null)} className="p-1 hover:bg-emerald-100 rounded-lg text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Staff Table */}
      <Card className="border-stone-100 bg-white shadow-xs rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className={`w-full ${isRtl ? 'text-right' : 'text-left'}`}>
            <thead>
              <tr className="bg-stone-50/70 border-b border-stone-100 text-[11px] font-bold text-stone-400 uppercase">
                <th className="px-6 py-4 text-center w-16">تصویر</th>
                <th className="px-6 py-4">نام و مشخصات</th>
                <th className="px-6 py-4">کد پرسنلی / پین</th>
                <th className="px-6 py-4">نقش سازمانی</th>
                <th className="px-6 py-4">شیفت کاری</th>
                <th className="px-6 py-4">وضعیت حضور</th>
                <th className="px-6 py-4 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs">
              {staff.map((s) => (
                <tr key={s.id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="px-6 py-4 text-center">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden bg-stone-50 border border-stone-200 mx-auto shrink-0 shadow-xs">
                      {s.photo && s.photo.trim() !== '' ? (
                        <img src={s.photo} alt={s.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-orange-600 text-base bg-orange-50">
                          {s.name.charAt(0)}
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="font-bold text-stone-900 text-sm">{s.name}</div>
                    <div className="text-[10px] text-stone-400 font-medium mt-0.5">{s.assigned_sections || 'سالن مرکزی'}</div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-stone-800 bg-stone-100 px-2 py-0.5 rounded-lg w-max text-xs">{s.employee_code}</span>
                      <span className="text-[10px] text-stone-400 font-mono">PIN: {s.password}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-600 border border-orange-200">
                      {getRoleTitle(s.role)}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-xl border border-stone-200 ${s.shift === 'MORNING' ? 'bg-amber-50 text-amber-600' : s.shift === 'EVENING' ? 'bg-orange-50 text-orange-600' : 'bg-purple-50 text-purple-600'}`}>
                        {s.shift === 'MORNING' ? <Sun className="w-3.5 h-3.5" /> : s.shift === 'EVENING' ? <Sunset className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-stone-800">{s.shift === 'MORNING' ? 'صبح' : s.shift === 'EVENING' ? 'عصر' : 'شب'}</div>
                        <div className="text-[10px] text-stone-400">{s.work_hours || '۰۸:۰۰ - ۱۶:۰۰'}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      {[
                        { id: 'PRESENT', label: 'حاضر', color: 'emerald' },
                        { id: 'LATE', label: 'تأخیر', color: 'amber' },
                        { id: 'ABSENT', label: 'غایب', color: 'rose' },
                      ].map((st) => (
                        <button
                          key={st.id}
                          onClick={() => handleToggleAttendance(s, st.id as any)}
                          className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-all ${
                            s.attendance_status === st.id
                              ? st.id === 'PRESENT'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-black'
                                : st.id === 'LATE'
                                ? 'bg-amber-50 text-amber-800 border-amber-300 font-black'
                                : 'bg-rose-50 text-rose-700 border-rose-300 font-black'
                              : 'bg-white border-stone-200 text-stone-400 hover:text-stone-700'
                          }`}
                        >
                          {st.label}
                        </button>
                      ))}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(s)}
                        className="p-1.5 rounded-xl border border-stone-200 text-stone-400 hover:text-orange-600 hover:border-orange-300 transition-all shadow-xs"
                        title="ویرایش مشخصات"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(s)}
                        className="p-1.5 rounded-xl border border-stone-200 text-stone-400 hover:text-rose-600 hover:border-rose-300 transition-all shadow-xs"
                        title="حذف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add / Edit Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-xl border border-stone-100 w-full max-w-lg overflow-hidden p-6 md:p-8 space-y-5 max-h-[85vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-base font-black text-stone-900">
                  {editingStaff ? `ویرایش همکار: ${editingStaff.name}` : 'افزودن همکار جدید'}
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">مشخصات پرسنلی، نقش و شیفت کاری</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-xl text-stone-400 hover:text-stone-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-stone-600 block mb-1">نام و نام خانوادگی</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: فرهاد انوری"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:border-orange-500 font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-600 block mb-1">نقش سازمانی</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:border-orange-500 font-bold"
                  >
                    <option value="WAITER">گارسون / سالندار</option>
                    <option value="CASHIER">صندوقدار</option>
                    <option value="KITCHEN">سرآشپز / آشپزخانه</option>
                    <option value="MANAGER">مدیر داخلی</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-600 block mb-1">شیفت کاری</label>
                  <select
                    value={shift}
                    onChange={(e) => setShift(e.target.value as any)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:border-orange-500 font-bold"
                  >
                    <option value="MORNING">صبح (۰۸:۰۰ - ۱۶:۰۰)</option>
                    <option value="EVENING">عصر (۱۶:۰۰ - ۲۴:۰۰)</option>
                    <option value="NIGHT">شب (۲۴:۰۰ - ۰۸:۰۰)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-600 block mb-1">کد پرسنلی</label>
                  <input
                    type="text"
                    value={employeeCode}
                    onChange={(e) => setEmployeeCode(e.target.value)}
                    placeholder="EMP-01"
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:border-orange-500 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-600 block mb-1">پین ورود (PIN)</label>
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="123"
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:border-orange-500 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-600 block mb-1">میزها یا بخش‌های محول‌شده</label>
                <input
                  type="text"
                  value={sections}
                  onChange={(e) => setSections(e.target.value)}
                  placeholder="مثال: میزهای سالن ۱، ۲، ۳"
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:border-orange-500"
                />
              </div>

              <div className="pt-3 border-t border-stone-100 flex justify-end gap-2.5">
                <Button type="button" variant="outline" size="md" onClick={() => setIsModalOpen(false)}>
                  انصراف
                </Button>
                <Button type="submit" variant="primary" size="md" icon={CheckCircle2}>
                  ذخیره اطلاعات
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Staff QR Modal */}
      {qrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-xl border border-stone-100 p-6 md:p-8 max-w-sm w-full text-center space-y-4">
            <h3 className="text-base font-black text-stone-900">QR ورود سریع پرسنل</h3>
            <p className="text-xs text-stone-400">همکاران با اسکن این کد می‌توانند مستقیماً به صفحه ورود دسترسی پیدا کنند.</p>
            {staffQrDataUrl && staffQrDataUrl.trim() !== '' && (
              <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100 inline-block mx-auto">
                <img src={staffQrDataUrl} alt="Staff QR" className="w-52 h-52 mx-auto rounded-xl" />
              </div>
            )}
            <Button variant="outline" size="md" className="w-full rounded-2xl font-bold" onClick={() => setQrModalOpen(false)}>
              بستن
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
