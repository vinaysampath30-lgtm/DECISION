import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { getHealth, getOptions, recommendOnce, streamRecommend } from '../lib/api.js';
import useLocalStorage from '../hooks/useLocalStorage.js';

const DecisionContext = createContext(null);

const STORAGE_KEYS = {
  preferences: 'ade.preferences.v1',
  objectiveId: 'ade.objective.v1',
  constraints: 'ade.constraints.v1',
  saved: 'ade.saved.v1',
  history: 'ade.history.v1',
};

const EMPTY_CONSTRAINTS = { location: '', budget: null, timeAvailable: null, mood: '' };

const upsertStage = (stages, incoming) => {
  const index = stages.findIndex((stage) => stage.id === incoming.id);
  if (index === -1) return [...stages, incoming];
  const next = [...stages];
  next[index] = { ...next[index], ...incoming };
  return next;
};

const trimRun = (payload) => ({
  requestId: payload.requestId,
  createdAt: payload.createdAt,
  mode: payload.mode,
  durationMs: payload.durationMs,
  objectiveLabel: payload.objective?.label,
  objectiveId: payload.objective?.id,
  constraints: payload.constraints,
  preferences: payload.preferences?.map((item) => item.input) || [],
  provenance: payload.provenance,
  stages: payload.stages,
  rankingChange: payload.rankingChange,
  results: (payload.results || []).map((item) => ({
    id: item.id,
    name: item.name,
    category: item.category,
    categoryLabel: item.categoryLabel,
    image: item.image,
    source: item.source,
    description: item.description,
    scorePercent: item.score?.percent ?? null,
    reason: item.reason,
  })),
});

export const DecisionProvider = ({ children }) => {
  const [options, setOptions] = useState(null);
  const [optionsStatus, setOptionsStatus] = useState('loading');
  const [optionsError, setOptionsError] = useState(null);
  const [mode, setMode] = useState('demo');
  const [qlooConfigured, setQlooConfigured] = useState(false);

  const [preferences, setPreferences] = useLocalStorage(STORAGE_KEYS.preferences, []);
  const [objectiveId, setObjectiveId] = useLocalStorage(STORAGE_KEYS.objectiveId, 'weekend');
  const [constraints, setConstraints] = useLocalStorage(STORAGE_KEYS.constraints, EMPTY_CONSTRAINTS);
  const [saved, setSaved] = useLocalStorage(STORAGE_KEYS.saved, []);
  const [history, setHistory] = useLocalStorage(STORAGE_KEYS.history, []);

  const [feedback, setFeedback] = useState({ liked: [], disliked: [] });
  const [excluded, setExcluded] = useState([]);
  const [run, setRun] = useState({ status: 'idle', stages: [], result: null, error: null });
  const abortRef = useRef(null);

  // ---------------------------------------------------------------- bootstrap
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setOptionsStatus('loading');
      try {
        const [optionsPayload, healthPayload] = await Promise.all([getOptions(), getHealth()]);
        if (cancelled) return;
        setOptions(optionsPayload);
        setMode(healthPayload.mode);
        setQlooConfigured(healthPayload.qlooConfigured);
        if (!optionsPayload.objectives?.some((item) => item.id === objectiveId)) {
          setObjectiveId(optionsPayload.objectives?.[0]?.id || 'weekend');
        }
        setOptionsStatus('ready');
      } catch (error) {
        if (cancelled) return;
        setOptionsError(error);
        setOptionsStatus('error');
      }
    };

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ------------------------------------------------------------- preferences
  const addPreference = useCallback(
    (preference) => {
      const name = String(preference?.name || '').trim();
      if (!name) return { ok: false, reason: 'Enter a name first.' };
      const max = options?.limits?.maxPreferences ?? 8;

      let result = { ok: true };
      setPreferences((current) => {
        if (current.length >= max) {
          result = { ok: false, reason: `You can add up to ${max} preferences.` };
          return current;
        }
        const duplicate = current.some(
          (item) => item.name.toLowerCase() === name.toLowerCase() && item.type === preference.type,
        );
        if (duplicate) {
          result = { ok: false, reason: `“${name}” is already in your list.` };
          return current;
        }
        return [
          ...current,
          {
            id: `pref-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            name,
            type: preference.type || 'movie',
          },
        ];
      });
      return result;
    },
    [options, setPreferences],
  );

  const removePreference = useCallback(
    (id) => setPreferences((current) => current.filter((item) => item.id !== id)),
    [setPreferences],
  );

  const clearPreferences = useCallback(() => setPreferences([]), [setPreferences]);

  const updateConstraints = useCallback(
    (patch) => setConstraints((current) => ({ ...current, ...patch })),
    [setConstraints],
  );

  const resetConstraints = useCallback(() => setConstraints(EMPTY_CONSTRAINTS), [setConstraints]);

  // ---------------------------------------------------------------- feedback
  const clearFeedback = useCallback(() => {
    setFeedback({ liked: [], disliked: [] });
    setExcluded([]);
  }, []);

  const clearExcluded = useCallback(() => setExcluded([]), []);

  const reactTo = useCallback((entityId, reaction) => {
    if (!entityId) return;
    setFeedback((current) => {
      const liked = new Set(current.liked);
      const disliked = new Set(current.disliked);

      liked.delete(entityId);
      disliked.delete(entityId);

      if (reaction === 'like') liked.add(entityId);
      if (reaction === 'dislike') disliked.add(entityId);

      return { liked: [...liked], disliked: [...disliked] };
    });
  }, []);

  const excludeEntity = useCallback((entityId) => {
    if (!entityId) return;
    setExcluded((current) => (current.includes(entityId) ? current : [...current, entityId]));
    setFeedback((current) => ({
      liked: current.liked.filter((id) => id !== entityId),
      disliked: current.disliked.filter((id) => id !== entityId),
    }));
    setRun((current) => ({
      ...current,
      result: current.result
        ? { ...current.result, results: (current.result.results || []).filter((item) => item.id !== entityId) }
        : current.result,
    }));
  }, []);

  const restoreFeedback = useCallback((payload) => {
    if (!payload) return;
    setFeedback({
      liked: payload.liked || [],
      disliked: payload.disliked || [],
    });
    setExcluded(payload.excluded || []);
  }, []);

  // -------------------------------------------------------------------- run
  const runWorkflow = useCallback(
    async ({ objectiveOverride, preferencesOverride } = {}) => {
      const activePreferences = (preferencesOverride || preferences).map(({ name, type }) => ({ name, type }));
      const activeObjective = objectiveOverride || objectiveId;

      if (!activePreferences.length) {
        setRun({
          status: 'error',
          stages: [],
          result: null,
          error: { code: 'NO_PREFERENCES', message: 'Add at least one preference before running the engine.' },
        });
        return { ok: false };
      }

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setRun({ status: 'running', stages: [], result: null, error: null });

      const body = {
        preferences: activePreferences,
        objective: activeObjective,
        constraints: {
          location: constraints.location || null,
          budget: constraints.budget || null,
          timeAvailable: constraints.timeAvailable || null,
          mood: constraints.mood || null,
        },
        feedback,
        exclude: excluded,
      };

      let streamFailure = null;

      try {
        await streamRecommend(body, {
          signal: controller.signal,
          onEvent: (event) => {
            if (event.type === 'stage') {
              setRun((current) => ({ ...current, stages: upsertStage(current.stages, event.stage) }));
            } else if (event.type === 'result') {
              setRun({
                status: 'done',
                stages: event.payload.stages,
                result: event.payload,
                error: null,
              });
              setHistory((current) => [trimRun(event.payload), ...current].slice(0, 12));
            } else if (event.type === 'error') {
              streamFailure = event.error || { code: 'STREAM_ERROR', message: 'The workflow failed.' };
            }
          },
        });

        if (streamFailure) {
          setRun({ status: 'error', stages: [], result: null, error: streamFailure });
          return { ok: false, error: streamFailure };
        }

        return { ok: true };
      } catch (error) {
        if (error.name === 'AbortError') return { ok: false, aborted: true };

        // Streaming unavailable (older browser, proxy buffering, network) — fall
        // back to the single-response endpoint so the user still gets an answer.
        try {
          const payload = await recommendOnce(body, { signal: controller.signal });
          setRun({ status: 'done', stages: payload.stages, result: payload, error: null });
          setHistory((current) => [trimRun(payload), ...current].slice(0, 12));
          return { ok: true };
        } catch (fallbackError) {
          const failure = {
            code: fallbackError.code || 'RUN_FAILED',
            message: fallbackError.message || 'The decision workflow could not be completed.',
          };
          setRun({ status: 'error', stages: [], result: null, error: failure });
          return { ok: false, error: failure };
        }
      }
    },
    [constraints, excluded, feedback, objectiveId, preferences, setHistory],
  );

  const cancelRun = useCallback(() => {
    abortRef.current?.abort();
    setRun({ status: 'idle', stages: [], result: null, error: null });
  }, []);

  const regenerate = useCallback(
    () => runWorkflow({}),
    [runWorkflow],
  );

  // ------------------------------------------------------------------ saving
  const saveRecommendation = useCallback(
    (recommendation) => {
      if (!recommendation) return;
      setSaved((current) => {
        if (current.some((item) => item.id === recommendation.id)) {
          return current.filter((item) => item.id !== recommendation.id);
        }
        const entry = {
          id: recommendation.id,
          name: recommendation.name,
          category: recommendation.category,
          categoryLabel: recommendation.categoryLabel,
          description: recommendation.description,
          image: recommendation.image,
          source: recommendation.source,
          scorePercent: recommendation.score?.percent ?? null,
          reason: recommendation.reason,
          connections: recommendation.connections || [],
          objectiveLabel: run.result?.objective?.label,
          mode: run.result?.mode,
          savedAt: new Date().toISOString(),
        };
        return [entry, ...current].slice(0, 40);
      });
    },
    [run.result, setSaved],
  );

  const removeSaved = useCallback(
    (id) => setSaved((current) => current.filter((item) => item.id !== id)),
    [setSaved],
  );

  const isSaved = useCallback((id) => saved.some((item) => item.id === id), [saved]);

  const clearHistory = useCallback(() => setHistory([]), [setHistory]);

  /** Puts a previous run's inputs back into the builder so it can be re-run. */
  const restoreRun = useCallback(
    (entry) => {
      if (!entry) return;
      if (entry.preferences?.length) {
        setPreferences(
          entry.preferences.map((item, index) => ({
            id: `restored-${Date.now()}-${index}`,
            name: item.name,
            type: item.type || 'movie',
          })),
        );
      }
      if (entry.objectiveId) setObjectiveId(entry.objectiveId);
      if (entry.constraints) setConstraints({ ...EMPTY_CONSTRAINTS, ...entry.constraints });
    },
    [setConstraints, setObjectiveId, setPreferences],
  );

  const value = useMemo(
    () => ({
      options,
      optionsStatus,
      optionsError,
      reloadOptions: () => window.location.reload(),
      mode,
      qlooConfigured,

      preferences,
      addPreference,
      removePreference,
      clearPreferences,

      objectiveId,
      setObjectiveId,
      constraints,
      updateConstraints,
      resetConstraints,

      feedback,
      excluded,
      reactTo,
      excludeEntity,
      clearFeedback,
      clearExcluded,
      restoreFeedback,

      run,
      runWorkflow,
      cancelRun,
      regenerate,

      saved,
      saveRecommendation,
      removeSaved,
      isSaved,

      history,
      clearHistory,
      restoreRun,
    }),
    [
      options,
      optionsStatus,
      optionsError,
      mode,
      qlooConfigured,
      preferences,
      addPreference,
      removePreference,
      clearPreferences,
      objectiveId,
      setObjectiveId,
      constraints,
      updateConstraints,
      resetConstraints,
      feedback,
      excluded,
      reactTo,
      excludeEntity,
      clearFeedback,
      clearExcluded,
      restoreFeedback,
      run,
      runWorkflow,
      cancelRun,
      regenerate,
      saved,
      saveRecommendation,
      removeSaved,
      isSaved,
      history,
      clearHistory,
      restoreRun,
    ],
  );

  return <DecisionContext.Provider value={value}>{children}</DecisionContext.Provider>;
};

export const useDecision = () => {
  const context = useContext(DecisionContext);
  if (!context) throw new Error('useDecision must be used inside a DecisionProvider');
  return context;
};

export default DecisionContext;
