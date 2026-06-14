import { useState, useEffect } from 'react';
import { LayoutDashboard, Car, DollarSign, User, Bell, Save, Camera, CheckCircle, Clock } from 'lucide-react';
import Sidebar from '../../components/common/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { driverService } from '../../services/driverService';
import toast from 'react-hot-toast';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard',    path: '/driver' },
  { icon: Bell,            label: 'Ride Requests', path: '/driver/requests' },
  { icon: Car,             label: 'Active Ride',   path: '/driver/ride' },
  { icon: DollarSign,      label: 'Earnings',      path: '/driver/earnings' },
  { icon: User,            label: 'Profile',       path: '/driver/profile' },
];

const CITIES        = ['Surat', 'Ahmedabad', 'Vadodara', 'Rajkot'];
const VEHICLE_TYPES = ['auto', 'bike', 'cab', 'premium'];

export default function DriverProfile() {
  const { user } = useAuth();
  const [form, setForm]   = useState({ name: '', phone: '', city: 'Surat', vehicle_make: '', vehicle_model: '', vehicle_color: '', plate_number: '', vehicle_type: 'cab' });
  const [saving, setSaving] = useState(false);
  const [verificationStatus, setVStatus] = useState('verified'); // pending|verified|rejected

  useEffect(() => {
    if (user) setForm(f => ({ ...f, name: user.name || '', phone: user.phone || '', city: user.city || 'Surat' }));
    const loadProfile = async () => {
      try {
        const res = await driverService.getProfile();
        const d   = res.data.data;
        setForm(f => ({ ...f, ...d, vehicle_make: d.vehicle?.make || '', vehicle_model: d.vehicle?.model || '', vehicle_color: d.vehicle?.color || '', plate_number: d.vehicle?.plate_number || '', vehicle_type: d.vehicle?.type || 'cab' }));
        setVStatus(d.verification_status || 'verified');
      } catch { /* use defaults */ }
    };
    loadProfile();
  }, [user]);

  const save = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      await driverService.updateProfile(form);
      toast.success('Profile updated!');
    } catch (err) { toast.error(err?.response?.data?.message || 'Update failed'); }
    finally { setSaving(false); }
  };

  const initials = form.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'DR';
  const STATUS_BADGE = { verified: 'badge-success', pending: 'badge-warning', rejected: 'badge-danger' };

  return (
    <div className="flex h-screen bg-dark-bg overflow-hidden">
      <Sidebar navItems={navItems} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-3xl mx-auto space-y-6">
          <h1 className="text-3xl font-display font-bold text-white">Driver Profile</h1>

          {/* Avatar + verification */}
          <div className="card p-6 flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-brand-gradient flex items-center justify-center text-3xl font-bold text-white shadow-brand">{initials}</div>
              <button className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-brand-500 text-white flex items-center justify-center"><Camera className="w-4 h-4" /></button>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{form.name || 'Driver'}</h2>
              <p className="text-gray-400 text-sm">{user?.email}</p>
              <div className="flex gap-2 mt-2">
                <span className={`badge ${STATUS_BADGE[verificationStatus] || 'badge-muted'} capitalize`}>
                  {verificationStatus === 'verified' && <CheckCircle className="w-3 h-3 mr-1" />}
                  {verificationStatus === 'pending'  && <Clock className="w-3 h-3 mr-1 animate-spin" />}
                  {verificationStatus}
                </span>
                <span className="badge badge-brand">Driver</span>
              </div>
            </div>
          </div>

          {/* Personal info */}
          <div className="card p-6">
            <h3 className="text-lg font-bold text-white mb-5">Personal Information</h3>
            <form id="driver-profile-form" onSubmit={save} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label" htmlFor="dp-name">Full Name</label>
                  <input id="dp-name" className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <label className="label" htmlFor="dp-phone">Phone</label>
                  <input id="dp-phone" className="input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Email (read-only)</label>
                  <input className="input opacity-60 cursor-not-allowed" value={user?.email || ''} readOnly />
                </div>
                <div>
                  <label className="label" htmlFor="dp-city">City</label>
                  <select id="dp-city" className="input" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))}>
                    {CITIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Vehicle info */}
              <div className="pt-4 border-t border-dark-border">
                <h4 className="text-sm font-bold text-brand-400 uppercase tracking-wider mb-4">Vehicle Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Vehicle Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      {VEHICLE_TYPES.map(v => (
                        <button key={v} type="button" onClick={() => setForm(f => ({ ...f, vehicle_type: v }))}
                          className={`py-2 rounded-xl text-sm font-semibold border transition-all ${form.vehicle_type === v ? 'bg-brand-500/20 border-brand-500 text-brand-400' : 'border-dark-border text-gray-400'}`}>
                          {v.charAt(0).toUpperCase() + v.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="label" htmlFor="dp-make">Make</label>
                      <input id="dp-make" className="input" placeholder="Maruti" value={form.vehicle_make} onChange={e => setForm(f => ({ ...f, vehicle_make: e.target.value }))} />
                    </div>
                    <div>
                      <label className="label" htmlFor="dp-model">Model</label>
                      <input id="dp-model" className="input" placeholder="Swift" value={form.vehicle_model} onChange={e => setForm(f => ({ ...f, vehicle_model: e.target.value }))} />
                    </div>
                  </div>
                  <div>
                    <label className="label" htmlFor="dp-color">Color</label>
                    <input id="dp-color" className="input" placeholder="White" value={form.vehicle_color} onChange={e => setForm(f => ({ ...f, vehicle_color: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label" htmlFor="dp-plate">Plate Number</label>
                    <input id="dp-plate" className="input" placeholder="GJ-05-AB-1234" value={form.plate_number} onChange={e => setForm(f => ({ ...f, plate_number: e.target.value }))} />
                  </div>
                </div>
              </div>

              <button id="save-driver-profile" type="submit" disabled={saving} className="btn-primary btn-md">
                {saving ? <><span className="spinner w-4 h-4" /> Saving…</> : <><Save className="w-4 h-4" /> Save Profile</>}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
