import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Car, DollarSign, User, Bell, TrendingUp, Star, MapPin, CheckCircle, XCircle, Clock } from 'lucide-react';
import Sidebar from '../../components/common/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { driverService } from '../../services/driverService';
import toast from 'react-hot-toast';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard',   path: '/driver' },
  { icon: Bell,            label: 'Ride Requests',path: '/driver/requests' },
  { icon: Car,             label: 'Active Ride',  path: '/driver/ride' },
  { icon: DollarSign,      label: 'Earnings',     path: '/driver/earnings' },
  { icon: User,            label: 'Profile',      path: '/driver/profile' },
];

const GRADE_COLORS = { A:'text-success-500 bg-success-500/10 border-success-500/20', B:'text-brand-400 bg-brand-500/10 border-brand-500/20', C:'text-yellow-400 bg-yellow-500/10 border-yellow-500/20', D:'text-accent-500 bg-accent-500/10 border-accent-500/20', F:'text-danger-500 bg-danger-500/10 border-danger-500/20' };

export default function DriverDashboard() {
  const { user } = useAuth();
  const [driver, setDriver]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    const load = async () => {
      try { const res = await driverService.getProfile(); setDriver(res.data.data); }
      catch { /* demo mock */ setDriver({ status: 'online', rating: 4.8, total_rides: 78, completed_rides: 76, completion_rate: 97.4, ai_performance_score: 91, performance_grade: 'A', today_earnings: 640, today_rides: 8 }); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const toggleStatus = async () => {
    if (!driver) return;
    const next = driver.status === 'online' ? 'offline' : 'online';
    setToggling(true);
    try {
      await driverService.updateStatus(next);
      setDriver(d => ({ ...d, status: next }));
      toast.success(next === 'online' ? '🟢 You are now online — accepting rides!' : '🔴 You are now offline');
    } catch { toast.error('Failed to update status'); }
    finally { setToggling(false); }
  };

  const isOnline = driver?.status === 'online';
  const grade    = driver?.performance_grade || 'A';

  return (
    <div className="flex h-screen bg-dark-bg overflow-hidden">
      <Sidebar navItems={navItems} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Welcome back,</p>
              <h1 className="text-3xl font-display font-bold text-white">{user?.name?.split(' ')[0]} 👨‍✈️</h1>
            </div>
            {/* Online/Offline toggle */}
            <button id="status-toggle" onClick={toggleStatus} disabled={toggling}
              className={`relative px-6 py-3 rounded-2xl font-bold text-sm transition-all duration-300 ${
                isOnline
                  ? 'bg-success-500/20 border-2 border-success-500 text-success-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                  : 'bg-dark-card border-2 border-dark-border text-gray-400'
              }`}>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-success-500 animate-pulse' : 'bg-gray-600'}`} />
                {toggling ? 'Updating…' : isOnline ? 'ONLINE — Accepting Rides' : 'OFFLINE — Tap to Go Online'}
              </div>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Today\'s Earnings', value: loading ? '—' : `₹${driver?.today_earnings || 0}`, icon: DollarSign, color: 'text-success-500' },
              { label: 'Today\'s Rides',   value: loading ? '—' : driver?.today_rides || 0,            icon: Car,        color: 'text-brand-400'   },
              { label: 'Rating',            value: loading ? '—' : `${driver?.rating || '—'} ★`,       icon: Star,       color: 'text-yellow-400'  },
              { label: 'Completion Rate',   value: loading ? '—' : `${driver?.completion_rate || 0}%`, icon: CheckCircle,color: 'text-teal-400'    },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <s.icon className={`w-5 h-5 ${s.color}`} />
                <div className="stat-value text-2xl">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AI Performance grade */}
            <div className="card-glow p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-brand-400" /> AI Performance Score
              </h3>
              <div className="flex items-center gap-5">
                <div className={`w-20 h-20 rounded-2xl border-2 flex items-center justify-center text-4xl font-black font-display ${GRADE_COLORS[grade] || GRADE_COLORS.B}`}>
                  {grade}
                </div>
                <div className="flex-1">
                  <div className="text-3xl font-display font-black text-white mb-1">{driver?.ai_performance_score || 91}<span className="text-lg text-gray-400">/100</span></div>
                  <div className="w-full bg-dark-muted rounded-full h-2 mb-3">
                    <div className="bg-brand-gradient h-2 rounded-full transition-all" style={{ width: `${driver?.ai_performance_score || 91}%` }} />
                  </div>
                  <div className="space-y-1 text-xs text-gray-400">
                    <div className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-success-500" /> High completion rate</div>
                    <div className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-success-500" /> Excellent customer reviews</div>
                    <div className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-success-500" /> Fast response time</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="card p-6">
              <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link to="/driver/requests" id="go-to-requests" className="sidebar-item bg-brand-500/5 border border-brand-500/20 justify-between hover:bg-brand-500/10">
                  <div className="flex items-center gap-2"><Bell className="w-5 h-5 text-brand-400" /> Ride Requests</div>
                  <span className="badge badge-brand">Live</span>
                </Link>
                <Link to="/driver/earnings" className="sidebar-item border border-dark-border justify-between">
                  <div className="flex items-center gap-2"><DollarSign className="w-5 h-5 text-success-500" /> View Earnings</div>
                  <span className="text-xs text-gray-400 font-mono">₹{driver?.today_earnings || 0} today</span>
                </Link>
                <Link to="/driver/profile" className="sidebar-item border border-dark-border justify-between">
                  <div className="flex items-center gap-2"><User className="w-5 h-5 text-gray-400" /> My Profile</div>
                  <span className="text-xs text-gray-500">Edit →</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Overall stats */}
          <div className="card p-6">
            <h3 className="text-lg font-bold text-white mb-4">All-Time Stats</h3>
            <div className="grid grid-cols-3 gap-6 text-center">
              <div><div className="text-3xl font-display font-black text-white">{driver?.total_rides || 0}</div><div className="text-xs text-gray-400 mt-1">Total Rides</div></div>
              <div><div className="text-3xl font-display font-black text-white">{driver?.completed_rides || 0}</div><div className="text-xs text-gray-400 mt-1">Completed</div></div>
              <div><div className="text-3xl font-display font-black text-white">{driver?.rating || '—'} ⭐</div><div className="text-xs text-gray-400 mt-1">Average Rating</div></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
