import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navigation, ArrowRight, ArrowLeft, User, Car, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const CITIES = ['Surat', 'Ahmedabad', 'Vadodara', 'Rajkot'];
const VEHICLE_TYPES = ['auto', 'bike', 'cab', 'premium'];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [step, setStep]       = useState(1);
  const [role, setRole]       = useState('');
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm]       = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '', city: 'Surat',
    license_number: '', vehicle_type: 'cab', vehicle_make: '', vehicle_model: '', plate_number: '',
  });

  const onChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const validate = () => {
    if (!form.name.trim())  { toast.error('Name is required'); return false; }
    if (!/\S+@\S+\.\S+/.test(form.email)) { toast.error('Invalid email address'); return false; }
    if (!/^\d{10}$/.test(form.phone))     { toast.error('Phone must be 10 digits'); return false; }
    if (form.password.length < 8)         { toast.error('Password must be at least 8 characters'); return false; }
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return false; }
    if (role === 'driver') {
      if (!form.license_number.trim()) { toast.error('License number required'); return false; }
      if (!form.plate_number.trim())   { toast.error('Vehicle plate number required'); return false; }
    }
    return true;
  };

  const onSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = { name: form.name, email: form.email, phone: form.phone, password: form.password, city: form.city, role };
      if (role === 'driver') {
        payload.license_number = form.license_number;
        payload.vehicle_type   = form.vehicle_type;
        payload.vehicle_make   = form.vehicle_make;
        payload.vehicle_model  = form.vehicle_model;
        payload.plate_number   = form.plate_number;
      }
      const user = await register(payload);
      toast.success('Account created! Welcome to RIDE-DISPATCHER 🚀');
      navigate(role === 'driver' ? '/driver' : '/dashboard');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg p-4 py-12">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-60 h-60 bg-accent-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-lg relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-brand-gradient flex items-center justify-center shadow-brand">
              <Navigation className="w-6 h-6 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-white">RIDE-DISPATCHER</span>
          </Link>
          <h1 className="text-3xl font-display font-bold text-white">Create your account</h1>
          <p className="text-gray-400 mt-2">Join thousands of riders in Gujarat</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-3 mb-8">
          {[1, 2].map(s => (
            <div key={s} className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${step >= s ? 'bg-brand-500' : 'bg-dark-muted'}`} />
          ))}
          <span className="text-xs text-gray-500 shrink-0">Step {step} of 2</span>
        </div>

        <div className="card p-8">
          {/* Step 1: Choose Role */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-2">I want to…</h2>
              <p className="text-gray-400 text-sm mb-6">Choose your role to get started</p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                  { value: 'user', icon: User, label: 'Ride as a Passenger', desc: 'Book rides, track drivers, rate trips' },
                  { value: 'driver', icon: Car, label: 'Drive & Earn', desc: 'Accept rides, earn daily income' },
                ].map(r => (
                  <button key={r.value} id={`role-${r.value}`} onClick={() => setRole(r.value)}
                    className={`p-5 rounded-2xl border-2 text-left transition-all duration-200 group ${
                      role === r.value
                        ? 'border-brand-500 bg-brand-500/10 shadow-brand'
                        : 'border-dark-border hover:border-brand-500/40 bg-dark-card'
                    }`}>
                    <r.icon className={`w-7 h-7 mb-3 ${role === r.value ? 'text-brand-400' : 'text-gray-500 group-hover:text-brand-400'} transition-colors`} />
                    <div className="font-bold text-white text-sm mb-1">{r.label}</div>
                    <div className="text-xs text-gray-400">{r.desc}</div>
                    {role === r.value && <CheckCircle className="w-4 h-4 text-brand-400 mt-2" />}
                  </button>
                ))}
              </div>
              <button id="next-step" disabled={!role}
                onClick={() => setStep(2)}
                className="btn-primary btn-md w-full justify-center disabled:opacity-40 disabled:cursor-not-allowed">
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Step 2: Fill Form */}
          {step === 2 && (
            <form id="register-form" onSubmit={onSubmit} className="space-y-4">
              <button type="button" onClick={() => setStep(1)} className="btn-ghost btn-sm -ml-2 mb-2">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <h2 className="text-xl font-bold text-white mb-4">
                {role === 'driver' ? '🚗 Driver Registration' : '👤 Rider Registration'}
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="label" htmlFor="reg-name">Full Name</label>
                  <input id="reg-name" name="name" className="input" placeholder="Arjun Mehta" value={form.name} onChange={onChange} />
                </div>
                <div>
                  <label className="label" htmlFor="reg-email">Email</label>
                  <input id="reg-email" name="email" type="email" className="input" placeholder="arjun@example.com" value={form.email} onChange={onChange} />
                </div>
                <div>
                  <label className="label" htmlFor="reg-phone">Phone (10 digits)</label>
                  <input id="reg-phone" name="phone" className="input" placeholder="9825000001" value={form.phone} onChange={onChange} maxLength={10} />
                </div>
                <div>
                  <label className="label" htmlFor="reg-city">City</label>
                  <select id="reg-city" name="city" className="input" value={form.city} onChange={onChange}>
                    {CITIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="relative">
                  <label className="label" htmlFor="reg-password">Password</label>
                  <div className="relative">
                    <input id="reg-password" name="password" type={showPw ? 'text' : 'password'}
                      className="input pr-10" placeholder="Min. 8 characters" value={form.password} onChange={onChange} />
                    <button type="button" onClick={() => setShowPw(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="label" htmlFor="reg-confirm">Confirm Password</label>
                  <input id="reg-confirm" name="confirmPassword" type="password"
                    className="input" placeholder="Repeat password" value={form.confirmPassword} onChange={onChange} />
                </div>
              </div>

              {/* Driver-only fields */}
              {role === 'driver' && (
                <div className="space-y-4 pt-4 border-t border-dark-border">
                  <p className="text-xs font-semibold text-brand-400 uppercase tracking-wider">Vehicle & License Info</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="label" htmlFor="reg-license">License Number</label>
                      <input id="reg-license" name="license_number" className="input" placeholder="GJ05 2021 003890" value={form.license_number} onChange={onChange} />
                    </div>
                    <div className="col-span-2">
                      <label className="label">Vehicle Type</label>
                      <div className="grid grid-cols-4 gap-2">
                        {VEHICLE_TYPES.map(v => (
                          <button key={v} type="button" onClick={() => setForm(p => ({ ...p, vehicle_type: v }))}
                            className={`py-2 rounded-xl text-sm font-semibold border transition-all ${form.vehicle_type === v ? 'bg-brand-500/20 border-brand-500 text-brand-400' : 'border-dark-border text-gray-400 hover:border-brand-500/30'}`}>
                            {v.charAt(0).toUpperCase() + v.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="label" htmlFor="reg-make">Make</label>
                      <input id="reg-make" name="vehicle_make" className="input" placeholder="Maruti" value={form.vehicle_make} onChange={onChange} />
                    </div>
                    <div>
                      <label className="label" htmlFor="reg-model">Model</label>
                      <input id="reg-model" name="vehicle_model" className="input" placeholder="Swift" value={form.vehicle_model} onChange={onChange} />
                    </div>
                    <div className="col-span-2">
                      <label className="label" htmlFor="reg-plate">Plate Number</label>
                      <input id="reg-plate" name="plate_number" className="input" placeholder="GJ-05-AB-1234" value={form.plate_number} onChange={onChange} />
                    </div>
                  </div>
                </div>
              )}

              <button id="register-submit" type="submit" disabled={loading}
                className="btn-primary btn-md w-full justify-center mt-4">
                {loading ? <><span className="spinner w-4 h-4" /> Creating account…</> : <>Create Account <ArrowRight className="w-4 h-4" /></>}
              </button>

              <p className="text-center text-xs text-gray-500">
                By signing up you agree to our{' '}
                <a href="#" className="text-brand-400">Terms of Service</a> and{' '}
                <a href="#" className="text-brand-400">Privacy Policy</a>.
              </p>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account? <Link to="/login" className="text-brand-400 hover:text-brand-300 font-semibold">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
