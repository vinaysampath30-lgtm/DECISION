import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Compass, Layers, RefreshCw, RotateCcw, SlidersHorizontal, Sparkles, XOctagon } from 'lucide-react';
import { EmptyState, ErrorState, GlassCard, SectionHeading, Skeleton, Spinner } from '../components/ui.jsx';
import PreferenceSummary from '../components/workspace/PreferenceSummary.jsx';
import ProvenancePanel from '../components/workspace/ProvenancePanel.jsx';
import RecommendationCard from '../components/workspace/RecommendationCard.jsx';
import RecommendationDetail from '../components/workspace/RecommendationDetail.jsx';
import WorkflowTimeline from '../components/workspace/WorkflowTimeline.jsx';
import { useDecision } from '../context/DecisionContext.jsx';
import { formatDuration, formatRelativeTime } from '../lib/format.js';

const ResultSkeletons = () => (
  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
    {Array.from({ length: 3 }).map((_, index) => (
      <GlassCard key={index} className="space-y-4 p-5">
        <div className="flex gap-3.5">
          <Skeleton className="h-14 w-14 shrink-0 rounded-2xl" />
          <div className="flex-1 space-y-2 pt-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-1.5 w-full rounded-full" />
        <Skeleton className="h-8 w-full rounded-lg" />
      </GlassCard>
    ))}
  </div>
);

export const WorkspacePage = () => {
  const navigate = useNavigate();
  const {
    options,
    preferences,
    run,
    mode,
    feedback,
    excluded,
    reactTo,
    excludeEntity,
    clearExcluded,
    regenerate,
    cancelRun,
    runWorkflow,
    saved,
    saveRecommendation,
    isSaved,
  } = useDecision();

  const [detail, setDetail] = useState(null);

  const payload = run.result;
  const results = payload?.results || [];
  const running = run.status === 'running';

  const effectiveStages = useMemo(
    () => (running && run.stages?.length ? run.stages : payload?.stages || run.stages || []),
    [payload, run.stages, running],
  );

  const activeRunScoreNote = useMemo(() => {
    if (!payload) return null;
    const heuristics = options?.scoring?.label || 'Engine score (heuristic)';
    return `Scores shown are ${heuristics} values produced by this application.`;
  }, [options, payload]);

  const openDetail = (recommendation) => setDetail(recommendation);
  const closeDetail = () => setDetail(null);

  const openRelated = (relatedId) => {
    const match = results.find((item) => item.id === relatedId);
    if (match) setDetail(match);
  };

  const handleRetry = () => {
    if (!preferences.length) {
      navigate('/preferences');
      return;
    }
    runWorkflow({});
  };

  // ------------------------------------------------------------- no preferences
  if (!preferences.length && run.status === 'idle') {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
        <EmptyState
          icon={Sparkles}
          title="Nothing to decide yet"
          description="Add at least one preference and the agent will resolve it into real entities before recommending anything."
          action={
            <Link to="/preferences" className="btn-primary mt-1">
              Add preferences
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Step 2 · Agentic decision workspace"
        title="Your shortlist, and exactly how it was reached"
        description="Every recommendation below is traced back to the preference that produced it, with the engine's scoring factors shown openly."
      />

      {/* ------------------------------------------------------- control bar */}
      <div className="glass-strong mt-7 flex flex-wrap items-center justify-between gap-4 p-4 sm:px-5">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-wider text-slate-500">
            {running ? 'Running' : payload ? `Run ${formatRelativeTime(payload.createdAt)}` : 'Ready'}
          </p>
          <p className="mt-1 truncate text-sm text-slate-300">
            {preferences.length} preference{preferences.length === 1 ? '' : 's'}
            {payload?.objective?.label ? ` · ${payload.objective.label}` : ''}
            {payload ? ` · ${results.length} result${results.length === 1 ? '' : 's'}` : ''}
            {payload?.durationMs ? ` · ${formatDuration(payload.durationMs)}` : ''}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {running && (
            <span className="flex items-center gap-2 text-xs text-cyan-100">
              <Spinner />
              agent working
            </span>
          )}
          {running && (
            <button type="button" className="btn-subtle" onClick={cancelRun}>
              <XOctagon className="h-3.5 w-3.5" aria-hidden="true" />
              Cancel
            </button>
          )}
          <button type="button" className="btn-subtle" onClick={() => navigate('/preferences')}>
            <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
            Refine preferences
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => regenerate()}
            disabled={running || !preferences.length}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${running ? 'animate-spin' : ''}`} aria-hidden="true" />
            Re-run
          </button>
        </div>
      </div>

      {activeRunScoreNote && (
        <p className="mt-3 text-[11px] text-slate-500">{activeRunScoreNote}</p>
      )}

      {excluded.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-amber-200">
          <span>
            {excluded.length} entit{excluded.length === 1 ? 'y is' : 'ies are'} excluded from every run.
          </span>
          <button type="button" onClick={clearExcluded} className="underline decoration-dotted hover:text-amber-100">
            clear exclusions
          </button>
        </div>
      )}

      {run.status === 'error' && (
        <div className="mt-5">
          <ErrorState
            title="The decision workflow failed"
            message={run.error?.message}
            code={run.error?.code}
            onRetry={handleRetry}
          />
        </div>
      )}

      <div className="mt-7 grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        {/* --------------------------------------------------------- sidebar */}
        <div className="space-y-6">
          <WorkflowTimeline
            stages={effectiveStages}
            status={run.status}
            durationMs={payload?.durationMs}
            requestId={payload?.requestId}
          />

          {payload ? (
            <PreferenceSummary payload={payload} options={options} />
          ) : (
            <GlassCard className="space-y-3 p-5">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </GlassCard>
          )}

          {payload && (
            <ProvenancePanel
              provenance={payload.provenance}
              rankingChange={payload.rankingChange}
              feedbackApplied={payload.feedbackApplied}
              results={results}
            />
          )}

          {(feedback.liked.length > 0 || feedback.disliked.length > 0) && (
            <GlassCard className="p-5">
              <h2 className="font-display text-base font-semibold text-white">Feedback applied</h2>
              <p className="mt-1 text-xs text-slate-500">
                Re-run the engine to fold these into the ranking.
              </p>
              <p className="mt-3 font-mono text-xs text-slate-300">
                {feedback.liked.length} like(s) · {feedback.disliked.length} dislike(s)
              </p>
              <button type="button" className="btn-ghost mt-3 !px-3 !py-1.5 text-xs" onClick={() => regenerate()}>
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                Apply and re-run
              </button>
            </GlassCard>
          )}
        </div>

        {/* ---------------------------------------------------------- results */}
        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-white">
              <Layers className="h-4 w-4 text-cyan-glow" aria-hidden="true" />
              Recommendations
              {results.length > 0 && <span className="text-slate-500">({results.length})</span>}
            </h2>
            {payload?.mode && (
              <span className="font-mono text-[10px] text-slate-500">
                mode: {payload.mode} · {payload.provenance?.provider}
              </span>
            )}
          </div>

          {running && !results.length ? (
            <>
              <AnimatePresence>
                <motion.p
                  key="running-note"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mb-4 flex items-center gap-2 text-xs text-slate-400"
                >
                  <AlertCircle className="h-3.5 w-3.5 text-cyan-glow" aria-hidden="true" />
                  The agent is still evaluating candidates — results appear as soon as the Decide stage finishes.
                </motion.p>
              </AnimatePresence>
              <ResultSkeletons />
            </>
          ) : results.length ? (
            <motion.ul layout className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              <AnimatePresence initial={false}>
                {results.map((recommendation, index) => (
                  <RecommendationCard
                    key={recommendation.id}
                    recommendation={recommendation}
                    rank={index + 1}
                    mode={mode}
                    isSaved={isSaved(recommendation.id)}
                    reaction={
                      feedback.liked.includes(recommendation.id)
                        ? 'like'
                        : feedback.disliked.includes(recommendation.id)
                          ? 'dislike'
                          : null
                    }
                    onToggleSave={saveRecommendation}
                    onReact={reactTo}
                    onExclude={excludeEntity}
                    onOpen={openDetail}
                  />
                ))}
              </AnimatePresence>
            </motion.ul>
          ) : payload ? (
            <EmptyState
              icon={Compass}
              title="No candidates survived this run"
              description={
                effectiveStages.find((stage) => stage.id === 'decide')?.notes?.[0] ||
                'Try removing an exclusion, adding another preference, or choosing a different objective.'
              }
              action={
                <div className="mt-1 flex flex-wrap justify-center gap-2">
                  <button type="button" className="btn-ghost !px-3 !py-2 text-xs" onClick={() => navigate('/preferences')}>
                    Adjust preferences
                  </button>
                  {excluded.length > 0 && (
                    <button type="button" className="btn-primary !px-3 !py-2 text-xs" onClick={clearExcluded}>
                      Clear exclusions
                    </button>
                  )}
                </div>
              }
            />
          ) : (
            <EmptyState
              icon={Sparkles}
              title="No run yet"
              description="Run the decision engine to generate a shortlist from your preferences."
              action={
                <button type="button" className="btn-primary mt-1" onClick={() => regenerate()}>
                  Run decision engine
                </button>
              }
            />
          )}
        </div>
      </div>

      <RecommendationDetail
        recommendation={detail}
        mode={mode}
        isSaved={detail ? isSaved(detail.id) : false}
        onToggleSave={(recommendation) => {
          saveRecommendation(recommendation);
        }}
        onOpenRelated={openRelated}
        onClose={closeDetail}
      />

      {saved.length > 0 && (
        <p className="mt-8 text-center text-xs text-slate-500">
          {saved.length} saved discover{saved.length === 1 ? 'y' : 'ies'} —{' '}
          <Link to="/history" className="text-cyan-100 underline decoration-dotted">
            view saved &amp; history
          </Link>
        </p>
      )}
    </div>
  );
};

export default WorkspacePage;
