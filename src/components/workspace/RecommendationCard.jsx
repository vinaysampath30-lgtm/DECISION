import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bookmark,
  BookmarkCheck,
  ChevronDown,
  Info,
  Link2,
  Minimize2,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react';
import { Badge, EntityThumb, ScoreBar, TypeIcon } from '../ui.jsx';
import { sourceLabel, titleCase } from '../../lib/format.js';

/**
 * One recommendation. Every number on this card is either an engine heuristic
 * (explicitly labelled) or a provider value shown separately — never blended.
 */
export const RecommendationCard = ({
  recommendation,
  rank,
  mode,
  isSaved,
  reaction,
  onToggleSave,
  onReact,
  onExclude,
  onOpen,
}) => {
  const [showBreakdown, setShowBreakdown] = useState(false);

  const score = recommendation.score || {};
  const providerValues = [
    recommendation.qlooPopularity !== null && recommendation.qlooPopularity !== undefined
      ? { label: 'Provider popularity', value: recommendation.qlooPopularity }
      : null,
    recommendation.qlooRating !== null && recommendation.qlooRating !== undefined
      ? { label: 'Provider rating', value: recommendation.qlooRating }
      : null,
  ].filter(Boolean);

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.22 }}
      className="glass flex flex-col p-5"
    >
      {/* ------------------------------------------------------------ head */}
      <div className="flex items-start gap-3.5">
        <EntityThumb entity={recommendation} mode={mode} className="h-14 w-14" rounded="rounded-2xl" />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] text-slate-500">#{String(rank).padStart(2, '0')}</span>
            <h3 className="min-w-0 truncate font-display text-base font-semibold text-white">
              {recommendation.name}
            </h3>
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <Badge tone="violet">
              <TypeIcon type={recommendation.category} className="h-3 w-3" />
              {recommendation.categoryLabel || titleCase(recommendation.category)}
            </Badge>
            <Badge tone={recommendation.source === 'qloo' ? 'emerald' : 'amber'}>
              {recommendation.provider || sourceLabel(recommendation.source)}
            </Badge>
          </div>
        </div>

        {Number.isFinite(score.percent) && (
          <div className="shrink-0 text-right">
            <p className="font-display text-xl font-semibold text-white">{score.percent}</p>
            <p className="text-[10px] uppercase tracking-wider text-slate-500">score</p>
          </div>
        )}
      </div>

      {recommendation.description && (
        <p className="mt-3.5 line-clamp-3 text-xs leading-relaxed text-slate-400">
          {recommendation.description}
        </p>
      )}

      {/* -------------------------------------------------- score honesty */}
      {Number.isFinite(score.percent) && (
        <div className="mt-3.5">
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-500">
              <Info className="h-3 w-3" aria-hidden="true" />
              {score.label || 'Engine score (heuristic)'}
            </span>
            <button
              type="button"
              onClick={() => setShowBreakdown((value) => !value)}
              aria-expanded={showBreakdown}
              className="flex items-center gap-1 text-[10px] text-slate-400 transition hover:text-cyan-100"
            >
              factors
              <ChevronDown
                className={`h-3 w-3 transition ${showBreakdown ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            </button>
          </div>

          <ScoreBar percent={score.percent} className="mt-2" />

          {showBreakdown && (
            <motion.ul
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-3 space-y-2 overflow-hidden"
            >
              {(score.breakdown || []).map((factor) => (
                <li key={factor.key}>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[11px] text-slate-300">
                      {factor.label}
                      {!factor.applied && <span className="ml-1.5 text-slate-600">not applied</span>}
                    </span>
                    <span className="shrink-0 font-mono text-[10px] text-slate-500">
                      w {factor.weight}
                      {factor.applied ? ` · ${Math.round(factor.value * 100)}%` : ''}
                    </span>
                  </div>
                  <ScoreBar
                    percent={factor.applied ? Math.round(factor.value * 100) : 0}
                    tone="cyan"
                    className="mt-1"
                  />
                  <p className="mt-1 text-[10px] text-slate-500">{factor.detail}</p>
                </li>
              ))}
            </motion.ul>
          )}
        </div>
      )}

      {providerValues.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {providerValues.map((entry) => (
            <span
              key={entry.label}
              className="rounded-md border border-emerald-400/25 bg-emerald-400/[0.07] px-2 py-0.5 font-mono text-[10px] text-emerald-100"
            >
              {entry.label}: {entry.value}
            </span>
          ))}
        </div>
      )}

      {/* ------------------------------------------------------ reasoning */}
      {recommendation.reason && (
        <p className="mt-3.5 border-l-2 border-violet-bright/50 pl-3 text-[11px] leading-relaxed text-slate-300">
          {recommendation.reason}
        </p>
      )}

      {recommendation.connections?.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <Link2 className="h-3 w-3 text-cyan-glow" aria-hidden="true" />
          {recommendation.connections.map((connection) => (
            <span
              key={`${recommendation.id}-${connection.preferenceId}`}
              className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] text-slate-300"
            >
              {connection.preferenceName}
            </span>
          ))}
        </div>
      )}

      {recommendation.tradeoffs && (
        <p className="mt-3 rounded-lg border border-amber-400/25 bg-amber-400/[0.06] px-2.5 py-2 text-[10px] leading-relaxed text-amber-100/90">
          Trade-off: {recommendation.tradeoffs}
        </p>
      )}

      {recommendation.uncertainty && (
        <p className="mt-2 text-[10px] leading-relaxed text-slate-500">{recommendation.uncertainty}</p>
      )}

      {/* -------------------------------------------------------- actions */}
      <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-4">
        <button
          type="button"
          onClick={() => onReact(recommendation.id, 'like')}
          aria-pressed={reaction === 'like'}
          aria-label={`Like ${recommendation.name}`}
          className={`btn-subtle !px-2.5 !py-1.5 ${
            reaction === 'like' ? '!border-emerald-400/50 !text-emerald-100' : ''
          }`}
        >
          <ThumbsUp className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => onReact(recommendation.id, 'dislike')}
          aria-pressed={reaction === 'dislike'}
          aria-label={`Dislike ${recommendation.name}`}
          className={`btn-subtle !px-2.5 !py-1.5 ${
            reaction === 'dislike' ? '!border-rose-400/50 !text-rose-100' : ''
          }`}
        >
          <ThumbsDown className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => onToggleSave(recommendation)}
          aria-pressed={isSaved}
          className={`btn-subtle !px-2.5 !py-1.5 ${isSaved ? '!border-cyan-glow/50 !text-cyan-100' : ''}`}
        >
          {isSaved ? (
            <BookmarkCheck className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <Bookmark className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          {isSaved ? 'Saved' : 'Save'}
        </button>
        <button
          type="button"
          onClick={() => onExclude(recommendation.id)}
          className="btn-subtle !px-2.5 !py-1.5"
          title="Remove and exclude from future runs"
        >
          <Minimize2 className="h-3.5 w-3.5" aria-hidden="true" />
          Exclude
        </button>
        <button type="button" onClick={() => onOpen(recommendation)} className="btn-ghost ml-auto !px-3 !py-1.5 text-xs">
          Details
        </button>
      </div>
    </motion.li>
  );
};

export default RecommendationCard;
