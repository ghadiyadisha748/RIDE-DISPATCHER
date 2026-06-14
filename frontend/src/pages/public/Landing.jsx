import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin, Zap, Shield, Star, ChevronDown, ChevronRight,
  Car, Bike, Navigation, Clock, TrendingUp, Users, Award,
  CheckCircle, Phone, Mail, Twitter, Instagram, Linkedin,
  ArrowRight, Play, Brain, BarChart3, Route, Sparkles,
  Menu, X, Moon, Sun, Quote
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

// ── Navbar ──────────────────────────────────────────────────────────────────
function Navbar() {
  const { isDark, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { href: '#features', label: 'Features' },
    { href: '#how-it-works', label: 'How It Works' },
    { href: '#ai-features', label: 'AI' },
    { href: '#testimonials', label: 'Reviews' },
    { href: '/about', label: 'About' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'py-3 bg-dark-bg/90 backdrop-blur-xl border-b border-dark-border shadow-lg' : 'py-5'
    }`}>
      <div className="container-rd flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-brand-gradient flex items-center justify-center shadow-brand group-hover:shadow-glow transition-shadow">
            <Navigation className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-xl text-white">
            RIDE<span className="text-brand-400">-</span>DISPATCHER
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {links.map(l => (
            <a key={l.href} href={l.href} className="nav-link text-gray-300 hover:text-white">
              {l.label}
            </a>
          ))}
        </div>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-3">
          <button onClick={toggleTheme} className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-dark-card transition-all">
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <Link to="/login" className="btn-ghost btn-sm text-gray-300 hover:text-white">Sign In</Link>
          <Link to="/register" className="btn-primary btn-sm">Get Started <ArrowRight className="w-4 h-4" /></Link>
        </div>

        {/* Mobile hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <button onClick={toggleTheme} className="p-2 rounded-xl text-gray-400">
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-xl text-gray-300">
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden mt-2 mx-4 rounded-2xl bg-dark-surface border border-dark-border p-4 animate-slide-down">
          {links.map(l => (
            <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
              className="block py-3 px-4 rounded-xl text-gray-300 hover:text-white hover:bg-dark-card transition-all text-sm font-medium">
              {l.label}
            </a>
          ))}
          <div className="flex gap-2 mt-3 pt-3 border-t border-dark-border">
            <Link to="/login" className="flex-1 btn-secondary btn-sm text-center">Sign In</Link>
            <Link to="/register" className="flex-1 btn-primary btn-sm text-center">Get Started</Link>
          </div>
        </div>
      )}
    </nav>
  );
}

// ── Hero ─────────────────────────────────────────────────────────────────────
function HeroSection() {
  const [activeCity, setActiveCity] = useState(0);
  const cities = ['Surat', 'Ahmedabad', 'Vadodara', 'Rajkot'];

  useEffect(() => {
    const t = setInterval(() => setActiveCity(c => (c + 1) % cities.length), 2500);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-dark-bg">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/15 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-800/5 rounded-full blur-3xl" />
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      <div className="container-rd relative z-10 pt-24 pb-16 md:pt-32">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Left: Content */}
          <div className="flex-1 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-semibold mb-8 animate-fade-in">
              <Sparkles className="w-4 h-4" />
              AI-Powered Ride Platform
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-black text-white leading-[1.05] mb-6 animate-slide-up">
              Smart Rides
              <br />
              <span className="text-gradient">Powered by AI</span>
              <br />
              <span className="text-gray-300 text-4xl md:text-5xl lg:text-6xl font-bold">
                Across{' '}
                <span className="text-brand-400 transition-all duration-500 inline-block min-w-[180px]">
                  {cities[activeCity]}
                </span>
              </span>
            </h1>

            <p className="text-gray-400 text-lg md:text-xl max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed">
              RIDE-DISPATCHER uses machine learning to match you with the best driver, predict fares accurately, 
              and ensure you reach your destination safely — every single time.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start mb-12">
              <Link to="/register" id="hero-get-started" className="btn-primary btn-lg shadow-glow">
                Book Your Ride <ArrowRight className="w-5 h-5" />
              </Link>
              <a href="#how-it-works" className="btn-secondary btn-lg group">
                <Play className="w-5 h-5 text-brand-400 group-hover:scale-110 transition-transform" />
                How It Works
              </a>
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap gap-8 justify-center lg:justify-start">
              {[
                { value: '50K+', label: 'Happy Riders' },
                { value: '2K+',  label: 'Verified Drivers' },
                { value: '4.8★', label: 'App Rating' },
                { value: '4',    label: 'Gujarat Cities' },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <div className="text-2xl font-display font-black text-white">{s.value}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Ride card mockup */}
          <div className="flex-1 flex justify-center">
            <div className="relative w-full max-w-sm">
              {/* Main app card */}
              <div className="card-glass p-6 rounded-3xl border border-white/10 shadow-glow">
                {/* Map placeholder */}
                <div className="relative h-52 rounded-2xl overflow-hidden mb-4 bg-gradient-to-br from-brand-900/50 to-dark-bg border border-white/5">
                  <div className="absolute inset-0 flex items-center justify-center text-brand-400 text-opacity-50">
                    <MapPin className="w-8 h-8" />
                    <div className="absolute top-1/3 left-1/3 w-3 h-3 bg-brand-500 rounded-full shadow-brand animate-pulse" />
                    <div className="absolute bottom-1/3 right-1/3 w-3 h-3 bg-accent-500 rounded-full shadow-orange animate-pulse" />
                    <svg className="absolute inset-0 w-full h-full opacity-30">
                      <line x1="33%" y1="33%" x2="67%" y2="67%" stroke="#5469ff" strokeWidth="2" strokeDasharray="4 4" />
                    </svg>
                  </div>
                  <div className="absolute top-3 left-3 glass-panel px-3 py-1.5 text-xs font-semibold text-white flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-success-500 animate-pulse" />
                    Live Tracking
                  </div>
                </div>

                {/* Ride info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-dark-card border border-dark-border">
                    <div className="w-8 h-8 rounded-lg bg-success-500/20 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-success-500" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Pickup</div>
                      <div className="text-sm font-semibold text-white">Vesu, Surat</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-dark-card border border-dark-border">
                    <div className="w-8 h-8 rounded-lg bg-accent-500/20 flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-accent-500" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Drop</div>
                      <div className="text-sm font-semibold text-white">Ring Road, Surat</div>
                    </div>
                  </div>

                  {/* Fare row */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-brand-500/10 border border-brand-500/20">
                    <div>
                      <div className="text-xs text-brand-400 flex items-center gap-1"><Brain className="w-3 h-3" /> AI Predicted Fare</div>
                      <div className="text-xl font-display font-bold text-white">₹85 – ₹95</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">ETA</div>
                      <div className="text-lg font-bold text-white">12 min</div>
                    </div>
                  </div>

                  {/* Book button */}
                  <Link to="/register" className="btn-primary btn-md w-full justify-center">
                    Book Now — ₹85 <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Floating badges */}
              <div className="absolute -top-4 -right-4 card-glass px-4 py-2 rounded-2xl border border-success-500/30 flex items-center gap-2 animate-float">
                <div className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
                <span className="text-xs font-bold text-white">3 drivers nearby</span>
              </div>
              <div className="absolute -bottom-4 -left-4 card-glass px-4 py-2 rounded-2xl border border-brand-500/30 flex items-center gap-2 animate-float" style={{ animationDelay: '1s' }}>
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-xs font-bold text-white">4.9 rated driver</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="flex justify-center mt-16 animate-bounce-gentle">
          <a href="#features" className="text-gray-500 hover:text-brand-400 transition-colors flex flex-col items-center gap-2 text-xs">
            Scroll to explore
            <ChevronDown className="w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  );
}

// ── Features ─────────────────────────────────────────────────────────────────
const features = [
  { icon: Brain,     color: 'brand',  title: 'AI-Smart Dispatch',   desc: 'Our ML engine scores and ranks drivers by proximity, rating, and completion rate in milliseconds.' },
  { icon: TrendingUp,color: 'accent', title: 'Fare Prediction',     desc: 'Random Forest model predicts your fare based on distance, traffic, time, and surge demand.' },
  { icon: Shield,    color: 'success',title: 'Fraud Detection',      desc: 'Isolation Forest anomaly detection flags suspicious patterns, protecting riders and drivers.' },
  { icon: BarChart3, color: 'brand',  title: 'Demand Forecasting',  desc: 'XGBoost forecasts peak demand across Surat zones so drivers are ready before you need them.' },
  { icon: Star,      color: 'warning',title: 'Sentiment Analysis',  desc: 'NLP classifier reads review sentiment to spotlight excellent drivers and catch bad actors.' },
  { icon: MapPin,    color: 'success',title: 'Live Tracking',        desc: 'Real-time GPS tracking with Socket.IO. Watch your driver move toward you on the map.' },
  { icon: Route,     color: 'accent', title: 'Smart Routing',       desc: 'Optimal routes using OpenStreetMap + OSRM with live traffic, seamlessly upgradeable to Google Maps.' },
  { icon: Zap,       color: 'brand',  title: 'Instant Matching',    desc: 'Sub-second driver assignment with real-time push notifications via WebSockets.' },
];

const colorMap = {
  brand:   { bg: 'bg-brand-500/10',   icon: 'text-brand-400',   border: 'border-brand-500/20'   },
  accent:  { bg: 'bg-accent-500/10',  icon: 'text-accent-500',  border: 'border-accent-500/20'  },
  success: { bg: 'bg-success-500/10', icon: 'text-success-500', border: 'border-success-500/20' },
  warning: { bg: 'bg-warning-500/10', icon: 'text-yellow-400',  border: 'border-yellow-400/20'  },
};

function FeaturesSection() {
  return (
    <section id="features" className="section bg-dark-surface">
      <div className="container-rd">
        <div className="text-center mb-16">
          <div className="badge badge-brand mx-auto mb-4">Platform Features</div>
          <h2 className="section-title text-white mb-4">
            Everything You Need,<br />
            <span className="text-gradient">Built With Intelligence</span>
          </h2>
          <p className="section-sub text-gray-400 mx-auto">
            Six AI modules, real-time sockets, and a seamless booking flow — designed to rival Uber, built for Gujarat.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => {
            const c = colorMap[f.color];
            return (
              <div key={f.title}
                className="card-glow p-6 group hover:-translate-y-2 transition-all duration-300"
                style={{ animationDelay: `${i * 0.05}s` }}>
                <div className={`w-12 h-12 rounded-2xl ${c.bg} border ${c.border} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <f.icon className={`w-6 h-6 ${c.icon}`} />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── How It Works ─────────────────────────────────────────────────────────────
const steps = [
  { step: '01', title: 'Sign Up', desc: 'Create your account in 60 seconds. Verify your phone number and you\'re ready.', icon: Users },
  { step: '02', title: 'Set Pickup & Drop', desc: 'Enter your locations using the map. Our AI immediately predicts your fare.', icon: MapPin },
  { step: '03', title: 'AI Matches Driver', desc: 'Our dispatch engine scores all nearby drivers and assigns the best one instantly.', icon: Brain },
  { step: '04', title: 'Track & Arrive', desc: 'Watch your driver live on the map. Get notified at every step of the journey.', icon: Navigation },
];

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="section bg-dark-bg">
      <div className="container-rd">
        <div className="text-center mb-16">
          <div className="badge badge-brand mx-auto mb-4">Simple Process</div>
          <h2 className="section-title text-white mb-4">
            Ride in <span className="text-gradient">4 Steps</span>
          </h2>
          <p className="section-sub text-gray-400 mx-auto">
            From signup to your destination — the entire experience takes less than a minute to start.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* Connecting line */}
          <div className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-brand-500/30 to-transparent" />

          {steps.map((s, i) => (
            <div key={s.step} className="relative text-center group">
              {/* Step circle */}
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full bg-brand-500/10 border-2 border-brand-500/30 group-hover:border-brand-500 group-hover:shadow-brand transition-all duration-300" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <s.icon className="w-8 h-8 text-brand-400 group-hover:scale-110 transition-transform" />
                </div>
                <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-brand-gradient flex items-center justify-center text-xs font-black text-white shadow-brand">
                  {s.step}
                </div>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed max-w-[200px] mx-auto">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Ride Types ────────────────────────────────────────────────────────────────
const rideTypes = [
  { type: 'Auto',    icon: '🛺', base: '₹25', per: '₹8/km', desc: 'Affordable 3-wheeler for short trips', color: 'yellow' },
  { type: 'Bike',    icon: '🏍️', base: '₹15', per: '₹5/km', desc: 'Fastest option to beat traffic',       color: 'green'  },
  { type: 'Cab',     icon: '🚗', base: '₹40', per: '₹12/km',desc: 'Comfortable AC cab for any distance',  color: 'blue'   },
  { type: 'Premium', icon: '🚘', base: '₹80', per: '₹20/km',desc: 'Luxury SUV for special occasions',     color: 'purple' },
];

function RideTypesSection() {
  return (
    <section className="section bg-dark-surface">
      <div className="container-rd">
        <div className="text-center mb-16">
          <div className="badge badge-brand mx-auto mb-4">Ride Options</div>
          <h2 className="section-title text-white mb-4">
            Choose Your <span className="text-gradient">Perfect Ride</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {rideTypes.map(r => (
            <div key={r.type} className="card p-6 hover:border-brand-500/30 hover:-translate-y-1 transition-all duration-300 group cursor-pointer">
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">{r.icon}</div>
              <h3 className="text-xl font-bold text-white mb-1">{r.type}</h3>
              <p className="text-sm text-gray-400 mb-4">{r.desc}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-brand-400">{r.base}</span>
                <span className="text-sm text-gray-500">base + {r.per}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── AI Features ───────────────────────────────────────────────────────────────
function AIFeaturesSection() {
  const aiModules = [
    { title: 'Fare Predictor',        tech: 'Random Forest', accuracy: '92%', icon: TrendingUp,  desc: 'Predicts ride fare from distance, traffic, time of day, and ride type with 92% accuracy.' },
    { title: 'Smart Dispatch',        tech: 'KD-Tree + Scoring', accuracy: 'Real-time', icon: Zap, desc: 'Matches riders with the best driver using a multi-factor weighted scoring algorithm.' },
    { title: 'Demand Forecaster',     tech: 'XGBoost',       accuracy: '88%', icon: BarChart3,   desc: 'Predicts surge zones across Surat, Ahmedabad, Vadodara, and Rajkot by hour and day.' },
    { title: 'Sentiment Analyzer',    tech: 'TF-IDF + LR',   accuracy: '91%', icon: Star,        desc: 'Classifies rider reviews as positive, neutral, or negative to surface driver quality.' },
    { title: 'Fraud Detector',        tech: 'Isolation Forest', accuracy: '94%', icon: Shield,   desc: 'Detects fake bookings, excessive cancellations, and suspicious account patterns.' },
    { title: 'Driver Performance',    tech: 'Composite Score', accuracy: 'A–F Grade', icon: Award, desc: 'Scores drivers on rating, completion rate, response time, and customer feedback.' },
  ];

  return (
    <section id="ai-features" className="section bg-dark-bg overflow-hidden">
      <div className="container-rd">
        <div className="text-center mb-16">
          <div className="badge badge-brand mx-auto mb-4">
            <Brain className="w-3 h-3" /> AI/ML Engine
          </div>
          <h2 className="section-title text-white mb-4">
            Six AI Models,<br /><span className="text-gradient">One Platform</span>
          </h2>
          <p className="section-sub text-gray-400 mx-auto">
            Built with Python, scikit-learn, and XGBoost. Trained on Indian ride data. Served via FastAPI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {aiModules.map((m, i) => (
            <div key={m.title}
              className="card-glow p-6 group hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center group-hover:shadow-brand transition-shadow">
                  <m.icon className="w-5 h-5 text-brand-400" />
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Algorithm</div>
                  <div className="text-xs font-mono font-semibold text-brand-400">{m.tech}</div>
                </div>
              </div>
              <h3 className="text-base font-bold text-white mb-2">{m.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed mb-4">{m.desc}</p>
              <div className="flex items-center justify-between pt-3 border-t border-dark-border">
                <span className="text-xs text-gray-500">Accuracy / Output</span>
                <span className="badge badge-brand">{m.accuracy}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Benefits ──────────────────────────────────────────────────────────────────
function BenefitsSection() {
  const riderBenefits = [
    'AI-predicted fares — no hidden charges',
    'Live GPS tracking of your driver',
    'One-tap SOS emergency alert',
    'Ride receipt download (PDF)',
    'Rate & review your experience',
    'Favorite locations for quick booking',
  ];
  const driverBenefits = [
    'Smart dispatch — no more waiting',
    'Real-time earnings dashboard',
    'Performance grade to grow your rating',
    'Accept or reject rides freely',
    'Transparent 80% fare payout',
    'Navigation assistance on every ride',
  ];

  return (
    <section className="section bg-dark-surface">
      <div className="container-rd">
        <div className="text-center mb-16">
          <h2 className="section-title text-white mb-4">
            Built for <span className="text-gradient">Everyone</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Riders */}
          <div className="card-glass p-8 rounded-3xl border border-brand-500/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-brand-gradient flex items-center justify-center shadow-brand">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-xs text-brand-400 font-semibold">FOR RIDERS</div>
                <h3 className="text-xl font-bold text-white">Your Smartest Commute</h3>
              </div>
            </div>
            <ul className="space-y-3">
              {riderBenefits.map(b => (
                <li key={b} className="flex items-start gap-3 text-sm text-gray-300">
                  <CheckCircle className="w-5 h-5 text-success-500 shrink-0 mt-0.5" />
                  {b}
                </li>
              ))}
            </ul>
            <Link to="/register" className="btn-primary btn-md mt-8 w-full justify-center">
              Start Riding <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Drivers */}
          <div className="card-glass p-8 rounded-3xl border border-accent-500/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-orange-gradient flex items-center justify-center shadow-orange">
                <Car className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-xs text-accent-500 font-semibold">FOR DRIVERS</div>
                <h3 className="text-xl font-bold text-white">Drive Smarter, Earn More</h3>
              </div>
            </div>
            <ul className="space-y-3">
              {driverBenefits.map(b => (
                <li key={b} className="flex items-start gap-3 text-sm text-gray-300">
                  <CheckCircle className="w-5 h-5 text-accent-500 shrink-0 mt-0.5" />
                  {b}
                </li>
              ))}
            </ul>
            <Link to="/register?role=driver" className="btn-md mt-8 w-full justify-center bg-orange-gradient text-white hover:shadow-orange hover:scale-[1.02] active:scale-[0.98] transition-all">
              Become a Driver <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Stats ─────────────────────────────────────────────────────────────────────
function StatsSection() {
  const stats = [
    { value: '50,000+', label: 'Rides Completed',   desc: 'Across 4 Gujarat cities' },
    { value: '4.8/5',   label: 'Average Rating',    desc: 'From verified riders' },
    { value: '98%',     label: 'On-time Arrivals',  desc: 'AI dispatch accuracy' },
    { value: '₹23 Cr+', label: 'Driver Earnings',   desc: 'Paid to partner drivers' },
  ];

  return (
    <section className="section bg-brand-gradient">
      <div className="container-rd">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map(s => (
            <div key={s.label} className="text-center">
              <div className="text-4xl md:text-5xl font-display font-black text-white mb-2">{s.value}</div>
              <div className="text-base font-semibold text-blue-100 mb-1">{s.label}</div>
              <div className="text-sm text-blue-200/70">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Testimonials ──────────────────────────────────────────────────────────────
const testimonials = [
  { name: 'Arjun Mehta',    city: 'Vesu, Surat',   rating: 5, text: 'The AI fare prediction is spot on. I always know what I\'ll pay before I book. Never had a surprise charge!', role: 'Rider' },
  { name: 'Ramesh Tadvi',   city: 'Katargam, Surat',rating: 5, text: 'As a driver, the smart dispatch means I spend zero time idle. Rides come to me — my earnings doubled.', role: 'Driver' },
  { name: 'Priya Shah',     city: 'Adajan, Surat',  rating: 5, text: 'Love the live tracking feature. I shared my ride with family and they watched me reach safely. 10/10!', role: 'Rider' },
  { name: 'Kiran Joshi',    city: 'Ahmedabad',      rating: 4, text: 'Best ride app in Gujarat. The premium cab service is actually premium — clean car, great driver.', role: 'Rider' },
  { name: 'Nilesh Vasava',  city: 'SG Highway, Ahmedabad', rating: 5, text: 'The performance grade system motivates me to do better every day. Went from C to A in a month!', role: 'Driver' },
  { name: 'Sanjana Kapoor', city: 'Vadodara',       rating: 5, text: 'Clean, fast, affordable. The SOS button gives me peace of mind for late-night rides. Highly recommended.', role: 'Rider' },
];

function TestimonialsSection() {
  return (
    <section id="testimonials" className="section bg-dark-bg overflow-hidden">
      <div className="container-rd">
        <div className="text-center mb-16">
          <div className="badge badge-brand mx-auto mb-4">Testimonials</div>
          <h2 className="section-title text-white mb-4">
            Loved by Riders &amp; <span className="text-gradient">Drivers Alike</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <div key={i} className="card-glow p-6 group hover:-translate-y-1 transition-all duration-300">
              <Quote className="w-8 h-8 text-brand-500/30 mb-3" />
              <p className="text-gray-300 text-sm leading-relaxed mb-4 italic">"{t.text}"</p>
              <div className="flex items-center gap-3 pt-3 border-t border-dark-border">
                <div className="w-10 h-10 rounded-full bg-brand-gradient flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {t.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-white truncate">{t.name}</div>
                  <div className="text-xs text-gray-500 truncate">{t.city}</div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  ))}
                  <span className="badge-muted text-xs ml-1">{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── FAQ ───────────────────────────────────────────────────────────────────────
const faqs = [
  { q: 'What cities does RIDE-DISPATCHER operate in?', a: 'Currently available in Surat, Ahmedabad, Vadodara, and Rajkot — with Surat as our primary city. More Gujarat cities coming soon.' },
  { q: 'How does the AI fare prediction work?',         a: 'Our Random Forest model trained on thousands of Indian rides predicts fare based on distance, traffic factor, time of day, day of week, and ride type. It achieves >92% accuracy.' },
  { q: 'What ride types are available?',                a: 'Auto (₹25 base), Bike (₹15 base), Cab (₹40 base), and Premium SUV (₹80 base). All options are available 24×7.' },
  { q: 'Is my ride tracking data private?',             a: 'Yes. Live location is only visible during the active ride and only to your booked driver and any emergency contacts you share your ride with.' },
  { q: 'How does the driver rating system work?',       a: 'Riders rate drivers 1–5 stars after each ride. Our AI also runs sentiment analysis on text reviews and computes a composite performance score (A–F grade).' },
  { q: 'What payment methods are accepted?',            a: 'Cash, UPI, digital wallet, and debit/credit card. All methods are available with secure transaction tracking.' },
  { q: 'Can I become a driver?',                        a: 'Yes! Register with your driving license, Aadhaar, and vehicle details. Our admin team verifies your documents and activates your account within 24 hours.' },
  { q: 'What is the SOS feature?',                      a: 'Press the red SOS button in-app during an active ride to instantly alert your emergency contacts with your live location and ride details.' },
];

function FAQSection() {
  const [open, setOpen] = useState(null);
  return (
    <section id="faq" className="section bg-dark-surface">
      <div className="container-rd max-w-3xl">
        <div className="text-center mb-16">
          <h2 className="section-title text-white mb-4">
            Frequently Asked <span className="text-gradient">Questions</span>
          </h2>
        </div>
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div key={i} className="card border-dark-border overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-brand-500/5 transition-colors">
                <span className="font-semibold text-white pr-4 text-sm">{f.q}</span>
                <ChevronDown className={`w-5 h-5 text-brand-400 shrink-0 transition-transform duration-300 ${open === i ? 'rotate-180' : ''}`} />
              </button>
              {open === i && (
                <div className="px-5 pb-5 text-gray-400 text-sm leading-relaxed border-t border-dark-border pt-4 animate-slide-down">
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Contact & CTA ─────────────────────────────────────────────────────────────
function ContactSection() {
  return (
    <section id="contact" className="section bg-dark-bg">
      <div className="container-rd">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* CTA */}
          <div>
            <h2 className="section-title text-white mb-4">
              Ready to<br /><span className="text-gradient">Get Moving?</span>
            </h2>
            <p className="text-gray-400 mb-8 leading-relaxed">
              Join thousands of riders and drivers in Surat and across Gujarat. 
              Sign up in 60 seconds and book your first AI-powered ride.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/register" className="btn-primary btn-lg shadow-glow">
                Start for Free <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/about" className="btn-secondary btn-lg">
                Meet the Team
              </Link>
            </div>

            <div className="mt-10 space-y-3">
              <a href="mailto:support@ridedispatcher.in" className="flex items-center gap-3 text-gray-400 hover:text-brand-400 transition-colors">
                <Mail className="w-5 h-5" /> support@ridedispatcher.in
              </a>
              <a href="tel:+919900000001" className="flex items-center gap-3 text-gray-400 hover:text-brand-400 transition-colors">
                <Phone className="w-5 h-5" /> +91 99000 00001
              </a>
            </div>
          </div>

          {/* Contact form */}
          <form className="card p-8 space-y-4" onSubmit={e => e.preventDefault()}>
            <h3 className="text-xl font-bold text-white">Send us a Message</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Name</label>
                <input id="contact-name" className="input" placeholder="Arjun Mehta" />
              </div>
              <div>
                <label className="label">Phone</label>
                <input id="contact-phone" className="input" placeholder="9825000001" />
              </div>
            </div>
            <div>
              <label className="label">Email</label>
              <input id="contact-email" type="email" className="input" placeholder="arjun@example.com" />
            </div>
            <div>
              <label className="label">Message</label>
              <textarea id="contact-message" className="input min-h-[100px] resize-none" placeholder="How can we help you?" />
            </div>
            <button type="submit" id="contact-submit" className="btn-primary btn-md w-full justify-center">
              Send Message <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-dark-surface border-t border-dark-border">
      <div className="container-rd py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-brand-gradient flex items-center justify-center shadow-brand">
                <Navigation className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-white">RIDE-DISPATCHER</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">
              AI-powered ride booking for Gujarat. Smart dispatch, real-time tracking, fair pricing.
            </p>
            <div className="flex gap-3">
              {[Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 rounded-lg bg-dark-card border border-dark-border flex items-center justify-center text-gray-400 hover:text-brand-400 hover:border-brand-500/30 transition-all">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {[
            { title: 'Platform',  links: ['Book Ride', 'Driver Sign Up', 'Pricing', 'Cities'] },
            { title: 'Company',   links: ['About Us', 'Careers', 'Blog', 'Press'] },
            { title: 'Support',   links: ['Help Center', 'Safety', 'Contact', 'Terms & Privacy'] },
          ].map(col => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-white mb-4">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map(l => (
                  <li key={l}><a href="#" className="text-sm text-gray-500 hover:text-brand-400 transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t border-dark-border">
          <p className="text-xs text-gray-600">
            © 2024 RIDE-DISPATCHER. Built with ❤️ by Disha, Anshika &amp; Shruti in Surat, Gujarat.
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <div className="w-1.5 h-1.5 rounded-full bg-success-500 animate-pulse" />
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  );
}

// ── Main Landing Page ─────────────────────────────────────────────────────────
export default function Landing() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <RideTypesSection />
      <AIFeaturesSection />
      <BenefitsSection />
      <StatsSection />
      <TestimonialsSection />
      <FAQSection />
      <ContactSection />
      <Footer />
    </div>
  );
}
