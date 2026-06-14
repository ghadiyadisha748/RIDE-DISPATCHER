import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LayoutDashboard, Car, DollarSign, User, Bell, Phone, CheckCircle, AlertTriangle, Navigation } from 'lucide-react';
import Sidebar from '../../components/common/Sidebar';
import { driverService } from '../../services/driverService';
import toast from 'react-hot-toast';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl:'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png', iconUrl:'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png', shadowUrl:'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png' });
const pickupIcon = new L.Icon({ iconUrl:'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png', shadowUrl:'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png', iconSize:[25,41], iconAnchor:[12,41] });
const dropIcon   = new L.Icon({ iconUrl:'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',   shadowUrl:'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png', iconSize:[25,41], iconAnchor:[12,41] });

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard',    path: '/driver' },
  { icon: Bell,            label: 'Ride Requests', path: '/driver/requests' },
  { icon: Car,             label: 'Active Ride',   path: '/driver/ride' },
  { icon: DollarSign,      label: 'Earnings',      path: '/driver/earnings' },
  { icon: User,            label: 'Profile',       path: '/driver/profile' },
];

const STEPS = ['En Route to Pickup', 'Arrived at Pickup', 'Ride in Progress', 'Completed'];
const MOCK_RIDE = {
  id: 'r1', user_name: 'Arjun Mehta', user_phone: '+91 9825000001', user_rating: 4.5,
  pickup: 'Vesu, Surat', drop: 'Ring Road, Surat', fare: 95, otp: '4821',
  pickup_coords: [21.1702, 72.8311], drop_coords: [21.180, 72.840],
};

export default function ActiveRide() {
  const [stepIdx, setStepIdx] = useState(0);
  const [ride]    = useState(MOCK_RIDE);
  const [showSOS, setShowSOS] = useState(false);

  const stepActions = ['I\'ve Arrived', 'Start Ride', 'Complete Ride', ''];

  const advanceStep = async () => {
    if (stepIdx >= 2) {
      try { await driverService.updateRideStatus(ride.id, 'completed'); }
      catch { /* demo */ }
      toast.success('Ride completed! ₹' + ride.fare + ' earned 🎉');
      setStepIdx(3);
      return;
    }
    const statuses = ['arrived', 'in_progress'];
    try { await driverService.updateRideStatus(ride.id, statuses[stepIdx]); }
    catch { /* demo */ }
    setStepIdx(s => s + 1);
  };

  return (
    <div className="flex h-screen bg-dark-bg overflow-hidden">
      <Sidebar navItems={navItems} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Status bar */}
        <div className="p-4 bg-dark-surface border-b border-dark-border">
          <div className="flex items-center gap-2 overflow-x-auto">
            {STEPS.map((s, i) => (
              <div key={s} className={`flex items-center gap-2 shrink-0 ${i < STEPS.length - 1 ? 'after:content-["→"] after:text-gray-600 after:mx-1' : ''}`}>
                <div className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${i < stepIdx ? 'bg-success-500/20 text-success-500' : i === stepIdx ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30' : 'text-gray-600'}`}>
                  {i < stepIdx ? <CheckCircle className="w-3 h-3" /> : null}
                  {s}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left: Ride info */}
          <div className="w-80 shrink-0 flex flex-col bg-dark-surface border-r border-dark-border overflow-y-auto p-5 space-y-4">
            <div className="card p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-brand-gradient flex items-center justify-center text-white font-bold">
                  {ride.user_name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-white">{ride.user_name}</div>
                  <div className="text-xs text-yellow-400">★ {ride.user_rating}</div>
                </div>
                <a href={`tel:${ride.user_phone}`} className="ml-auto btn-ghost btn-sm">
                  <Phone className="w-4 h-4" />
                </a>
              </div>
              {stepIdx === 1 && (
                <div className="p-3 rounded-xl bg-brand-500/10 border border-brand-500/20 text-center">
                  <div className="text-xs text-brand-400 mb-1">Ask for OTP</div>
                  <div className="text-3xl font-mono font-black text-white tracking-widest">{ride.otp}</div>
                </div>
              )}
            </div>

            <div className="card p-4 space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-success-500 mt-1.5 shrink-0" />
                <div className="text-gray-300">{ride.pickup}</div>
              </div>
              <div className="flex items-start gap-2">
                <Navigation className="w-3.5 h-3.5 text-accent-500 mt-0.5 shrink-0" />
                <div className="text-gray-300">{ride.drop}</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-success-500/5 border border-success-500/20 text-center">
              <div className="text-xs text-gray-400 mb-1">Ride Fare</div>
              <div className="text-3xl font-display font-black text-success-500">₹{ride.fare}</div>
            </div>

            {stepIdx < 3 && (
              <button id="step-action-btn" onClick={advanceStep}
                className="btn-primary btn-md w-full justify-center shadow-glow">
                {stepActions[stepIdx]}
              </button>
            )}

            {stepIdx === 3 && (
              <div className="text-center p-4">
                <CheckCircle className="w-12 h-12 text-success-500 mx-auto mb-2" />
                <p className="text-success-500 font-bold">Ride Completed!</p>
                <p className="text-gray-400 text-sm mt-1">₹{ride.fare} earned</p>
              </div>
            )}

            <button id="sos-driver-btn" onClick={() => setShowSOS(true)} className="sos-btn-sm w-full">
              🆘 SOS Emergency
            </button>
          </div>

          {/* Right: Map */}
          <div className="flex-1">
            <MapContainer center={ride.pickup_coords} zoom={13} className="w-full h-full" style={{ zIndex: 1 }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='© OpenStreetMap' />
              <Marker position={ride.pickup_coords} icon={pickupIcon} />
              <Marker position={ride.drop_coords}   icon={dropIcon} />
              <Polyline positions={[ride.pickup_coords, [21.174, 72.834], ride.drop_coords]} color="#5469ff" weight={4} />
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
