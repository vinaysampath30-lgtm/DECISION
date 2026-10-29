import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bookmark, BookmarkCheck, ExternalLink, Info, Link2, MapPin, Tag, X } from 'lucide-react';
import { Badge, EntityThumb, ScoreBar, TypeIcon } from '../ui.jsx';
import { resolveEntityImage, sourceLabel } from '../../lib/format.js';

/**
 * Full recommendation detail. Includes the connection to the user's stated
 * preferences, the engine's reason, related entities discovered in the same
 * run, and an explicit provenance block so the origin of every value is clear.
 */
export const RecommendationDetail = ({ recommendation, mode, isSaved, onToggleSave, onClose, onOpenRelated }) => {
  const closeRef = useRef(null);

  useEffect(() => {
    if (!recommendation) return undefined;

    closeRef.current?.focus();

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [recommendation, onClose]);

  const open = Boolean(recommendation);
  const score = recommendation?.score || {};
  const image = resolveEntityImage(recommendation, { mode });

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/80 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`${recommendation.name} details`}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            onClick={(event) => event.stopPropagation()}
            className="glass-strong max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-2xl sm:rounded-2xl"
          >
            {/* ------------------------------------------------------ header */}
            <div className="relative">
              {image && (
                <div className="h-40 w-full overflow-hidden sm:h-52">
                  <img src={image} alt="" className="h-full w-full object-cover opacity-70" />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/60 to-transparent" />
                </div>
              )}

              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Close details"
                className="absolute right-3 top-3 rounded-full border border-white/15 bg-ink-950/70 p-2 text-slate-200 transition hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>

              <div className={`px-5 pb-4 sm:px-7 ${image ? '-mt-12' : 'pt-6'}`}>
                <div className="flex flex-wrap items-start gap-3">
                  <EntityThumb entity={recommendation} mode={mode} className="h-16 w-16" rounded="rounded-2xl" />
                  <div className="min-w-0 flex-1">
                    <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
                      {recommendation.name}
                    </h2>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <Badge tone="violet">
                        <TypeIcon type={recommendation.category} className="h-3 w-3" />
                        {recommendation.categoryLabel || recommendation.category}
                      </Badge>
                      <Badge tone={recommendation.source === 'qloo' ? 'emerald' : 'amber'}>
                        {recommendation.provider || sourceLabel(recommendation.source)}
                      </Badge>
                      {recommendation.disambiguation && (
                        <Badge tone="default">{recommendation.disambiguation}</Badge>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onToggleSave(recommendation)}
                    className={`btn-subtle shrink-0 !px-3 !py-2 text-xs ${isSaved ? '!border-cyan-glow/50 !text-cyan-100' : ''}`}
                  >
                    {isSaved ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
                    {isSaved ? 'Saved' : 'Save'}
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-6 px-5 pb-7 sm:px-7">
              {recommendation.description && (
                <p className="text-sm leading-relaxed text-slate-300">{recommendation.description}</p>
              )}

              {/* ------------------------------------------- connection block */}
              <section>
                <h3 className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-glow">
                  <Link2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Connection to your preferences
                </h3>
                {recommendation.connections?.length ? (
                  <ul className="mt-2.5 flex flex-wrap gap-2">
                    {recommendation.connections.map((connection) => (
                      <li
                        key={`${recommendation.id}-detail-${connection.preferenceId}`}
                        className="flex items-center gap-1.5 rounded-full border border-white/[0.12] bg-white/[0.05] px-3 py-1 text-xs text-slate-200"
                      >
                        <TypeIcon type={connection.preferenceType} className="h-3 w-3 text-violet-bright" />
                        {connection.preferenceName}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-xs text-slate-500">
                    No direct preference signal was recorded for this entity.
                  </p>
                )}

                {recommendation.reason && (
                  <p className="mt-3 border-l-2 border-violet-bright/50 pl-3 text-xs leading-relaxed text-slate-300">
                    {recommendation.reason}
                  </p>
                )}
              </section>

              {/* ---------------------------------------------- score detail */}
              {Number.isFinite(score.percent) && (
                <section>
                  <h3 className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-glow">
                    <Info className="h-3.5 w-3.5" aria-hidden="true" />
                    How this was scored
                  </h3>
                  <div className="mt-2.5 flex items-center gap-3">
                    <span className="font-display text-3xl font-semibold text-white">{score.percent}</span>
                    <div className="flex-1">
                      <ScoreBar percent={score.percent} />
                      <p className="mt-1.5 text-[10px] text-slate-500">
                        {score.label || 'Engine score (heuristic)'} · generated by this application, not a Qloo
                        metric.
                      </p>
                    </div>
                  </div>

                  <ul className="mt-4 space-y-3">
                    {(score.breakdown || []).map((factor) => (
                      <li key={factor.key}>
                        <div className="flex items-baseline justify-between gap-3">
                          <span className="text-xs text-slate-200">{factor.label}</span>
                          <span className="font-mono text-[10px] text-slate-500">
                            weight {factor.weight} · contribution {factor.contribution}
                          </span>
                        </div>
                        <ScoreBar
                          percent={factor.applied ? Math.round(factor.value * 100) : 0}
                          tone="cyan"
                          className="mt-1.5"
                        />
                        <p className="mt-1 text-[10px] text-slate-500">
                          {factor.detail}
                          {!factor.applied && ' · excluded from this score'}
                        </p>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* ------------------------------------------- provider values */}
              {(recommendation.qlooPopularity !== null && recommendation.qlooPopularity !== undefined) ||
              (recommendation.qlooRating !== null && recommendation.qlooRating !== undefined) ? (
                <section>
                  <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-200">
                    Provider-provided values
                  </h3>
                  <p className="mt-1.5 text-[10px] text-slate-500">
                    Returned by the entity source. Shown separately and never folded into the engine score.
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {recommendation.qlooPopularity !== null && recommendation.qlooPopularity !== undefined && (
                      <span className="rounded-lg border border-emerald-400/25 bg-emerald-400/[0.07] px-3 py-1.5 font-mono text-xs text-emerald-100">
                        popularity {recommendation.qlooPopularity}
                      </span>
                    )}
                    {recommendation.qlooRating !== null && recommendation.qlooRating !== undefined && (
                      <span className="rounded-lg border border-emerald-400/25 bg-emerald-400/[0.07] px-3 py-1.5 font-mono text-xs text-emerald-100">
                        rating {recommendation.qlooRating}
                      </span>
                    )}
                  </div>
                </section>
              ) : null}

              {/* ---------------------------------------------------- metadata */}
              {(recommendation.address || recommendation.priceLevel || recommendation.tags?.length > 0) && (
                <section>
                  <h3 className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-glow">
                    <Tag className="h-3.5 w-3.5" aria-hidden="true" />
                    Entity metadata
                  </h3>
                  <div className="mt-2.5 space-y-2 text-xs text-slate-300">
                    {recommendation.address && (
                      <p className="flex items-start gap-2">
                        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" aria-hidden="true" />
                        {recommendation.address}
                      </p>
                    )}
                    {recommendation.priceLevel !== null && recommendation.priceLevel !== undefined && (
                      <p>
                        Price level:{' '}
                        <span className="font-mono text-slate-200">
                          {String(recommendation.priceLevel)}
                        </span>
                      </p>
                    )}
                    {recommendation.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {recommendation.tags.map((tag) => (
                          <span
                            key={typeof tag === 'string' ? tag : tag.id || tag.name}
                            className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] text-slate-400"
                          >
                            {typeof tag === 'string' ? tag : tag.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* ------------------------------------------------------ related */}
              <section>
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-glow">
                  Related entities in this run
                </h3>
                {recommendation.related?.length ? (
                  <ul className="mt-2.5 grid gap-2 sm:grid-cols-2">
                    {recommendation.related.map((related) => (
                      <li key={related.id}>
                        <button
                          type="button"
                          onClick={() => onOpenRelated(related.id)}
                          className="flex w-full items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-left transition hover:border-white/25"
                        >
                          <span className="min-w-0">
                            <span className="block truncate text-xs font-medium text-slate-100">
                              {related.name}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {related.type?.replace(/_/g, ' ')} · {sourceLabel(related.source)}
                            </span>
                          </span>
                          <span className="shrink-0 font-mono text-[10px] text-cyan-100">
                            {related.scorePercent}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-xs text-slate-500">
                    No related entities surfaced for this recommendation in this run.
                  </p>
                )}
              </section>

              {/* --------------------------------------------------- provenance */}
              <section className="rounded-xl border border-white/[0.09] bg-white/[0.02] p-4">
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Source &amp; provenance
                </h3>
                <dl className="mt-2.5 grid gap-x-6 gap-y-2 text-xs sm:grid-cols-2">
                  <div>
                    <dt className="text-slate-500">Data source</dt>
                    <dd className="text-slate-200">{recommendation.provider || sourceLabel(recommendation.source)}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Entity type</dt>
                    <dd className="font-mono text-[11px] text-slate-200">
                      {recommendation.typeUrn || recommendation.category}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Entity id</dt>
                    <dd className="break-all font-mono text-[11px] text-slate-200">{recommendation.id}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Score kind</dt>
                    <dd className="text-slate-200">
                      {score.kind === 'heuristic' ? 'Engine heuristic (not a provider metric)' : 'Unavailable'}
                    </dd>
                  </div>
                </dl>

                {recommendation.uncertainty && (
                  <p className="mt-3 text-[10px] leading-relaxed text-slate-500">
                    <ExternalLink className="mr-1 inline h-3 w-3" aria-hidden="true" />
                    Uncertainty: {recommendation.uncertainty}
                  </p>
                )}
              </section>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RecommendationDetail;
