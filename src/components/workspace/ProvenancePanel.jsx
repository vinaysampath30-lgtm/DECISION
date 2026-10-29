import { ShieldAlert, ShieldCheck, TrendingUp } from 'lucide-react';

/**
 * Provenance panel. States exactly where the data came from, which endpoints
 * were touched, and what the engine did or did not measure.
 */
export const ProvenancePanel = ({ provenance, rankingChange, feedbackApplied, results = [] }) => {
  if (!provenance) return null;

  const live = provenance.dataMode === 'live';
  const qlooResults = results.filter((item) => item.source === 'qloo').length;
  const demoResults = results.filter((item) => item.source === 'demo').length;
  const feedbackCount =
    (feedbackApplied?.liked?.length || 0) +
    (feedbackApplied?.disliked?.length || 0) +
    (feedbackApplied?.excluded?.length || 0);

  return (
    <div className="glass p-5 sm:p-6">
      <h2 className="flex items-center gap-2 font-display text-base font-semibold text-white">
        {live ? (
          <ShieldCheck className="h-4 w-4 text-emerald-400" aria-hidden="true" />
        ) : (
          <ShieldAlert className="h-4 w-4 text-amber-300" aria-hidden="true" />
        )}
        Provenance
      </h2>

      <dl className="mt-4 space-y-2.5 text-xs">
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-slate-500">Provider</dt>
          <dd className="text-right text-slate-200">{provenance.provider}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-slate-500">Discovery queries</dt>
          <dd className="font-mono text-slate-200">{provenance.discoveryQueries}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-slate-500">Resolution requests</dt>
          <dd className="font-mono text-slate-200">{provenance.resolutionRequests}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-slate-500">Results by source</dt>
          <dd className="font-mono text-slate-200">
            {qlooResults} qloo · {demoResults} demo
          </dd>
        </div>
        {provenance.endpoints?.length > 0 && (
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-slate-500">Endpoints used</dt>
            <dd className="break-all text-right font-mono text-[10px] text-slate-300">
              {provenance.endpoints.join(', ')}
            </dd>
          </div>
        )}
      </dl>

      {provenance.notes?.length > 0 && (
        <ul className="mt-4 space-y-2 border-t border-white/[0.07] pt-3.5">
          {provenance.notes.map((note) => (
            <li key={note} className="text-[10px] leading-relaxed text-slate-500">
              {note}
            </li>
          ))}
        </ul>
      )}

      {rankingChange?.changed && feedbackCount > 0 && (
        <p className="mt-4 flex items-start gap-1.5 rounded-xl border border-cyan-glow/25 bg-cyan-glow/[0.06] px-3 py-2.5 text-[10px] leading-relaxed text-cyan-100">
          <TrendingUp className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
          Your feedback changed this run: it reordered the shortlist relative to the same run scored without your
          likes, dislikes and exclusions.
        </p>
      )}
    </div>
  );
};

export default ProvenancePanel;
