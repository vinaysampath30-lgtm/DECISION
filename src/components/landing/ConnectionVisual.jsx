import { motion } from 'framer-motion';
import { Cpu, Film, MapPin, Music, Plane, Sparkles, Tv, Utensils } from 'lucide-react';

/**
 * Animated illustration of the core idea: a few preferences on the left, the
 * agent in the middle, cross-category recommendations on the right.
 * Purely decorative — no data is implied by the visual.
 */

const INPUTS = [
  { icon: Film, label: 'Film', note: 'Interstellar', y: 42 },
  { icon: Music, label: 'Artist', note: 'Tame Impala', y: 142 },
  { icon: Utensils, label: 'Cuisine', note: 'Japanese', y: 242 },
];

const OUTPUTS = [
  { icon: MapPin, label: 'Place', note: 'Listening bar', y: 42 },
  { icon: Tv, label: 'Series', note: 'Severance', y: 142 },
  { icon: Plane, label: 'Destination', note: 'Kyoto', y: 242 },
];

const curve = (fromY, toY) => `M 150 ${fromY} C 235 ${fromY}, 265 ${toY}, 350 ${toY}`;

export const ConnectionVisual = () => (
  <div className="glass relative overflow-hidden px-4 py-6 sm:px-6">
    <div
      className="pointer-events-none absolute inset-0 bg-grid-fade opacity-40"
      style={{ backgroundSize: '36px 36px' }}
      aria-hidden="true"
    />
    <div className="relative">
      <div className="mb-5 flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
          Preference graph
        </p>
        <span className="inline-flex items-center gap-1.5 text-[11px] text-cyan-glow">
          <Sparkles className="h-3 w-3" aria-hidden="true" />
          cross-category discovery
        </span>
      </div>

      <svg viewBox="0 0 500 300" className="w-full" role="img" aria-label="Preferences connected to recommendations">
        <defs>
          <linearGradient id="wire" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.15" />
            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.5" />
          </linearGradient>
        </defs>

        {INPUTS.map((input, index) =>
          OUTPUTS.map((output, outIndex) => {
            const active = index === outIndex || (index + outIndex) % 2 === 0;
            return (
              <path
                key={`${input.label}-${output.label}`}
                d={curve(input.y, output.y)}
                fill="none"
                stroke="url(#wire)"
                strokeWidth={active ? 1.6 : 0.8}
                strokeOpacity={active ? 0.95 : 0.35}
                strokeDasharray="6 10"
              >
                <animate
                  attributeName="stroke-dashoffset"
                  from="0"
                  to="-32"
                  dur={`${2.4 + ((index + outIndex) % 3) * 0.8}s`}
                  repeatCount="indefinite"
                />
              </path>
            );
          }),
        )}

        <g>
          <circle cx="250" cy="142" r="46" fill="url(#wire)" opacity="0.14" />
          <circle cx="250" cy="142" r="34" fill="#0b0b1e" stroke="#8b5cf6" strokeOpacity="0.6" />
          <foreignObject x="222" y="114" width="56" height="56">
            <div className="flex h-14 w-14 items-center justify-center">
              <Cpu className="h-5 w-5 text-cyan-glow" />
            </div>
          </foreignObject>
        </g>
      </svg>

      <div className="mt-2 grid grid-cols-[1fr_auto_1fr] items-start gap-3">
        <ul className="space-y-2">
          {INPUTS.map((input) => (
            <li key={input.label} className="flex items-center gap-2 text-xs">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-violet-bright/30 bg-violet-glow/10">
                <input.icon className="h-3.5 w-3.5 text-violet-bright" aria-hidden="true" />
              </span>
              <span>
                <span className="block font-medium text-slate-200">{input.label}</span>
                <span className="text-[11px] text-slate-500">{input.note}</span>
              </span>
            </li>
          ))}
        </ul>

        <motion.div
          className="mt-6 hidden flex-col items-center gap-1 sm:flex"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="h-14 w-px bg-gradient-to-b from-violet-glow/60 to-cyan-glow/60" />
          <span className="rounded-full border border-white/10 bg-ink-900/80 px-2 py-1 text-[10px] font-medium text-slate-400">
            agent
          </span>
          <span className="h-14 w-px bg-gradient-to-b from-cyan-glow/60 to-violet-glow/60" />
        </motion.div>

        <ul className="space-y-2 text-right">
          {OUTPUTS.map((output) => (
            <li key={output.label} className="flex flex-row-reverse items-center gap-2 text-xs">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-cyan-glow/30 bg-cyan-glow/10">
                <output.icon className="h-3.5 w-3.5 text-cyan-glow" aria-hidden="true" />
              </span>
              <span>
                <span className="block font-medium text-slate-200">{output.label}</span>
                <span className="text-[11px] text-slate-500">{output.note}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);

export default ConnectionVisual;
