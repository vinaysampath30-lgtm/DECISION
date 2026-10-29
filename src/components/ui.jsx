import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Disc3,
  Film,
  Gamepad2,
  MapPin,
  Mic,
  Music,
  PenLine,
  Plane,
  Sparkles,
  Tag,
  Tv,
  Utensils,
} from 'lucide-react';
import { initials, resolveEntityImage } from '../lib/format.js';

export const TYPE_ICONS = {
  movie: Film,
  tv_show: Tv,
  artist: Music,
  album: Disc3,
  book: BookOpen,
  author: PenLine,
  cuisine: Utensils,
  place: MapPin,
  brand: Tag,
  destination: Plane,
  podcast: Mic,
  video_game: Gamepad2,
  director: Film,
  person: Sparkles,
};

export const TypeIcon = ({ type, className = 'h-4 w-4' }) => {
  const Icon = TYPE_ICONS[type] || Sparkles;
  return <Icon className={className} aria-hidden="true" />;
};

export const GlassCard = ({ children, className = '', interactive = false, ...rest }) => (
  <div
    className={`glass ${interactive ? 'transition duration-200 hover:border-white/25 hover:bg-white/[0.06]' : ''} ${className}`}
    {...rest}
  >
    {children}
  </div>
);

export const SectionHeading = ({ eyebrow, title, description, align = 'left' }) => (
  <div className={align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
    {eyebrow && (
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-glow">{eyebrow}</p>
    )}
    <h2 className="font-display text-2xl font-semibold text-white sm:text-3xl">{title}</h2>
    {description && <p className="mt-3 text-sm leading-relaxed text-slate-400">{description}</p>}
  </div>
);

const BADGE_TONES = {
  default: 'border-white/[0.12] bg-white/[0.05] text-slate-300',
  violet: 'border-violet-bright/40 bg-violet-glow/15 text-violet-100',
  cyan: 'border-cyan-glow/40 bg-cyan-glow/10 text-cyan-100',
  amber: 'border-amber-400/40 bg-amber-400/10 text-amber-100',
  rose: 'border-rose-400/40 bg-rose-400/10 text-rose-100',
  emerald: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-100',
};

export const Badge = ({ children, tone = 'default', className = '' }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
      BADGE_TONES[tone] || BADGE_TONES.default
    } ${className}`}
  >
    {children}
  </span>
);

export const Spinner = ({ className = 'h-4 w-4' }) => (
  <motion.span
    className={`inline-block rounded-full border-2 border-white/25 border-t-cyan-glow ${className}`}
    animate={{ rotate: 360 }}
    transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
    aria-hidden="true"
  />
);

export const Skeleton = ({ className = 'h-4 w-full' }) => <div className={`skeleton ${className}`} />;

export const ScoreBar = ({ percent = 0, tone = 'violet', className = '' }) => {
  const safe = Math.max(0, Math.min(100, percent));
  const gradient = tone === 'cyan' ? 'from-cyan-glow to-violet-bright' : 'from-violet-glow to-cyan-glow';

  return (
    <div className={`h-1.5 w-full overflow-hidden rounded-full bg-white/[0.07] ${className}`}>
      <motion.div
        className={`h-full rounded-full bg-gradient-to-r ${gradient}`}
        initial={{ width: 0 }}
        animate={{ width: `${safe}%` }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      />
    </div>
  );
};

export const EmptyState = ({ icon: Icon = Sparkles, title, description, action }) => (
  <div className="glass flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
    <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05]">
      <Icon className="h-5 w-5 text-cyan-glow" aria-hidden="true" />
    </span>
    <h3 className="font-display text-lg font-semibold text-white">{title}</h3>
    {description && <p className="max-w-md text-sm leading-relaxed text-slate-400">{description}</p>}
    {action}
  </div>
);

export const ErrorState = ({ title = 'Something went wrong', message, code, onRetry }) => (
  <div
    role="alert"
    className="rounded-2xl border border-rose-400/30 bg-rose-500/[0.07] px-5 py-4 text-sm text-rose-100"
  >
    <p className="font-semibold">{title}</p>
    {message && <p className="mt-1 leading-relaxed text-rose-100/85">{message}</p>}
    <div className="mt-2 flex flex-wrap items-center gap-3">
      {code && <span className="font-mono text-[11px] text-rose-200/70">{code}</span>}
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn-ghost !px-3 !py-1.5 text-xs">
          Try again
        </button>
      )}
    </div>
  </div>
);

/** Entity artwork: provider image → generated demo illustration → monogram tile. */
export const EntityThumb = ({ entity, mode, className = 'h-10 w-10', rounded = 'rounded-xl' }) => {
  const [failed, setFailed] = useState(false);
  const url = resolveEntityImage(entity, { mode });

  if (!url || failed) {
    return (
      <span
        className={`flex ${className} ${rounded} shrink-0 items-center justify-center bg-gradient-to-br from-violet-glow/40 to-cyan-glow/30 font-display text-xs font-semibold text-white`}
        aria-hidden="true"
      >
        {initials(entity?.name)}
      </span>
    );
  }

  return (
    <img
      src={url}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
      className={`${className} ${rounded} shrink-0 object-cover`}
    />
  );
};
