import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Car, DollarSign, User, Bell, MapPin, Clock, X, Check, ArrowRight } from 'lucide-react';
import Sidebar from '../../components/common/Sidebar';
import { driverService } from '../../services/driverService';
import { useSocket } from '../../context/SocketContext';
import toast from 'react-hot-toast';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard',    path: '/driver' },
  { icon: Bell,            label: 'Ride Requests', path: '/driver/requests' },
  { icon: Car,             label: 'Active Ride',   path: '/driver/ride' },
  { icon: DollarSign,      label: 'Earnings',      path: '/driver/earnings' },
  { icon: User,            label: 'Profile',       path: '/driver/profile' },
];

// Mock incoming requests for demo
const MOCK_REQUESTS = [
  { id: 'r1', user_name: 'Arjun Mehta', pickup: 'Vesu, Surat', drop: 'Ring Road, Surat', distance: 6.2, fare: 95, ride_type: 'cab', expires_at: Date.now() + 30000 },
  { id: 'r2', user_name: 'Priya Shah',  pickup: 'Adajan, Surat', drop: 'Althan, Surat', distance: 4.1, fare: 62, ride_type: 'auto', expires_at: Date.now() + 25000 },
];

function CountdownTimer({ expiresAt, onExpire }) {
  const [sec, setSec] = useState(Math.max(0, Math.round((expiresAt - Date.now()) / 1000)));
  useEffect(() => {
    if (sec <= 0) { onExpire(); return; }
    const t = setTimeout(() => setSec(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [sec]);
  const pct = (sec / 30) * 100;
  const color = sec > 15 ? 'text-success-500' : sec > 8 ? 'text-yellow-400' : 'text-danger-500';
  return (
    <div className="flex items-center gap-2">
      <div className="relative w-10 h-10">
        <svg className="w-10 h-10 -rotate-90">
          <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="2" className="text-dark-muted" fill="none" />
          <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="2" className={color} fill="none"
            strokeDasharray={100.5} strokeDashoffset={100.5 - (pct / 100) * 100.5} strokeLinecap="round" />
        </svg>
        <span className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${color}`}>{sec}</span>
      </div>
    </div>
  );
}

export default function RideRequests() {
  const navigate = useNavigate();
  const { on }   = useSocket();
  const [requests, setRequests] = useState(MOCK_REQUESTS);
  const [online, setOnline]     = useState(true);

  const dismiss = (id) => setRequests(r => r.filter(req => req.id !== id));

  const accept = async (req) => {
    try {
      await driverService.acceptRide(req.id);
      toast.success(`Ride accepted! Navigate to ${req.pickup}`);
      navigate('/driver/ride');
    } catch {
      // Demo: navigate anyway
      toast.success('Ride accepted! 🚗');
      navigate('/driver/ride');
    }
  };

  const reject = async (req) => {
    try { await driverService.rejectRide(req.id); }
    catch { /* demo */ }
    toast('Ride declined', { icon: '👋' });
    setTimeout(() => dismiss(req.id), 500);
  };

  return (
    <div className="flex h-screen bg-dark-bg overflow-hidden">
      <Sidebar navItems={navItems} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-display font-bold text-white">Ride Requests</h1>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${online ? 'bg-success-500/10 text-success-500 border border-success-500/20' : 'bg-dark-card text-gray-500 border border-dark-border'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${online ? 'bg-success-500 animate-pulse' : 'bg-gray-600'}`} />
              {online ? 'Online — Accepting' : 'Offline'}
            </div>
          </div>

          {!online ? (
            <div className="card p-12 text-center">
              <div className="text-4xl mb-4">🔴</div>
              <h3 className="text-white font-bold text-lg mb-2">You're Offline</h3>
              <p className="text-gray-400 text-sm mb-5">Go online from the dashboard to start receiving ride requests.</p>
              <Link to="/driver" className="btn-primary btn-md inline-flex">Go Online →</Link>
            </div>
          ) : requests.length === 0 ? (
            <div className="card p-12 text-center">
              <div className="text-5xl mb-4 animate-bounce-gentle">🚗</div>
              <h3 className="text-white font-bold text-lg mb-2">Waiting for Rides…</h3>
              <p className="text-gray-400 text-sm">Ride requests will appear here in real-time. Stay online!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map(req => (
                <div key={req.id} className="card-glow p-5 border-brand-500/30 animate-scale-in">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="text-xs text-brand-400 font-semibold mb-1">NEW RIDE REQUEST</div>
                      <h3 className="text-lg font-bold text-white">{req.user_name}</h3>
                    </div>
                    <CountdownTimer expiresAt={req.expires_at} onExpire={() => dismiss(req.id)} />
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-start gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-success-500 mt-1.5 shrink-0" />
                      <div className="text-gray-300">{req.pickup}</div>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="w-3.5 h-3.5 text-accent-500 mt-0.5 shrink-0" />
                      <div className="text-gray-300">{req.drop}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-4 text-sm">
                    <div><span className="text-gray-500">Distance:</span> <span className="font-bold text-white">{req.distance} km</span></div>
                    <div><span className="text-gray-500">Fare:</span> <span className="font-bold text-success-500">₹{req.fare}</span></div>
                    <div><span className="text-gray-500">Type:</span> <span className="font-semibold text-white capitalize">{req.ride_type}</span></div>
                  </div>

                  <div className="flex gap-3">
                    <button id={`reject-${req.id}`} onClick={() => reject(req)}
                      className="flex-1 btn-ghost btn-md border border-danger-500/30 text-danger-500 hover:bg-danger-500/10 justify-center">
                      <X className="w-4 h-4" /> Decline
                    </button>
                    <button id={`accept-${req.id}`} onClick={() => accept(req)}
                      className="flex-2 btn-primary btn-md px-8 justify-center shadow-glow">
                      <Check className="w-4 h-4" /> Accept Ride
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
