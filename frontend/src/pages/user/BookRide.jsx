import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LayoutDashboard, Car, History, Heart, User, MapPin, X, Brain, Clock, Zap, Navigation, CheckCircle, Phone } from 'lucide-react';
import Sidebar from '../../components/common/Sidebar';
import { rideService } from '../../services/rideService';
import { searchPlace, getRoute, reverseGeocode, SURAT_CENTER } from '../../services/mapService';
import { useSocket } from '../../context/SocketContext';
import toast from 'react-hot-toast';

// Fix Leaflet default marker
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const pickupIcon = new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png', shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png', iconSize:[25,41], iconAnchor:[12,41] });
const dropIcon   = new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',   shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png', iconSize:[25,41], iconAnchor:[12,41] });

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Car,             label: 'Book Ride', path: '/book' },
  { icon: History,         label: 'My Rides',  path: '/rides' },
  { icon: Heart,           label: 'Favorites', path: '/favorites' },
  { icon: User,            label: 'Profile',   path: '/profile' },
];

const RIDE_TYPES = [
  { type: 'auto',    emoji: '🛺', label: 'Auto',    base: 25, perKm: 8 },
  { type: 'bike',    emoji: '🏍️', label: 'Bike',    base: 15, perKm: 5 },
  { type: 'cab',     emoji: '🚗', label: 'Cab',     base: 40, perKm: 12 },
  { type: 'premium', emoji: '🚘', label: 'Premium', base: 80, perKm: 20 },
];

function LocationSearch({ label, value, onChange, placeholder, id }) {
  const [query, setQuery]       = useState(value?.address || '');
  const [results, setResults]   = useState([]);
  const [open, setOpen]         = useState(false);
  const debounce                = useRef(null);

  const onType = e => {
    const q = e.target.value;
    setQuery(q);
    clearTimeout(debounce.current);
    if (q.length < 3) { setResults([]); return; }
    debounce.current = setTimeout(async () => {
      const res = await searchPlace(q + ' Surat Gujarat');
      setResults(res.slice(0, 5));
      setOpen(true);
    }, 400);
  };

  const select = place => {
    setQuery(place.name.split(',').slice(0, 2).join(','));
    setResults([]);
    setOpen(false);
    onChange({ lat: place.lat, lng: place.lng, address: place.name });
  };

  return (
    <div className="relative">
      <label className="label" htmlFor={id}>{label}</label>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input id={id} value={query} onChange={onType} onFocus={() => results.length && setOpen(true)}
          className="input pl-9" placeholder={placeholder} autoComplete="off" />
        {query && <button onClick={() => { setQuery(''); onChange(null); setResults([]); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
          <X className="w-4 h-4" />
        </button>}
      </div>
      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 card border border-dark-border shadow-card overflow-hidden">
          {results.map(r => (
            <button key={r.id} onClick={() => select(r)}
              className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-dark-card hover:text-white transition-colors border-b border-dark-border last:border-0 flex items-start gap-2">
              <MapPin className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
              <span className="truncate">{r.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => { if (center) map.setView(center, 13, { animate: true }); }, [center, map]);
  return null;
}

// Mock nearby drivers for demo
const MOCK_DRIVERS = [
  { id: 'd1', lat: 21.175, lng: 72.835, name: 'Ramesh Tadvi',   rating: 4.8, type: 'auto' },
  { id: 'd2', lat: 21.165, lng: 72.825, name: 'Suresh Baraiya', rating: 4.6, type: 'cab' },
  { id: 'd3', lat: 21.180, lng: 72.828, name: 'Pratik Gamit',   rating: 4.7, type: 'cab' },
];

export default function BookRide() {
  const [searchParams] = useSearchParams();
  const { on, emit }   = useSocket();

  const [pickup,      setPickup]     = useState(null);
  const [drop,        setDrop]       = useState(null);
  const [rideType,    setRideType]   = useState(searchParams.get('type') || 'cab');
  const [route,       setRoute]      = useState(null);
  const [fareEst,     setFareEst]    = useState(null);
  const [loadingEst,  setLoadingEst] = useState(false);
  const [booking,     setBooking]    = useState(false);
  const [booked,      setBooked]     = useState(null);
  const [ridePhase,   setRidePhase]  = useState('idle'); // idle | searching | assigned | tracking

  // Recalculate route + fare when pickup/drop/type changes
  useEffect(() => {
    if (!pickup || !drop) { setRoute(null); setFareEst(null); return; }
    const calculate = async () => {
      setLoadingEst(true);
      try {
        const r = await getRoute(pickup.lat, pickup.lng, drop.lat, drop.lng);
        setRoute(r);
        try {
          const res = await rideService.estimateFare({
            pickup_lat: pickup.lat, pickup_lng: pickup.lng,
            drop_lat:   drop.lat,   drop_lng:   drop.lng,
            ride_type:  rideType,   distance_km: r.distanceKm,
          });
          setFareEst(res.data.data);
        } catch {
          // Fallback fare calc
          const t = RIDE_TYPES.find(rt => rt.type === rideType);
          const fare = Math.round(t.base + t.perKm * r.distanceKm + r.durationMin * 1.5);
          setFareEst({ estimated_fare: fare, surge_multiplier: 1.0, model_used: 'formula' });
        }
      } catch { toast.error('Could not calculate route. Try different locations.'); }
      finally { setLoadingEst(false); }
    };
    calculate();
  }, [pickup, drop, rideType]);

  const handleBook = async () => {
    if (!pickup || !drop || !fareEst) return;
    setBooking(true);
    setRidePhase('searching');
    try {
      const res = await rideService.bookRide({
        pickup_lat: pickup.lat, pickup_lng: pickup.lng, pickup_address: pickup.address,
        drop_lat:   drop.lat,   drop_lng:   drop.lng,   drop_address:   drop.address,
        ride_type:  rideType,   estimated_fare: fareEst.estimated_fare,
      });
      const ride = res.data.data;
      // Simulate driver assignment for demo
      setTimeout(() => {
        setBooked({ ...ride, driver: MOCK_DRIVERS[0], otp: Math.floor(1000 + Math.random() * 9000).toString() });
        setRidePhase('assigned');
        toast.success('Driver assigned! 🚗');
      }, 2000);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Booking failed. Please try again.');
      setRidePhase('idle');
    } finally {
      setBooking(false);
    }
  };

  const mapCenter = pickup ? [pickup.lat, pickup.lng] : [SURAT_CENTER.lat, SURAT_CENTER.lng];

  return (
    <div className="flex h-screen bg-dark-bg overflow-hidden">
      <Sidebar navItems={navItems} />
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Booking panel */}
        <div className="w-[380px] shrink-0 flex flex-col bg-dark-surface border-r border-dark-border overflow-y-auto">
          <div className="p-5 border-b border-dark-border">
            <h1 className="text-xl font-display font-bold text-white">Book a Ride</h1>
            <p className="text-xs text-gray-400 mt-1">Surat, Gujarat — AI-powered dispatch</p>
          </div>

          {ridePhase === 'idle' && (
            <div className="p-5 space-y-5 flex-1">
              <LocationSearch id="pickup-search" label="Pickup Location" value={pickup}
                onChange={setPickup} placeholder="Search pickup in Surat…" />
              <LocationSearch id="drop-search"   label="Destination"     value={drop}
                onChange={setDrop}   placeholder="Where to?" />

              {/* Ride type */}
              <div>
                <label className="label">Ride Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {RIDE_TYPES.map(rt => (
                    <button key={rt.type} id={`ride-type-${rt.type}`}
                      onClick={() => setRideType(rt.type)}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${rideType === rt.type ? 'border-brand-500 bg-brand-500/10' : 'border-dark-border hover:border-brand-500/30'}`}>
                      <span className="text-xl">{rt.emoji}</span>
                      <div className="text-sm font-bold text-white mt-1">{rt.label}</div>
                      <div className="text-xs text-gray-400">₹{rt.base}+</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Fare estimate */}
              {(loadingEst || fareEst) && (
                <div className="p-4 rounded-2xl bg-brand-500/5 border border-brand-500/20">
                  {loadingEst ? (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <span className="spinner w-4 h-4" /> Calculating AI fare…
                    </div>
                  ) : fareEst && (
                    <>
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="w-4 h-4 text-brand-400" />
                        <span className="text-xs text-brand-400 font-semibold">AI Predicted Fare</span>
                        {fareEst.surge_multiplier > 1 && (
                          <span className="badge badge-warning text-xs ml-auto">⚡ {fareEst.surge_multiplier}x Surge</span>
                        )}
                      </div>
                      <div className="text-3xl font-display font-black text-white">₹{fareEst.estimated_fare}</div>
                      {route && <div className="text-xs text-gray-400 mt-1">{route.distanceKm} km · ~{route.durationMin} min</div>}
                    </>
                  )}
                </div>
              )}

              <button id="book-ride-btn" onClick={handleBook}
                disabled={!pickup || !drop || !fareEst || booking}
                className="btn-primary btn-md w-full justify-center disabled:opacity-40 disabled:cursor-not-allowed">
                {booking ? <><span className="spinner w-4 h-4" /> Booking…</> : <><Zap className="w-4 h-4" /> Book Now — ₹{fareEst?.estimated_fare || '—'}</>}
              </button>
            </div>
          )}

          {ridePhase === 'searching' && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-20 h-20 rounded-full border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin mb-6" />
              <h3 className="text-lg font-bold text-white mb-2">Finding your driver…</h3>
              <p className="text-gray-400 text-sm">Our AI is matching the best driver for you</p>
            </div>
          )}

          {ridePhase === 'assigned' && booked && (
            <div className="p-5 space-y-4 flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
                <span className="text-sm font-bold text-success-500">Driver Assigned!</span>
              </div>

              {/* Driver card */}
              <div className="card p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-brand-gradient flex items-center justify-center text-white font-bold text-lg">
                    {booked.driver.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-base font-bold text-white">{booked.driver.name}</div>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <span className="text-yellow-400">★</span> {booked.driver.rating} · {booked.driver.type}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-dark-card text-center">
                    <div className="text-xs text-gray-500">OTP to share</div>
                    <div className="text-2xl font-mono font-black text-brand-400 tracking-wider mt-1">{booked.otp}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-dark-card text-center">
                    <div className="text-xs text-gray-500">ETA</div>
                    <div className="text-2xl font-bold text-white mt-1">~8 min</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 btn-ghost btn-md border border-dark-border justify-center">
                  <Phone className="w-4 h-4" /> Call Driver
                </button>
                <button onClick={() => { setRidePhase('idle'); setBooked(null); setPickup(null); setDrop(null); setRoute(null); setFareEst(null); }}
                  className="btn-danger btn-sm px-4">
                  Cancel
                </button>
              </div>

              <div className="p-3 rounded-xl bg-success-500/5 border border-success-500/20">
                <div className="flex items-start gap-2 text-xs text-gray-400">
                  <CheckCircle className="w-4 h-4 text-success-500 shrink-0 mt-0.5" />
                  Share the 4-digit OTP with your driver to start the ride. Keep it confidential.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Map */}
        <div className="flex-1 relative">
          <MapContainer center={mapCenter} zoom={13} className="w-full h-full" style={{ zIndex: 1 }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='© <a href="https://openstreetmap.org">OpenStreetMap</a>' />
            <MapUpdater center={mapCenter} />
            {pickup && <Marker position={[pickup.lat, pickup.lng]} icon={pickupIcon} />}
            {drop   && <Marker position={[drop.lat,   drop.lng]}   icon={dropIcon} />}
            {route?.geometry && <Polyline positions={route.geometry} color="#5469ff" weight={4} opacity={0.8} dashArray={ridePhase === 'assigned' ? undefined : '8 4'} />}
            {/* Mock driver markers */}
            {MOCK_DRIVERS.map(d => (
              <Circle key={d.id} center={[d.lat, d.lng]} radius={80} color="#5469ff" fillColor="#5469ff" fillOpacity={0.3} />
            ))}
          </MapContainer>

          {/* Map overlay info */}
          <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
            <div className="card-glass px-3 py-2 text-xs text-white flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
              {MOCK_DRIVERS.length} drivers nearby
            </div>
          </div>
        </div>
      </div>
      <button id="sos-btn" className="sos-btn">SOS</button>
    </div>
  );
}
