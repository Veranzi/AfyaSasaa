"use client";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import ReactMarkdown from 'react-markdown';
import { type ReactMarkdownProps } from 'react-markdown';

export default function MedicalChatbot() {
  const [user, setUser] = useState<any>(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello! I'm your medical assistant. How can I help you today?" }
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;
    setMessages((msgs) => [...msgs, { role: "user", content: input }]);
    setLoading(true);
    try {
      const res = await fetch("https://afyasasa-llm.onrender.com/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: input }),
      });
      const data = await res.json();
      setMessages((msgs) => [...msgs, { role: "user", content: input }, { role: "assistant", content: data.answer?.replaceAll("\n", "\n") || "Sorry, I couldn't understand that." }]);
      setInput("");
    } catch (e) {
      setMessages((msgs) => [...msgs, { role: "assistant", content: "Sorry, there was an error connecting to the chatbot." }]);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-4">Medical Chatbot</h2>
      <div className="border rounded-lg p-4 h-96 overflow-y-auto bg-gray-50 mb-4 flex flex-col gap-2">
        {messages.map((msg, idx) => (
          <div key={idx} className={msg.role === "user" ? "text-right" : "text-left"}>
            <span className={msg.role === "user" ? "bg-pink-200 text-pink-900 px-3 py-1 rounded-lg inline-block" : "bg-white text-gray-900 px-3 py-1 rounded-lg inline-block border"}>
              <b>{msg.role === "user" ? "You" : "Bot"}:</b> <pre className="whitespace-pre-wrap inline">{msg.content}</pre>
            </span>
          </div>
        ))}
        {loading && <div className="text-left text-gray-400">Bot is typing...</div>}
      </div>
      <div className="flex gap-2">
        <input
          className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") sendMessage(); }}
          placeholder="Type your question..."
          disabled={loading}
        />
        <button
          className="bg-pink-500 text-white font-bold px-4 py-2 rounded-lg shadow hover:bg-pink-600 transition disabled:opacity-60"
          onClick={sendMessage}
          disabled={loading || !input.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
} 