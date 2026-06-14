import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navigation, Eye, EyeOff, ArrowRight, Shield, Zap, Star, Brain } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate   = useNavigate();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);

  const onChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = async e => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error('Please fill in all fields'); return; }
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      const routes = { admin: '/admin', driver: '/driver', user: '/dashboard' };
      navigate(routes[user.role] || '/dashboard');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-dark-bg">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-hero-gradient flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-brand-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-60 h-60 bg-accent-500/10 rounded-full blur-3xl" />
        </div>
        <Link to="/" className="flex items-center gap-2 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-brand-gradient flex items-center justify-center shadow-brand">
            <Navigation className="w-6 h-6 text-white" />
          </div>
          <span className="font-display font-bold text-xl text-white">RIDE-DISPATCHER</span>
        </Link>

        <div className="relative z-10">
          <h1 className="text-5xl font-display font-black text-white leading-tight mb-6">
            Smart Rides,<br /><span className="text-gradient">AI-Powered</span>
          </h1>
          <p className="text-gray-400 text-lg mb-10 leading-relaxed">
            Join thousands of riders across Surat, Ahmedabad, Vadodara, and Rajkot experiencing the future of urban mobility.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[{ icon: Brain, label: '6 AI Models', sub: 'Fare, dispatch & fraud' },
              { icon: Shield, label: 'Secure', sub: 'JWT + bcrypt auth' },
              { icon: Zap, label: 'Real-time', sub: 'Live tracking' },
              { icon: Star, label: '4.8 Rating', sub: 'Verified reviews' }
            ].map(i => (
              <div key={i.label} className="glass-panel p-4 rounded-2xl border border-white/10">
                <i.icon className="w-5 h-5 text-brand-400 mb-2" />
                <div className="text-sm font-bold text-white">{i.label}</div>
                <div className="text-xs text-gray-500">{i.sub}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs text-gray-600 relative z-10">
          Built by Disha Ghadiya · Anshika Badala · Shruti Babariya — Surat, Gujarat
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-brand-gradient flex items-center justify-center">
              <Navigation className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-lg text-white">RIDE-DISPATCHER</span>
          </div>

          <h2 className="text-3xl font-display font-bold text-white mb-2">Welcome back</h2>
          <p className="text-gray-400 mb-8">Sign in to your account to continue</p>

          <form id="login-form" onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="label" htmlFor="login-email">Email Address</label>
              <input id="login-email" name="email" type="email" className="input"
                placeholder="arjun@example.com" value={form.email} onChange={onChange} autoComplete="email" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label mb-0" htmlFor="login-password">Password</label>
                <Link to="/forgot-password" className="text-xs text-brand-400 hover:text-brand-300">Forgot password?</Link>
              </div>
              <div className="relative">
                <input id="login-password" name="password" type={showPw ? 'text' : 'password'}
                  className="input pr-10" placeholder="••••••••"
                  value={form.password} onChange={onChange} autoComplete="current-password" />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button id="login-submit" type="submit" disabled={loading}
              className="btn-primary btn-md w-full justify-center">
              {loading ? <><span className="spinner w-4 h-4" /> Signing in…</> : <>Sign In <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="divider my-6">or</div>

          <button disabled className="btn-secondary btn-md w-full justify-center opacity-50 cursor-not-allowed">
            <span className="text-lg">G</span> Continue with Google — Coming Soon
          </button>

          <p className="text-center text-sm text-gray-500 mt-8">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-400 hover:text-brand-300 font-semibold">Create one free</Link>
          </p>

          {/* Demo creds */}
          <div className="mt-6 p-4 rounded-xl bg-brand-500/5 border border-brand-500/10">
            <p className="text-xs font-semibold text-brand-400 mb-2">🔑 Demo Credentials</p>
            <div className="space-y-1 text-xs text-gray-500">
              <div>Admin: <span className="text-gray-300">disha@ridedispatcher.in</span></div>
              <div>Rider: <span className="text-gray-300">arjun.mehta@gmail.com</span></div>
              <div>Driver: <span className="text-gray-300">ramesh.tadvi@gmail.com</span></div>
              <div>All passwords: <span className="text-gray-300">Password@123</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
