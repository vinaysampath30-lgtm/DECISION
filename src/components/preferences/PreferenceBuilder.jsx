import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Plus, X } from 'lucide-react';
import { TypeIcon } from '../ui.jsx';
import { useDecision } from '../../context/DecisionContext.jsx';

/** Fast-start examples so a demo never stalls on typing. */
const SUGGESTIONS = {
  movie: ['Interstellar', 'Dune', 'Spirited Away', 'Whiplash'],
  tv_show: ['Severance', 'Foundation', "Chef's Table"],
  artist: ['Tame Impala', 'Aphex Twin', 'Kendrick Lamar', 'Miles Davis'],
  album: ['Currents', 'Kind of Blue', 'async'],
  book: ['Kafka on the Shore', 'Dune', 'The Left Hand of Darkness'],
  author: ['Haruki Murakami', 'Ursula K. Le Guin'],
  cuisine: ['Japanese', 'Italian', 'Wine bar', 'Coffee'],
  place: ['Jazz Listening Bar', 'Art-house Cinema', 'Specialty Coffee Roastery'],
  brand: ['MUJI', 'Leica', 'Blue Bottle Coffee'],
  destination: ['Kyoto', 'Reykjavík', 'Lisbon', 'Berlin'],
  podcast: ['Song Exploder', '99% Invisible'],
  video_game: ['Outer Wilds', 'Stardew Valley'],
};

export const PreferenceBuilder = () => {
  const { options, preferences, addPreference, removePreference, clearPreferences } = useDecision();
  const [activeType, setActiveType] = useState('movie');
  const [draft, setDraft] = useState('');
  const [error, setError] = useState(null);

  const categories = options?.categories || [];
  const activeCategory = useMemo(
    () => categories.find((category) => category.id === activeType) || categories[0],
    [categories, activeType],
  );

  const max = options?.limits?.maxPreferences ?? 8;
  const full = preferences.length >= max;

  const submit = (name) => {
    const value = String(name ?? draft).trim();
    if (!value) {
      setError('Enter something you like first.');
      return;
    }
    const result = addPreference({ name: value, type: activeType });
    if (!result?.ok) {
      setError(result?.reason || 'That preference could not be added.');
      return;
    }
    setError(null);
    setDraft('');
  };

  return (
    <div className="glass p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-white">Your preferences</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            {preferences.length}/{max} added · the more anchors, the stronger the connections
          </p>
        </div>
        {preferences.length > 0 && (
          <button type="button" onClick={clearPreferences} className="btn-subtle !px-2.5 !py-1.5 text-xs">
            Clear all
          </button>
        )}
      </div>

      {/* categories */}
      <div className="mt-5">
        <p className="label">Category</p>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Preference category">
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              role="radio"
              aria-checked={activeType === category.id}
              onClick={() => {
                setActiveType(category.id);
                setError(null);
              }}
              className={activeType === category.id ? 'chip-on' : 'chip-off'}
            >
              <TypeIcon type={category.id} className="h-3.5 w-3.5" />
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* input */}
      <div className="mt-5">
        <label className="label" htmlFor="preference-input">
          Add a {activeCategory?.label || 'preference'}
        </label>
        <div className="flex gap-2">
          <input
            id="preference-input"
            className="field"
            value={draft}
            maxLength={120}
            placeholder={activeCategory?.placeholder || 'Type a name'}
            onChange={(event) => {
              setDraft(event.target.value);
              if (error) setError(null);
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                submit();
              }
            }}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'preference-error' : undefined}
          />
          <button type="button" className="btn-primary shrink-0" onClick={() => submit()} disabled={full}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add
          </button>
        </div>

        {error && (
          <p id="preference-error" role="alert" className="mt-2 flex items-center gap-1.5 text-xs text-rose-300">
            <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
            {error}
          </p>
        )}

        {full && !error && (
          <p className="mt-2 text-xs text-amber-200">
            You have reached the {max}-preference limit. Remove one to add another.
          </p>
        )}

        {SUGGESTIONS[activeType]?.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-slate-500">Quick add:</span>
            {SUGGESTIONS[activeType].map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                disabled={full}
                onClick={() => submit(suggestion)}
                className="rounded-full border border-dashed border-white/15 px-2.5 py-1 text-[11px] text-slate-400 transition hover:border-cyan-glow/50 hover:text-cyan-100 disabled:opacity-40"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* list */}
      <div className="mt-6">
        <p className="label">Selected</p>
        {preferences.length === 0 ? (
          <p className="rounded-xl border border-dashed border-white/[0.12] px-4 py-6 text-center text-xs text-slate-500">
            Nothing added yet. Pick a category and add at least one thing you love.
          </p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            <AnimatePresence initial={false}>
              {preferences.map((preference) => (
                <motion.li
                  key={preference.id}
                  layout
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ duration: 0.16 }}
                >
                  <span className="chip-on !py-2">
                    <TypeIcon type={preference.type} className="h-3.5 w-3.5" />
                    <span className="font-medium">{preference.name}</span>
                    <button
                      type="button"
                      onClick={() => removePreference(preference.id)}
                      className="ml-0.5 rounded-full p-0.5 text-violet-100/80 transition hover:bg-white/15 hover:text-white"
                      aria-label={`Remove ${preference.name}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </div>
  );
};

export default PreferenceBuilder;
