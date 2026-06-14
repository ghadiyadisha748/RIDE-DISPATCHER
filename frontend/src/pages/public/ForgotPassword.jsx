import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navigation, Mail, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { authService } from '../../services/authService';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail]     = useState('');
  const [sent, setSent]       = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async e => {
    e.preventDefault();
    if (!email) { toast.error('Please enter your email address'); return; }
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg p-4">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl" />
      </div>
      <div className="w-full max-w-md relative z-10">
        <Link to="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="w-9 h-9 rounded-xl bg-brand-gradient flex items-center justify-center shadow-brand">
            <Navigation className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-lg text-white">RIDE-DISPATCHER</span>
        </Link>

        <div className="card p-8 text-center">
          {!sent ? (
            <>
              <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mx-auto mb-5">
                <Mail className="w-8 h-8 text-brand-400" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Forgot Password?</h1>
              <p className="text-gray-400 text-sm mb-6">Enter your registered email and we'll send you a reset link.</p>
              <form id="forgot-form" onSubmit={onSubmit} className="space-y-4 text-left">
                <div>
                  <label className="label" htmlFor="forgot-email">Email Address</label>
                  <input id="forgot-email" type="email" className="input" placeholder="arjun@example.com"
                    value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <button id="forgot-submit" type="submit" disabled={loading} className="btn-primary btn-md w-full justify-center">
                  {loading ? <><span className="spinner w-4 h-4" /> Sending…</> : <>Send Reset Link <ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-success-500/20 border border-success-500/30 flex items-center justify-center mx-auto mb-5 animate-scale-in">
                <CheckCircle className="w-8 h-8 text-success-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Check Your Email</h2>
              <p className="text-gray-400 text-sm mb-6">
                We've sent a password reset link to <span className="text-white font-semibold">{email}</span>.
                Check your inbox and spam folder.
              </p>
              <button onClick={() => setSent(false)} className="btn-ghost btn-md w-full justify-center">
                Try a different email
              </button>
            </>
          )}
        </div>

        <div className="text-center mt-6">
          <Link to="/login" className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1 justify-center">
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
