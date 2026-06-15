import { Link } from 'react-router-dom';
import { Navigation, Brain, Zap, Target, Mail, ArrowRight, Users, Star, CheckCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Menu } from 'lucide-react';
import { useState, useEffect } from 'react';

const team = [
  {
    name: 'Disha Ghadiya',
    role: 'AI/ML & Backend Development',
    avatar: 'DG',
    color: 'from-brand-500 to-purple-500',
    skills: ['Python', 'scikit-learn', 'FastAPI', 'Node.js', 'PostgreSQL'],
    desc: 'Leads AI model development and backend architecture. Built all six ML models — from fare prediction to fraud detection — and the Node.js REST API.',
    social: { github: '#', linkedin: '#', email: 'disha@ridedispatcher.in' },
  },
  {
    name: 'Anshika Badala',
    role: 'Frontend & UI/UX Design',
    avatar: 'AB',
    color: 'from-accent-500 to-pink-500',
    skills: ['React.js', 'Tailwind CSS', 'Figma', 'Leaflet', 'Socket.IO'],
    desc: 'Crafted the entire user experience — from the landing page to the real-time driver dashboard. Designed the brand identity and all interactive components.',
    social: { github: '#', linkedin: '#', email: 'anshika@ridedispatcher.in' },
  },
  {
    name: 'Shruti Babariya',
    role: 'Database, Testing & QA',
    avatar: 'SB',
    color: 'from-success-500 to-teal-500',
    skills: ['PostgreSQL', 'Jest', 'Postman', 'Docker', 'Documentation'],
    desc: 'Architected the 10-table PostgreSQL schema, wrote all migrations and seed data, built the test suite, and authored the complete project documentation.',
    social: { github: '#', linkedin: '#', email: 'shruti@ridedispatcher.in' },
  },
];

function Navbar() {
  const { isDark, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'py-3 bg-dark-bg/90 backdrop-blur-xl border-b border-dark-border' : 'py-5'}`}>
      <div className="container-rd flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-brand-gradient flex items-center justify-center shadow-brand">
            <Navigation className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-xl text-white">RIDE<span className="text-brand-400">-</span>DISPATCHER</span>
        </Link>
        <div className="flex items-center gap-3">
          <button onClick={toggleTheme} className="p-2 rounded-xl text-gray-400 hover:text-white">
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <Link to="/" className="btn-ghost btn-sm text-gray-300">← Home</Link>
          <Link to="/register" className="btn-primary btn-sm">Join Us <ArrowRight className="w-4 h-4" /></Link>
        </div>
      </div>
    </nav>
  );
}

export default function About() {
  return (
    <div className="min-h-screen bg-dark-bg">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-60 h-60 bg-accent-500/10 rounded-full blur-3xl" />
        </div>
        <div className="container-rd relative text-center">
          <div className="badge badge-brand mx-auto mb-6">About Us</div>
          <h1 className="section-title text-white mb-6">
            Building the Future of<br />
            <span className="text-gradient">Indian Urban Mobility</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            RIDE-DISPATCHER is a final-year engineering project that demonstrates how Artificial Intelligence can
            transform ride-hailing — from smarter dispatch to real-time fraud detection.
          </p>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="section bg-dark-surface">
        <div className="container-rd">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="card-glow p-8 rounded-3xl">
              <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mb-5">
                <Target className="w-6 h-6 text-brand-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Our Vision</h2>
              <p className="text-gray-400 leading-relaxed">
                To provide a <strong className="text-white">smart, reliable, affordable, and AI-powered</strong> ride-booking experience that
                makes urban mobility accessible to everyone across Gujarat — from Surat to Rajkot.
              </p>
            </div>
            <div className="card-glow p-8 rounded-3xl border-accent-500/20">
              <div className="w-12 h-12 rounded-2xl bg-accent-500/10 border border-accent-500/20 flex items-center justify-center mb-5">
                <Brain className="w-6 h-6 text-accent-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
              <p className="text-gray-400 leading-relaxed">
                To <strong className="text-white">optimize ride dispatching and enhance transportation efficiency</strong> using Artificial Intelligence —
                proving that ML models can solve real-world logistics problems at scale.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section bg-dark-bg">
        <div className="container-rd">
          <div className="text-center mb-16">
            <div className="badge badge-brand mx-auto mb-4">The Team</div>
            <h2 className="section-title text-white mb-4">
              Meet the <span className="text-gradient">Builders</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Three engineers from Gujarat, combining AI/ML, frontend design, and database expertise to build a production-grade platform.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {team.map(m => (
              <div key={m.name} className="card-glow p-8 group hover:-translate-y-2 transition-all duration-300">
                {/* Avatar */}
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${m.color} flex items-center justify-center text-3xl font-black text-white mb-5 shadow-brand group-hover:shadow-glow transition-shadow`}>
                  {m.avatar}
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{m.name}</h3>
                <p className="text-sm text-brand-400 font-semibold mb-4">{m.role}</p>
                <p className="text-sm text-gray-400 leading-relaxed mb-5">{m.desc}</p>
                {/* Skills */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {m.skills.map(s => (
                    <span key={s} className="badge badge-brand text-xs">{s}</span>
                  ))}
                </div>
                {/* Social */}
                <div className="flex gap-3 pt-4 border-t border-dark-border">
                  {/* <a href={m.social.github} className="text-gray-500 hover:text-white transition-colors"><Github className="w-5 h-5" /></a> */}
                  {/* <a href={m.social.linkedin} className="text-gray-500 hover:text-brand-400 transition-colors"><Linkedin className="w-5 h-5" /></a> */}
                  <a href={`mailto:${m.social.email}`} className="text-gray-500 hover:text-accent-400 transition-colors"><Mail className="w-5 h-5" /></a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech stack */}
      <section className="section bg-dark-surface">
        <div className="container-rd">
          <div className="text-center mb-12">
            <h2 className="section-title text-white mb-4">Technology <span className="text-gradient">Stack</span></h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: 'React.js', color: 'text-cyan-400' },
              { name: 'Tailwind CSS', color: 'text-teal-400' },
              { name: 'Node.js', color: 'text-green-400' },
              { name: 'Express.js', color: 'text-gray-300' },
              { name: 'PostgreSQL', color: 'text-blue-400' },
              { name: 'Socket.IO', color: 'text-white' },
              { name: 'Python', color: 'text-yellow-400' },
              { name: 'FastAPI', color: 'text-teal-300' },
              { name: 'scikit-learn', color: 'text-orange-400' },
              { name: 'XGBoost', color: 'text-red-400' },
              { name: 'Leaflet/OSM', color: 'text-green-300' },
              { name: 'JWT Auth', color: 'text-brand-400' },
            ].map(t => (
              <div key={t.name} className="card p-4 text-center hover:border-brand-500/30 transition-colors">
                <div className={`text-sm font-bold ${t.color}`}>{t.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-brand-gradient">
        <div className="container-rd text-center">
          <h2 className="text-4xl font-display font-black text-white mb-4">
            Ready to Experience RIDE-DISPATCHER?
          </h2>
          <p className="text-blue-100 mb-8 text-lg">Sign up for free and book your first AI-powered ride in Surat today.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/register" className="btn bg-white text-brand-600 font-bold px-8 py-4 rounded-xl hover:shadow-xl hover:scale-[1.02] transition-all">
              Get Started — It's Free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/" className="btn-secondary btn-lg border-white/30 text-white hover:bg-white/10">
              Back to Home
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark-surface border-t border-dark-border py-8">
        <div className="container-rd text-center text-sm text-gray-600">
          © 2024 RIDE-DISPATCHER · Disha Ghadiya · Anshika Badala · Shruti Babariya · Surat, Gujarat
        </div>
      </footer>
    </div>
  );
}
