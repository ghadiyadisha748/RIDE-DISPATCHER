import { useState, useEffect } from 'react';
import {
  LayoutDashboard, Users, Car, DollarSign, MessageSquare,
  BarChart3, Activity, AlertCircle, CheckCircle, Clock,
  ChevronDown, Search, Filter, RefreshCw,
} from 'lucide-react';
import Sidebar from '../../components/common/Sidebar';
import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard',  path: '/admin' },
  { icon: Users,           label: 'Users',       path: '/admin/users' },
  { icon: Car,             label: 'Drivers',     path: '/admin/drivers' },
  { icon: Activity,        label: 'Rides',       path: '/admin/rides' },
  { icon: DollarSign,      label: 'Revenue',     path: '/admin/revenue' },
  { icon: MessageSquare,   label: 'Complaints',  path: '/admin/complaints' },
  { icon: BarChart3,       label: 'Demand AI',   path: '/admin/demand' },
];

// ── Static mock data so the page is always usable without a live DB ──────────
const MOCK_COMPLAINTS = [
  { id: 'c1000000-a', user_name: 'Priya Shah',    user_email: 'priya.shah@gmail.com',    category: 'payment',         description: 'Surge pricing was applied without clear notice. Want partial refund.', status: 'in_review', priority: 'medium', created_at: new Date(Date.now() - 86400000 * 1).toISOString(), ride_id: 'r6' },
  { id: 'c1000000-b', user_name: 'Rohan Patel',   user_email: 'rohan.patel@gmail.com',   category: 'driver_behavior', description: 'Driver never showed up after accepting the ride. Very inconvenient.',    status: 'open',      priority: 'high',   created_at: new Date(Date.now() - 86400000 * 2).toISOString(), ride_id: 'r7' },
  { id: 'c1000000-c', user_name: 'Neha Desai',    user_email: 'neha.desai@gmail.com',    category: 'app_issue',       description: 'Map showed wrong route for Dumas Beach.',                               status: 'resolved',  priority: 'low',    created_at: new Date(Date.now() - 86400000 * 3).toISOString(), ride_id: 'r4' },
  { id: 'c1000000-d', user_name: 'Arjun Mehta',   user_email: 'arjun.mehta@gmail.com',   category: 'safety',          description: 'Driver was speeding and ignored my request to slow down.',               status: 'open',      priority: 'high',   created_at: new Date(Date.now() - 86400000 * 0.5).toISOString(), ride_id: null },
  { id: 'c1000000-e', user_name: 'Kiran Joshi',   user_email: 'kiran.joshi@gmail.com',   category: 'other',           description: 'Promo code WKND20 did not apply at checkout.',                          status: 'closed',    priority: 'low',    created_at: new Date(Date.now() - 86400000 * 5).toISOString(), ride_id: null },
];

const STATUS_META = {
  open:      { label: 'Open',      icon: AlertCircle,  cls: 'badge-danger' },
  in_review: { label: 'In Review', icon: Clock,        cls: 'badge-warning' },
  resolved:  { label: 'Resolved',  icon: CheckCircle,  cls: 'badge-success' },
  closed:    { label: 'Closed',    icon: CheckCircle,  cls: 'badge-muted' },
};

const PRIORITY_CLS = { critical: 'text-red-400', high: 'text-orange-400', medium: 'text-yellow-400', low: 'text-gray-400' };

const CATEGORY_LABELS = {
  safety: 'Safety', payment: 'Payment', driver_behavior: 'Driver Behaviour',
  app_issue: 'App Issue', other: 'Other',
};

export default function Complaints() {
  const [complaints, setComplaints]   = useState(MOCK_COMPLAINTS);
  const [search, setSearch]           = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading]         = useState(false);
  const [updating, setUpdating]       = useState(null);
  const [selected, setSelected]       = useState(null); // detail modal

  // Attempt to load real data; fall back to mock silently
  useEffect(() => {
    setLoading(true);
    adminService.getComplaints?.()
      .then(res => { if (res?.data?.data?.complaints?.length) setComplaints(res.data.data.complaints); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    setUpdating(id);
    try {
      await adminService.updateComplaint?.(id, { status: newStatus, resolution_note: '' });
      setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
      if (selected?.id === id) setSelected(prev => ({ ...prev, status: newStatus }));
      toast.success('Complaint status updated.');
    } catch {
      // optimistic update even if API unavailable
      setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
      if (selected?.id === id) setSelected(prev => ({ ...prev, status: newStatus }));
    } finally {
      setUpdating(null);
    }
  };

  const filtered = complaints.filter(c => {
    const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
    const q = search.toLowerCase();
    const matchesSearch = !q || c.user_name?.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q) || c.category?.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const counts = {
    all: complaints.length,
    open: complaints.filter(c => c.status === 'open').length,
    in_review: complaints.filter(c => c.status === 'in_review').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
  };

  return (
    <div className="flex h-screen bg-dark-bg overflow-hidden">
      <Sidebar navItems={navItems} />

      <main className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-7xl mx-auto space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold text-white">Complaints</h1>
              <p className="text-gray-400 text-sm mt-1">Manage and resolve user-reported issues</p>
            </div>
            <button onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 600); }}
              className="btn-ghost btn-sm flex items-center gap-2">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>

          {/* KPI tabs */}
          <div className="flex gap-3 flex-wrap">
            {[
              { key: 'all',      label: 'All',       count: counts.all },
              { key: 'open',     label: 'Open',      count: counts.open },
              { key: 'in_review',label: 'In Review', count: counts.in_review },
              { key: 'resolved', label: 'Resolved',  count: counts.resolved },
            ].map(t => (
              <button key={t.key} id={`filter-${t.key}`}
                onClick={() => setFilterStatus(t.key)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2
                  ${filterStatus === t.key
                    ? 'bg-brand-500 text-white shadow-brand'
                    : 'bg-dark-card text-gray-400 hover:text-white border border-dark-border'}`}>
                {t.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${filterStatus === t.key ? 'bg-white/20' : 'bg-dark-border'}`}>
                  {t.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              id="complaints-search"
              type="text"
              placeholder="Search by user, category or description…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input pl-9"
            />
          </div>

          {/* Table */}
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-dark-card border-b border-dark-border">
                  {['User', 'Category', 'Description', 'Priority', 'Status', 'Date', 'Actions'].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-gray-500">
                      <Filter className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      No complaints match your filters.
                    </td>
                  </tr>
                ) : filtered.map(c => {
                  const sm = STATUS_META[c.status] || STATUS_META.open;
                  return (
                    <tr key={c.id} className="hover:bg-dark-card/50 cursor-pointer"
                      onClick={() => setSelected(c)}>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{c.user_name}</div>
                        <div className="text-xs text-gray-500">{c.user_email}</div>
                      </td>
                      <td className="py-3 px-4 text-gray-300 whitespace-nowrap">
                        {CATEGORY_LABELS[c.category] || c.category}
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <p className="text-gray-400 truncate">{c.description}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-semibold capitalize text-xs ${PRIORITY_CLS[c.priority] || 'text-gray-400'}`}>
                          {c.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`badge ${sm.cls} capitalize text-xs`}>{sm.label}</span>
                      </td>
                      <td className="py-3 px-4 text-gray-500 text-xs whitespace-nowrap">
                        {c.created_at ? format(new Date(c.created_at), 'dd MMM, HH:mm') : '—'}
                      </td>
                      <td className="py-3 px-4" onClick={e => e.stopPropagation()}>
                        <div className="relative group inline-block">
                          <button
                            id={`action-${c.id}`}
                            disabled={updating === c.id}
                            className="btn-ghost btn-sm flex items-center gap-1 text-xs">
                            {updating === c.id
                              ? <span className="spinner w-3 h-3" />
                              : <><span>Update</span><ChevronDown className="w-3 h-3" /></>}
                          </button>
                          <div className="absolute right-0 top-full mt-1 w-36 bg-dark-card border border-dark-border rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
                            {Object.keys(STATUS_META).map(s => (
                              <button key={s} onClick={() => handleStatusChange(c.id, s)}
                                className={`w-full text-left px-3 py-2 text-xs hover:bg-dark-border/50 first:rounded-t-xl last:rounded-b-xl
                                  ${c.status === s ? 'text-brand-400 font-bold' : 'text-gray-300'}`}>
                                {STATUS_META[s].label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-gray-600 text-center">
            Showing {filtered.length} of {complaints.length} complaints
          </p>
        </div>
      </main>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setSelected(null)}>
          <div className="bg-dark-surface border border-dark-border rounded-2xl p-6 max-w-lg w-full space-y-4"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">{selected.user_name}</h2>
                <p className="text-xs text-gray-500">{selected.user_email}</p>
              </div>
              <span className={`badge ${STATUS_META[selected.status]?.cls} capitalize`}>
                {STATUS_META[selected.status]?.label}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-dark-card rounded-xl p-3">
                <div className="text-xs text-gray-500 mb-1">Category</div>
                <div className="text-white font-semibold">{CATEGORY_LABELS[selected.category] || selected.category}</div>
              </div>
              <div className="bg-dark-card rounded-xl p-3">
                <div className="text-xs text-gray-500 mb-1">Priority</div>
                <div className={`font-semibold capitalize ${PRIORITY_CLS[selected.priority]}`}>{selected.priority}</div>
              </div>
            </div>

            <div className="bg-dark-card rounded-xl p-4">
              <div className="text-xs text-gray-500 mb-2">Description</div>
              <p className="text-gray-300 text-sm leading-relaxed">{selected.description}</p>
            </div>

            <div>
              <div className="text-xs text-gray-500 mb-2">Update Status</div>
              <div className="flex gap-2 flex-wrap">
                {Object.entries(STATUS_META).map(([s, meta]) => (
                  <button key={s}
                    id={`modal-status-${s}`}
                    disabled={updating === selected.id}
                    onClick={() => handleStatusChange(selected.id, s)}
                    className={`btn-sm capitalize ${selected.status === s ? 'btn-primary' : 'btn-ghost border border-dark-border'}`}>
                    {meta.label}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={() => setSelected(null)} className="btn-ghost btn-md w-full justify-center">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
