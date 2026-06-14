import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Car, History, Heart, User, MapPin, Clock, Star, TrendingUp, AlertCircle, ArrowRight, Zap } from 'lucide-react';
import Sidebar from '../../components/common/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import { format } from 'date-fns';

const STATUS_COLORS = { completed: 'badge-success', cancelled: 'badge-danger', in_progress: 'badge-brand', requested: 'badge-warning', driver_assigned: 'badge-brand' };
const RIDE_ICONS = { auto: '🛺', bike: '🏍️', cab: '🚗', premium: '🚘' };

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard',  path: '/dashboard' },
  { icon: Car,             label: 'Book Ride',  path: '/book' },
  { icon: History,         label: 'My Rides',   path: '/rides' },
  { icon: Heart,           label: 'Favorites',  path: '/favorites' },
  { icon: User,            label: 'Profile',    path: '/profile' },
];

const QUICK_RIDE_TYPES = [
  { type: 'auto',    icon: '🛺', label: 'Auto',    price: '₹25+', color: 'border-yellow-500/30 hover:border-yellow-500' },
  { type: 'bike',    icon: '🏍️', label: 'Bike',    price: '₹15+', color: 'border-green-500/30 hover:border-green-500' },
  { type: 'cab',     icon: '🚗', label: 'Cab',     price: '₹40+', color: 'border-brand-500/30 hover:border-brand-500' },
  { type: 'premium', icon: '🚘', label: 'Premium', price: '₹80+', color: 'border-purple-500/30 hover:border-purple-500' },
];

export default function UserDashboard() {
  const { user } = useAuth();
  const [rides, setRides]         = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading]     = useState(true);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    const load = async () => {
      try {
        const [rRes, fRes] = await Promise.all([
          userService.getRideHistory({ limit: 5 }),
          userService.getFavorites(),
        ]);
        setRides(rRes.data.data?.rides || []);
        setFavorites(fRes.data.data || []);
      } catch { /* use empty state */ }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const activeRide = rides.find(r => ['requested','driver_assigned','en_route','in_progress'].includes(r.status));
  const totalSpent = rides.filter(r => r.status === 'completed').reduce((s, r) => s + (r.final_fare || 0), 0);

  return (
    <div className="flex h-screen bg-dark-bg overflow-hidden">
      <Sidebar navItems={navItems} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">{greeting},</p>
              <h1 className="text-3xl font-display font-bold text-white">{user?.name?.split(' ')[0]} 👋</h1>
            </div>
            <Link to="/book" className="btn-primary btn-md">
              <Zap className="w-4 h-4" /> Book a Ride
            </Link>
          </div>

          {/* Active ride alert */}
          {activeRide && (
            <div className="card-glow p-5 border-brand-500/40 bg-brand-500/5 flex items-center justify-between animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                <div>
                  <div className="text-sm font-bold text-white">Ride in Progress</div>
                  <div className="text-xs text-gray-400">{activeRide.pickup_address} → {activeRide.drop_address}</div>
                </div>
              </div>
              <Link to="/book" className="btn-primary btn-sm">Track Live <ArrowRight className="w-3 h-3" /></Link>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Rides',  value: rides.length, icon: Car,         color: 'text-brand-400'   },
              { label: 'Total Spent',  value: `₹${totalSpent.toFixed(0)}`, icon: TrendingUp, color: 'text-success-500' },
              { label: 'Avg Rating',   value: '4.8 ⭐',     icon: Star,        color: 'text-yellow-400'  },
              { label: 'City',         value: user?.city || 'Surat', icon: MapPin, color: 'text-accent-400' },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <s.icon className={`w-5 h-5 ${s.color}`} />
                <div className="stat-value text-2xl">{loading ? '—' : s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Quick book */}
          <div>
            <h2 className="text-lg font-bold text-white mb-3">Quick Book</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {QUICK_RIDE_TYPES.map(r => (
                <Link key={r.type} to={`/book?type=${r.type}`} id={`quick-book-${r.type}`}
                  className={`card p-4 text-center border-2 ${r.color} transition-all duration-200 hover:-translate-y-1 group`}>
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{r.icon}</div>
                  <div className="text-sm font-bold text-white">{r.label}</div>
                  <div className="text-xs text-gray-400">{r.price}</div>
                </Link>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent rides */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-white">Recent Rides</h2>
                <Link to="/rides" className="text-sm text-brand-400 hover:text-brand-300">View all →</Link>
              </div>
              <div className="card divide-y divide-dark-border">
                {loading ? (
                  <div className="p-8 text-center text-gray-500">Loading rides…</div>
                ) : rides.length === 0 ? (
                  <div className="p-8 text-center">
                    <Car className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No rides yet. Book your first ride!</p>
                    <Link to="/book" className="btn-primary btn-sm mt-3 inline-flex">Book Now</Link>
                  </div>
                ) : rides.slice(0, 4).map(r => (
                  <div key={r.id} className="p-4 hover:bg-dark-card transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{RIDE_ICONS[r.ride_type] || '🚗'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-white truncate">{r.pickup_address} → {r.drop_address}</div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {r.created_at ? format(new Date(r.created_at), 'dd MMM yyyy, HH:mm') : ''}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-bold text-white">₹{r.final_fare || r.estimated_fare || '—'}</div>
                        <span className={`badge ${STATUS_COLORS[r.status] || 'badge-muted'} text-xs mt-1`}>{r.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Saved places */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-white">Saved Places</h2>
                <Link to="/favorites" className="text-sm text-brand-400">Manage →</Link>
              </div>
              <div className="card divide-y divide-dark-border">
                {favorites.length === 0 ? (
                  <div className="p-5 text-center">
                    <Heart className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-500 text-xs">No saved places yet</p>
                    <Link to="/favorites" className="text-xs text-brand-400 mt-1 inline-block">Add one →</Link>
                  </div>
                ) : favorites.map(f => (
                  <div key={f.id} className="p-4 hover:bg-dark-card cursor-pointer transition-colors group">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{f.label === 'home' ? '🏠' : f.label === 'work' ? '💼' : '📍'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-white capitalize">{f.label}</div>
                        <div className="text-xs text-gray-400 truncate">{f.address}</div>
                      </div>
                      <Link to={`/book?dest=${encodeURIComponent(f.address)}&dlat=${f.lat}&dlng=${f.lng}`}
                        className="btn-ghost btn-sm opacity-0 group-hover:opacity-100 transition-opacity text-xs">
                        Book →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* SOS */}
      <button id="sos-btn" className="sos-btn" title="SOS Emergency">SOS</button>
    </div>
  );
}
