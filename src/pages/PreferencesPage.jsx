import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import PreferenceBuilder from '../components/preferences/PreferenceBuilder.jsx';
import { Badge, GlassCard, SectionHeading, Spinner, TypeIcon } from '../components/ui.jsx';
import { useDecision } from '../context/DecisionContext.jsx';
import { iconForObjective } from '../lib/icons.js';

const ConstraintChips = ({ label, options, value, onChange, allowClear = true }) => (
  <div>
    <p className="label">{label}</p>
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          aria-pressed={value === option.id}
          onClick={() => onChange(allowClear && value === option.id ? null : option.id)}
          className={value === option.id ? 'chip-on' : 'chip-off'}
        >
          {option.label}
        </button>
      ))}
    </div>
  </div>
);

export const PreferencesPage = () => {
  const navigate = useNavigate();
  const {
    options,
    optionsStatus,
    optionsError,
    preferences,
    objectiveId,
    setObjectiveId,
    constraints,
    updateConstraints,
    resetConstraints,
    run,
    runWorkflow,
    clearExcluded,
    excluded,
  } = useDecision();

  const [localError, setLocalError] = useState(null);

  const objectives = options?.objectives || [];
  const activeObjective = objectives.find((objective) => objective.id === objectiveId);

  const handleRun = async () => {
    if (!preferences.length) {
      setLocalError('Add at least one preference before running the engine.');
      return;
    }
    setLocalError(null);
    navigate('/workspace');
    await runWorkflow({});
  };

  if (optionsStatus === 'error') {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <GlassCard className="p-6">
          <p className="font-display text-lg font-semibold text-white">The backend is not reachable</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            {optionsError?.message || 'Could not load objectives and categories.'} Start the API with{' '}
            <span className="font-mono text-cyan-100">npm run dev:server</span> and reload.
          </p>
          <button type="button" className="btn-ghost mt-4" onClick={() => window.location.reload()}>
            Reload
          </button>
        </GlassCard>
      </div>
    );
  }

  const loading = optionsStatus === 'loading';

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionHeading
          eyebrow="Step 1 · Preference input"
          title="Tell the agent what you actually like"
          description="Add a few favourites, choose what you are deciding, and set any constraints. The engine will resolve these names into real entities before it recommends anything."
        />
        {excluded.length > 0 && (
          <Badge tone="amber">
            {excluded.length} excluded from previous runs
            <button
              type="button"
              className="ml-1 underline decoration-dotted"
              onClick={clearExcluded}
            >
              reset
            </button>
          </Badge>
        )}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        {/* ------------------------------------------------------ left */}
        <div className="space-y-6">
          {loading ? (
            <GlassCard className="space-y-4 p-6">
              <div className="skeleton h-5 w-40" />
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="skeleton h-7 w-24 rounded-full" />
                ))}
              </div>
              <div className="skeleton h-10 w-full" />
              <div className="skeleton h-24 w-full" />
            </GlassCard>
          ) : (
            <PreferenceBuilder />
          )}
        </div>

        {/* ----------------------------------------------------- right */}
        <div className="space-y-6">
          <GlassCard className="p-5 sm:p-6">
            <h2 className="font-display text-lg font-semibold text-white">What are you deciding?</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              The objective sets which categories the agent searches for.
            </p>

            <div className="mt-5 space-y-2.5" role="radiogroup" aria-label="Decision objective">
              {loading
                ? Array.from({ length: 3 }).map((_, index) => <div key={index} className="skeleton h-16 w-full" />)
                : objectives.map((objective) => {
                    const Icon = iconForObjective(objective.icon);
                    const active = objective.id === objectiveId;
                    return (
                      <button
                        key={objective.id}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setObjectiveId(objective.id)}
                        className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition ${
                          active
                            ? 'border-violet-bright/60 bg-violet-glow/15 shadow-[0_0_30px_-14px_rgba(139,92,246,0.9)]'
                            : 'border-white/10 bg-white/[0.02] hover:border-white/25'
                        }`}
                      >
                        <span
                          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${
                            active ? 'border-violet-bright/50 bg-violet-glow/20' : 'border-white/10 bg-white/[0.04]'
                          }`}
                        >
                          <Icon className={`h-4 w-4 ${active ? 'text-violet-bright' : 'text-slate-400'}`} />
                        </span>
                        <span className="min-w-0">
                          <span className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-100">{objective.label}</span>
                            {active && <CheckCircle2 className="h-3.5 w-3.5 text-cyan-glow" />}
                          </span>
                          <span className="mt-1 block text-xs leading-relaxed text-slate-400">
                            {objective.description}
                          </span>
                          <span className="mt-1.5 flex flex-wrap gap-1.5">
                            {objective.targets.map((target) => (
                              <span
                                key={target}
                                className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] text-slate-400"
                              >
                                <TypeIcon type={target} className="h-2.5 w-2.5" />
                                {target.replace(/_/g, ' ')}
                              </span>
                            ))}
                          </span>
                        </span>
                      </button>
                    );
                  })}
            </div>
          </GlassCard>

          <GlassCard className="space-y-5 p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-semibold text-white">Optional constraints</h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Only used where the provider returns matching data. Constraints that cannot be verified are reported
                  as unverified, never assumed.
                </p>
              </div>
              <button type="button" className="btn-subtle shrink-0 !px-2.5 !py-1.5 text-xs" onClick={resetConstraints}>
                Reset
              </button>
            </div>

            <div>
              <label className="label" htmlFor="constraint-location">
                Location
              </label>
              <input
                id="constraint-location"
                className="field"
                placeholder="e.g. Tokyo, Lisbon, Brooklyn"
                value={constraints.location || ''}
                maxLength={80}
                onChange={(event) => updateConstraints({ location: event.target.value })}
              />
            </div>

            <div>
              <label className="label" htmlFor="constraint-mood">
                Mood
              </label>
              <input
                id="constraint-mood"
                className="field"
                placeholder="e.g. quiet, nostalgic, energetic"
                value={constraints.mood || ''}
                maxLength={60}
                onChange={(event) => updateConstraints({ mood: event.target.value })}
              />
            </div>

            <ConstraintChips
              label="Budget"
              options={options?.budgets || []}
              value={constraints.budget}
              onChange={(value) => updateConstraints({ budget: value })}
            />

            <ConstraintChips
              label="Time available"
              options={options?.times || []}
              value={constraints.timeAvailable}
              onChange={(value) => updateConstraints({ timeAvailable: value })}
            />
          </GlassCard>
        </div>
      </div>

      {/* ------------------------------------------------------ action bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong sticky bottom-4 z-30 mt-8 flex flex-wrap items-center justify-between gap-4 p-4 sm:px-5"
      >
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-wider text-slate-500">Ready to run</p>
          <p className="mt-1 truncate text-sm text-slate-300">
            {preferences.length
              ? `${preferences.length} preference${preferences.length === 1 ? '' : 's'} · ${
                  activeObjective?.label || 'objective not set'
                }`
              : 'No preferences yet'}
          </p>
          {localError && (
            <p role="alert" className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-300">
              <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
              {localError}
            </p>
          )}
          {run.status === 'error' && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-300">
              <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
              {run.error?.message}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {run.status === 'running' && (
            <span className="flex items-center gap-2 text-xs text-cyan-100">
              <Spinner />
              running
            </span>
          )}
          <button
            type="button"
            className="btn-primary"
            onClick={handleRun}
            disabled={run.status === 'running' || !preferences.length}
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Run decision engine
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PreferencesPage;
