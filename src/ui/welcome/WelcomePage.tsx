import { ArrowRight, ArrowUpRight, Lightbulb, Moon, Sun } from 'lucide-react';
import * as React from 'react';

import type { HelpfulnessVote } from '@/src/features/feedback/types';
import { SAMPLE_SCENARIO } from '@/src/features/scenario/dummy-provider';
import { Panel } from '@/src/ui/overlay/Panel';
import './welcome.css';

const SAMPLE_PROBLEM_URL = 'https://leetcode.com/problems/two-sum/';
const DEFAULT_SHORTCUT = 'Alt+Shift+A';

function useToggleShortcut(): string | null {
  const [shortcut, setShortcut] = React.useState<string | null>(DEFAULT_SHORTCUT);

  React.useEffect(() => {
    browser?.commands
      ?.getAll()
      .then((commands) => {
        const toggle = commands.find(
          (command) =>
            command.name === '_execute_action' || command.name === '_execute_browser_action',
        );
        setShortcut(toggle?.shortcut || null);
      })
      .catch(() => {});
  }, []);

  return shortcut;
}

export function WelcomePage() {
  const shortcut = useToggleShortcut();
  const [vote, setVote] = React.useState<HelpfulnessVote | null>(null);
  const [previewOpen, setPreviewOpen] = React.useState(true);
  const [dark, setDark] = React.useState(() => document.documentElement.classList.contains('dark'));
  const previewChip = React.useRef<HTMLButtonElement>(null);
  const unsupportedPage =
    new URLSearchParams(window.location.search).get('reason') === 'unsupported-page';

  function toggleTheme() {
    document.documentElement.classList.toggle('dark', !dark);
    setDark(!dark);
  }

  function closePreview() {
    setPreviewOpen(false);
    previewChip.current?.focus();
  }

  return (
    <div className="welcome">
      <div className="welcome-shell">
        <header className="welcome-header">
          <a className="welcome-wordmark" href="welcome.html" aria-label="AlgoBridge home">
            <img src="/icon/48.png" width="36" height="36" alt="" />
            AlgoBridge
          </a>
          <nav className="welcome-nav" aria-label="Page links">
            <a href="https://github.com/cgaswin/algobridge/issues" target="_blank" rel="noreferrer">
              Give feedback <ArrowUpRight size={15} aria-hidden="true" />
            </a>
            <button className="welcome-theme" type="button" onClick={toggleTheme}
              aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}>
              {dark ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
            </button>
          </nav>
        </header>

        {unsupportedPage && (
          <p className="welcome-notice" role="status">
            You're all set—just open a LeetCode problem to use AlgoBridge. If one is already open,
            refresh that tab and try again.
          </p>
        )}

        <main id="main" className="welcome-main">
          <section className="welcome-intro" aria-labelledby="welcome-title">
            <h1 id="welcome-title">Go beyond<br />“Accepted.”</h1>
            <p className="welcome-lead">
              You know how to solve it.<br />Now see where it matters.
            </p>
            <p className="welcome-description">
              Connect LeetCode problems to real-world applications, right beside the problem you're solving.
            </p>
            <a href={SAMPLE_PROBLEM_URL} className="welcome-primary">
              Try it on Two Sum <ArrowRight size={19} aria-hidden="true" />
            </a>
            <p className="welcome-ready">No account or API key needed.</p>

            <div className="welcome-instructions">
              <h2>A little context. One click away.</h2>
              <ol>
                <li>Open a problem on LeetCode.</li>
                <li>Click <span className="welcome-inline-chip"><Lightbulb size={13} aria-hidden="true" /> Real-world</span> below the problem title.</li>
                <li>Explore the use cases. Reveal the approach when you're ready.</li>
              </ol>
              <p className="welcome-shortcut">
                {shortcut ? <>Or use <kbd>{shortcut}</kbd> or the toolbar icon.</> :
                  <>You can also use the toolbar icon or set an extension shortcut.</>}
              </p>
            </div>
          </section>

          <section className="welcome-demo" aria-label="Interactive example">
            <div className="welcome-demo-caption">
              <span>From a coding exercise…</span>
              <span className="welcome-demo-note">Interactive preview</span>
            </div>
            <div className="welcome-problem" data-ui="problem-preview">
              <div className="welcome-problem-heading"><span>1. Two Sum</span><span className="welcome-easy">Easy</span></div>
              <p>Find two numbers in an array that add up to a target.</p>
              <div className="welcome-problem-bottom">
                <code>[2, 7, 11, 15] <span>→ target: 9</span></code>
                <button type="button" ref={previewChip} className="welcome-demo-chip"
                  aria-expanded={previewOpen} aria-controls="welcome-preview"
                  onClick={() => setPreviewOpen(!previewOpen)}>
                  <Lightbulb size={14} aria-hidden="true" /> Real-world
                </button>
              </div>
            </div>
            <div className="welcome-connection" aria-hidden="true"><span />…to a real-world use case.</div>
            <div id="welcome-preview" className="welcome-preview" data-ui="panel-preview"
              onKeyDown={(event) => {
                if (event.key === 'Escape' && previewOpen) {
                  event.preventDefault();
                  closePreview();
                }
              }}>
              {previewOpen ? (
                <Panel state={{ status: 'success', data: SAMPLE_SCENARIO }} vote={vote}
                  onVote={setVote} onRetry={() => {}} onClose={closePreview} className="welcome-panel" />
              ) : (
                <div className="welcome-preview-empty">
                  <Lightbulb size={28} aria-hidden="true" />
                  <h2>Make the connection.</h2>
                  <p>Click the Real-world chip above to explore the example.</p>
                  <button type="button" onClick={() => {
                    setPreviewOpen(true);
                    previewChip.current?.focus();
                  }}>Show example <ArrowRight size={16} aria-hidden="true" /></button>
                </div>
              )}
            </div>
            <p className="welcome-demo-disclaimer">Example data · Preview votes aren't saved.</p>
          </section>
        </main>

        <footer className="welcome-footer">
          <details className="welcome-data">
            <summary>What leaves my browser?</summary>
            <p>When you request an explanation, the problem URL is sent to the AlgoBridge API,
              which uses AI services to generate it. Your code isn't sent. Votes on LeetCode
              stay in your browser. AI explanations can be inaccurate; check important details.
              The first request may take longer while the service wakes up.</p>
          </details>
          <p>Made for the curious. Not affiliated with LeetCode.</p>
        </footer>
      </div>
    </div>
  );
}
