import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BadgeCheck,
  Brain,
  Compass,
  Eye,
  Filter,
  Gauge,
  GitBranch,
  Layers,
  ListChecks,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Wand2,
} from 'lucide-react';
import ConnectionVisual from '../components/landing/ConnectionVisual.jsx';
import { Badge, GlassCard, SectionHeading } from '../components/ui.jsx';
import { useDecision } from '../context/DecisionContext.jsx';

const STAGES = [
  { id: 'understand', icon: Eye, title: 'Understand', text: 'Parse the objective, preferences and constraints. Flag anything missing before spending a single API call.' },
  { id: 'discover', icon: Search, title: 'Discover', text: 'Resolve each preference into a real Qloo entity and pull its taste neighbourhood.' },
  { id: 'generate', icon: Layers, title: 'Generate options', text: "Build a candidate pool across the objective's target categories, de-duplicated and constraint-aware." },
  { id: 'evaluate', icon: Gauge, title: 'Evaluate', text: 'Score every candidate on five transparent factors, normalised so they can be compared fairly.' },
  { id: 'decide', icon: Target, title: 'Decide', text: 'Select a balanced shortlist and write a reason, a trade-off and an uncertainty note for each pick.' },
  { id: 'improve', icon: RefreshCw, title: 'Improve', text: 'Feed your likes, dislikes and exclusions back in and show exactly how the shortlist changed.' },
];

const FEATURES = [
  {
    icon: Brain,
    title: 'Taste intelligence',
    text: 'Qloo resolves your named favourites into entities and returns their cultural neighbours. Repeated signals from different preferences are treated as stronger evidence.',
  },
  {
    icon: GitBranch,
    title: 'Agentic reasoning',
    text: 'Six real stages, streamed to the browser as they happen. Every stage reports the queries it ran, the candidates it found and how long it took.',
  },
  {
    icon: Wand2,
    title: 'Personalised decisions',
    text: 'A balanced weekend shortlist instead of ten near-identical results — filtered by your location, budget and mood, and reshaped by your feedback.',
  },
];

const JOURNEY = [
  'Add a favourite film, a music artist and a cuisine.',
  'Pick the objective “Plan my ideal weekend”.',
  'The agent resolves each preference through entity search.',
  'Taste-based discovery pulls candidates in places, films, music and destinations.',
  'The engine scores, then balances the shortlist across categories.',
  'Every card shows why it was chosen and where the data came from.',
  'Dislike one pick, hit refine — and watch the shortlist change.',
];

const PROVENANCE = [
  { icon: BadgeCheck, title: 'Labelled sources', text: 'Every entity and metric is tagged: Qloo data, provider values, or an engine-generated heuristic.' },
  { icon: Filter, title: 'No invented metrics', text: 'No ratings, review counts or availability are fabricated. Missing data is stated as missing.' },
  { icon: ShieldCheck, title: 'Server-side key', text: 'The Qloo API key lives only in the Express backend — never in the browser bundle or storage.' },
  { icon: Compass, title: 'Honest fallback', text: 'Without a key the app says it is in demo mode and runs a random-free local catalogue instead.' },
];

export const LandingPage = () => {
  const { mode, options, preferences } = useDecision();
  const live = mode === 'live';

  return (
    <div>
      {/* ------------------------------------------------------------- hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:pb-24 lg:pt-20">
          <div>
            <Badge tone={live ? 'emerald' : 'amber'} className="mb-5">
              <Sparkles className="h-3 w-3" aria-hidden="true" />
              {live ? 'Live Qloo taste intelligence' : 'Demo mode — sample catalogue, real workflow'}
            </Badge>

            <h1 className="font-display text-4xl font-semibold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[3.4rem]">
              Your Preferences. <span className="gradient-text">Connected.</span>
              <br />
              Your Next Decision, Smarter.
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-400">
              Add a handful of things you genuinely love. A six-stage agent resolves them into real entities,
              discovers their cross-category taste connections, scores the options transparently, and hands you a
              shortlist you can actually understand.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/preferences" className="btn-primary">
                Start Discovering
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <a href="#workflow" className="btn-ghost">
                See the agent workflow
              </a>
            </div>

            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-white/[0.08] pt-6">
              <div>
                <dt className="text-[11px] uppercase tracking-wider text-slate-500">Agent stages</dt>
                <dd className="font-display text-xl font-semibold text-white">6</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-wider text-slate-500">Scoring factors</dt>
                <dd className="font-display text-xl font-semibold text-white">
                  {Object.keys(options?.scoring?.weights || {}).length || 5}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-wider text-slate-500">Categories</dt>
                <dd className="font-display text-xl font-semibold text-white">
                  {options?.categories?.length || 12}
                </dd>
              </div>
            </dl>
          </div>

          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <ConnectionVisual />
          </motion.div>
        </div>
      </section>

      {/* --------------------------------------------------------- features */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="What makes it different"
          title="Not a dashboard. A decision workflow."
          description="Taste intelligence is the input, agentic reasoning is the process, and an explainable shortlist is the output."
        />

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {FEATURES.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
            >
              <GlassCard interactive className="h-full p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-violet-glow/25 to-cyan-glow/20">
                  <feature.icon className="h-5 w-5 text-cyan-glow" aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold text-white">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{feature.text}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* --------------------------------------------------------- workflow */}
      <section id="workflow" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Agentic workflow"
          title="Six stages you can watch happen"
          description="Progress is streamed from the backend as real work completes. Each stage reports its own metrics and elapsed time — nothing is faked."
        />

        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {STAGES.map((stage, index) => (
            <motion.li
              key={stage.id}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.35, delay: index * 0.05 }}
            >
              <GlassCard className="flex h-full gap-4 p-5">
                <span className="font-display text-xs font-semibold text-slate-600">
                  0{index + 1}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <stage.icon className="h-4 w-4 text-violet-bright" aria-hidden="true" />
                    <h3 className="font-display text-sm font-semibold text-white">{stage.title}</h3>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-400">{stage.text}</p>
                </div>
              </GlassCard>
            </motion.li>
          ))}
        </ol>
      </section>

      {/* ------------------------------------------------------------- qloo */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <SectionHeading
              eyebrow="Qloo integration"
              title="How Qloo powers the discovery"
              description="Qloo is the source of taste, not a logo in the corner."
            />
            <div className="mt-7 space-y-5">
              <div className="flex gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-violet-bright/30 bg-violet-glow/10 font-mono text-[11px] text-violet-bright">
                  1
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-200">Entity resolution</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-400">
                    Free text like “Interstellar” is resolved through the Qloo search endpoint into a concrete entity
                    ID, so the agent reasons about real things rather than strings.
                  </p>
                  <code className="mt-2 block overflow-x-auto rounded-lg border border-white/10 bg-ink-900/70 px-3 py-2 font-mono text-[11px] text-cyan-100">
                    GET /search?query=Interstellar&amp;types=urn:entity:movie
                  </code>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-cyan-glow/30 bg-cyan-glow/10 font-mono text-[11px] text-cyan-glow">
                  2
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-200">Taste-based discovery</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-400">
                    Each resolved entity becomes a signal for the Insights endpoint, which returns entities with a
                    high affinity to it — across categories you never asked about.
                  </p>
                  <code className="mt-2 block overflow-x-auto rounded-lg border border-white/10 bg-ink-900/70 px-3 py-2 font-mono text-[11px] text-cyan-100">
                    GET /v2/insights/?filter.type=urn:entity:place
                    <br />
                    &amp;signal.interests.entities=&lt;qloo-entity-id&gt;
                  </code>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/[0.05] font-mono text-[11px] text-slate-300">
                  3
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-200">Provenance, not decoration</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-400">
                    The number of distinct preferences that surfaced a candidate becomes the strongest scoring
                    signal, which is why a single film can unlock a restaurant, a city and an album.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Example connection
              </p>
              <Badge tone="violet">cross-category</Badge>
            </div>

            <div className="mt-5 space-y-3">
              {[
                { label: 'Interstellar', kind: 'Movie', strength: 1 },
                { label: 'Hans Zimmer', kind: 'Artist', strength: 0.86 },
                { label: 'Observatory & Planetarium', kind: 'Place', strength: 0.72 },
                { label: 'Dune', kind: 'Movie', strength: 0.68 },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-3">
                  <span className="w-40 shrink-0 truncate text-sm text-slate-200">{row.label}</span>
                  <span className="w-16 shrink-0 text-[11px] text-slate-500">{row.kind}</span>
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.07]">
                    <span
                      className="block h-full rounded-full bg-gradient-to-r from-violet-glow to-cyan-glow"
                      style={{ width: `${row.strength * 100}%` }}
                    />
                  </span>
                </div>
              ))}
            </div>

            <p className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-3 text-[11px] leading-relaxed text-slate-400">
              Illustrative only. The live app shows the real evidence count and the real provider values returned for
              each candidate — never a mocked strength value.
            </p>
          </GlassCard>
        </div>
      </section>

      {/* ---------------------------------------------------------- journey */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <SectionHeading
            eyebrow="Example journey"
            title="Film + artist + cuisine → a weekend plan"
            description="The end-to-end path the app is built to demonstrate, exactly as it runs."
          />
          <ol className="space-y-3">
            {JOURNEY.map((step, index) => (
              <li key={step}>
                <GlassCard className="flex items-start gap-3.5 p-4">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-glow to-cyan-glow font-display text-[11px] font-semibold text-white">
                    {index + 1}
                  </span>
                  <p className="text-sm leading-relaxed text-slate-300">{step}</p>
                </GlassCard>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ------------------------------------------------------- provenance */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Trust"
          title="Built to be honest about its own data"
          description="A hackathon demo is only convincing if it never lies about what it did."
          align="center"
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PROVENANCE.map((item) => (
            <GlassCard key={item.title} className="p-5">
              <item.icon className="h-5 w-5 text-cyan-glow" aria-hidden="true" />
              <h3 className="mt-3 font-display text-sm font-semibold text-white">{item.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-400">{item.text}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* -------------------------------------------------------------- cta */}
      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <GlassCard className="relative overflow-hidden px-6 py-12 text-center sm:px-12">
          <div
            className="pointer-events-none absolute inset-0 opacity-70"
            style={{
              background:
                'radial-gradient(36rem 16rem at 50% 0%, rgba(139,92,246,0.22), transparent 70%), radial-gradient(30rem 14rem at 50% 120%, rgba(34,211,238,0.18), transparent 70%)',
            }}
            aria-hidden="true"
          />
          <div className="relative">
            <ListChecks className="mx-auto h-6 w-6 text-cyan-glow" aria-hidden="true" />
            <h2 className="mt-4 font-display text-2xl font-semibold text-white sm:text-3xl">
              {preferences.length
                ? 'Your preferences are ready.'
                : 'Give the agent three things you love.'}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-400">
              {preferences.length
                ? `You already have ${preferences.length} preference${preferences.length === 1 ? '' : 's'} saved. Jump straight into the workspace.`
                : 'It needs a starting point. Three is enough to reveal connections you would not have searched for.'}
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link to="/preferences" className="btn-primary">
                {preferences.length ? 'Review preferences' : 'Start Discovering'}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              {preferences.length > 0 && (
                <Link to="/workspace" className="btn-ghost">
                  Open the workspace
                </Link>
              )}
            </div>
          </div>
        </GlassCard>
      </section>
    </div>
  );
};

export default LandingPage;
