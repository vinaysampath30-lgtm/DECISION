import { AlertTriangle, CheckCircle2, Compass, MapPin, SlidersHorizontal, Sparkles } from 'lucide-react';
import { Badge, TypeIcon } from '../ui.jsx';

/**
 * Mirrors the resolved understanding of the request: which preferences were
 * matched to real entities, which were not, the objective, and the constraints
 * that were actually applied.
 */
export const PreferenceSummary = ({ payload, options }) => {
  const preferences = payload?.preferences || [];
  const objective = payload?.objective;
  const constraints = payload?.constraints || {};

  const budgetLabel = options?.budgets?.find((budget) => budget.id === constraints.budget)?.label;
  const timeLabel = options?.times?.find((time) => time.id === constraints.timeAvailable)?.label;

  const constraintChips = [
    constraints.location ? { icon: MapPin, text: constraints.location } : null,
    budgetLabel ? { icon: SlidersHorizontal, text: budgetLabel } : null,
    timeLabel ? { icon: SlidersHorizontal, text: timeLabel } : null,
    constraints.mood ? { icon: Sparkles, text: `mood: ${constraints.mood}` } : null,
  ].filter(Boolean);

  return (
    <div className="glass p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-base font-semibold text-white">What the agent understood</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Resolved against {payload?.mode === 'live' ? 'the live Qloo API' : 'the local demo catalogue'}.
          </p>
        </div>
        {objective && (
          <Badge tone="violet">
            <Compass className="h-3 w-3" />
            {objective.label}
          </Badge>
        )}
      </div>

      <ul className="mt-4 space-y-2">
        {preferences.map((preference) => {
          const resolvedName = preference.entity?.name;
          return (
            <li
              key={`${preference.input?.type}-${preference.input?.name}`}
              className="flex items-center gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.02] px-3 py-2"
            >
              <TypeIcon type={preference.input?.type} className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              <span className="min-w-0 flex-1 truncate text-xs text-slate-200">
                {preference.input?.name}
                {resolvedName && resolvedName.toLowerCase() !== preference.input?.name.toLowerCase() && (
                  <span className="text-slate-500"> → {resolvedName}</span>
                )}
              </span>
              {preference.resolved ? (
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" aria-label="Resolved" />
              ) : (
                <span
                  className="flex shrink-0 items-center gap-1 text-[10px] text-amber-200"
                  title={preference.error || 'No matching entity was found'}
                >
                  <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                  unresolved
                </span>
              )}
            </li>
          );
        })}
      </ul>

      {preferences.some((preference) => !preference.resolved) && (
        <p className="mt-3 text-[10px] leading-relaxed text-amber-200/80">
          Unresolved preferences contribute no taste signal. Try a more specific name, or remove the entry.
        </p>
      )}

      <div className="mt-4 border-t border-white/[0.07] pt-3.5">
        <p className="text-[10px] uppercase tracking-wider text-slate-500">Constraints</p>
        {constraintChips.length ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {constraintChips.map((chip) => (
              <span
                key={chip.text}
                className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] text-slate-300"
              >
                <chip.icon className="h-3 w-3 text-cyan-glow" aria-hidden="true" />
                {chip.text}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-[10px] text-slate-500">
            None supplied — ranking is driven by taste evidence alone.
          </p>
        )}
      </div>

      {payload?.followUp?.needed && (
        <div className="mt-4 rounded-xl border border-cyan-glow/25 bg-cyan-glow/[0.06] px-3.5 py-3">
          <p className="text-[10px] uppercase tracking-wider text-cyan-100">The agent would ask next</p>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-200">{payload.followUp.question}</p>
          <p className="mt-1 text-[10px] text-slate-500">{payload.followUp.reason}</p>
        </div>
      )}
    </div>
  );
};

export default PreferenceSummary;
