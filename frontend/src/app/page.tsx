"use client";  // Required for Next.js client components

import { useState } from "react";

export default function Home() {
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [sentiment, setSentiment] = useState("");

  const summarizeText = async () => {
    if (!text) return;

    try {
      const response = await fetch("http://127.0.0.1:8000/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Unknown API error");
      }

      const data = await response.json();
      setSummary(data.summary);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      console.error("Summarization Error:", errorMessage);
      setSummary(`Error: ${errorMessage}`);
    }
  };

  const analyzeSentiment = async () => {
    if (!text) return;

    try {
      const response = await fetch("http://127.0.0.1:8000/api/sentiment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Unknown API error");
      }

      const data = await response.json();
      setSentiment(`${data.sentiment} (Confidence: ${data.confidence.toFixed(2)})`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      console.error("Sentiment Analysis Error:", errorMessage);
      setSentiment(`Error: ${errorMessage}`);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-8 gap-8">
      <h1 className="text-2xl font-bold">AI Text Analysis Tool</h1>
      <textarea
        className="w-full max-w-lg p-2 border border-gray-300 rounded"
        rows={5}
        placeholder="Enter text..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      ></textarea>
      
      <div className="flex gap-4">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={summarizeText}
        >
          Summarize
        </button>
        <button
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          onClick={analyzeSentiment}
        >
          Analyze Sentiment
        </button>
      </div>

      {summary && (
        <div className="mt-4 p-4 border border-gray-300 rounded w-full max-w-lg">
          <h2 className="text-lg font-semibold">Summary:</h2>
          <p>{summary}</p>
        </div>
      )}

      {sentiment && (
        <div className="mt-4 p-4 border border-gray-300 rounded w-full max-w-lg">
          <h2 className="text-lg font-semibold">Sentiment Analysis:</h2>
          <p>{sentiment}</p>
        </div>
      )}
    </div>
  );
}
