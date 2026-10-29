import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Database, Menu, Network, X } from 'lucide-react';
import { useDecision } from '../../context/DecisionContext.jsx';

const LINKS = [
  { to: '/', label: 'Overview', end: true },
  { to: '/preferences', label: 'Preferences' },
  { to: '/workspace', label: 'Workspace' },
  { to: '/history', label: 'Saved & history' },
];

const ModeBadge = ({ mode, qlooConfigured }) => {
  const [open, setOpen] = useState(false);
  const live = mode === 'live';

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${
          live
            ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-100 hover:bg-emerald-400/20'
            : 'border-amber-400/40 bg-amber-400/10 text-amber-100 hover:bg-amber-400/20'
        }`}
      >
        {live ? <Network className="h-3 w-3" /> : <Database className="h-3 w-3" />}
        {live ? 'Live Qloo' : 'Demo mode'}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="glass-strong absolute right-0 z-50 mt-2 w-72 p-4 text-xs leading-relaxed text-slate-300"
          >
            {live ? (
              <>
                <p className="font-semibold text-emerald-200">Live Qloo data</p>
                <p className="mt-1.5">
                  A <span className="font-mono">QLOO_API_KEY</span> is configured on the server, so entity
                  resolution and taste discovery run against the real Qloo API.
                </p>
                <p className="mt-1.5 text-slate-400">
                  Every result is tagged with its source, and Qloo-provided values are shown separately from the
                  engine&apos;s own heuristic score.
                </p>
              </>
            ) : (
              <>
                <p className="font-semibold text-amber-200">Demo mode — not Qloo data</p>
                <p className="mt-1.5">
                  No <span className="font-mono">QLOO_API_KEY</span> is set, so the agent runs against a labelled
                  local sample catalogue instead of the live Qloo API.
                </p>
                <p className="mt-1.5 text-slate-400">
                  The full six-stage workflow, scoring and explanations are real and identical — only the entity
                  source differs. Add a key to <span className="font-mono">server/.env</span> and restart to switch
                  to live Qloo data.
                </p>
              </>
            )}
            {!qlooConfigured && (
              <p className="mt-2.5 rounded-lg border border-amber-400/25 bg-amber-400/[0.06] px-2.5 py-2 font-mono text-[10px] text-amber-100/90">
                QLOO_API_KEY=
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const Navbar = () => {
  const { mode, qlooConfigured } = useDecision();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.07] bg-ink-950/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-glow to-cyan-glow shadow-glow">
            <Network className="h-4 w-4 text-white" aria-hidden="true" />
          </span>
          <span className="font-display text-sm font-semibold leading-tight text-white">
            Agentic Decision Engine
            <span className="block text-[10px] font-normal tracking-wide text-slate-500">
              taste intelligence · agentic reasoning
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive ? 'bg-white/[0.07] text-white' : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-100'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ModeBadge mode={mode} qlooConfigured={qlooConfigured} />
          <Link to="/preferences" className="btn-primary hidden !px-3.5 !py-2 text-xs sm:inline-flex">
            Start discovering
          </Link>
          <button
            type="button"
            className="btn-subtle !p-2 md:hidden"
            onClick={() => setMobileOpen((value) => !value)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/[0.07] md:hidden"
            aria-label="Mobile"
          >
            <div className="flex flex-col gap-1 px-4 py-3">
              {LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                      isActive ? 'bg-white/[0.07] text-white' : 'text-slate-400 hover:bg-white/[0.04]'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
