import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import DocSearch from "./pages/DocSearch";
import CodeReview from "./pages/CodeReview";
import Agent from "./pages/Agent";
import "./App.css";

function Home() {
  return (
    <div className="card">
      <h1>AI Platform</h1>
      <p style={{ color: "var(--color-text-secondary)" }}>
        Select a module from the sidebar to get started.
      </p>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <aside className="sidebar">
          <h2>AI Platform</h2>
          <Link to="/">Home</Link>
          <Link to="/doc-search">Document Search</Link>
          <Link to="/code-review">Code Review Bot</Link>
          <Link to="/agent">Agent Memory</Link>
        </aside>
        <main className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/doc-search" element={<DocSearch />} />
            <Route path="/code-review" element={<CodeReview />} />
            <Route path="/agent" element={<Agent />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;