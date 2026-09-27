import React, { useState } from 'react';
import {
  Grid,
  List,
  Plus,
  Users,
  Clock,
  Receipt,
  ChefHat,
  X,
  CreditCard,
  QrCode,
  ArrowRight,
  Sparkles,
  Edit2,
  Trash2,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Layers,
} from 'lucide-react';
import { Card, Button, Badge } from '../common/UI';
import { TableQrModal } from '../common/TableQrModal';
import { TableItem, OrderData, StaffData } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';

interface TablesViewProps {
  tables: TableItem[];
  orders: OrderData[];
  staff?: StaffData[];
  onSelectTable: (table: TableItem) => void;
  onOpenPosForTable: (table: TableItem) => void;
  onOpenSplitBillForTable: (table: TableItem) => void;
  selectedTable: TableItem | null;
  onCloseDrawer: () => void;
  onAddTable?: (table: Omit<TableItem, 'id'>) => void;
  onUpdateTable?: (table: TableItem) => void;
  onDeleteTable?: (tableId: number) => void;
  onBatchAssignWaiter?: (tableIds: number[], waiterId: number, waiterName: string) => void;
}

export function TablesView({
  tables,
  orders,
  staff = [],
  onSelectTable,
  onOpenPosForTable,
  onOpenSplitBillForTable,
  selectedTable,
  onCloseDrawer,
  onAddTable,
  onUpdateTable,
  onDeleteTable,
  onBatchAssignWaiter,
}: TablesViewProps) {
  const { t, isRtl, formatPrice, getDishName } = useLanguage();
  const [viewMode, setViewMode] = useState<'floor' | 'list'>('floor');
  const [activeSection, setActiveSection] = useState<string>('ALL');
  const [waiterFilter, setWaiterFilter] = useState<string>('ALL');
  const [qrModalOpen, setQrModalOpen] = useState<boolean>(false);
  const [selectedQrTableId, setSelectedQrTableId] = useState<number>(1);

  // Add / Edit Table Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingTable, setEditingTable] = useState<TableItem | null>(null);
  const [tableNumber, setTableNumber] = useState<string>('');
  const [tableNameLabel, setTableNameLabel] = useState<string>('');
  const [sectionName, setSectionName] = useState<string>('سالن اصلی');
  const [capacity, setCapacity] = useState<number>(4);
  const [assignedWaiterId, setAssignedWaiterId] = useState<number | undefined>(undefined);
  const [tableStatus, setTableStatus] = useState<TableItem['status']>('AVAILABLE');

  // Batch Assign Waiter Modal
  const [isBatchAssignOpen, setIsBatchAssignOpen] = useState<boolean>(false);
  const [batchWaiterId, setBatchWaiterId] = useState<number | undefined>(undefined);
  const [selectedBatchTableIds, setSelectedBatchTableIds] = useState<number[]>([]);
  const [customTableNumbersInput, setCustomTableNumbersInput] = useState<string>('');

  // Delete Confirm Modal
  const [tableToDelete, setTableToDelete] = useState<TableItem | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const waiters = staff.filter((s) => s.role === 'WAITER' || s.role === 'MANAGER');

  const sectionOptions = [
    { id: 'ALL', label: t.tables.allSections },
    { id: 'سالن اصلی', label: t.tables.mainHall },
    { id: 'تراس', label: t.tables.terrace },
    { id: 'بخش VIP', label: t.tables.vipSection },
  ];

  const filteredTables = tables.filter((tItem) => {
    const matchesSec = activeSection === 'ALL' || tItem.section_name === activeSection || tItem.section === activeSection;
    const matchesWaiter =
      waiterFilter === 'ALL' ||
      String(tItem.assigned_waiter_id) === waiterFilter ||
      tItem.assigned_waiter_name === waiterFilter ||
      tItem.waiter_name === waiterFilter;
    return matchesSec && matchesWaiter;
  });

  const tableOrders = selectedTable
    ? orders.filter((o) => o.table_id === selectedTable.id || String(o.table_number) === String(selectedTable.table_number))
    : [];

  const statusText: Record<string, string> = {
    AVAILABLE: t.tables.available,
    OCCUPIED: t.tables.occupied,
    RESERVED: t.tables.reserved,
    CLEANING: t.tables.cleaning,
  };

  const handleOpenAddModal = () => {
    setTableNumber(String(tables.length + 1));
    setTableNameLabel(`میز ${tables.length + 1}`);
    setSectionName('سالن اصلی');
    setCapacity(4);
    setAssignedWaiterId(waiters[0]?.id);
    setTableStatus('AVAILABLE');
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (table: TableItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingTable(table);
    setTableNumber(table.table_number);
    setTableNameLabel(table.name_label || `میز ${table.table_number}`);
    setSectionName(table.section_name || table.section || 'سالن اصلی');
    setCapacity(table.capacity || 4);
    setAssignedWaiterId(table.assigned_waiter_id);
    setTableStatus(table.status);
  };

  const handleSaveTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableNumber.trim()) return;

    const assignedW = waiters.find((w) => w.id === Number(assignedWaiterId));

    if (editingTable) {
      if (onUpdateTable) {
        onUpdateTable({
          ...editingTable,
          table_number: tableNumber.trim(),
          name_label: tableNameLabel.trim() || `میز ${tableNumber.trim()}`,
          section: sectionName,
          section_name: sectionName,
          capacity: Number(capacity) || 4,
          assigned_waiter_id: assignedW?.id,
          assigned_waiter_name: assignedW?.name,
          waiter_name: assignedW?.name,
          status: tableStatus,
        });
      }
      setNotice(`مشخصات میز ${tableNumber} با موفقیت به‌روزرسانی شد.`);
    } else {
      if (onAddTable) {
        onAddTable({
          table_number: tableNumber.trim(),
          name_label: tableNameLabel.trim() || `میز ${tableNumber.trim()}`,
          section: sectionName,
          section_name: sectionName,
          capacity: Number(capacity) || 4,
          status: 'AVAILABLE',
          assigned_waiter_id: assignedW?.id,
          assigned_waiter_name: assignedW?.name,
          waiter_name: assignedW?.name,
          current_bill_total: 0,
        });
      }
      setNotice(`میز جدید #${tableNumber} با موفقیت افزوده شد.`);
    }

    setIsAddModalOpen(false);
    setEditingTable(null);
    setTimeout(() => setNotice(null), 3500);
  };

  const handleConfirmDelete = () => {
    if (!tableToDelete) return;
    if (onDeleteTable) {
      onDeleteTable(tableToDelete.id);
    }
    setNotice(`میز #${tableToDelete.table_number} حذف گردید.`);
    setTableToDelete(null);
    setTimeout(() => setNotice(null), 3500);
  };

  const handleToggleTableForBatch = (tblId: number) => {
    setSelectedBatchTableIds((prev) => {
      const exists = prev.includes(tblId);
      const next = exists ? prev.filter((id) => id !== tblId) : [...prev, tblId];
      const matched = tables.filter((t) => next.includes(t.id));
      setCustomTableNumbersInput(matched.map((t) => t.table_number).join('، '));
      return next;
    });
  };

  const handleExecuteBatchAssign = (e: React.FormEvent) => {
    e.preventDefault();
    const assignedW = waiters.find((w) => w.id === Number(batchWaiterId));
    if (!assignedW) return;

    if (selectedBatchTableIds.length === 0) {
      setNotice('لطفاً حداقل یک میز برای تخصیص به گارسون انتخاب کنید.');
      setTimeout(() => setNotice(null), 3000);
      return;
    }

    const assignedTables = tables.filter((t) => selectedBatchTableIds.includes(t.id));
    const tableNumsStr = assignedTables.map((t) => t.table_number).join('، ');

    if (onBatchAssignWaiter) {
      onBatchAssignWaiter(selectedBatchTableIds, assignedW.id, assignedW.name);
      setNotice(
        `میزهای (${tableNumsStr}) به گارسون «${assignedW.name}» واگذار شدند.`
      );
    }

    setIsBatchAssignOpen(false);
    setTimeout(() => setNotice(null), 4000);
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header with Sections tabs, Add Table, Batch Assign & Mode switch */}
      <div className="bg-white p-6 md:p-8 border border-stone-100 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black text-stone-900 tracking-tight">{t.tables.title}</h1>
          </div>
          <p className="text-xs text-stone-400 font-medium">
            {t.tables.subtitle}
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={handleOpenAddModal}
            icon={Plus}
            className="rounded-2xl font-bold shadow-md shadow-orange-500/20"
          >
            میز جدید
          </Button>

          <Button
            variant="secondary"
            size="md"
            onClick={() => {
              setBatchWaiterId(waiters[0]?.id);
              setSelectedBatchTableIds([]);
              setCustomTableNumbersInput('');
              setIsBatchAssignOpen(true);
            }}
            icon={UserCheck}
            className="rounded-2xl font-bold"
          >
            تخصیص گارسون
          </Button>

          <Button
            variant="outline"
            size="md"
            onClick={() => {
              setSelectedQrTableId(1);
              setQrModalOpen(true);
            }}
            icon={QrCode}
            className="bg-white rounded-2xl font-bold border-stone-200"
          >
            کدهای QR ({tables.length})
          </Button>

          <div className="bg-stone-50 p-1 rounded-2xl flex items-center border border-stone-200">
            <button
              onClick={() => setViewMode('floor')}
              className={`p-2 rounded-xl transition-all ${
                viewMode === 'floor' ? 'bg-white text-orange-600 shadow-xs' : 'text-stone-400 hover:text-stone-600'
              }`}
              title="نمایش نقشه سالن"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-xl transition-all ${
                viewMode === 'list' ? 'bg-white text-orange-600 shadow-xs' : 'text-stone-400 hover:text-stone-600'
              }`}
              title="نمایش فهرست"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {notice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl shadow-xs flex items-center justify-between text-xs font-bold animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{notice}</span>
          </div>
          <button onClick={() => setNotice(null)} className="p-1 hover:bg-emerald-100 rounded-lg text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filters: Sections & Waiters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {sectionOptions.map((sec) => (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${
                activeSection === sec.id
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-transparent shadow-xs'
                  : 'bg-white text-stone-600 border-stone-200 hover:border-orange-200'
              }`}
            >
              {sec.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-stone-400">گارسون:</span>
          <select
            value={waiterFilter}
            onChange={(e) => setWaiterFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white border border-stone-200 rounded-2xl outline-none font-bold text-stone-700 focus:border-orange-500 shadow-xs"
          >
            <option value="ALL">همه گارسون‌ها</option>
            {waiters.map((w) => (
              <option key={w.id} value={String(w.id)}>
                {w.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Floor / List Content */}
      {viewMode === 'floor' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {filteredTables.map((table) => {
            const isOccupied = table.status === 'OCCUPIED';
            const assignedWName = table.assigned_waiter_name || table.waiter_name;

            return (
              <div
                key={table.id}
                onClick={() => onSelectTable(table)}
                className={`group relative p-5 rounded-3xl bg-white border cursor-pointer flex flex-col justify-between min-h-[180px] transition-all shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:border-orange-200 hover:shadow-xl ${
                  isOccupied
                    ? 'border-orange-200 bg-orange-50/10'
                    : 'border-stone-100'
                } ${selectedTable?.id === table.id ? 'ring-2 ring-orange-500' : ''}`}
              >
                {/* Edit & Delete Mini Action Buttons on Hover */}
                <div className="absolute top-3 left-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                  <button
                    onClick={(e) => handleOpenEditModal(table, e)}
                    className="p-1.5 rounded-xl border bg-white text-stone-600 hover:text-orange-600 border-stone-200 shadow-xs transition-all"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setTableToDelete(table);
                    }}
                    className="p-1.5 rounded-xl border bg-white text-rose-500 hover:bg-rose-50 border-stone-200 shadow-xs transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-black text-xl tabular-nums tracking-tight text-stone-900">
                      میز {table.table_number}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isOccupied
                        ? 'bg-orange-50 text-orange-600 border border-orange-200'
                        : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                    }`}>
                      {statusText[table.status] || table.status}
                    </span>
                  </div>

                  <div className="text-[11px] font-bold flex items-center gap-1.5 mb-2 text-stone-400">
                    <Users className="w-3.5 h-3.5 text-stone-400" />
                    <span>ظرفیت: {table.capacity} نفر</span>
                  </div>

                  <div className="text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-block bg-stone-100 text-stone-600">
                    {assignedWName || 'بدون گارسون'}
                  </div>
                </div>

                {isOccupied ? (
                  <div className="pt-3 border-t border-stone-100 mt-3 space-y-1">
                    <div className="text-base font-black tabular-nums text-orange-600">
                      {formatPrice(table.current_bill_total || 0)}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-medium text-stone-400">
                      <Clock className="w-3 h-3 text-orange-500" />
                      <span>{table.session_started_at || 'هم‌اکنون'}</span>
                    </div>
                  </div>
                ) : (
                  <div className="pt-3 border-t border-stone-100 mt-3 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-600">آماده پذیرایی</span>
                    <span className="text-[10px] font-medium text-stone-400">
                      {table.section_name || table.section}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <Card className="overflow-hidden border-stone-100 bg-white rounded-3xl shadow-xs">
          <table className={`w-full ${isRtl ? 'text-right' : 'text-left'}`}>
            <thead className="bg-stone-50/70 text-[11px] font-bold text-stone-400 uppercase">
              <tr>
                <th className="px-6 py-4">میز</th>
                <th className="px-6 py-4">بخش سالن</th>
                <th className="px-6 py-4">ظرفیت</th>
                <th className="px-6 py-4">وضعیت</th>
                <th className="px-6 py-4">مبلغ فاکتور</th>
                <th className="px-6 py-4">گارسون موظف</th>
                <th className={`px-6 py-4 ${isRtl ? 'text-left' : 'text-right'}`}>عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs font-medium">
              {filteredTables.map((tItem) => (
                <tr key={tItem.id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="px-6 py-4 font-black text-stone-900 text-sm">
                    #{tItem.table_number}
                    {tItem.name_label && (
                      <span className="text-stone-400 text-xs font-bold mr-2">
                        ({tItem.name_label})
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-stone-500 font-bold">{tItem.section_name || tItem.section}</td>
                  <td className="px-6 py-4 text-stone-500">{tItem.capacity} نفر</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      tItem.status === 'OCCUPIED'
                        ? 'bg-orange-50 text-orange-600 border border-orange-200'
                        : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                    }`}>
                      {statusText[tItem.status] || tItem.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-black text-orange-600 tabular-nums">
                    {formatPrice(tItem.current_bill_total || 0)}
                  </td>
                  <td className="px-6 py-4 text-stone-700 font-bold">
                    {tItem.assigned_waiter_name || 'بدون گارسون'}
                  </td>
                  <td className={`px-6 py-4 ${isRtl ? 'text-left' : 'text-right'}`}>
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="secondary" size="sm" onClick={() => onSelectTable(tItem)}>
                        جزئیات
                      </Button>
                      <button
                        onClick={(e) => handleOpenEditModal(tItem, e)}
                        className="p-1.5 text-stone-400 hover:text-orange-600 bg-white border border-stone-200 rounded-xl shadow-xs"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setTableToDelete(tItem)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 bg-white border border-stone-200 rounded-xl shadow-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Side Drawer for Selected Table Details */}
      {selectedTable && (
        <div
          className={`fixed inset-y-0 ${
            isRtl ? 'left-0 border-r' : 'right-0 border-l'
          } w-[380px] bg-white border-stone-100 shadow-2xl z-50 p-6 md:p-8 overflow-y-auto flex flex-col justify-between animate-in slide-in-from-right duration-300`}
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white flex items-center justify-center font-black text-lg shadow-xs">
                  {selectedTable.table_number}
                </div>
                <div>
                  <h3 className="text-base font-black text-stone-900 tracking-tight">
                    {t.orders.table} {selectedTable.table_number}
                  </h3>
                  <p className="text-xs text-stone-400 font-medium">
                    {selectedTable.section_name || selectedTable.section} • ظرفیت {selectedTable.capacity} نفر
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => handleOpenEditModal(selectedTable, e)}
                  className="p-2 rounded-xl text-stone-400 hover:text-orange-600 hover:bg-orange-50 transition-all"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={onCloseDrawer}
                  className="p-2 rounded-xl text-stone-400 hover:text-stone-900 hover:bg-stone-50 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Current Session Summary */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-stone-50 space-y-1 border border-stone-100">
                <div className="text-[10px] font-bold text-stone-400 uppercase">وضعیت</div>
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  selectedTable.status === 'OCCUPIED'
                    ? 'bg-orange-50 text-orange-600 border border-orange-200'
                    : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                }`}>
                  {statusText[selectedTable.status] || selectedTable.status}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-stone-50 space-y-1 border border-stone-100">
                <div className="text-[10px] font-bold text-stone-400 uppercase">گارسون</div>
                <div className="text-xs font-bold text-stone-800 truncate">
                  {selectedTable.assigned_waiter_name || selectedTable.waiter_name || 'تخصیص‌نیافته'}
                </div>
              </div>
              
              {selectedTable.status === 'OCCUPIED' && (
                <>
                  <div className="p-4 rounded-2xl bg-stone-50 space-y-1 border border-stone-100">
                    <div className="text-[10px] font-bold text-stone-400 uppercase">شروع نشست</div>
                    <div className="text-xs font-bold text-stone-800">{selectedTable.session_started_at || 'هم‌اکنون'}</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-orange-50/70 space-y-1 border border-orange-200">
                    <div className="text-[10px] font-bold text-orange-700 uppercase">مجموع فاکتور</div>
                    <div className="text-base font-black text-orange-600 tabular-nums">
                      {formatPrice(selectedTable.current_bill_total || 0)}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Orders for this Table */}
            {tableOrders.length > 0 ? (
              <div className="space-y-4 pt-4 border-t border-stone-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-stone-800 uppercase tracking-wider">{t.waiter.orderItems}</h4>
                  <Badge variant="neutral">{tableOrders.reduce((acc, o) => acc + o.items.length, 0)} قلم</Badge>
                </div>
                <div className="space-y-2.5 max-h-[260px] overflow-y-auto no-scrollbar pr-1">
                  {tableOrders.flatMap((o) =>
                    o.items.map((item) => (
                      <div key={item.id} className="p-3 bg-stone-50/60 border border-stone-100 rounded-2xl flex justify-between items-center hover:bg-white transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center font-black text-xs">
                            {item.quantity}×
                          </div>
                          <div>
                            <div className="font-bold text-stone-900 text-xs">{getDishName(item)}</div>
                            <div className="text-[10px] text-stone-400 mt-0.5">
                              صندلی #{item.seat_number}
                            </div>
                          </div>
                        </div>
                        <span className="font-black text-stone-900 text-xs">{formatPrice(item.subtotal || item.unit_price * item.quantity)}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="pt-8 flex flex-col items-center justify-center text-center space-y-2 opacity-50">
                <ChefHat className="w-10 h-10 text-stone-300" />
                <p className="text-xs font-bold text-stone-400">هنوز سفارشی ثبت نشده است</p>
              </div>
            )}
          </div>

          {/* Drawer Quick Action Buttons */}
          <div className="pt-6 space-y-2.5 border-t border-stone-100 mt-6">
            <Button
              variant="primary"
              size="md"
              className="w-full rounded-2xl font-bold py-3"
              onClick={() => onOpenPosForTable(selectedTable)}
              icon={Plus}
            >
              مدیریت و ثبت سفارش
            </Button>

            {selectedTable.status === 'OCCUPIED' && (
              <Button
                variant="secondary"
                size="md"
                className="w-full rounded-2xl font-bold py-3"
                onClick={() => onOpenSplitBillForTable(selectedTable)}
                icon={CreditCard}
              >
                تسویه حساب و تقسیم فاکتور
              </Button>
            )}

            <Button
              variant="outline"
              size="md"
              className="w-full bg-white rounded-2xl font-bold py-3 border-stone-200"
              onClick={() => {
                setSelectedQrTableId(selectedTable.id);
                setQrModalOpen(true);
              }}
              icon={QrCode}
            >
              نمایش QR میز
            </Button>
          </div>
        </div>
      )}

      {/* Add / Edit Table Modal */}
      {(isAddModalOpen || editingTable) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-xl border border-stone-100 w-full max-w-md overflow-hidden p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-stone-900">
                  {editingTable ? 'ویرایش مشخصات میز' : 'ایجاد میز جدید'}
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">تنظیم شماره، بخش و ظرفیت میز</p>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingTable(null);
                }}
                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-900 hover:bg-stone-50 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTable} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-stone-500 block mb-1">شماره میز</label>
                  <input
                    type="text"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    placeholder="مثلاً: 14"
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:border-orange-500 focus:bg-white font-black text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-stone-500 block mb-1">عنوان نمایشی</label>
                  <input
                    type="text"
                    value={tableNameLabel}
                    onChange={(e) => setTableNameLabel(e.target.value)}
                    placeholder="مثلاً: کنار پنجره"
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:border-orange-500 focus:bg-white font-bold text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-stone-500 block mb-1">بخش سالن</label>
                  <select
                    value={sectionName}
                    onChange={(e) => setSectionName(e.target.value)}
                    className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:border-orange-500 font-bold text-xs"
                  >
                    <option value="سالن اصلی">{t.tables.mainHall}</option>
                    <option value="تراس">{t.tables.terrace}</option>
                    <option value="بخش VIP">{t.tables.vipSection}</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-stone-500 block mb-1">ظرفیت (صندلی)</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:border-orange-500 focus:bg-white font-bold text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-500 block mb-1">گارسون مسئول</label>
                <select
                  value={assignedWaiterId || ''}
                  onChange={(e) => setAssignedWaiterId(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:border-orange-500 font-bold text-xs"
                >
                  <option value="">بدون گارسون مشخص</option>
                  {waiters.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  className="flex-1 rounded-2xl font-bold py-2.5"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingTable(null);
                  }}
                >
                  انصراف
                </Button>
                <Button type="submit" variant="primary" size="md" className="flex-1 rounded-2xl font-bold py-2.5">
                  {editingTable ? 'ذخیره تغییرات' : 'ایجاد میز'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Batch Assign Waiter Modal */}
      {isBatchAssignOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-xl border border-stone-100 w-full max-w-lg overflow-hidden p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-stone-900">تخصیص گروهی میزها</h3>
                  <p className="text-xs text-stone-400 mt-0.5">انتخاب چند میز و واگذاری همزمان به یک گارسون</p>
                </div>
              </div>
              <button
                onClick={() => setIsBatchAssignOpen(false)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-900 hover:bg-stone-50 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteBatchAssign} className="space-y-5">
              <div>
                <label className="text-[11px] font-bold text-stone-500 block mb-1">انتخاب گارسون</label>
                <select
                  value={batchWaiterId || ''}
                  onChange={(e) => setBatchWaiterId(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:border-orange-500 font-bold text-xs"
                  required
                >
                  {waiters.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.role === 'MANAGER' ? 'مدیر' : 'گارسون'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-bold text-stone-500">انتخاب میزها</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const allIds = tables.map((t) => t.id);
                        setSelectedBatchTableIds(allIds);
                        setCustomTableNumbersInput(tables.map((t) => t.table_number).join('، '));
                      }}
                      className="text-[11px] font-bold text-orange-600 hover:text-orange-700 bg-orange-50 px-2.5 py-1 rounded-xl"
                    >
                      انتخاب همه
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedBatchTableIds([]);
                        setCustomTableNumbersInput('');
                      }}
                      className="text-[11px] font-bold text-stone-400 hover:text-rose-500 bg-stone-100 px-2.5 py-1 rounded-xl"
                    >
                      پاک کردن
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-48 overflow-y-auto no-scrollbar p-1">
                  {tables.map((tItem) => {
                    const isSelected = selectedBatchTableIds.includes(tItem.id);
                    return (
                      <button
                        key={tItem.id}
                        type="button"
                        onClick={() => handleToggleTableForBatch(tItem.id)}
                        className={`aspect-square rounded-2xl border transition-all flex flex-col items-center justify-center gap-0.5 ${
                          isSelected
                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-transparent shadow-xs scale-95'
                            : 'bg-white text-stone-600 border-stone-200 hover:border-orange-300'
                        }`}
                      >
                        <span className="font-black text-sm">{tItem.table_number}</span>
                        <span className={`text-[8px] font-medium truncate max-w-full px-1 ${isSelected ? 'text-white/80' : 'text-stone-400'}`}>
                          {tItem.assigned_waiter_name?.split(' ')[0] || 'آزاد'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-4 bg-orange-50/70 border border-orange-200 rounded-2xl flex items-center justify-between text-orange-800">
                <span className="text-xs font-bold">تعداد میزهای انتخاب‌شده:</span>
                <span className="text-base font-black text-orange-600">{selectedBatchTableIds.length} میز</span>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  className="flex-1 rounded-2xl font-bold py-2.5"
                  onClick={() => setIsBatchAssignOpen(false)}
                >
                  انصراف
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="flex-1 rounded-2xl font-bold py-2.5"
                  disabled={selectedBatchTableIds.length === 0}
                >
                  تأیید واگذاری
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {tableToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-xl border border-stone-100 p-6 md:p-8 max-w-sm w-full space-y-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-base font-black text-stone-900">حذف میز #{tableToDelete.table_number}</h4>
              <p className="text-xs text-stone-400 mt-1">این عملیات قابل بازگشت نیست.</p>
            </div>

            {tableToDelete.status === 'OCCUPIED' && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-bold">
                ⚠️ هشدار: این میز هم‌اکنون دارای مهمان و فاکتور فعال است!
              </div>
            )}

            <div className="flex flex-col gap-2.5">
              <Button variant="danger" size="md" className="w-full rounded-2xl font-bold py-2.5" onClick={handleConfirmDelete}>
                حذف قطعی میز
              </Button>
              <Button variant="outline" size="md" className="w-full rounded-2xl font-bold py-2.5" onClick={() => setTableToDelete(null)}>
                انصراف
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Standalone Table QR Generator & Printing Modal */}
      <TableQrModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        tables={tables}
        selectedTableId={selectedQrTableId}
      />
    </div>
  );
}
