import { useEffect, useState } from "react";
import RepoDashboard from "./components/RepoDashboard";
import TokenUsageDashboard from "./components/TokenUsageDashboard";

const views = {
  tokens: TokenUsageDashboard,
  repo: RepoDashboard
};

function readViewFromLocation() {
  const params = new URLSearchParams(window.location.search);
  const requested = params.get("view");
  return views[requested] ? requested : "tokens";
}

function writeViewToLocation(view) {
  const url = new URL(window.location.href);
  url.searchParams.set("view", view);
  window.history.replaceState({}, "", url);
}

export default function App() {
  const [view, setView] = useState(readViewFromLocation);

  useEffect(() => {
    writeViewToLocation(view);
  }, [view]);

  const ActiveView = views[view];

  return (
    <>
      <header className="app-nav">
        <div>
          <p className="eyebrow">AI Native Studio</p>
          <h1>Dashboard surfaces for repo governance and token efficiency.</h1>
        </div>
        <div className="view-toggle">
          <button
            className={`nav-button ${view === "tokens" ? "is-active" : ""}`}
            onClick={() => setView("tokens")}
          >
            Token usage
          </button>
          <button
            className={`nav-button ${view === "repo" ? "is-active" : ""}`}
            onClick={() => setView("repo")}
          >
            Repo control
          </button>
        </div>
      </header>

      <ActiveView />
    </>
  );
}
