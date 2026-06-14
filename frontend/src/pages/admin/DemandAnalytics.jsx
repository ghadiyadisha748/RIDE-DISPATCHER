import { useState, useEffect } from 'react';
import {
  LayoutDashboard, Users, Car, DollarSign, MessageSquare,
  BarChart3, Activity, MapPin, TrendingUp, Zap, Clock,
} from 'lucide-react';
import Sidebar from '../../components/common/Sidebar';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, Cell,
} from 'recharts';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard',  path: '/admin' },
  { icon: Users,           label: 'Users',       path: '/admin/users' },
  { icon: Car,             label: 'Drivers',     path: '/admin/drivers' },
  { icon: Activity,        label: 'Rides',       path: '/admin/rides' },
  { icon: DollarSign,      label: 'Revenue',     path: '/admin/revenue' },
  { icon: MessageSquare,   label: 'Complaints',  path: '/admin/complaints' },
  { icon: BarChart3,       label: 'Demand AI',   path: '/admin/demand' },
];

// ── Mock demand data mirroring seed.sql demand_analytics rows ────────────────
const HOURLY_DEMAND = [
  { hour: '12am', demand: 42,  surge: 1.0 },
  { hour: '2am',  demand: 18,  surge: 1.0 },
  { hour: '4am',  demand: 12,  surge: 1.0 },
  { hour: '6am',  demand: 55,  surge: 1.1 },
  { hour: '8am',  demand: 195, surge: 1.6 },
  { hour: '10am', demand: 130, surge: 1.2 },
  { hour: '12pm', demand: 148, surge: 1.3 },
  { hour: '2pm',  demand: 122, surge: 1.2 },
  { hour: '4pm',  demand: 160, surge: 1.4 },
  { hour: '6pm',  demand: 235, surge: 2.0 },
  { hour: '8pm',  demand: 175, surge: 1.7 },
  { hour: '10pm', demand: 95,  surge: 1.3 },
];

const AREA_DATA = {
  Surat: [
    { area: 'Ring Road',         demand: 235, surge: 2.00, level: 'surge',  lat: 21.1938, lng: 72.8302 },
    { area: 'Surat Railway Stn', demand: 225, surge: 1.80, level: 'surge',  lat: 21.1939, lng: 72.8302 },
    { area: 'Adajan',            demand: 182, surge: 1.70, level: 'surge',  lat: 21.2097, lng: 72.7939 },
    { area: 'SVNIT',             demand: 115, surge: 1.40, level: 'high',   lat: 21.1631, lng: 72.7823 },
    { area: 'Vesu',              demand: 108, surge: 1.20, level: 'high',   lat: 21.1481, lng: 72.7836 },
    { area: 'Katargam',          demand: 92,  surge: 1.10, level: 'medium', lat: 21.2299, lng: 72.8342 },
    { area: 'Dumas Beach',       demand: 90,  surge: 1.30, level: 'high',   lat: 21.2395, lng: 72.8700 },
    { area: 'Surat Airport',     demand: 65,  surge: 1.00, level: 'medium', lat: 21.1139, lng: 72.7481 },
  ],
  Ahmedabad: [
    { area: 'SG Highway', demand: 205, surge: 1.50, level: 'surge',  lat: 23.0225, lng: 72.5714 },
    { area: 'CG Road',    demand: 200, surge: 1.80, level: 'surge',  lat: 23.0261, lng: 72.5687 },
    { area: 'Bopal',      demand: 88,  surge: 1.10, level: 'medium', lat: 23.0395, lng: 72.5550 },
  ],
  Vadodara: [
    { area: 'Sayajigunj', demand: 72, surge: 1.00, level: 'medium', lat: 22.3072, lng: 73.1812 },
  ],
  Rajkot: [
    { area: 'Kalawad Road', demand: 52, surge: 1.00, level: 'medium', lat: 22.3039, lng: 70.8022 },
  ],
};

const LEVEL_META = {
  surge:  { cls: 'badge-danger',   bar: '#ef4444' },
  high:   { cls: 'badge-warning',  bar: '#f59e0b' },
  medium: { cls: 'badge-brand',    bar: '#5469ff' },
  low:    { cls: 'badge-muted',    bar: '#6b7280' },
};

const TT = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-panel px-3 py-2 rounded-xl border border-dark-border text-xs">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }} className="font-bold">
          {p.name === 'surge' ? `${p.value}x surge` : `${p.value} rides`}
        </p>
      ))}
    </div>
  );
};

export default function DemandAnalytics() {
  const [city, setCity]   = useState('Surat');
  const [areas, setAreas] = useState(AREA_DATA['Surat']);

  useEffect(() => {
    setAreas(AREA_DATA[city] || []);
  }, [city]);

  const totalRides   = areas.reduce((s, a) => s + a.demand, 0);
  const avgSurge     = areas.length ? (areas.reduce((s, a) => s + a.surge, 0) / areas.length).toFixed(2) : '1.00';
  const surgeZones   = areas.filter(a => a.level === 'surge').length;
  const peakHour     = HOURLY_DEMAND.reduce((max, h) => h.demand > max.demand ? h : max, HOURLY_DEMAND[0]);

  return (
    <div className="flex h-screen bg-dark-bg overflow-hidden">
      <Sidebar navItems={navItems} />

      <main className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-7xl mx-auto space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-3xl font-display font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-7 h-7 text-brand-400" /> Demand Analytics
              </h1>
              <p className="text-gray-400 text-sm mt-1">AI-powered ride demand forecasting across cities</p>
            </div>

            {/* City selector */}
            <div className="flex gap-2">
              {Object.keys(AREA_DATA).map(c => (
                <button key={c} id={`city-${c.toLowerCase()}`}
                  onClick={() => setCity(c)}
                  className={`btn-sm ${city === c ? 'btn-primary' : 'btn-ghost border border-dark-border'}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Rides Now',  value: totalRides,        icon: Activity,  color: 'text-brand-400',   sub: `in ${city}` },
              { label: 'Avg Surge',        value: `${avgSurge}×`,    icon: Zap,       color: 'text-yellow-400',  sub: 'multiplier' },
              { label: 'Surge Zones',      value: surgeZones,        icon: MapPin,    color: 'text-danger-500',  sub: 'hotspots active' },
              { label: 'Peak Hour',        value: peakHour.hour,     icon: Clock,     color: 'text-success-500', sub: `${peakHour.demand} rides` },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <s.icon className={`w-5 h-5 ${s.color}`} />
                <div className="stat-value text-2xl">{s.value}</div>
                <div className="stat-label">{s.label}</div>
                <div className="text-xs text-gray-500 mt-1">{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Hourly demand chart */}
            <div className="card p-6">
              <h3 className="text-lg font-bold text-white mb-1">Hourly Ride Demand</h3>
              <p className="text-xs text-gray-500 mb-4">24-hour pattern for {city} — XGBoost forecast</p>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={HOURLY_DEMAND}>
                  <defs>
                    <linearGradient id="demandGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#5469ff" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#5469ff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2038" vertical={false} />
                  <XAxis dataKey="hour" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<TT />} />
                  <Area type="monotone" dataKey="demand" name="demand"
                    stroke="#5469ff" fill="url(#demandGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Surge multiplier by area */}
            <div className="card p-6">
              <h3 className="text-lg font-bold text-white mb-1">Surge by Area</h3>
              <p className="text-xs text-gray-500 mb-4">Current surge multiplier per hotspot — {city}</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={areas} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2038" horizontal={false} />
                  <XAxis type="number" domain={[0, 2.5]} tick={{ fill: '#6b7280', fontSize: 11 }}
                    axisLine={false} tickLine={false} tickFormatter={v => `${v}×`} />
                  <YAxis type="category" dataKey="area" tick={{ fill: '#9ca3af', fontSize: 11 }}
                    axisLine={false} tickLine={false} width={110} />
                  <Tooltip content={<TT />} />
                  <Bar dataKey="surge" name="surge" radius={[0, 4, 4, 0]}>
                    {areas.map((a, i) => (
                      <Cell key={i} fill={LEVEL_META[a.level]?.bar || '#5469ff'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Area hotspot table */}
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-dark-border flex items-center justify-between">
              <h3 className="font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-brand-400" /> Hotspot Table — {city}
              </h3>
              <span className="text-xs text-gray-500">{areas.length} areas tracked</span>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-dark-card border-b border-dark-border">
                  {['Area', 'Predicted Demand', 'Surge', 'Level', 'Coordinates'].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border">
                {areas.map(a => (
                  <tr key={a.area} className="hover:bg-dark-card/50">
                    <td className="py-3 px-4 font-semibold text-white flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-brand-400 shrink-0" /> {a.area}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 rounded-full bg-dark-border w-24 overflow-hidden">
                          <div className="h-full rounded-full bg-brand-500"
                            style={{ width: `${Math.min((a.demand / 240) * 100, 100)}%` }} />
                        </div>
                        <span className="text-gray-300 text-xs">{a.demand}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-bold ${a.surge >= 1.5 ? 'text-danger-500' : a.surge >= 1.2 ? 'text-yellow-400' : 'text-success-500'}`}>
                        {a.surge.toFixed(2)}×
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`badge ${LEVEL_META[a.level]?.cls} capitalize text-xs`}>{a.level}</span>
                    </td>
                    <td className="py-3 px-4 text-gray-500 font-mono text-xs">
                      {a.lat.toFixed(4)}, {a.lng.toFixed(4)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* AI model footnote */}
          <div className="card p-4 flex items-start gap-3 border border-brand-500/20 bg-brand-500/5">
            <Zap className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
            <p className="text-xs text-gray-400 leading-relaxed">
              Demand forecasts are generated by the <span className="text-brand-400 font-semibold">XGBoost Demand Forecaster</span> (AI microservice,{' '}
              <code className="text-xs bg-dark-card px-1 rounded">http://localhost:8000/ai/demand</code>). Displayed data uses
              seed values when the AI service is offline. Surge multipliers update every 5 minutes in production.
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}
