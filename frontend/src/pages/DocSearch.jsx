import { useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

function DocSearch() {
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]); // {role: 'user'|'ai', text: string}
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setUploadStatus("Uploading & indexing...");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(`${API_URL}/docs-search/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUploadStatus(`Indexed "${res.data.filename}" (${res.data.chunks_added} chunks)`);
    } catch (err) {
      setUploadStatus("Upload failed. Check backend logs.");
    }
  };

  const handleAsk = async () => {
    if (!question.trim()) return;
    const userMsg = { role: "user", text: question };
    setMessages((prev) => [...prev, userMsg]);
    setQuestion("");
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/docs-search/query`, { question: userMsg.text });
      setMessages((prev) => [...prev, { role: "ai", text: res.data.answer }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "ai", text: "Error: could not get an answer." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="card" style={{ marginBottom: 20 }}>
        <h1>AI Document Search</h1>
        <p style={{ color: "var(--color-text-secondary)" }}>Upload a PDF, then ask questions about it.</p>

        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files[0])}
          style={{ marginTop: 12 }}
        />
        <button
          onClick={handleUpload}
          style={{
            marginLeft: 12,
            background: "var(--color-primary)",
            color: "#fff",
            border: "none",
            borderRadius: "var(--radius)",
            padding: "8px 16px",
            cursor: "pointer",
          }}
        >
          Upload
        </button>
        {uploadStatus && (
          <p style={{ marginTop: 10, color: "var(--color-text-secondary)", fontSize: 14 }}>{uploadStatus}</p>
        )}
      </div>

      <div className="card">
        <div style={{ minHeight: 200, marginBottom: 16 }}>
          {messages.length === 0 && (
            <p style={{ color: "var(--color-text-muted)" }}>Ask something once your PDF is indexed.</p>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                marginBottom: 12,
                padding: "10px 14px",
                borderRadius: "var(--radius)",
                background: m.role === "user" ? "var(--color-accent-light)" : "var(--color-surface-secondary)",
                color: "var(--color-text-primary)",
                maxWidth: "80%",
                marginLeft: m.role === "user" ? "auto" : 0,
              }}
            >
              {m.text}
            </div>
          ))}
          {loading && <p style={{ color: "var(--color-text-muted)" }}>Thinking...</p>}
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAsk()}
            placeholder="Ask a question about the document..."
            style={{
              flex: 1,
              padding: "10px 12px",
              borderRadius: "var(--radius)",
              border: "1px solid var(--color-border)",
              fontFamily: "var(--font-main)",
            }}
          />
          <button
            onClick={handleAsk}
            style={{
              background: "var(--color-accent)",
              color: "#fff",
              border: "none",
              borderRadius: "var(--radius)",
              padding: "10px 20px",
              cursor: "pointer",
            }}
          >
            Ask
          </button>
        </div>
      </div>
    </div>
  );
}

export default DocSearch;