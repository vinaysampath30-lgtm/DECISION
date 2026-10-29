import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BookmarkX,
  Clock3,
  Database,
  History,
  Network,
  RotateCcw,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { Badge, EmptyState, EntityThumb, GlassCard, SectionHeading, TypeIcon } from '../components/ui.jsx';
import { useDecision } from '../context/DecisionContext.jsx';
import { formatDuration, formatRelativeTime, sourceLabel } from '../lib/format.js';

const SavedCard = ({ entry, mode, onRemove, onOpenWorkspace }) => (
  <motion.li
    layout
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.97 }}
    transition={{ duration: 0.2 }}
    className="glass flex flex-col p-4"
  >
    <div className="flex items-start gap-3">
      <EntityThumb entity={entry} mode={mode} className="h-11 w-11" rounded="rounded-xl" />
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-display text-sm font-semibold text-white">{entry.name}</h3>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <Badge tone="violet">
            <TypeIcon type={entry.category} className="h-3 w-3" />
            {entry.categoryLabel || entry.category}
          </Badge>
          <Badge tone={entry.source === 'qloo' ? 'emerald' : 'amber'}>{sourceLabel(entry.source)}</Badge>
        </div>
      </div>
      {Number.isFinite(entry.scorePercent) && (
        <span className="shrink-0 font-display text-base font-semibold text-white">{entry.scorePercent}</span>
      )}
    </div>

    {entry.description && (
      <p className="mt-3 line-clamp-2 text-[11px] leading-relaxed text-slate-400">{entry.description}</p>
    )}

    <p className="mt-2 text-[10px] text-slate-500">
      saved {formatRelativeTime(entry.savedAt)}
      {entry.objectiveLabel ? ` · ${entry.objectiveLabel}` : ''}
      {entry.mode ? ` · ${entry.mode} mode` : ''}
    </p>

    <div className="mt-3.5 flex gap-2">
      <button type="button" onClick={() => onOpenWorkspace(entry)} className="btn-ghost !px-3 !py-1.5 text-xs">
        <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
        Similar run
      </button>
      <button
        type="button"
        onClick={() => onRemove(entry.id)}
        className="btn-subtle ml-auto !px-2.5 !py-1.5"
        aria-label={`Remove ${entry.name} from saved`}
      >
        <BookmarkX className="h-3.5 w-3.5" aria-hidden="true" />
        Remove
      </button>
    </div>
  </motion.li>
);

const RunRow = ({ entry, onRestore }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <li className="glass p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-display text-sm font-semibold text-white">
              {entry.objectiveLabel || 'Decision run'}
            </span>
            <Badge tone={entry.mode === 'live' ? 'emerald' : 'amber'}>
              {entry.mode === 'live' ? <Network className="h-3 w-3" /> : <Database className="h-3 w-3" />}
              {entry.mode === 'live' ? 'Live Qloo' : 'Demo catalogue'}
            </Badge>
          </div>
          <p className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <Clock3 className="h-3 w-3" aria-hidden="true" />
              {formatRelativeTime(entry.createdAt)}
            </span>
            <span>{entry.results?.length || 0} results</span>
            {Number.isFinite(entry.durationMs) && <span>{formatDuration(entry.durationMs)}</span>}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            aria-expanded={expanded}
            className="btn-subtle !px-3 !py-1.5 text-xs"
          >
            {expanded ? 'Hide' : 'Inspect'}
          </button>
          <button type="button" onClick={() => onRestore(entry)} className="btn-ghost !px-3 !py-1.5 text-xs">
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Restore inputs
          </button>
        </div>
      </div>

      {entry.preferences?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {entry.preferences.map((preference) => (
            <span
              key={`${entry.requestId}-${preference.type}-${preference.name}`}
              className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] text-slate-300"
            >
              <TypeIcon type={preference.type} className="h-3 w-3 text-slate-500" />
              {preference.name}
            </span>
          ))}
        </div>
      )}

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <ol className="mt-3 space-y-1.5 border-t border-white/[0.07] pt-3">
              {(entry.stages || []).map((stage) => (
                <li key={stage.id} className="flex items-baseline justify-between gap-3 text-[11px]">
                  <span className="text-slate-300">{stage.title}</span>
                  <span className="text-right text-slate-500">
                    {stage.detail}
                    {Number.isFinite(stage.durationMs) ? ` · ${stage.durationMs} ms` : ''}
                  </span>
                </li>
              ))}
            </ol>

            {entry.results?.length > 0 && (
              <ul className="mt-3 space-y-1.5">
                {entry.results.map((result) => (
                  <li key={result.id} className="flex items-baseline justify-between gap-3 text-[11px]">
                    <span className="truncate text-slate-300">{result.name}</span>
                    <span className="shrink-0 font-mono text-slate-500">
                      {result.categoryLabel || result.category} · {result.scorePercent}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {entry.provenance && (
              <p className="mt-3 border-t border-white/[0.07] pt-3 text-[10px] leading-relaxed text-slate-500">
                {entry.provenance.provider} · {entry.provenance.discoveryQueries} discovery queries ·{' '}
                {entry.provenance.resolutionRequests} resolution requests
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
};

export const HistoryPage = () => {
  const navigate = useNavigate();
  const { saved, removeSaved, history, clearHistory, restoreRun, mode } = useDecision();

  const openWorkspaceFromSaved = (entry) => {
    restoreRun({
      preferences: [{ name: entry.name, type: entry.category }],
      objectiveId: null,
      constraints: null,
    });
    navigate('/workspace');
  };

  const handleRestore = (entry) => {
    restoreRun(entry);
    navigate('/preferences');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Step 3 · Saved & history"
        title="Everything you kept, and every run you made"
        description="Runs and saved discoveries are stored in this browser only. No account, no server-side profile."
      />

      {/* ------------------------------------------------------------ saved */}
      <section className="mt-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-white">
            <Sparkles className="h-4 w-4 text-cyan-glow" aria-hidden="true" />
            Saved discoveries
            {saved.length > 0 && <span className="text-slate-500">({saved.length})</span>}
          </h2>
          <Link to="/preferences" className="btn-ghost !px-3 !py-1.5 text-xs">
            Find more
          </Link>
        </div>

        {saved.length ? (
          <motion.ul layout className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence initial={false}>
              {saved.map((entry) => (
                <SavedCard
                  key={entry.id}
                  entry={entry}
                  mode={mode}
                  onRemove={removeSaved}
                  onOpenWorkspace={openWorkspaceFromSaved}
                />
              ))}
            </AnimatePresence>
          </motion.ul>
        ) : (
          <EmptyState
            icon={Sparkles}
            title="No saved discoveries yet"
            description="Save a recommendation from the workspace and it will appear here."
            action={
              <Link to="/workspace" className="btn-primary mt-1">
                Open workspace
              </Link>
            }
          />
        )}
      </section>

      {/* ---------------------------------------------------------- history */}
      <section className="mt-12">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-white">
            <History className="h-4 w-4 text-violet-bright" aria-hidden="true" />
            Previous runs
            {history.length > 0 && <span className="text-slate-500">({history.length})</span>}
          </h2>
          {history.length > 0 && (
            <button type="button" className="btn-subtle !px-3 !py-1.5 text-xs" onClick={clearHistory}>
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              Clear history
            </button>
          )}
        </div>

        {history.length ? (
          <motion.ul layout className="space-y-4">
            <AnimatePresence initial={false}>
              {history.map((entry) => (
                <RunRow key={entry.requestId} entry={entry} onRestore={handleRestore} />
              ))}
            </AnimatePresence>
          </motion.ul>
        ) : (
          <GlassCard className="px-5 py-10 text-center">
            <p className="font-display text-sm font-semibold text-white">No runs recorded yet</p>
            <p className="mx-auto mt-1.5 max-w-md text-xs leading-relaxed text-slate-500">
              The last 12 runs are kept locally so you can compare how the shortlist changed as you refined your
              preferences.
            </p>
          </GlassCard>
        )}
      </section>
    </div>
  );
};

export default HistoryPage;
