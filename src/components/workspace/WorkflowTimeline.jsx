import { motion } from 'framer-motion';
import { AlertTriangle, Check, Clock3, Loader2 } from 'lucide-react';

/**
 * The six workflow stages. Stage identity, wording and metrics all come from the
 * server: the component only renders what the backend actually reported.
 */
export const STAGE_ORDER = [
  { id: 'understand', title: 'Understand', caption: 'Read your objective, preferences and constraints.' },
  { id: 'discover', title: 'Discover', caption: 'Resolve each preference into a real entity.' },
  { id: 'generate', title: 'Generate options', caption: 'Pull taste-based candidates per target category.' },
  { id: 'evaluate', title: 'Evaluate', caption: 'Score every candidate on transparent factors.' },
  { id: 'decide', title: 'Decide', caption: 'Select a diverse shortlist and write explanations.' },
  { id: 'improve', title: 'Improve', caption: 'Apply your feedback to reshape the ranking.' },
];

const STATUS_META = {
  pending: { tone: 'text-slate-500', ring: 'border-white/10 bg-white/[0.03]', icon: Clock3 },
  running: { tone: 'text-cyan-100', ring: 'border-cyan-glow/50 bg-cyan-glow/10', icon: Loader2 },
  completed: { tone: 'text-emerald-100', ring: 'border-emerald-400/40 bg-emerald-400/10', icon: Check },
  failed: { tone: 'text-rose-100', ring: 'border-rose-400/40 bg-rose-400/10', icon: AlertTriangle },
};

const StageRow = ({ definition, stage, index, isLast }) => {
  const reported = stage || {};
  const status = reported.status || 'pending';
  const meta = STATUS_META[status] || STATUS_META.pending;
  const Icon = meta.icon;
  const duration = Number.isFinite(reported.durationMs) ? reported.durationMs : null;

  return (
    <li className="relative flex gap-3.5 pb-5 last:pb-0">
      {!isLast && (
        <span
          aria-hidden="true"
          className={`absolute left-[15px] top-9 h-[calc(100%-1.5rem)] w-px ${
            status === 'completed' ? 'bg-gradient-to-b from-emerald-400/50 to-cyan-glow/25' : 'bg-white/10'
          }`}
        />
      )}

      <span
        className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${meta.ring}`}
      >
        <Icon
          className={`h-3.5 w-3.5 ${meta.tone} ${status === 'running' ? 'animate-spin' : ''}`}
          aria-hidden="true"
        />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <span className={`text-sm font-semibold ${status === 'pending' ? 'text-slate-500' : 'text-slate-100'}`}>
            <span className="mr-1.5 font-mono text-[10px] text-slate-500">{String(index + 1).padStart(2, '0')}</span>
            {reported.title || definition.title}
          </span>
          {duration !== null && (
            <span className="font-mono text-[10px] text-slate-500">{duration} ms</span>
          )}
        </div>

        <p className="mt-0.5 text-xs leading-relaxed text-slate-400">
          {reported.detail || definition.caption}
        </p>

        {reported.metrics?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {reported.metrics.map((metric) => (
              <span
                key={`${reported.id}-${metric.label}`}
                className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] text-slate-300"
              >
                {metric.label}: <span className="text-cyan-100">{metric.value}</span>
              </span>
            ))}
          </div>
        )}

        {reported.notes?.length > 0 && (
          <ul className="mt-2 space-y-1">
            {reported.notes.map((note) => (
              <li key={note} className="flex gap-1.5 text-[11px] leading-relaxed text-amber-200/90">
                <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
                {note}
              </li>
            ))}
          </ul>
        )}
      </div>
    </li>
  );
};

export const WorkflowTimeline = ({ stages = [], status = 'idle', durationMs, requestId }) => {
  const byId = new Map(stages.map((stage) => [stage.id, stage]));

  return (
    <div className="glass p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-base font-semibold text-white">Agent workflow</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Six stages, reported live by the backend as they run.
          </p>
        </div>
        {Number.isFinite(durationMs) && (
          <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-[10px] text-slate-300">
            total {durationMs} ms
          </span>
        )}
      </div>

      <motion.ol layout className="mt-5">
        {STAGE_ORDER.map((definition, index) => (
          <StageRow
            key={definition.id}
            definition={definition}
            stage={byId.get(definition.id)}
            index={index}
            isLast={index === STAGE_ORDER.length - 1}
          />
        ))}
      </motion.ol>

      {status === 'running' && stages.some((stage) => stage.status === 'running') && (
        <p className="mt-1 text-[11px] text-slate-500">
          Waiting for the remaining stages to report back…
        </p>
      )}

      {requestId && (
        <p className="mt-4 border-t border-white/[0.07] pt-3 font-mono text-[10px] text-slate-600">
          request {requestId}
        </p>
      )}
    </div>
  );
};

export default WorkflowTimeline;
