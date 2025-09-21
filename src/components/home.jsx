// src/components/Home.jsx
"use client";
import { useState } from "react";

function Analyzer() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to analyze video");
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          🎬 AI Video Analyzer
        </h1>

        <form
          onSubmit={handleUpload}
          className="space-y-6 flex flex-col items-center"
        >
          <label className="w-full h-40 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition">
            <input
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) =>
                setFile(e.target.files ? e.target.files[0] : null)
              }
            />
            {file ? (
              <span className="text-gray-700 font-medium">{file.name}</span>
            ) : (
              <span className="text-gray-500">Click or drag a video here</span>
            )}
          </label>

          <button
            type="submit"
            disabled={!file || loading}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "⏳ Analyzing..." : "🚀 Upload & Analyze"}
          </button>
        </form>

        {error && (
          <div className="mt-6 p-4 text-red-700 bg-red-100 border border-red-300 rounded-lg">
            ❌ {error}
          </div>
        )}

        {result && (
          <div className="mt-6 space-y-6">
            {result.summary && (
              <div className="p-4 border rounded-lg bg-gray-50">
                <h2 className="text-lg font-semibold mb-2">
                  📊 Video Summary:
                </h2>
                <pre className="text-sm whitespace-pre-wrap text-gray-800">
                  {result.summary}
                </pre>
              </div>
            )}

            {result.transcript && (
              <div className="p-4 border rounded-lg bg-gray-50">
                <h2 className="text-lg font-semibold mb-2">📝 Transcript:</h2>
                <pre className="text-sm whitespace-pre-wrap text-gray-800">
                  {result.transcript}
                </pre>
              </div>
            )}

            {result.frame_notes && result.frame_notes.length > 0 && (
              <div className="p-4 border rounded-lg bg-gray-50">
                <h2 className="text-lg font-semibold mb-2">🖼️ Frame Notes:</h2>
                <ul className="list-disc pl-6 space-y-2">
                  {result.frame_notes.map((note, idx) => (
                    <li key={idx} className="bg-white p-2 rounded shadow-sm">
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Analyzer;
