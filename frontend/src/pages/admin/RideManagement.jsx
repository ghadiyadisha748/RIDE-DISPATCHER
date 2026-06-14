import { useState } from 'react';
import { LayoutDashboard, Users, Car, DollarSign, MessageSquare, BarChart3, Activity, ChevronDown, ChevronUp } from 'lucide-react';
import Sidebar from '../../components/common/Sidebar';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard',  path: '/admin' },
  { icon: Users,           label: 'Users',       path: '/admin/users' },
  { icon: Car,             label: 'Drivers',     path: '/admin/drivers' },
  { icon: Activity,        label: 'Rides',       path: '/admin/rides' },
  { icon: DollarSign,      label: 'Revenue',     path: '/admin/revenue' },
  { icon: MessageSquare,   label: 'Complaints',  path: '/admin/complaints' },
  { icon: BarChart3,       label: 'Demand AI',   path: '/admin/demand' },
];
const STATUS_COLORS = { completed:'badge-success', cancelled:'badge-danger', in_progress:'badge-brand', requested:'badge-warning', driver_assigned:'badge-brand' };
const MOCK_RIDES = [
  { id:'R001', user:'Arjun Mehta', driver:'Ramesh Tadvi', pickup:'Vesu, Surat', drop:'Ring Road, Surat', type:'cab', fare:95, status:'completed', date:'14 Jun 2024 09:30', city:'Surat' },
  { id:'R002', user:'Priya Shah', driver:'Suresh Baraiya', pickup:'Adajan', drop:'Althan', type:'auto', fare:62, status:'completed', date:'14 Jun 2024 11:00', city:'Surat' },
  { id:'R003', user:'Kiran Joshi', driver:'Pratik Gamit', pickup:'CG Road, Ahmedabad', drop:'SG Highway', type:'premium', fare:320, status:'in_progress', date:'14 Jun 2024 14:20', city:'Ahmedabad' },
  { id:'R004', user:'Sonal Dave', driver:'-', pickup:'Sayajigunj, Vadodara', drop:'Manjalpur', type:'bike', fare:38, status:'cancelled', date:'13 Jun 2024 18:45', city:'Vadodara' },
  { id:'R005', user:'Ravi Patel', driver:'Nilesh Vasava', pickup:'Kalavad Road, Rajkot', drop:'University Rd', type:'cab', fare:78, status:'completed', date:'13 Jun 2024 10:10', city:'Rajkot' },
];

export default function RideManagement() {
  const [expanded, setExpanded] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCity,   setFilterCity]   = useState('all');

  const stats = { completed: MOCK_RIDES.filter(r => r.status === 'completed').length, cancelled: MOCK_RIDES.filter(r => r.status === 'cancelled').length, in_progress: MOCK_RIDES.filter(r => r.status === 'in_progress').length, avg_fare: Math.round(MOCK_RIDES.reduce((s,r) => s + r.fare, 0) / MOCK_RIDES.length) };
  const filtered = MOCK_RIDES.filter(r => (filterStatus === 'all' || r.status === filterStatus) && (filterCity === 'all' || r.city === filterCity));

  return (
    <div className="flex h-screen bg-dark-bg overflow-hidden">
      <Sidebar navItems={navItems} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-7xl mx-auto space-y-6">
          <h1 className="text-3xl font-display font-bold text-white">Ride Management</h1>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[{ label:'Completed', value: stats.completed, color:'text-success-500' }, { label:'Cancelled', value: stats.cancelled, color:'text-danger-500' }, { label:'In Progress', value: stats.in_progress, color:'text-brand-400' }, { label:'Avg Fare', value:`₹${stats.avg_fare}`, color:'text-yellow-400' }].map(s => (
              <div key={s.label} className="stat-card">
                <div className={`text-2xl font-display font-black ${s.color}`}>{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 flex-wrap">
            <select id="filter-ride-status" className="input py-2.5 w-auto" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              {['all','completed','cancelled','in_progress','requested'].map(s => <option key={s} value={s}>{s==='all'?'All Statuses':s}</option>)}
            </select>
            <select id="filter-ride-city" className="input py-2.5 w-auto" value={filterCity} onChange={e => setFilterCity(e.target.value)}>
              {['all','Surat','Ahmedabad','Vadodara','Rajkot'].map(c => <option key={c} value={c}>{c==='all'?'All Cities':c}</option>)}
            </select>
          </div>

          <div className="card divide-y divide-dark-border overflow-hidden">
            {filtered.map(r => (
              <div key={r.id}>
                <button onClick={() => setExpanded(e => e === r.id ? null : r.id)} className="w-full p-4 hover:bg-dark-card text-left flex items-center gap-4">
                  <span className="font-mono text-xs text-brand-400 w-14 shrink-0">{r.id}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white">{r.user} → {r.driver}</div>
                    <div className="text-xs text-gray-500">{r.pickup} → {r.drop}</div>
                  </div>
                  <span className={`badge ${STATUS_COLORS[r.status]||'badge-muted'} text-xs shrink-0`}>{r.status}</span>
                  <span className="text-sm font-bold text-white shrink-0">₹{r.fare}</span>
                  {expanded === r.id ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
                </button>
                {expanded === r.id && (
                  <div className="px-4 pb-4 bg-dark-card border-t border-dark-border text-sm text-gray-400 grid grid-cols-2 md:grid-cols-4 gap-3 pt-3">
                    {[['Date', r.date], ['City', r.city], ['Type', r.type], ['Fare', `₹${r.fare}`]].map(([k,v]) => (
                      <div key={k}><div className="text-xs text-gray-600">{k}</div><div className="text-white font-semibold capitalize">{v}</div></div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
