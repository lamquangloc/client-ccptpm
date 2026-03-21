import { useState, useEffect, useRef } from 'react';
import { tableService, type ITable, type TableStatus } from '../../services/tableService';
import { useAuth } from '../../context/AuthContext';

// ─── Helpers ──────────────────────────────────────────────────────────────────
/** Server trả về "available" | "occupied" | "reserved" → map sang display */
const STATUS_MAP: Record<TableStatus, { label: string; dot: string; chip: string }> = {
  available: { label: 'Available', dot: 'bg-green-400',  chip: 'bg-green-50 text-green-600 border border-green-200'   },
  occupied:  { label: 'Occupied',  dot: 'bg-orange-400', chip: 'bg-orange-50 text-orange-500 border border-orange-200' },
  reserved:  { label: 'Reserved',  dot: 'bg-blue-400',   chip: 'bg-blue-50 text-blue-600 border border-blue-200'       },
};

const PAGE_SIZE = 6;

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconChair = () => (
  <svg className="w-4 h-4 inline-block mr-1 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M5 5h14M5 5v6a2 2 0 002 2h10a2 2 0 002-2V5M9 19v-6m6 6v-6m-8 6h10" />
  </svg>
);
const IconEdit = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M15.232 5.232l3.536 3.536M9 13l6.243-6.243a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-2.828 0L6 13.172V17h3.828L9 13z" />
  </svg>
);
const IconDelete = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a1 1 0 011-1h6a1 1 0 011 1v2" />
  </svg>
);
const IconCheck = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);
const IconCalendar = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);
const IconSearch = () => (
  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M21 21l-4.35-4.35M16.65 16.65A7.5 7.5 0 1116.65 2a7.5 7.5 0 010 14.65z" />
  </svg>
);
const IconFilter = () => (
  <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M7 8h10M11 12h2M9 16h6" />
  </svg>
);
const IconPlus = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
  </svg>
);
const IconClose = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const IconSpinner = () => (
  <svg className="w-5 h-5 animate-spin text-orange-500" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
  </svg>
);

// ─── Stat Card ────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: number;
  color: string;
  borderColor: string;
  icon: React.ReactNode;
  delay: number;
  visible: boolean;
}
function StatCard({ label, value, color, borderColor, icon, delay, visible }: StatCardProps) {
  return (
    <div
      className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col gap-1"
      style={{
        borderLeft: `4px solid ${borderColor}`,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(10px)',
        transition: `opacity 0.4s ease ${delay}ms, transform 0.4s ease ${delay}ms`,
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</span>
        <span className={color}>{icon}</span>
      </div>
      <p className={`text-3xl font-extrabold mt-1 ${color}`}>{value}</p>
    </div>
  );
}

// ─── Row Actions ──────────────────────────────────────────────────────────────
function RowActions({
  table,
  onEdit,
  onChangeStatus,
  onDelete,
}: {
  table: ITable;
  onEdit: (t: ITable) => void;
  onChangeStatus: (id: string, status: TableStatus) => void;
  onDelete: (id: string) => void;
}) {
  const { status } = table;
  return (
    <div className="flex items-center gap-1.5 justify-end">
      {status === 'available' && (
        <>
          <button title="Mark Reserved" onClick={() => onChangeStatus(table._id, 'reserved')}
            className="p-1.5 rounded-md text-blue-400 hover:bg-blue-50 hover:text-blue-600 transition-colors">
            <IconCalendar />
          </button>
          <button title="Mark Occupied" onClick={() => onChangeStatus(table._id, 'occupied')}
            className="p-1.5 rounded-md text-orange-400 hover:bg-orange-50 hover:text-orange-600 transition-colors">
            <IconCheck />
          </button>
        </>
      )}
      {status === 'occupied' && (
        <button title="Mark Available" onClick={() => onChangeStatus(table._id, 'available')}
          className="p-1.5 rounded-md text-green-400 hover:bg-green-50 hover:text-green-600 transition-colors">
          <IconCheck />
        </button>
      )}
      {status === 'reserved' && (
        <button title="Mark Available" onClick={() => onChangeStatus(table._id, 'available')}
          className="p-1.5 rounded-md text-green-400 hover:bg-green-50 hover:text-green-600 transition-colors">
          <IconCheck />
        </button>
      )}
      <button title="Edit Table" onClick={() => onEdit(table)}
        className="p-1.5 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
        <IconEdit />
      </button>
      <button title="Delete Table" onClick={() => onDelete(table._id)}
        className="p-1.5 rounded-md text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors">
        <IconDelete />
      </button>
    </div>
  );
}

// ─── Add / Edit Modal ─────────────────────────────────────────────────────────
interface ModalProps {
  open: boolean;
  editTable: ITable | null;
  onClose: () => void;
  onSave: (number: number, capacity: number) => Promise<void>;
  saving: boolean;
}
function TableModal({ open, editTable, onClose, onSave, saving }: ModalProps) {
  const [tableNumber, setTableNumber] = useState('');
  const [capacity, setCapacity] = useState(4);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      if (editTable) {
        setTableNumber(String(editTable.number));
        setCapacity(editTable.capacity);
      } else {
        setTableNumber('');
        setCapacity(4);
      }
      setError('');
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [open, editTable]);

  const handleSave = async () => {
    const num = parseInt(tableNumber, 10);
    if (!tableNumber || isNaN(num) || num <= 0) {
      setError('Vui lòng nhập số bàn hợp lệ (số nguyên dương).');
      return;
    }
    setError('');
    await onSave(num, capacity);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-end"
      style={{ backgroundColor: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(2px)' }}
      onClick={(e) => { if (e.target === e.currentTarget && !saving) onClose(); }}
    >
      <div
        className="bg-white h-full w-80 shadow-2xl flex flex-col"
        style={{ animation: 'slideInRight 0.25s ease' }}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                {editTable ? 'Edit Table' : 'Add New Table'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {editTable ? 'Cập nhật thông tin bàn.' : 'Configure a new table for your layout'}
              </p>
            </div>
            <button onClick={onClose} disabled={saving}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50">
              <IconClose />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 px-6 py-5 flex flex-col gap-6 overflow-y-auto">
          {/* Table Number */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Table Number / ID
            </label>
            <input
              ref={inputRef}
              id="modal-table-number"
              type="number"
              min={1}
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              placeholder="e.g. 35"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder-slate-300 outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
            />
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>

          {/* Capacity */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Capacity (Seats)
            </label>
            <div className="flex items-center gap-4">
              <button id="capacity-decrease" type="button"
                onClick={() => setCapacity(c => Math.max(1, c - 1))}
                className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 active:bg-slate-200 transition-colors font-bold text-lg">
                −
              </button>
              <span className="text-3xl font-extrabold text-orange-500 w-8 text-center select-none">
                {capacity}
              </span>
              <button id="capacity-increase" type="button"
                onClick={() => setCapacity(c => c + 1)}
                className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 active:bg-slate-200 transition-colors font-bold text-lg">
                +
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button id="modal-cancel" onClick={onClose} disabled={saving}
            className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button id="modal-save" onClick={handleSave} disabled={saving}
            className="flex-1 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white text-sm font-semibold transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-70">
            {saving ? <><IconSpinner /><span>Saving…</span></> : 'Save Table'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
function ConfirmDeleteModal({
  open,
  tableNumber,
  onCancel,
  onConfirm,
  deleting,
}: {
  open: boolean;
  tableNumber: number | null;
  onCancel: () => void;
  onConfirm: () => void;
  deleting: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(2px)' }}>
      <div className="bg-white rounded-2xl shadow-xl p-6 w-80 flex flex-col gap-4"
        style={{ animation: 'fadeInScale 0.2s ease' }}>
        <div className="flex items-center gap-3">
          <span className="p-2.5 bg-red-50 rounded-xl text-red-500">
            <IconDelete />
          </span>
          <div>
            <p className="font-bold text-slate-800">Xoá bàn {tableNumber ? `T-${String(tableNumber).padStart(2, '0')}` : ''}?</p>
            <p className="text-xs text-slate-400 mt-0.5">Hành động này không thể hoàn tác.</p>
          </div>
        </div>
        <div className="flex gap-2 mt-1">
          <button onClick={onCancel} disabled={deleting}
            className="flex-1 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors">
            Huỷ
          </button>
          <button onClick={onConfirm} disabled={deleting}
            className="flex-1 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-semibold disabled:opacity-70 transition-colors flex items-center justify-center gap-1">
            {deleting ? <IconSpinner /> : 'Xoá bàn'}
          </button>
        </div>
      </div>
      <style>{`@keyframes fadeInScale { from { opacity:0; transform:scale(.95); } to { opacity:1; transform:scale(1); } }`}</style>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
interface Toast { id: number; message: string; type: 'success' | 'error' }
function ToastList({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id}
          className={`px-4 py-3 rounded-xl shadow-lg text-sm font-semibold text-white flex items-center gap-2 pointer-events-none
            ${t.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}
          style={{ animation: 'slideUp 0.25s ease' }}>
          {t.type === 'success'
            ? <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
            : <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          }
          {t.message}
        </div>
      ))}
      <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminTablesPage() {
  const { token } = useAuth();

  const [tables, setTables] = useState<ITable[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState('');

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<TableStatus | 'all'>('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editTable, setEditTable] = useState<ITable | null>(null);
  const [saving, setSaving] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  const [animateStats, setAnimateStats] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // ── Toast helpers ─────────────────────────────────────────────────────────
  const pushToast = (message: string, type: 'success' | 'error') => {
    const id = ++toastId.current;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  // ── Fetch tables ──────────────────────────────────────────────────────────
  const fetchTables = async () => {
    try {
      setLoading(true);
      setApiError('');
      const data = await tableService.getAll();
      setTables(data);
    } catch (err: any) {
      setApiError(err.message || 'Không thể tải danh sách bàn.');
    } finally {
      setLoading(false);
      setTimeout(() => setAnimateStats(true), 80);
    }
  };

  useEffect(() => { fetchTables(); }, []);

  // ── Close filter menu on outside click ────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node))
        setShowFilterMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const totalTables    = tables.length;
  const occupiedCount  = tables.filter(t => t.status === 'occupied').length;
  const availableCount = tables.filter(t => t.status === 'available').length;
  const reservedCount  = tables.filter(t => t.status === 'reserved').length;

  // ── Filtered & paginated ──────────────────────────────────────────────────
  const filtered = tables.filter(t => {
    const q = search.toLowerCase();
    const matchSearch = String(t.number).includes(q) || `t-${String(t.number).padStart(2,'0')}`.includes(q);
    const matchStatus = filterStatus === 'all' || t.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated   = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleChangeStatus = async (id: string, status: TableStatus) => {
    if (!token) { pushToast('Bạn cần đăng nhập với quyền admin.', 'error'); return; }
    try {
      const updated = await tableService.update(token, id, { status });
      setTables(prev => prev.map(t => t._id === id ? updated : t));
      pushToast(`Đã cập nhật trạng thái → ${STATUS_MAP[status].label}`, 'success');
    } catch (err: any) {
      pushToast(err.message || 'Cập nhật thất bại.', 'error');
    }
  };

  const handleSave = async (number: number, capacity: number) => {
    if (!token) { pushToast('Bạn cần đăng nhập với quyền admin.', 'error'); return; }
    setSaving(true);
    try {
      if (editTable) {
        const updated = await tableService.update(token, editTable._id, { number, capacity });
        setTables(prev => prev.map(t => t._id === editTable._id ? updated : t));
        pushToast('Đã cập nhật bàn thành công.', 'success');
      } else {
        const created = await tableService.create(token, { number, capacity });
        setTables(prev => [...prev, created]);
        pushToast('Đã thêm bàn mới thành công.', 'success');
      }
      setModalOpen(false);
    } catch (err: any) {
      pushToast(err.message || 'Lưu thất bại.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId || !token) return;
    setDeleting(true);
    try {
      await tableService.delete(token, deleteId);
      setTables(prev => prev.filter(t => t._id !== deleteId));
      pushToast('Đã xoá bàn thành công.', 'success');
      setDeleteId(null);
    } catch (err: any) {
      pushToast(err.message || 'Xoá thất bại.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const openAddModal = () => { setEditTable(null); setModalOpen(true); };
  const openEditModal = (t: ITable) => { setEditTable(t); setModalOpen(true); };

  const tableName = (t: ITable) => `T-${String(t.number).padStart(2, '0')}`;
  const deleteTarget = tables.find(t => t._id === deleteId);

  const statusFilters: { value: TableStatus | 'all'; label: string }[] = [
    { value: 'all',       label: 'All Statuses' },
    { value: 'available', label: 'Available'    },
    { value: 'occupied',  label: 'Occupied'     },
    { value: 'reserved',  label: 'Reserved'     },
  ];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
        <span className="text-orange-500">Tables</span>
        <span>/</span>
        <span className="text-slate-600">Table Management</span>
      </nav>

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800">Table List View</h1>
        <p className="text-sm text-slate-400 mt-0.5">Monitor and organize restaurant seating layouts efficiently.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Tables"  value={totalTables}    color="text-orange-500" borderColor="#f97316"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 10h18M3 14h18M10 6v12M14 6v12"/></svg>}
          delay={0} visible={animateStats} />
        <StatCard label="Occupied"      value={occupiedCount}  color="text-orange-400" borderColor="#fb923c"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>}
          delay={80} visible={animateStats} />
        <StatCard label="Available"     value={availableCount} color="text-green-500"  borderColor="#22c55e"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
          delay={160} visible={animateStats} />
        <StatCard label="Reserved"      value={reservedCount}  color="text-blue-500"   borderColor="#3b82f6"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>}
          delay={240} visible={animateStats} />
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 flex-wrap">
          <div className="relative flex-1 min-w-40">
            <span className="absolute left-3 top-1/2 -translate-y-1/2"><IconSearch /></span>
            <input
              id="table-search"
              type="text"
              placeholder="Search by ID, e.g. T-01..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm text-slate-700 placeholder-slate-300 outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent transition"
            />
          </div>

          <div className="relative" ref={filterRef}>
            <button id="table-filter-btn" onClick={() => setShowFilterMenu(v => !v)}
              className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              <IconFilter />
              Filters
              {filterStatus !== 'all' && <span className="ml-1 w-2 h-2 rounded-full bg-orange-500 inline-block" />}
            </button>
            {showFilterMenu && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-20 min-w-36">
                {statusFilters.map(s => (
                  <button key={s.value}
                    onClick={() => { setFilterStatus(s.value); setPage(1); setShowFilterMenu(false); }}
                    className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors ${
                      filterStatus === s.value ? 'bg-orange-50 text-orange-600' : 'text-slate-600 hover:bg-slate-50'
                    }`}>
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button id="add-table-btn" onClick={openAddModal}
            className="ml-auto flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors">
            <IconPlus />+ Add Table
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-slate-400">
            <IconSpinner />
            <span className="text-sm">Đang tải dữ liệu...</span>
          </div>
        ) : apiError ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <p className="text-red-500 font-semibold text-sm">{apiError}</p>
            <button onClick={fetchTables}
              className="px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors">
              Thử lại
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs font-semibold text-slate-400 uppercase tracking-wide bg-slate-50/60 border-b border-gray-100">
                  <th className="pl-4 pr-2 py-3 text-left w-8">
                    <input type="checkbox" className="rounded border-gray-300 accent-orange-500" />
                  </th>
                  <th className="px-2 py-3 text-left">Table ID</th>
                  <th className="px-2 py-3 text-left">Capacity</th>
                  <th className="px-2 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-slate-400 text-sm">
                      Không tìm thấy bàn nào.
                    </td>
                  </tr>
                ) : (
                  paginated.map((table, i) => {
                    const sc = STATUS_MAP[table.status];
                    return (
                      <tr key={table._id}
                        className="border-b border-gray-50 hover:bg-orange-50/20 transition-colors"
                        style={{ animationDelay: `${i * 40}ms` }}>
                        <td className="pl-4 pr-2 py-3.5">
                          <input type="checkbox" className="rounded border-gray-300 accent-orange-500" />
                        </td>
                        <td className="px-2 py-3.5 font-bold text-slate-800">{tableName(table)}</td>
                        <td className="px-2 py-3.5 text-slate-600">
                          <IconChair />{table.capacity} Seats
                        </td>
                        <td className="px-2 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${sc.chip}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                            {sc.label}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <RowActions
                            table={table}
                            onEdit={openEditModal}
                            onChangeStatus={handleChangeStatus}
                            onDelete={(id) => setDeleteId(id)}
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && !apiError && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 flex-wrap gap-2">
            <span className="text-xs text-slate-400">
              Showing {filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1} to{' '}
              {Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length} tables
            </span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                    p === currentPage ? 'bg-orange-500 text-white shadow-sm' : 'border border-gray-200 text-slate-600 hover:bg-slate-50'
                  }`}>
                  {p}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <TableModal
        open={modalOpen}
        editTable={editTable}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        saving={saving}
      />
      <ConfirmDeleteModal
        open={!!deleteId}
        tableNumber={deleteTarget?.number ?? null}
        onCancel={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        deleting={deleting}
      />

      {/* Toast notifications */}
      <ToastList toasts={toasts} />
    </div>
  );
}
