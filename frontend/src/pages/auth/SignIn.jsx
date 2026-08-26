import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ShieldCheck, ArrowRight, Eye, EyeOff } from 'lucide-react';
import AuthShell from './AuthShell.jsx';
import GoogleAuthButton from '../../components/GoogleAuthButton.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { triggerGoogleOAuth } from '../../utils/googleAuthClient.js';

export default function SignIn() {
  const { login, googleLogin } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [role, setRole] = useState('user');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      setError('Please enter both your email/username and password.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(identifier, password, role);
      toast.success(`Welcome back${role === 'user' ? '' : ', Administrator'}!`);
      navigate(role === 'user' ? '/user' : '/admin');
    } catch (err) {
      const msg = err.message || 'Login failed. Please check your credentials.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      // 1. Open official Google Account Picker dialog
      const googleTokenData = await triggerGoogleOAuth();

      // 2. Submit verified Google credential to QuizMaster backend
      const result = await googleLogin(googleTokenData);

      const welcomeMsg = result?.isNewUser
        ? 'Welcome to QuizMaster! Your student account has been created successfully.'
        : 'Welcome back! Signed in with Google.';

      toast.success(welcomeMsg);
      navigate('/user');
    } catch (err) {
      if (err?.isCancelled) {
        // User dismissed account chooser
        return;
      }
      const msg = err.message || 'Google authentication failed. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <AuthShell title="Sign In" subtitle="Access your examination portal and certifications.">
      <form onSubmit={submit} className="space-y-4 sm:space-y-5" noValidate>
        {/* Apple HIG Segmented Role Selector */}
        <div>
          <span className="label-base text-[11px] sm:text-xs">Portal Access Role</span>
          <div className="grid grid-cols-2 gap-1 p-1 bg-surface rounded-2xl border border-border">
            {[
              { key: 'user', label: 'Student Portal', icon: User },
              { key: 'admin', label: 'Admin Console', icon: ShieldCheck },
            ].map((r) => (
              <button
                type="button"
                key={r.key}
                onClick={() => setRole(r.key)}
                className={`flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl py-2 sm:py-2.5 px-2 text-[11px] sm:text-xs font-bold transition-all duration-200 min-h-[38px] ${
                  role === r.key
                    ? 'bg-card text-text shadow-sm ring-1 ring-border'
                    : 'text-muted hover:text-text hover:bg-surface-hover/50'
                }`}
                aria-pressed={role === r.key}
              >
                <r.icon size={14} className={`shrink-0 ${role === r.key ? 'text-primary' : 'text-muted'}`} />
                <span className="truncate">{r.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label-base text-[11px] sm:text-xs">Email or Username</label>
          <div className="relative group">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors pointer-events-none" />
            <input
              type="text"
              autoComplete="username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Enter your email or username"
              className="input-base pl-10 h-11 text-xs sm:text-sm"
              required
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="label-base text-[11px] sm:text-xs mb-0">Password</label>
          </div>
          <div className="relative group">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors pointer-events-none" />
            <input
              type={showPw ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="input-base pl-10 pr-11 h-11 text-xs sm:text-sm"
              required
            />
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted hover:text-text transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface"
              aria-label={showPw ? 'Hide password' : 'Show password'}
            >
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-danger/10 border border-danger/20 rounded-2xl text-xs font-semibold text-danger animate-fade-in flex items-center gap-2">
            <span>{error}</span>
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading || googleLoading} 
          className="btn-primary-grad w-full justify-center text-xs sm:text-sm font-bold min-h-[44px] sm:min-h-[46px] shadow-sm"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin shrink-0" />
              <span>Authenticating...</span>
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <span>Sign In to {role === 'user' ? 'Student Portal' : 'Admin Console'}</span>
              <ArrowRight size={15} className="shrink-0" />
            </span>
          )}
        </button>

        {/* Google Authentication Option for Students */}
        {role === 'user' && (
          <>
            <div className="relative my-3 sm:my-4 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-[10px] sm:text-[11px] uppercase">
                <span className="bg-card px-2.5 text-muted font-bold tracking-wider">or continue with</span>
              </div>
            </div>

            <GoogleAuthButton
              onClick={handleGoogleAuth}
              loading={googleLoading}
              disabled={loading}
              text="Continue with Google"
            />
          </>
        )}

        {role === 'user' ? (
          <p className="text-center text-xs text-muted pt-1">
            Don't have a student account?{' '}
            <Link to="/auth/signup" className="text-primary font-bold hover:underline">
              Create one now
            </Link>
          </p>
        ) : (
          <p className="text-center text-[11px] sm:text-xs text-muted pt-1 leading-relaxed">
            Administrator accounts are provisioned via secure server configuration.
          </p>
        )}
      </form>
    </AuthShell>
  );
}