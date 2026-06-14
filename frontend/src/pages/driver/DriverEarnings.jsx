import { useState, useEffect } from 'react';
import { LayoutDashboard, Car, DollarSign, User, Bell, Download, TrendingUp, TrendingDown } from 'lucide-react';
import Sidebar from '../../components/common/Sidebar';
import { driverService } from '../../services/driverService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard',    path: '/driver' },
  { icon: Bell,            label: 'Ride Requests', path: '/driver/requests' },
  { icon: Car,             label: 'Active Ride',   path: '/driver/ride' },
  { icon: DollarSign,      label: 'Earnings',      path: '/driver/earnings' },
  { icon: User,            label: 'Profile',       path: '/driver/profile' },
];

// Mock data for demo
const MOCK_WEEKLY = Array.from({ length: 7 }).map((_, i) => ({
  day: format(subDays(new Date(), 6 - i), 'EEE'),
  gross: Math.round(400 + Math.random() * 500),
  net:   Math.round(320 + Math.random() * 400),
}));
const MOCK_RIDES = [
  { id: 'R001', date: '14 Jun 2024 09:30', fare: 95, commission: 19, net: 76 },
  { id: 'R002', date: '14 Jun 2024 11:00', fare: 62, commission: 12, net: 50 },
  { id: 'R003', date: '13 Jun 2024 18:45', fare: 130, commission: 26, net: 104 },
  { id: 'R004', date: '13 Jun 2024 08:20', fare: 48, commission: 10, net: 38 },
  { id: 'R005', date: '12 Jun 2024 16:10', fare: 88, commission: 18, net: 70 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-panel px-4 py-3 rounded-xl border border-dark-border text-xs">
      <p className="text-gray-400 mb-1">{label}</p>
      <p className="text-white font-bold">Gross: ₹{payload[0]?.value}</p>
      <p className="text-success-500 font-bold">Net: ₹{payload[1]?.value}</p>
    </div>
  );
};

export default function DriverEarnings() {
  const [earnings, setEarnings] = useState({ gross_month: 16420, commission_month: 3284, net_month: 13136, rides_month: 168 });
  const [loading, setLoading]   = useState(false);

  const totalGross = MOCK_WEEKLY.reduce((s, d) => s + d.gross, 0);
  const totalNet   = MOCK_WEEKLY.reduce((s, d) => s + d.net, 0);

  const exportCSV = () => {
    const rows = ['Ride ID,Date,Fare,Commission,Net', ...MOCK_RIDES.map(r => `${r.id},${r.date},${r.fare},${r.commission},${r.net}`)];
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a'); a.href = url; a.download = 'earnings.csv'; a.click();
  };

  return (
    <div className="flex h-screen bg-dark-bg overflow-hidden">
      <Sidebar navItems={navItems} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-5xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-display font-bold text-white">Earnings</h1>
            <button id="export-csv" onClick={exportCSV} className="btn-ghost btn-sm border border-dark-border">
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Gross (Month)', value: `₹${earnings.gross_month.toLocaleString()}`, color: 'text-white' },
              { label: 'Commission 20%', value: `₹${earnings.commission_month.toLocaleString()}`, color: 'text-danger-500' },
              { label: 'Net Earned',     value: `₹${earnings.net_month.toLocaleString()}`, color: 'text-success-500' },
              { label: 'Rides (Month)', value: earnings.rides_month, color: 'text-brand-400' },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <div className={`text-2xl font-display font-black ${s.color}`}>{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Bar chart */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Last 7 Days</h3>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-brand-500 inline-block" /> Gross</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-success-500 inline-block" /> Net</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={MOCK_WEEKLY} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2038" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(84,105,255,0.05)' }} />
                <Bar dataKey="gross" fill="#5469ff" radius={[4,4,0,0]} />
                <Bar dataKey="net"   fill="#10b981" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Ride table */}
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-dark-border">
              <h3 className="text-lg font-bold text-white">Recent Rides</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-dark-border bg-dark-card">
                    {['Ride ID', 'Date & Time', 'Gross Fare', 'Commission (20%)', 'Net Earned'].map(h => (
                      <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border">
                  {MOCK_RIDES.map(r => (
                    <tr key={r.id} className="hover:bg-dark-card transition-colors">
                      <td className="py-3 px-4 font-mono text-xs text-brand-400">{r.id}</td>
                      <td className="py-3 px-4 text-gray-300">{r.date}</td>
                      <td className="py-3 px-4 text-white font-semibold">₹{r.fare}</td>
                      <td className="py-3 px-4 text-danger-500">-₹{r.commission}</td>
                      <td className="py-3 px-4 text-success-500 font-bold">₹{r.net}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
