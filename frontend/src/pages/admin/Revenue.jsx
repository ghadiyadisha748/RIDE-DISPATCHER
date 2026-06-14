import { useState } from 'react';
import { LayoutDashboard, Users, Car, DollarSign, MessageSquare, BarChart3, Activity } from 'lucide-react';
import Sidebar from '../../components/common/Sidebar';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { format, subDays } from 'date-fns';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard',  path: '/admin' },
  { icon: Users,           label: 'Users',       path: '/admin/users' },
  { icon: Car,             label: 'Drivers',     path: '/admin/drivers' },
  { icon: Activity,        label: 'Rides',       path: '/admin/rides' },
  { icon: DollarSign,      label: 'Revenue',     path: '/admin/revenue' },
  { icon: MessageSquare,   label: 'Complaints',  path: '/admin/complaints' },
  { icon: BarChart3,       label: 'Demand AI',   path: '/admin/demand' },
];

const TREND = Array.from({ length: 7 }).map((_, i) => ({ day: format(subDays(new Date(), 6-i), 'dd MMM'), gross: Math.round(50000 + Math.random() * 30000), net: Math.round(40000 + Math.random() * 24000) }));
const CITY_REVENUE = [{ city: 'Surat', revenue: 320000 }, { city: 'Ahmedabad', revenue: 184000 }, { city: 'Vadodara', revenue: 92000 }, { city: 'Rajkot', revenue: 68000 }];
const PAY_METHODS  = [{ name: 'Cash', value: 42 }, { name: 'UPI', value: 38 }, { name: 'Card', value: 15 }, { name: 'Wallet', value: 5 }];
const PAY_COLORS   = ['#5469ff', '#10b981', '#f59e0b', '#8b5cf6'];
const TOP_DRIVERS  = [{ name: 'Ramesh Tadvi', rides: 76, gross: '₹14,820', net: '₹11,856' }, { name: 'Pratik Gamit', rides: 63, gross: '₹12,240', net: '₹9,792' }, { name: 'Suresh Baraiya', rides: 52, gross: '₹8,640', net: '₹6,912' }];

const TT = ({ active, payload, label }) => !active || !payload?.length ? null : (
  <div className="glass-panel px-3 py-2 rounded-xl border border-dark-border text-xs">
    <p className="text-gray-400 mb-1">{label}</p>
    {payload.map(p => <p key={p.name} style={{ color: p.color }} className="font-bold">₹{p.value?.toLocaleString()}</p>)}
  </div>
);

export default function Revenue() {
  const [range, setRange] = useState('7d');
  const total = TREND.reduce((s, d) => s + d.gross, 0);
  const commission = Math.round(total * 0.2);

  return (
    <div className="flex h-screen bg-dark-bg overflow-hidden">
      <Sidebar navItems={navItems} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-display font-bold text-white">Revenue Analytics</h1>
            <div className="flex gap-2">
              {['7d','30d','90d'].map(r => (
                <button key={r} id={`range-${r}`} onClick={() => setRange(r)} className={`btn-sm ${range === r ? 'btn-primary' : 'btn-ghost border border-dark-border'}`}>{r}</button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Gross Revenue',    value: `₹${total.toLocaleString()}`,       color: 'text-white' },
              { label: 'Platform (20%)',   value: `₹${commission.toLocaleString()}`,  color: 'text-success-500' },
              { label: 'Driver Payouts',   value: `₹${(total-commission).toLocaleString()}`, color: 'text-brand-400' },
              { label: 'Avg Fare',         value: '₹92',                               color: 'text-yellow-400' },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <div className={`text-2xl font-display font-black ${s.color}`}>{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-bold text-white mb-4">Revenue Trend</h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={TREND}>
                <defs>
                  <linearGradient id="gradGross" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#5469ff" stopOpacity={0.3}/><stop offset="95%" stopColor="#5469ff" stopOpacity={0}/></linearGradient>
                  <linearGradient id="gradNet" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2038" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<TT />} />
                <Area type="monotone" dataKey="gross" stroke="#5469ff" fill="url(#gradGross)" strokeWidth={2} />
                <Area type="monotone" dataKey="net"   stroke="#10b981" fill="url(#gradNet)"   strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="text-lg font-bold text-white mb-4">Revenue by City</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={CITY_REVENUE} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2038" horizontal={false} />
                  <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="city" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={v => `₹${v.toLocaleString()}`} contentStyle={{ background:'#161829', border:'1px solid #1e2038', borderRadius:'12px', fontSize:'12px' }} />
                  <Bar dataKey="revenue" fill="#5469ff" radius={[0,4,4,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-bold text-white mb-4">Payment Methods</h3>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={PAY_METHODS} cx="50%" cy="50%" outerRadius={70} dataKey="value">
                    {PAY_METHODS.map((_, i) => <Cell key={i} fill={PAY_COLORS[i]} />)}
                  </Pie>
                  <Tooltip formatter={v => `${v}%`} contentStyle={{ background:'#161829', border:'1px solid #1e2038', borderRadius:'12px', fontSize:'12px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 justify-center mt-2">
                {PAY_METHODS.map((p, i) => <span key={p.name} className="text-xs flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: PAY_COLORS[i] }} /> {p.name} {p.value}%</span>)}
              </div>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="p-4 border-b border-dark-border"><h3 className="font-bold text-white">Top Earning Drivers</h3></div>
            <table className="w-full text-sm">
              <thead><tr className="bg-dark-card border-b border-dark-border">{['Driver','Rides','Gross','Net (80%)'].map(h => <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-dark-border">
                {TOP_DRIVERS.map(d => (
                  <tr key={d.name} className="hover:bg-dark-card">
                    <td className="py-3 px-4 font-semibold text-white">{d.name}</td>
                    <td className="py-3 px-4 text-gray-400">{d.rides}</td>
                    <td className="py-3 px-4 text-white">{d.gross}</td>
                    <td className="py-3 px-4 text-success-500 font-bold">{d.net}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
