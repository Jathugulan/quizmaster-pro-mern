import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Camera, Eye, EyeOff, ArrowRight } from 'lucide-react';
import AuthShell from './AuthShell.jsx';
import GoogleAuthButton from '../../components/GoogleAuthButton.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { triggerGoogleOAuth } from '../../utils/googleAuthClient.js';

export default function SignUp() {
  const { signup, googleLogin } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirm: '',
  });
  const [photo, setPhoto] = useState('');
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const onPhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = Math.min(img.width, 256);
        const scale = size / Math.max(img.width, img.height);
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        const dx = (size - img.width * scale) / 2;
        const dy = (size - img.height * scale) / 2;
        ctx.drawImage(img, dx, dy, img.width * scale, img.height * scale);
        setPhoto(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const validate = () => {
    if (!form.name.trim() || !form.username.trim() || !form.email.trim()) return 'Please fill in all required fields.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Please enter a valid email address.';
    if (form.password.length < 6) return 'Password must be at least 6 characters.';
    if (form.password !== form.confirm) return 'Passwords do not match.';
    if (!terms) return 'Please accept the terms & conditions.';
    return '';
  };

  const submit = async (e) => {
    e.preventDefault();
    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }
    setError('');
    setLoading(true);
    try {
      await signup({
        name: form.name.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        photo,
      });
      toast.success('Account created successfully. Welcome to QuizMaster!');
      navigate('/user');
    } catch (err) {
      const errorMessage = err.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
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

      // 2. Submit verified Google credential to QuizMaster backend for auto-registration
      const result = await googleLogin(googleTokenData);

      const welcomeMsg = result?.isNewUser
        ? 'Welcome to QuizMaster! Your account has been created successfully.'
        : 'Welcome back! Signed in with Google.';

      toast.success(welcomeMsg);
      navigate('/user');
    } catch (err) {
      if (err?.isCancelled) {
        return;
      }
      const msg = err.message || 'Google registration failed. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <AuthShell title="Create Account" subtitle="Register to start quizzes and earn digital certificates.">
      <form onSubmit={submit} className="space-y-3.5 sm:space-y-4" noValidate>
        {/* Avatar Selection */}
        <div className="flex items-center gap-3 sm:gap-4 pb-1">
          {photo ? (
            <img src={photo} alt="Avatar preview" className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl object-cover ring-2 ring-primary shadow-sm shrink-0" />
          ) : (
            <div className="grid h-14 w-14 sm:h-16 sm:w-16 place-items-center rounded-2xl bg-surface border border-border text-primary font-bold shadow-sm shrink-0">
              <User size={24} className="sm:w-[26px] sm:h-[26px]" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <label className="btn-outline-grad cursor-pointer text-xs h-9 px-3 sm:px-3.5 inline-flex items-center gap-1.5">
              <Camera size={14} className="shrink-0" />
              <span>Upload Avatar</span>
              <span className="opacity-70 text-[10px] hidden sm:inline">(Optional)</span>
              <input type="file" accept="image/*" className="hidden" onChange={onPhoto} />
            </label>
            <p className="text-[10px] text-muted mt-1 truncate">Recommended 256x256 JPG/PNG</p>
          </div>
        </div>

        <div>
          <label htmlFor="name" className="label-base text-[11px] sm:text-xs">Full Name</label>
          <div className="relative group">
            <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors pointer-events-none" />
            <input id="name" className="input-base pl-10 h-11 text-xs sm:text-sm" placeholder="Enter your full name" value={form.name} onChange={set('name')} required />
          </div>
        </div>

        <div>
          <label htmlFor="username" className="label-base text-[11px] sm:text-xs">Username</label>
          <div className="relative group">
            <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors pointer-events-none" />
            <input id="username" className="input-base pl-10 h-11 text-xs sm:text-sm" placeholder="Choose a username" value={form.username} onChange={set('username')} required />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="label-base text-[11px] sm:text-xs">Email Address</label>
          <div className="relative group">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors pointer-events-none" />
            <input id="email" type="email" className="input-base pl-10 h-11 text-xs sm:text-sm" placeholder="name@example.com" value={form.email} onChange={set('email')} required />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="password" className="label-base text-[11px] sm:text-xs">Password</label>
            <div className="relative group">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors pointer-events-none" />
              <input id="password" type={showPw ? 'text' : 'password'} className="input-base pl-10 pr-10 h-11 text-xs sm:text-sm" placeholder="Create password" value={form.password} onChange={set('password')} required />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted hover:text-text transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface" aria-label="Toggle password visibility">
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="confirm" className="label-base text-[11px] sm:text-xs">Confirm</label>
            <div className="relative group">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors pointer-events-none" />
              <input id="confirm" type={showPw ? 'text' : 'password'} className="input-base pl-10 h-11 text-xs sm:text-sm" placeholder="Confirm password" value={form.confirm} onChange={set('confirm')} required />
            </div>
          </div>
        </div>

        <label className="flex items-start gap-2.5 cursor-pointer text-[11px] sm:text-xs text-text-secondary pt-1 font-medium select-none leading-tight">
          <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-0.5 h-4 w-4 accent-primary rounded cursor-pointer shrink-0" />
          <span>I agree to the Academic Code of Conduct and examination Terms &amp; Conditions.</span>
        </label>

        {error && (
          <p className="rounded-xl bg-danger/10 border border-danger/20 px-3.5 py-2.5 text-xs font-bold text-danger animate-pop-in" role="alert">{error}</p>
        )}

        <button 
          type="submit" 
          disabled={loading || googleLoading} 
          className="btn-primary-grad w-full min-h-[44px] sm:min-h-[46px] text-xs sm:text-sm font-bold shadow-md justify-center flex items-center gap-2"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin shrink-0" />
              <span>Creating Account…</span>
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <span>Complete Registration</span>
              <ArrowRight size={15} className="shrink-0" />
            </span>
          )}
        </button>

        {/* Google Authentication Option for Registration */}
        <div className="relative my-3 sm:my-3.5 text-center">
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

        <p className="text-center text-xs text-text-secondary font-medium pt-1">
          Already registered?{' '}
          <Link to="/auth/signin" className="font-bold text-primary hover:underline">Sign in</Link>
        </p>
      </form>
    </AuthShell>
  );
}