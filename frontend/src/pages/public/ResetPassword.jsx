import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Navigation, Lock, Eye, EyeOff, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { authService } from '../../services/authService';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const { token }     = useParams();
  const navigate      = useNavigate();
  const [form, setForm]       = useState({ password: '', confirm: '' });
  const [showPw, setShowPw]   = useState(false);
  const [showCf, setShowCf]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);
  const [error, setError]     = useState('');

  const onChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const validate = () => {
    if (!form.password || !form.confirm) return 'Please fill in both fields.';
    if (form.password.length < 8)        return 'Password must be at least 8 characters.';
    if (!/[A-Z]/.test(form.password))    return 'Password must contain at least one uppercase letter.';
    if (!/[0-9]/.test(form.password))    return 'Password must contain at least one number.';
    if (form.password !== form.confirm)  return 'Passwords do not match.';
    return null;
  };

  const onSubmit = async e => {
    e.preventDefault();
    setError('');
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    if (!token) { setError('Reset token is missing from the URL. Please use the link from your email.'); return; }

    setLoading(true);
    try {
      await authService.resetPassword({ token, password: form.password });
      setDone(true);
      toast.success('Password reset successful!');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Reset link is invalid or has expired.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg p-4">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-56 h-56 bg-accent-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="w-9 h-9 rounded-xl bg-brand-gradient flex items-center justify-center shadow-brand">
            <Navigation className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-lg text-white">RIDE-DISPATCHER</span>
        </Link>

        <div className="card p-8">
          {!done ? (
            <>
              {/* Icon */}
              <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mx-auto mb-5">
                <Lock className="w-8 h-8 text-brand-400" />
              </div>

              <h1 className="text-2xl font-bold text-white text-center mb-1">Set New Password</h1>
              <p className="text-gray-400 text-sm text-center mb-6">
                Choose a strong password for your account.
              </p>

              {/* Error banner */}
              {error && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-danger-500/10 border border-danger-500/20 mb-5">
                  <AlertCircle className="w-4 h-4 text-danger-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-danger-500">{error}</p>
                </div>
              )}

              <form id="reset-password-form" onSubmit={onSubmit} className="space-y-5">
                {/* New password */}
                <div>
                  <label className="label" htmlFor="reset-password">New Password</label>
                  <div className="relative">
                    <input
                      id="reset-password"
                      name="password"
                      type={showPw ? 'text' : 'password'}
                      className="input pr-10"
                      placeholder="Min 8 chars, 1 uppercase, 1 number"
                      value={form.password}
                      onChange={onChange}
                      autoComplete="new-password"
                    />
                    <button type="button" onClick={() => setShowPw(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                      {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm password */}
                <div>
                  <label className="label" htmlFor="reset-confirm">Confirm Password</label>
                  <div className="relative">
                    <input
                      id="reset-confirm"
                      name="confirm"
                      type={showCf ? 'text' : 'password'}
                      className="input pr-10"
                      placeholder="Re-enter your new password"
                      value={form.confirm}
                      onChange={onChange}
                      autoComplete="new-password"
                    />
                    <button type="button" onClick={() => setShowCf(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                      {showCf ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {/* Live match indicator */}
                  {form.confirm && (
                    <p className={`text-xs mt-1.5 ${form.password === form.confirm ? 'text-success-500' : 'text-danger-500'}`}>
                      {form.password === form.confirm ? '✓ Passwords match' : '✗ Passwords do not match'}
                    </p>
                  )}
                </div>

                {/* Password rules */}
                <ul className="text-xs text-gray-500 space-y-1 pl-1">
                  {[
                    { ok: form.password.length >= 8,         text: 'At least 8 characters' },
                    { ok: /[A-Z]/.test(form.password),       text: 'One uppercase letter' },
                    { ok: /[0-9]/.test(form.password),       text: 'One number' },
                  ].map(r => (
                    <li key={r.text} className={`flex items-center gap-1.5 ${r.ok ? 'text-success-500' : 'text-gray-500'}`}>
                      <span>{r.ok ? '✓' : '○'}</span> {r.text}
                    </li>
                  ))}
                </ul>

                <button id="reset-submit" type="submit" disabled={loading}
                  className="btn-primary btn-md w-full justify-center">
                  {loading
                    ? <><span className="spinner w-4 h-4" /> Resetting…</>
                    : <>Reset Password <ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>
            </>
          ) : (
            /* Success state */
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-success-500/20 border border-success-500/30 flex items-center justify-center mx-auto mb-5 animate-scale-in">
                <CheckCircle className="w-8 h-8 text-success-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Password Reset!</h2>
              <p className="text-gray-400 text-sm mb-6">
                Your password has been updated successfully.
                Redirecting you to login…
              </p>
              <Link to="/login" className="btn-primary btn-md w-full justify-center">
                Go to Login <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>

        <div className="text-center mt-6">
          <Link to="/login" className="text-sm text-brand-400 hover:text-brand-300">
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
