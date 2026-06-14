import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Users, Car, DollarSign, MessageSquare, BarChart3, TrendingUp, Activity, AlertCircle, Brain } from 'lucide-react';
import Sidebar from '../../components/common/Sidebar';
import { adminService } from '../../services/adminService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { format, subDays } from 'date-fns';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard',    path: '/admin' },
  { icon: Users,           label: 'Users',         path: '/admin/users' },
  { icon: Car,             label: 'Drivers',       path: '/admin/drivers' },
  { icon: Activity,        label: 'Rides',         path: '/admin/rides' },
  { icon: DollarSign,      label: 'Revenue',       path: '/admin/revenue' },
  { icon: MessageSquare,   label: 'Complaints',    path: '/admin/complaints' },
  { icon: BarChart3,       label: 'Demand AI',     path: '/admin/demand' },
];

// Mock data
const MOCK_STATS   = { total_users: 4820, active_drivers: 312, rides_today: 843, revenue_today: 68240 };
const MOCK_TREND   = Array.from({ length: 7 }).map((_, i) => ({ day: format(subDays(new Date(), 6-i), 'EEE'), rides: Math.round(600 + Math.random() * 400) }));
const PIE_DATA     = [{ name: 'Auto', value: 35 }, { name: 'Bike', value: 28 }, { name: 'Cab', value: 27 }, { name: 'Premium', value: 10 }];
const PIE_COLORS   = ['#f59e0b', '#10b981', '#5469ff', '#8b5cf6'];
const ACTIVE_RIDES = [
  { id: 'R912', user: 'Arjun Mehta', driver: 'Ramesh Tadvi', pickup: 'Vesu', drop: 'Ring Road', status: 'in_progress' },
  { id: 'R913', user: 'Priya Shah',  driver: 'Suresh Baraiya', pickup: 'Adajan', drop: 'Althan', status: 'driver_assigned' },
  { id: 'R914', user: 'Kiran Joshi', driver: 'Pratik Gamit', pickup: 'Sarthana', drop: 'VR Mall', status: 'in_progress' },
];
const COMPLAINTS   = [{ id: 'C1', user: 'Ravi Patel', issue: 'Driver rude behavior', priority: 'high', status: 'open' }, { id: 'C2', user: 'Sonal Dave', issue: 'Overcharged fare', priority: 'medium', status: 'in_review' }];
const PRIORITY_COLORS = { critical: 'badge-danger', high: 'badge-warning', medium: 'badge-brand', low: 'badge-muted' };

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return <div className="glass-panel px-3 py-2 rounded-xl border border-dark-border text-xs"><p className="text-gray-400">{label}</p><p className="text-white font-bold">{payload[0]?.value} rides</p></div>;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(MOCK_STATS);

  useEffect(() => {
    adminService.getStats().then(res => setStats(res.data.data)).catch(() => {});
  }, []);

  return (
    <div className="flex h-screen bg-dark-bg overflow-hidden">
      <Sidebar navItems={navItems} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-7xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-display font-bold text-white">Admin Dashboard</h1>
            <p className="text-gray-400 text-sm mt-1">RIDE-DISPATCHER — Real-time Platform Overview</p>
          </div>

          {/* KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Users',    value: stats.total_users?.toLocaleString(),   icon: Users,      color: 'text-brand-400',  sub: '+24 today' },
              { label: 'Active Drivers', value: stats.active_drivers,                  icon: Car,        color: 'text-success-500',sub: 'online now' },
              { label: 'Rides Today',    value: stats.rides_today,                     icon: Activity,   color: 'text-accent-500', sub: '↑ 12% vs yesterday' },
              { label: 'Revenue Today',  value: `₹${(stats.revenue_today||0).toLocaleString()}`, icon: DollarSign, color: 'text-yellow-400', sub: 'after commission' },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <s.icon className={`w-5 h-5 ${s.color}`} />
                <div className="stat-value text-2xl">{s.value}</div>
                <div className="stat-label">{s.label}</div>
                <div className="text-xs text-success-500 mt-1">{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 card p-6">
              <h3 className="text-lg font-bold text-white mb-4">7-Day Ride Volume</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={MOCK_TREND}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2038" vertical={false} />
                  <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#5469ff', strokeWidth: 1 }} />
                  <Line type="monotone" dataKey="rides" stroke="#5469ff" strokeWidth={2} dot={{ fill: '#5469ff', r: 4 }} activeDot={{ r: 6, fill: '#5469ff' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="card p-6">
              <h3 className="text-lg font-bold text-white mb-4">Ride Type Split</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={PIE_DATA} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }) => `${name} ${value}%`} labelLine={false}>
                    {PIE_DATA.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => `${v}%`} contentStyle={{ background: '#161829', border: '1px solid #1e2038', borderRadius: '12px', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Active rides + complaints */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card overflow-hidden">
              <div className="p-4 border-b border-dark-border flex items-center justify-between">
                <h3 className="font-bold text-white">Active Rides</h3>
                <Link to="/admin/rides" className="text-xs text-brand-400">View all →</Link>
              </div>
              <div className="divide-y divide-dark-border">
                {ACTIVE_RIDES.map(r => (
                  <div key={r.id} className="p-4 text-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs text-brand-400">{r.id}</span>
                      <span className={`badge ${r.status === 'in_progress' ? 'badge-success' : 'badge-brand'} text-xs`}>{r.status}</span>
                    </div>
                    <div className="text-gray-300">{r.user} → {r.driver}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{r.pickup} → {r.drop}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card overflow-hidden">
              <div className="p-4 border-b border-dark-border flex items-center justify-between">
                <h3 className="font-bold text-white">Recent Complaints</h3>
                <Link to="/admin/complaints" className="text-xs text-brand-400">View all →</Link>
              </div>
              <div className="divide-y divide-dark-border">
                {COMPLAINTS.map(c => (
                  <div key={c.id} className="p-4 text-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white font-semibold">{c.user}</span>
                      <span className={`badge ${PRIORITY_COLORS[c.priority]} text-xs`}>{c.priority}</span>
                    </div>
                    <div className="text-gray-400 text-xs">{c.issue}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
