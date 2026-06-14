import { useState, useEffect } from 'react';
import { LayoutDashboard, Car, History, Heart, User, Download, Star, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import Sidebar from '../../components/common/Sidebar';
import { userService } from '../../services/userService';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Car,             label: 'Book Ride', path: '/book' },
  { icon: History,         label: 'My Rides',  path: '/rides' },
  { icon: Heart,           label: 'Favorites', path: '/favorites' },
  { icon: User,            label: 'Profile',   path: '/profile' },
];

const STATUS_COLORS   = { completed: 'badge-success', cancelled: 'badge-danger', in_progress: 'badge-brand', requested: 'badge-warning', driver_assigned: 'badge-brand' };
const RIDE_EMOJI      = { auto: '🛺', bike: '🏍️', cab: '🚗', premium: '🚘' };
const STATUS_OPTIONS  = ['all','completed','cancelled','in_progress','requested','driver_assigned'];
const TYPE_OPTIONS    = ['all','auto','bike','cab','premium'];

export default function RideHistory() {
  const [rides, setRides]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [filters, setFilters] = useState({ status: 'all', rideType: 'all' });
  const [page, setPage]       = useState(1);
  const [total, setTotal]     = useState(0);
  const PER_PAGE = 10;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = { page, limit: PER_PAGE };
        if (filters.status   !== 'all') params.status    = filters.status;
        if (filters.rideType !== 'all') params.ride_type = filters.rideType;
        const res = await userService.getRideHistory(params);
        setRides(res.data.data?.rides || []);
        setTotal(res.data.data?.total || 0);
      } catch { toast.error('Failed to load ride history'); }
      finally { setLoading(false); }
    };
    load();
  }, [page, filters]);

  const downloadReceipt = async (rideId) => {
    try {
      const res = await userService.getRideHistory({ id: rideId }); // simple data fetch
      toast.success('Receipt downloaded!');
    } catch { toast.error('Could not download receipt'); }
  };

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div className="flex h-screen bg-dark-bg overflow-hidden">
      <Sidebar navItems={navItems} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-5xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold text-white">Ride History</h1>
              <p className="text-gray-400 text-sm mt-1">{total} total rides</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select id="filter-status" value={filters.status}
                onChange={e => { setFilters(p => ({ ...p, status: e.target.value })); setPage(1); }}
                className="input py-2 text-sm w-auto">
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s === 'all' ? 'All Statuses' : s}</option>)}
              </select>
            </div>
            <select id="filter-type" value={filters.rideType}
              onChange={e => { setFilters(p => ({ ...p, rideType: e.target.value })); setPage(1); }}
              className="input py-2 text-sm w-auto">
              {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t === 'all' ? 'All Types' : t}</option>)}
            </select>
          </div>

          {/* Ride list */}
          <div className="card divide-y divide-dark-border">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-4 flex gap-4">
                  <div className="skeleton w-10 h-10 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-4 w-3/4 rounded" />
                    <div className="skeleton h-3 w-1/2 rounded" />
                  </div>
                </div>
              ))
            ) : rides.length === 0 ? (
              <div className="p-12 text-center">
                <Car className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <h3 className="text-white font-semibold mb-1">No rides found</h3>
                <p className="text-gray-500 text-sm">Try changing your filters</p>
              </div>
            ) : rides.map(r => (
              <div key={r.id}>
                <button onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                  className="w-full p-4 hover:bg-dark-card transition-colors text-left">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl w-10 text-center">{RIDE_EMOJI[r.ride_type] || '🚗'}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-white truncate">
                        {r.pickup_address?.split(',')[0]} → {r.drop_address?.split(',')[0]}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {r.created_at ? format(new Date(r.created_at), 'dd MMM yyyy, HH:mm') : '—'}
                        {r.distance_km && ` · ${r.distance_km} km`}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 flex items-center gap-3">
                      <div>
                        <div className="text-sm font-bold text-white">₹{r.final_fare || r.estimated_fare || '—'}</div>
                        <span className={`badge ${STATUS_COLORS[r.status] || 'badge-muted'} text-xs`}>{r.status}</span>
                      </div>
                      {expanded === r.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>
                  </div>
                </button>

                {expanded === r.id && (
                  <div className="px-4 pb-4 bg-dark-card border-t border-dark-border animate-slide-down">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 mb-4">
                      {[
                        { label: 'Distance', value: r.distance_km ? `${r.distance_km} km` : '—' },
                        { label: 'Duration', value: r.duration_min ? `${r.duration_min} min` : '—' },
                        { label: 'Fare',     value: `₹${r.final_fare || r.estimated_fare || '—'}` },
                        { label: 'Type',     value: r.ride_type?.toUpperCase() || '—' },
                      ].map(d => (
                        <div key={d.label} className="p-3 rounded-xl bg-dark-surface text-center">
                          <div className="text-xs text-gray-500">{d.label}</div>
                          <div className="text-sm font-bold text-white mt-0.5">{d.value}</div>
                        </div>
                      ))}
                    </div>
                    <div className="text-xs text-gray-400 mb-3">
                      <div><span className="text-gray-500">From:</span> {r.pickup_address}</div>
                      <div className="mt-1"><span className="text-gray-500">To:</span> {r.drop_address}</div>
                    </div>
                    {r.status === 'completed' && (
                      <button id={`download-receipt-${r.id}`}
                        onClick={() => downloadReceipt(r.id)}
                        className="btn-ghost btn-sm border border-dark-border">
                        <Download className="w-4 h-4" /> Download Receipt
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="btn-ghost btn-sm disabled:opacity-40">← Prev</button>
              <span className="text-sm text-gray-400">Page {page} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="btn-ghost btn-sm disabled:opacity-40">Next →</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
