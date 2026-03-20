import { useState, useEffect, useRef } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────
type TableStatus = 'Occupied' | 'Available' | 'Reserved' | 'Cleaning';

interface RestaurantTable {
  id: string;
  capacity: number;
  status: TableStatus;
  customer?: string;
  floor: string;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────
const FLOORS = ['Floor 1 (Main Hall)', 'Floor 2 (VIP)', 'Rooftop', 'Outdoor'];

const initialTables: RestaurantTable[] = [
  { id: 'T-01', capacity: 4, status: 'Occupied',  customer: 'John D.',   floor: 'Floor 1 (Main Hall)' },
  { id: 'T-02', capacity: 2, status: 'Available',                         floor: 'Floor 1 (Main Hall)' },
  { id: 'T-03', capacity: 6, status: 'Reserved',  customer: 'Smith Fam.', floor: 'Floor 1 (Main Hall)' },
  { id: 'T-04', capacity: 4, status: 'Occupied',  customer: 'Lee Party', floor: 'Floor 2 (VIP)' },
  { id: 'T-05', capacity: 2, status: 'Available',                         floor: 'Floor 2 (VIP)' },
  { id: 'T-06', capacity: 8, status: 'Cleaning',                          floor: 'Rooftop' },
  { id: 'T-07', capacity: 4, status: 'Available',                         floor: 'Rooftop' },
  { id: 'T-08', capacity: 6, status: 'Occupied',  customer: 'Wang G.',   floor: 'Outdoor' },
  { id: 'T-09', capacity: 2, status: 'Reserved',  customer: 'Kim & Co.', floor: 'Outdoor' },
  { id: 'T-10', capacity: 4, status: 'Available',                         floor: 'Floor 1 (Main Hall)' },
  { id: 'T-11', capacity: 8, status: 'Occupied',  customer: 'Phan T.',   floor: 'Floor 2 (VIP)' },
  { id: 'T-12', capacity: 2, status: 'Available',                         floor: 'Floor 2 (VIP)' },
];

const PAGE_SIZE = 6;

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<TableStatus, { label: string; dot: string; chip: string }> = {
  Occupied:  { label: 'Occupied',  dot: 'bg-orange-400', chip: 'bg-orange-50 text-orange-500 border border-orange-200' },
  Available: { label: 'Available', dot: 'bg-green-400',  chip: 'bg-green-50 text-green-600 border border-green-200'   },
  Reserved:  { label: 'Reserved',  dot: 'bg-blue-400',   chip: 'bg-blue-50 text-blue-600 border border-blue-200'      },
  Cleaning:  { label: 'Cleaning',  dot: 'bg-slate-400',  chip: 'bg-slate-100 text-slate-500 border border-slate-200'  },
};

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

const IconClean = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
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
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M3 4h18M7 8h10M11 12h2M9 16h6" />
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
        <span className={`${color}`}>{icon}</span>
      </div>
      <p className={`text-3xl font-extrabold mt-1 ${color}`}>{value}</p>
    </div>
  );
}

// ─── Row action buttons ───────────────────────────────────────────────────────
function RowActions({
  table,
  onEdit,
  onMark,
}: {
  table: RestaurantTable;
  onEdit: (t: RestaurantTable) => void;
  onMark: (id: string, status: TableStatus) => void;
}) {
  const { status } = table;
  return (
    <div className="flex items-center gap-1.5 justify-end">
      {status === 'Available' && (
        <>
          <button
            title="Mark Reserved"
            onClick={() => onMark(table.id, 'Reserved')}
            className="p-1.5 rounded-md text-blue-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
          >
            <IconCalendar />
          </button>
          <button
            title="Mark Occupied"
            onClick={() => onMark(table.id, 'Occupied')}
            className="p-1.5 rounded-md text-orange-400 hover:bg-orange-50 hover:text-orange-600 transition-colors"
          >
            <IconCheck />
          </button>
        </>
      )}
      {status === 'Occupied' && (
        <>
          <button
            title="Mark Cleaning"
            onClick={() => onMark(table.id, 'Cleaning')}
            className="p-1.5 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <IconClean />
          </button>
        </>
      )}
      {status === 'Reserved' && (
        <>
          <button
            title="Mark Available"
            onClick={() => onMark(table.id, 'Available')}
            className="p-1.5 rounded-md text-green-400 hover:bg-green-50 hover:text-green-600 transition-colors"
          >
            <IconCheck />
          </button>
        </>
      )}
      {status === 'Cleaning' && (
        <>
          <button
            title="Mark Available"
            onClick={() => onMark(table.id, 'Available')}
            className="p-1.5 rounded-md text-green-400 hover:bg-green-50 hover:text-green-600 transition-colors"
          >
            <IconCheck />
          </button>
        </>
      )}
      <button
        title="Edit Table"
        onClick={() => onEdit(table)}
        className="p-1.5 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
      >
        <IconEdit />
      </button>
      <button
        title="Delete Table"
        onClick={() => onMark(table.id, 'Cleaning')}
        className="p-1.5 rounded-md text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
      >
        <IconDelete />
      </button>
    </div>
  );
}

// ─── Add / Edit Table Modal ───────────────────────────────────────────────────
interface TableModalProps {
  open: boolean;
  editTable: RestaurantTable | null;
  onClose: () => void;
  onSave: (table: Omit<RestaurantTable, 'status'> & { status?: TableStatus }) => void;
}

function TableModal({ open, editTable, onClose, onSave }: TableModalProps) {
  const [tableId, setTableId] = useState('');
  const [floor, setFloor] = useState(FLOORS[0]);
  const [capacity, setCapacity] = useState(4);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      if (editTable) {
        setTableId(editTable.id);
        setFloor(editTable.floor);
        setCapacity(editTable.capacity);
      } else {
        setTableId('');
        setFloor(FLOORS[0]);
        setCapacity(4);
      }
      setError('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open, editTable]);

  const handleSave = () => {
    if (!tableId.trim()) { setError('Table Number / ID is required.'); return; }
    setError('');
    onSave({ id: tableId.trim(), floor, capacity, status: editTable?.status });
    onClose();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-end"
      style={{ backgroundColor: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(2px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
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
                {editTable ? 'Update table details.' : 'Configure a new table for your layout'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <IconClose />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 px-6 py-5 flex flex-col gap-6 overflow-y-auto">
          {/* Table Number / ID */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Table Number / ID
            </label>
            <input
              ref={inputRef}
              id="modal-table-id"
              type="text"
              value={tableId}
              onChange={(e) => setTableId(e.target.value)}
              placeholder="e.g. T-35"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder-slate-300 outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
            />
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>

          {/* Floor / Area */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Floor / Area
            </label>
            <div className="relative">
              <select
                id="modal-floor"
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent appearance-none bg-white transition"
              >
                {FLOORS.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </div>
          </div>

          {/* Capacity */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Capacity (Seats)
            </label>
            <div className="flex items-center gap-4">
              <button
                id="capacity-decrease"
                type="button"
                onClick={() => setCapacity((c) => Math.max(1, c - 1))}
                className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 active:bg-slate-200 transition-colors font-bold text-lg"
              >
                −
              </button>
              <span className="text-3xl font-extrabold text-orange-500 w-8 text-center select-none">
                {capacity}
              </span>
              <button
                id="capacity-increase"
                type="button"
                onClick={() => setCapacity((c) => c + 1)}
                className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 active:bg-slate-200 transition-colors font-bold text-lg"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button
            id="modal-cancel"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            id="modal-save"
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white text-sm font-semibold transition-colors shadow-sm"
          >
            Save Table
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

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminTablesPage() {
  const [tables, setTables] = useState<RestaurantTable[]>(initialTables);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<TableStatus | 'All'>('All');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTable, setEditTable] = useState<RestaurantTable | null>(null);
  const [animateStats, setAnimateStats] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setAnimateStats(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Close filter dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setShowFilterMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Stats ────────────────────────────────────────────────────────────────
  const totalTables    = tables.length;
  const occupiedCount  = tables.filter(t => t.status === 'Occupied').length;
  const availableCount = tables.filter(t => t.status === 'Available').length;
  const reservedCount  = tables.filter(t => t.status === 'Reserved').length;

  // ── Filtered ─────────────────────────────────────────────────────────────
  const filtered = tables.filter(t => {
    const matchSearch = t.id.toLowerCase().includes(search.toLowerCase())
      || (t.customer || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'All' || t.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleStatusChange = (id: string, status: TableStatus) => {
    setTables(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  };

  const handleEdit = (table: RestaurantTable) => {
    setEditTable(table);
    setModalOpen(true);
  };

  const handleSave = (data: Omit<RestaurantTable, 'status'> & { status?: TableStatus }) => {
    if (editTable) {
      setTables(prev => prev.map(t => t.id === editTable.id ? { ...t, ...data, status: data.status || t.status } : t));
    } else {
      const exists = tables.find(t => t.id === data.id);
      if (exists) {
        setTables(prev => prev.map(t => t.id === data.id ? { ...t, ...data } : t));
      } else {
        setTables(prev => [...prev, { ...data, status: 'Available' }]);
      }
    }
    setPage(1);
  };

  const openAddModal = () => {
    setEditTable(null);
    setModalOpen(true);
  };

  const handlePageChange = (p: number) => {
    if (p >= 1 && p <= totalPages) setPage(p);
  };

  const statusFilters: (TableStatus | 'All')[] = ['All', 'Occupied', 'Available', 'Reserved', 'Cleaning'];

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* ── Breadcrumb ─────────────────────────────────────────────────────── */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
        <span className="text-orange-500">Tables</span>
        <span>/</span>
        <span className="text-slate-600">Table Management</span>
      </nav>

      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800">Table List View</h1>
        <p className="text-sm text-slate-400 mt-0.5">Monitor and organize restaurant seating layouts efficiently.</p>
      </div>

      {/* ── Stat Cards ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Tables" value={totalTables}
          color="text-orange-500" borderColor="#f97316"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 10h18M3 14h18M10 6v12M14 6v12M4 6h16a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V7a1 1 0 011-1z"/></svg>}
          delay={0} visible={animateStats}
        />
        <StatCard
          label="Occupied" value={occupiedCount}
          color="text-orange-400" borderColor="#fb923c"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>}
          delay={80} visible={animateStats}
        />
        <StatCard
          label="Available" value={availableCount}
          color="text-green-500" borderColor="#22c55e"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
          delay={160} visible={animateStats}
        />
        <StatCard
          label="Reserved" value={reservedCount}
          color="text-blue-500" borderColor="#3b82f6"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>}
          delay={240} visible={animateStats}
        />
      </div>

      {/* ── Toolbar ───────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-40">
            <span className="absolute left-3 top-1/2 -translate-y-1/2">
              <IconSearch />
            </span>
            <input
              id="table-search"
              type="text"
              placeholder="Search by ID, Customer..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm text-slate-700 placeholder-slate-300 outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent transition"
            />
          </div>

          {/* Filter */}
          <div className="relative" ref={filterRef}>
            <button
              id="table-filter-btn"
              onClick={() => setShowFilterMenu(v => !v)}
              className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <IconFilter />
              Filters
              {filterStatus !== 'All' && (
                <span className="ml-1 w-2 h-2 rounded-full bg-orange-500 inline-block" />
              )}
            </button>
            {showFilterMenu && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-20 min-w-36">
                {statusFilters.map(s => (
                  <button
                    key={s}
                    onClick={() => { setFilterStatus(s); setPage(1); setShowFilterMenu(false); }}
                    className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors ${
                      filterStatus === s
                        ? 'bg-orange-50 text-orange-600'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {s === 'All' ? 'All Statuses' : s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="ml-auto">
            <button
              id="add-table-btn"
              onClick={openAddModal}
              className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
            >
              <IconPlus />
              + Add Table
            </button>
          </div>
        </div>

        {/* ── Table ─────────────────────────────────────────────────────── */}
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
                <th className="px-2 py-3 text-left hidden md:table-cell">Floor</th>
                <th className="px-2 py-3 text-left hidden lg:table-cell">Customer</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 text-sm">
                    No tables found.
                  </td>
                </tr>
              ) : (
                paginated.map((table, i) => {
                  const sc = STATUS_CONFIG[table.status];
                  return (
                    <tr
                      key={table.id}
                      className="border-b border-gray-50 hover:bg-orange-50/20 transition-colors"
                      style={{ animationDelay: `${i * 40}ms` }}
                    >
                      <td className="pl-4 pr-2 py-3.5">
                        <input type="checkbox" className="rounded border-gray-300 accent-orange-500" />
                      </td>
                      <td className="px-2 py-3.5 font-bold text-slate-800">{table.id}</td>
                      <td className="px-2 py-3.5 text-slate-600">
                        <IconChair />{table.capacity} Seats
                      </td>
                      <td className="px-2 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${sc.chip}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-2 py-3.5 text-slate-500 hidden md:table-cell text-xs">{table.floor}</td>
                      <td className="px-2 py-3.5 text-slate-500 hidden lg:table-cell text-xs">
                        {table.customer || <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-4 py-3.5">
                        <RowActions table={table} onEdit={handleEdit} onMark={handleStatusChange} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 flex-wrap gap-2">
          <span className="text-xs text-slate-400">
            Showing {filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1} to{' '}
            {Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length} tables
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => handlePageChange(p)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                  p === currentPage
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'border border-gray-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ── Modal ─────────────────────────────────────────────────────────── */}
      <TableModal
        open={modalOpen}
        editTable={editTable}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}
