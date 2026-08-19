 import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import DocSearch from "./pages/DocSearch";
import CodeReview from "./pages/CodeReview";
import Agent from "./pages/Agent";

function Home() {
  return (
    <div>
      <h1>AI Platform</h1>
      <ul>
        <li><Link to="/doc-search">AI Document Search</Link></li>
        <li><Link to="/code-review">AI Code Review Bot</Link></li>
        <li><Link to="/agent">AI Agent with Memory</Link></li>
      </ul>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/doc-search" element={<DocSearch />} />
        <Route path="/code-review" element={<CodeReview />} />
        <Route path="/agent" element={<Agent />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;