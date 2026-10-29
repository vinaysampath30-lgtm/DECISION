import { useEffect } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass } from 'lucide-react';
import Navbar from './components/layout/Navbar.jsx';
import Footer from './components/layout/Footer.jsx';
import LandingPage from './pages/LandingPage.jsx';
import PreferencesPage from './pages/PreferencesPage.jsx';
import WorkspacePage from './pages/WorkspacePage.jsx';
import HistoryPage from './pages/HistoryPage.jsx';
import { useDecision } from './context/DecisionContext.jsx';
import { EmptyState } from './components/ui.jsx';

/** Restores scroll position on navigation — the workspace keeps its own state. */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);

  return null;
};

const NotFoundPage = () => (
  <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
    <EmptyState
      icon={Compass}
      title="That page does not exist"
      description="The link you followed does not match any route in the app."
      action={
        <Link to="/" className="btn-primary mt-1">
          Back to overview
        </Link>
      }
    />
  </div>
);

const App = () => {
  const { mode } = useDecision();

  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-ink-800 focus:px-4 focus:py-2 focus:text-sm focus:text-white"
      >
        Skip to content
      </a>

      <Navbar />

      {mode === 'demo' && (
        <div className="border-b border-amber-400/25 bg-amber-400/[0.07]">
          <p className="mx-auto max-w-7xl px-4 py-2 text-center text-[11px] leading-relaxed text-amber-100 sm:px-6 lg:px-8">
            Demo mode: no <span className="font-mono">QLOO_API_KEY</span> is configured, so the agent is using a
            labelled local sample catalogue. These are not Qloo results.
          </p>
        </div>
      )}

      <main id="main" className="flex-1">
        <Routes>
          <Route
            path="/"
            element={
              <PageTransition>
                <LandingPage />
              </PageTransition>
            }
          />
          <Route
            path="/preferences"
            element={
              <PageTransition>
                <PreferencesPage />
              </PageTransition>
            }
          />
          <Route
            path="/workspace"
            element={
              <PageTransition>
                <WorkspacePage />
              </PageTransition>
            }
          />
          <Route
            path="/history"
            element={
              <PageTransition>
                <HistoryPage />
              </PageTransition>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
};

const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.25, ease: 'easeOut' }}
  >
    {children}
  </motion.div>
);

export default App;
