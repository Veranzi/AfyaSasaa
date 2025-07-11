import { useState } from "react";

export default function LLMRecommendationDemo() {
  const [context, setContext] = useState("");
  const [question, setQuestion] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setRecommendation("");
    setError("");
    try {
      const res = await fetch("http://localhost:5000/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: context + "\n" + question }),
      });
      const data = await res.json();
      if (data.response) {
        setRecommendation(data.response);
      } else if (data.error) {
        setError(data.error);
      } else {
        setError("No response from LLM.");
      }
    } catch (err) {
      setError("Network or server error.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">LLM Recommendation Demo</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Context (e.g., inventory, prices, patient info, prediction):</label>
          <textarea
            className="w-full border rounded p-2"
            rows={6}
            value={context}
            onChange={e => setContext(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Question:</label>
          <input
            className="w-full border rounded p-2"
            type="text"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Getting Recommendation..." : "Get Recommendation"}
        </button>
      </form>
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}
      {recommendation && (
        <div className="mt-6 p-4 bg-gray-100 rounded">
          <h3 className="font-semibold mb-2">LLM Recommendation:</h3>
          <p>{recommendation}</p>
        </div>
      )}
    </div>
  );
} 