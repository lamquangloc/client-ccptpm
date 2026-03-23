import { useState, useEffect } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────
interface StatCard {
  label: string;
  value: string;
  change: string;
  positive: boolean;
  icon: React.ReactNode;
  iconBg: string;
  id?: string;
}

interface StaffMember {
  name: string;
  tables: number;
  sales: string;
  tips: string;
  avatar: string;
}

interface InventoryItem {
  name: string;
  status: 'critical' | 'low';
  statusText: string;
  emoji: string;
  color: string;
}

// ─── Data ────────────────────────────────────────────────────────────────────
const defaultStatCards: StatCard[] = [
  {
    label: 'Total Revenue',
    value: '...',
    change: '...',
    positive: true,
    iconBg: 'bg-green-50',
    id: 'revenue',
    icon: (
      <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: 'Total Orders',
    value: '...',
    change: '...',
    positive: true,
    iconBg: 'bg-blue-50',
    id: 'orders',
    icon: (
      <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: 'Total Products',
    value: '...',
    change: '...',
    positive: false,
    iconBg: 'bg-orange-50',
    id: 'products',
    icon: (
      <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    ),
  },
  {
    label: 'Staff Count',
    value: '...',
    change: '...',
    positive: true,
    iconBg: 'bg-purple-50',
    id: 'staff',
    icon: (
      <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

const iconMap: Record<string, React.ReactNode> = {
  revenue: defaultStatCards[0].icon,
  orders: defaultStatCards[1].icon,
  products: defaultStatCards[2].icon,
  staff: defaultStatCards[3].icon
};

// ─── Donut Chart ─────────────────────────────────────────────────────────────
function DonutChart({ slices, totalRevenue }: { slices: any[], totalRevenue: number }) {
  const cx = 70, cy = 70, r = 55, strokeW = 22;
  const circumference = 2 * Math.PI * r;
  let offset = 0;

  const processedSlices = (slices || []).map((s) => {
    const dash = (s.pct / 100) * circumference;
    const gap = circumference - dash;
    const rotationDeg = (offset / circumference) * 360 - 90;
    offset += dash;
    return { ...s, dash, gap, rotationDeg };
  });

  return (
    <svg width={140} height={140} viewBox="0 0 140 140">
      {processedSlices.map((s, i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={s.color}
          strokeWidth={strokeW}
          strokeDasharray={`${s.dash} ${s.gap}`}
          strokeDashoffset={0}
          transform={`rotate(${s.rotationDeg} ${cx} ${cy})`}
          style={{ transition: 'stroke-dasharray 0.5s ease' }}
        />
      ))}
      <text x={cx} y={cy - 6} textAnchor="middle" className="text-sm font-bold" fontSize={13} fontWeight={700} fill="#1e293b">${(totalRevenue/1000).toFixed(1)}k</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize={8} fill="#94a3b8">Total Sales</text>
    </svg>
  );
}

// ─── Bar Chart ───────────────────────────────────────────────────────────────
function BarChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) return null;
  const maxVal = Math.max(...data.flatMap(d => [d.today, d.yesterday]));
  const chartH = 120;

  return (
    <div className="flex items-end gap-1 h-32 w-full mt-2">
      {data.map((d, i) => {
        const todayH = maxVal > 0 ? (d.today / maxVal) * chartH : 0;
        const yestH = maxVal > 0 ? (d.yesterday / maxVal) * chartH : 0;
        const isHighlight = d.hour === '1pm' || d.hour === '6pm' || d.hour === '7pm' || d.hour === '8pm';
        return (
          <div key={i} className="flex flex-col items-center flex-1 gap-0.5">
            <div className="flex items-end gap-0.5 w-full justify-center">
              <div
                className="rounded-t transition-all duration-500"
                style={{
                  height: todayH,
                  width: '45%',
                  backgroundColor: isHighlight ? (d.hour === '1pm' ? '#22c55e' : '#1e293b') : '#e2e8f0',
                }}
              />
              <div
                className="rounded-t transition-all duration-500"
                style={{
                  height: yestH,
                  width: '45%',
                  backgroundColor: '#f1f5f9',
                }}
              />
            </div>
            <span className="text-[9px] text-slate-400 font-medium mt-0.5 whitespace-nowrap">{d.hour}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const [animateStats, setAnimateStats] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/dashboard', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await res.json();
        setDashboardData(result);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDashboard();
    
    const timer = setTimeout(() => setAnimateStats(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const statCards: StatCard[] = dashboardData?.statCards 
    ? dashboardData.statCards.map((c: any) => ({ ...c, icon: iconMap[c.id || ''] || defaultStatCards[0].icon }))
    : defaultStatCards;

  const donutSlices = dashboardData?.donutSlices || [];
  const peakHoursData = dashboardData?.peakHoursData || [];
  const inventoryItems: InventoryItem[] = dashboardData?.inventoryItems || [];
  const staffData: StaffMember[] = dashboardData?.staffData || [];
  const totalRevenue = dashboardData?.totalRevenue || 0;

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* ── Stat Cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-3 hover:shadow-md transition-shadow"
            style={{
              opacity: animateStats ? 1 : 0,
              transform: animateStats ? 'translateY(0)' : 'translateY(12px)',
              transition: `opacity 0.4s ease ${i * 80}ms, transform 0.4s ease ${i * 80}ms`,
            }}
          >
            <div className="flex items-center justify-between">
              <div className={`p-2.5 rounded-xl ${card.iconBg}`}>{card.icon}</div>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${
                  card.positive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
                }`}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3}
                    d={card.positive ? 'M5 10l7-7m0 0l7 7m-7-7v18' : 'M19 14l-7 7m0 0l-7-7m7 7V3'} />
                </svg>
                {card.change}
              </span>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium mb-1">{card.label}</p>
              <p className="text-2xl font-bold text-slate-800">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts Row ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Sales by Category – Donut */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800">Sales by Category</h2>
            <button className="text-slate-400 hover:text-slate-600 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
              </svg>
            </button>
          </div>
          <div className="flex items-center gap-6">
            <DonutChart slices={donutSlices} totalRevenue={totalRevenue} />
            <div className="flex flex-col gap-3">
              {donutSlices.map((s: any, i: number) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                  <div>
                    <p className="text-xs font-semibold text-slate-700">{s.label}</p>
                    <p className="text-xs text-slate-400">{s.pct}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Peak Hours Traffic – Bar Chart */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h2 className="font-bold text-slate-800">Peak Hours Traffic</h2>
              <p className="text-xs text-slate-400">Guest count distribution per hour</p>
            </div>
            <button className="flex items-center gap-1 text-xs font-semibold text-green-500 hover:text-green-700 transition">
              Today vs Yesterday
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
          <BarChart data={peakHoursData} />
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-slate-800 inline-block" />
              <span className="text-xs text-slate-500">Today</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-slate-200 inline-block" />
              <span className="text-xs text-slate-500">Yesterday</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-green-500 inline-block" />
              <span className="text-xs text-slate-500">Peak now</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Row ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Inventory Alerts */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-orange-50 rounded-lg">
                <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="font-bold text-slate-800">Inventory Alerts</h2>
            </div>
            <button className="text-sm font-semibold text-green-500 hover:text-green-700 transition">
              View Inventory
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {inventoryItems.map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-slate-50 transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xl flex-shrink-0">
                  {item.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{item.name}</p>
                  <p className={`text-xs font-medium ${item.color}`}>{item.statusText}</p>
                </div>
                <button className="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 rounded-lg border border-green-400 text-green-600 text-xs font-semibold hover:bg-green-50">
                  Reorder
                </button>
                {/* Default reorder badge */}
                <span className="group-hover:hidden px-3 py-1.5 rounded-lg border border-green-400 text-green-600 text-xs font-semibold">
                  Reorder
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Staff Performance */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-50 rounded-lg">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 className="font-bold text-slate-800">Staff Performance</h2>
            </div>
            <button className="text-sm font-semibold text-green-500 hover:text-green-700 transition">
              Full Report
            </button>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-400 uppercase tracking-wide">
                <th className="text-left pb-3 font-semibold">Server</th>
                <th className="text-center pb-3 font-semibold">Tables</th>
                <th className="text-right pb-3 font-semibold">Sales</th>
                <th className="text-right pb-3 font-semibold">Tips</th>
              </tr>
            </thead>
            <tbody>
              {staffData.map((s, i) => (
                <tr key={i} className="border-t border-gray-50 hover:bg-slate-50 transition-colors rounded-lg">
                  <td className="py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 flex-shrink-0">
                        <img
                          src={`https://api.dicebear.com/7.x/notionists/svg?seed=${s.avatar}`}
                          alt={s.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="font-semibold text-slate-700">{s.name}</span>
                    </div>
                  </td>
                  <td className="py-3 text-center text-slate-600">{s.tables}</td>
                  <td className="py-3 text-right font-semibold text-slate-800">{s.sales}</td>
                  <td className="py-3 text-right font-semibold text-green-500">{s.tips}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
