"use client";

import { useState } from "react";

export default function Home() {
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const summarizeText = async () => {
    if (!text) return;
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:8000/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Something went wrong");
      }

      setSummary(data.summary);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-8 gap-8">
      <h1 className="text-2xl font-bold text-gray-800">Text Summarization</h1>
      
      <textarea
        className="w-full max-w-lg p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows={5}
        placeholder="Enter text to summarize..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      ></textarea>

      <button
        className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 transition"
        onClick={summarizeText}
        disabled={loading}
      >
        {loading ? "Summarizing..." : "Summarize"}
      </button>

      {error && <p className="text-red-500">{error}</p>}

      {summary && (
        <div className="mt-4 p-4 border border-gray-300 rounded-md w-full max-w-lg bg-gray-100">
          <h2 className="text-lg font-semibold text-gray-700">Summary:</h2>
          <p className="text-gray-800">{summary}</p>
        </div>
      )}
    </div>
  );
}
