import { useState, useEffect } from 'react';
import { LayoutDashboard, Car, History, Heart, User, Camera, Lock, AlertTriangle, Save } from 'lucide-react';
import Sidebar from '../../components/common/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import toast from 'react-hot-toast';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Car,             label: 'Book Ride', path: '/book' },
  { icon: History,         label: 'My Rides',  path: '/rides' },
  { icon: Heart,           label: 'Favorites', path: '/favorites' },
  { icon: User,            label: 'Profile',   path: '/profile' },
];

const CITIES = ['Surat', 'Ahmedabad', 'Vadodara', 'Rajkot'];

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: '', phone: '', city: 'Surat' });
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    if (user) setForm({ name: user.name || '', phone: user.phone || '', city: user.city || 'Surat' });
  }, [user]);

  const saveProfile = async e => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Name cannot be empty'); return; }
    setSaving(true);
    try {
      const res = await userService.updateProfile(form);
      updateUser(res.data.data);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Update failed');
    } finally { setSaving(false); }
  };

  const savePassword = async e => {
    e.preventDefault();
    if (pwForm.newPw.length < 8)           { toast.error('New password must be at least 8 characters'); return; }
    if (pwForm.newPw !== pwForm.confirm)   { toast.error('Passwords do not match'); return; }
    setSavingPw(true);
    try {
      await userService.changePassword({ currentPassword: pwForm.current, newPassword: pwForm.newPw });
      toast.success('Password changed successfully!');
      setPwForm({ current: '', newPw: '', confirm: '' });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to change password');
    } finally { setSavingPw(false); }
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div className="flex h-screen bg-dark-bg overflow-hidden">
      <Sidebar navItems={navItems} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-3xl mx-auto space-y-6">
          <h1 className="text-3xl font-display font-bold text-white">My Profile</h1>

          {/* Avatar */}
          <div className="card p-6 flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-brand-gradient flex items-center justify-center text-3xl font-bold text-white shadow-brand">
                {initials}
              </div>
              <button className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-brand-500 text-white flex items-center justify-center shadow-brand hover:shadow-glow transition-shadow">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{user?.name}</h2>
              <p className="text-gray-400 text-sm">{user?.email}</p>
              <div className="flex gap-2 mt-2">
                <span className="badge badge-brand capitalize">{user?.role}</span>
                <span className="badge badge-success">Verified</span>
              </div>
            </div>
          </div>

          {/* Edit profile */}
          <div className="card p-6">
            <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2"><User className="w-5 h-5 text-brand-400" /> Personal Information</h3>
            <form id="profile-form" onSubmit={saveProfile} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label" htmlFor="profile-name">Full Name</label>
                  <input id="profile-name" className="input" value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div>
                  <label className="label" htmlFor="profile-phone">Phone</label>
                  <input id="profile-phone" className="input" value={form.phone}
                    onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} maxLength={10} />
                </div>
                <div>
                  <label className="label" htmlFor="profile-email">Email (read-only)</label>
                  <input id="profile-email" className="input opacity-60 cursor-not-allowed" value={user?.email || ''} readOnly />
                </div>
                <div>
                  <label className="label" htmlFor="profile-city">City</label>
                  <select id="profile-city" className="input" value={form.city}
                    onChange={e => setForm(p => ({ ...p, city: e.target.value }))}>
                    {CITIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <button id="save-profile" type="submit" disabled={saving} className="btn-primary btn-md">
                {saving ? <><span className="spinner w-4 h-4" /> Saving…</> : <><Save className="w-4 h-4" /> Save Changes</>}
              </button>
            </form>
          </div>

          {/* Change password */}
          <div className="card p-6">
            <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2"><Lock className="w-5 h-5 text-brand-400" /> Change Password</h3>
            <form id="password-form" onSubmit={savePassword} className="space-y-4">
              {[
                { id: 'pw-current', label: 'Current Password', key: 'current' },
                { id: 'pw-new',     label: 'New Password',     key: 'newPw'   },
                { id: 'pw-confirm', label: 'Confirm Password', key: 'confirm' },
              ].map(f => (
                <div key={f.id}>
                  <label className="label" htmlFor={f.id}>{f.label}</label>
                  <input id={f.id} type="password" className="input" placeholder="••••••••"
                    value={pwForm[f.key]} onChange={e => setPwForm(p => ({ ...p, [f.key]: e.target.value }))} />
                </div>
              ))}
              <button id="save-password" type="submit" disabled={savingPw} className="btn-primary btn-md">
                {savingPw ? <><span className="spinner w-4 h-4" /> Updating…</> : 'Update Password'}
              </button>
            </form>
          </div>

          {/* Danger zone */}
          <div className="card p-6 border-danger-500/20">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2 text-danger-500"><AlertTriangle className="w-5 h-5" /> Danger Zone</h3>
            <p className="text-gray-400 text-sm mb-4">Deactivating your account will hide your profile. You can reactivate by contacting support.</p>
            <button id="deactivate-btn" className="btn-danger btn-sm">Deactivate Account</button>
          </div>
        </div>
      </main>
    </div>
  );
}
