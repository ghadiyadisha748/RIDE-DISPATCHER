import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Navigation, Mail, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { authService } from '../../services/authService';

// States: 'loading' | 'success' | 'error'
export default function VerifyEmail() {
  const { token }     = useParams();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Verification token is missing. Please use the link from your email.');
      return;
    }

    authService.verifyEmail(token)
      .then(() => {
        setStatus('success');
        setMessage('Your email has been verified successfully. You can now log in.');
      })
      .catch(err => {
        setStatus('error');
        setMessage(
          err?.response?.data?.message ||
          'Email verification link is invalid or has expired. Please request a new one.'
        );
      });
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg p-4">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="w-9 h-9 rounded-xl bg-brand-gradient flex items-center justify-center shadow-brand">
            <Navigation className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-lg text-white">RIDE-DISPATCHER</span>
        </Link>

        <div className="card p-8 text-center">

          {/* Loading */}
          {status === 'loading' && (
            <>
              <div className="w-16 h-16 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mx-auto mb-5">
                <Loader className="w-8 h-8 text-brand-400 animate-spin" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Verifying Email…</h1>
              <p className="text-gray-400 text-sm">
                Please wait while we verify your email address.
              </p>
            </>
          )}

          {/* Success */}
          {status === 'success' && (
            <>
              <div className="w-16 h-16 rounded-full bg-success-500/20 border border-success-500/30 flex items-center justify-center mx-auto mb-5 animate-scale-in">
                <CheckCircle className="w-8 h-8 text-success-500" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Email Verified!</h1>
              <p className="text-gray-400 text-sm mb-6">{message}</p>

              <div className="space-y-3">
                <Link to="/login" id="verify-go-login"
                  className="btn-primary btn-md w-full justify-center">
                  Continue to Login
                </Link>
                <Link to="/" className="btn-ghost btn-md w-full justify-center text-gray-400">
                  Back to Home
                </Link>
              </div>
            </>
          )}

          {/* Error */}
          {status === 'error' && (
            <>
              <div className="w-16 h-16 rounded-2xl bg-danger-500/10 border border-danger-500/20 flex items-center justify-center mx-auto mb-5">
                <AlertCircle className="w-8 h-8 text-danger-500" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Verification Failed</h1>
              <p className="text-gray-400 text-sm mb-6">{message}</p>

              <div className="space-y-3">
                <Link to="/register" id="verify-go-register"
                  className="btn-primary btn-md w-full justify-center">
                  Register Again
                </Link>
                <Link to="/login" className="btn-ghost btn-md w-full justify-center text-gray-400">
                  Back to Login
                </Link>
              </div>

              {/* Help hint */}
              <div className="mt-6 p-3 rounded-xl bg-dark-card border border-dark-border">
                <div className="flex items-center gap-2 mb-1">
                  <Mail className="w-4 h-4 text-brand-400" />
                  <span className="text-xs font-semibold text-gray-300">Need a new link?</span>
                </div>
                <p className="text-xs text-gray-500">
                  Verification links expire after 24 hours. Register again or contact{' '}
                  <span className="text-brand-400">support@ridedispatcher.in</span>.
                </p>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
