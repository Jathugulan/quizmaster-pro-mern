import { useState } from 'react';
import ThemeToggle from '../../components/ThemeToggle.jsx';
import { GraduationCap, Sparkles, ShieldCheck, Award, Zap, CheckCircle2, ArrowRight, LayoutDashboard, KeyRound } from 'lucide-react';

/**
 * Universal Responsive Authentication Shell for All Devices (Mobile 320px - 4K Desktop)
 */
export default function AuthShell({ title, subtitle, children }) {
  const [mobileTab, setMobileTab] = useState('form'); // 'form' | 'showcase'

  return (
    <div className="min-h-[100dvh] w-full max-w-full bg-bg flex flex-col lg:flex-row selection:bg-primary/20 selection:text-primary overflow-x-hidden relative">
      
      {/* Mobile Top App Bar (< lg) */}
      <header className="lg:hidden w-full bg-surface/85 dark:bg-card/85 backdrop-blur-xl border-b border-border sticky top-0 z-50 px-3.5 sm:px-5 py-2.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-white shadow-sm shrink-0">
            <GraduationCap size={18} />
          </div>
          <div className="min-w-0">
            <span className="text-sm font-black tracking-tight text-text leading-tight block truncate">QuizMaster</span>
            <span className="text-[8px] font-bold uppercase tracking-widest text-muted block">Apple HIG</span>
          </div>
        </div>

        {/* Responsive Segmented Switcher on Mobile & Tablet */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex p-0.5 bg-surface-hover/80 dark:bg-surface rounded-xl border border-border">
            <button
              type="button"
              onClick={() => setMobileTab('form')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                mobileTab === 'form'
                  ? 'bg-card text-text shadow-sm ring-1 ring-border'
                  : 'text-muted hover:text-text'
              }`}
              aria-label="View authentication form"
            >
              <KeyRound size={12} className={mobileTab === 'form' ? 'text-primary' : ''} />
              <span>{title}</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileTab('showcase')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                mobileTab === 'showcase'
                  ? 'bg-card text-text shadow-sm ring-1 ring-border'
                  : 'text-muted hover:text-text'
              }`}
              aria-label="View platform showcase"
            >
              <LayoutDashboard size={12} className={mobileTab === 'showcase' ? 'text-primary' : ''} />
              <span className="hidden xs:inline">Showcase</span>
              <span className="xs:hidden">Info</span>
            </button>
          </div>

          <ThemeToggle showLabel={false} className="scale-90" />
        </div>
      </header>

      {/* Left Panel: Platform Showcase (Visible on Desktop, or when Showcase tab is active on Mobile) */}
      <section 
        aria-label="QuizMaster Platform Showcase"
        className={`w-full lg:w-1/2 min-h-[calc(100dvh-53px)] lg:min-h-screen relative overflow-hidden bg-gradient-to-br from-[#005bb5] via-[#003d82] to-[#040d1a] dark:from-[#003d82] dark:via-[#021833] dark:to-[#03060c] text-white flex-col justify-between p-4 sm:p-6 md:p-8 lg:p-12 xl:p-16 transition-all duration-300 ${
          mobileTab === 'showcase' ? 'flex animate-slide-up-fade' : 'hidden lg:flex'
        }`}
      >
        {/* Dynamic Animated Ambient Glowing Orbs */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_25%_25%,white,transparent_60%)] pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 lg:-bottom-32 lg:-left-32 w-64 h-64 lg:w-96 lg:h-96 bg-primary-light/30 rounded-full blur-3xl pointer-events-none animate-float-orb-1" />
        <div className="absolute top-1/4 -right-16 lg:top-1/3 lg:-right-20 w-56 h-56 lg:w-80 lg:h-80 bg-purple/30 rounded-full blur-3xl pointer-events-none animate-float-orb-2" />

        <div className="relative z-10 flex flex-col justify-between h-full space-y-5 sm:space-y-8 my-auto max-w-xl">
          
          {/* Desktop Brand Logo Header */}
          <header className="hidden lg:flex items-center justify-between select-none w-full">
            <div className="flex items-center gap-3.5 group cursor-default">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-xl border border-white/25 shadow-lg shadow-black/20 shrink-0 transition-transform duration-300 group-hover:scale-105 group-hover:bg-white/20">
                <GraduationCap size={24} className="text-white" />
              </div>
              <div>
                <span className="text-2xl font-black tracking-tight text-white block">QuizMaster</span>
                <span className="block text-[10px] font-bold uppercase tracking-widest text-white/70">Apple HIG Edition</span>
              </div>
            </div>
          </header>

          {/* Hero Pitch Content with Non-Overlapping Typography */}
          <div className="space-y-4 sm:space-y-6 py-2">
            
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/15 backdrop-blur-md border border-white/25 shadow-sm text-white/95 animate-pop-in">
              <Sparkles size={14} className="text-amber-300 shrink-0 animate-pulse" />
              <span>Certified Examination Engine</span>
            </div>

            {/* Non-overlapping High-Contrast Headline */}
            <div className="space-y-1.5 sm:space-y-2">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.6rem] xl:text-[3.1rem] font-black tracking-tight leading-[1.25] sm:leading-[1.2] text-white">
                <span className="block">Test your knowledge.</span>
                <span className="block">Prove your mastery.</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400">
                  Earn credentials.
                </span>
              </h1>
            </div>

            {/* Subtext */}
            <p className="text-xs sm:text-sm lg:text-base text-white/85 leading-relaxed font-normal max-w-lg">
              Experience an Apple HIG inspired examination platform with verified digital certificates in PDF &amp; JPG formats, live countdown timers, and full progress analytics.
            </p>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 pt-2 w-full">
              <FeatureTag icon={Award} text="PDF & JPG Certificates" sub="Instant verified credentials" />
              <FeatureTag icon={Zap} text="Instant Score Engine" sub="Real-time evaluation" />
              <FeatureTag icon={ShieldCheck} text="Security Verified ID" sub="Anti-cheat validation" />
              <FeatureTag icon={CheckCircle2} text="Dark & Light HIG Mode" sub="Apple dynamic theme" />
            </div>

            {/* Mobile Action: Jump to Form */}
            <div className="lg:hidden pt-3 sm:pt-4 w-full">
              <button
                type="button"
                onClick={() => setMobileTab('form')}
                className="flex items-center justify-center gap-2 w-full min-h-[46px] py-3 px-6 rounded-2xl bg-white text-[#003d82] font-black text-xs sm:text-sm shadow-apple-lg active:scale-[0.98] transition-all hover:bg-white/95"
              >
                <span>Continue to {title}</span>
                <ArrowRight size={16} className="text-[#003d82] stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Desktop Footer note */}
          <footer className="hidden lg:flex items-center justify-between text-xs text-white/60 font-medium pt-3 border-t border-white/10 select-none w-full">
            <span>© {new Date().getFullYear()} QuizMaster Platform</span>
            <span className="text-white/40">Apple HIG Design Tokens</span>
          </footer>
        </div>
      </section>

      {/* Right Panel: Authentication Form (Always accessible, smoothly animated) */}
      <section 
        id="auth-form" 
        aria-label="Authentication Form"
        className={`flex-1 min-h-[calc(100dvh-53px)] lg:min-h-screen flex-col justify-between p-3.5 sm:p-6 md:p-8 lg:p-12 xl:p-16 relative w-full overflow-y-auto transition-all duration-300 ${
          mobileTab === 'form' ? 'flex animate-slide-up-fade' : 'hidden lg:flex'
        }`}
      >
        {/* Desktop Theme Toggle */}
        <div className="hidden lg:flex justify-end p-2 z-10">
          <ThemeToggle showLabel />
        </div>

        <div className="flex-1 flex items-center justify-center py-3 sm:py-6 lg:py-8 z-10 w-full">
          <div className="w-full max-w-[440px] animate-slide-up-fade space-y-4 sm:space-y-6">
            <div className="text-left">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-text">{title}</h2>
              {subtitle && <p className="mt-1 text-xs sm:text-sm text-text-secondary font-medium">{subtitle}</p>}
            </div>

            <div className="apple-card p-4 sm:p-6 md:p-8 shadow-apple-lg border border-border relative overflow-hidden">
              {/* Subtle top card accent line */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary-light via-primary to-purple opacity-70" />
              {children}
            </div>
          </div>
        </div>

        <footer className="text-center text-[10px] sm:text-xs text-muted z-10 py-2 sm:py-3 select-none">
          Secured with LocalStorage encryption &amp; Apple HIG design tokens.
        </footer>
      </section>
    </div>
  );
}

function FeatureTag({ icon: Icon, text, sub }) {
  return (
    <div className="flex items-center gap-2.5 sm:gap-3 rounded-2xl bg-white/10 backdrop-blur-md px-3 sm:px-3.5 py-2.5 sm:py-3 text-xs font-bold text-white border border-white/15 shadow-sm transition-all duration-300 hover:bg-white/15 hover:border-white/25 hover:-translate-y-0.5">
      <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl bg-white/15 shrink-0 text-amber-300">
        <Icon size={15} className="sm:w-4 sm:h-4" />
      </div>
      <div className="min-w-0 flex-1">
        <span className="block truncate font-bold text-white text-xs">{text}</span>
        {sub && <span className="block truncate font-medium text-white/70 text-[10px]">{sub}</span>}
      </div>
    </div>
  );
}