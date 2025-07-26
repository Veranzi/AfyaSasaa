"use client";
import { useState } from "react";
import Image from "next/image";

export default function DashboardMedicalChatbot() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello! I'm your medical assistant. I can answer questions about ovarian cysts and provide information based on medical data. How can I help you today?" }
  ]);
  const [userInput, setUserInput] = useState("");
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [sampleQuestions] = useState([
    "What is an ovarian cyst?",
    "What are the common symptoms of ovarian cysts?",
    "How are ovarian cysts detected or diagnosed?",
    "What are the treatment options for ovarian cysts?",
    "Can ovarian cysts become cancerous?",
    "How can I manage pain from an ovarian cyst?",
    "When should I see a doctor about an ovarian cyst?",
    "Do ovarian cysts affect fertility?",
    "What causes ovarian cysts to form?",
    "Are there different types of ovarian cysts?"
  ]);

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;
    const newMessage = { role: "user", content: userInput };
    setMessages(prev => [...prev, newMessage]);
    const currentInput = userInput;
    setUserInput("");
    setThinking(true);
    setIsLoadingChat(true);
    try {
      // Show 'thinking...' before fetching
      await new Promise(resolve => setTimeout(resolve, 600)); // short delay for effect
      const res = await fetch("https://afyasasa-llm.onrender.com/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: currentInput }),
      });
      const data = await res.json();
      if (res.ok) {
        const responseText = data.answer?.replaceAll("\n", "\n") || "No answer found.";
        setMessages(prev => [...prev, { role: "assistant", content: responseText }]);
      } else {
        setMessages(prev => [...prev, { role: "assistant", content: "I apologize, but I encountered an error. Please try again." }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: "assistant", content: "I apologize, but I encountered an error. Please try again." }]);
    } finally {
      setIsLoadingChat(false);
      setThinking(false);
    }
  };

  return (
    <section className="py-10 min-h-screen bg-gradient-to-br from-[#f5f7fa] to-[#ffe4ef] font-sans">
      <div className="container px-0 max-w-full h-full flex flex-col items-center justify-center">
        <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl p-4 animate-fadeIn flex flex-col justify-center">
          <h2 className="text-2xl font-bold text-center mb-2 text-pink-700 flex items-center justify-center gap-2">
            <Image src="/logo-afyasasa.svg" alt="" width={36} height={36} className="inline-block align-middle" />
            Medical Chatbot
          </h2>
          <p className="text-center mb-6 text-gray-500">
            Ask any question about ovarian cysts or related health topics.
          </p>
          <div className="border rounded-lg p-4 h-[32rem] overflow-y-auto bg-gray-50 mb-4 flex flex-col gap-2 transition-all duration-300 w-full">
            {messages.map((msg, idx) => (
              <div key={idx} className={msg.role === "user" ? "text-right" : "text-left"}>
                <span className={msg.role === "user" ? "bg-pink-200 text-pink-900 px-3 py-1 rounded-lg inline-block" : "bg-white text-gray-900 px-3 py-1 rounded-lg inline-block border"}>
                  <b>{msg.role === "user" ? "You" : "AfyaSasa Bot"}:</b> <pre className="whitespace-pre-wrap inline">{msg.content}</pre>
                </span>
              </div>
            ))}
            {(thinking || isLoadingChat) && <div className="text-left text-gray-400 italic">AfyaSasa Bot is thinking...</div>}
          </div>
          <div className="flex gap-2 mb-4">
            <input
              className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
              value={userInput}
              onChange={e => setUserInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleSendMessage(); }}
              placeholder="Type your question..."
              disabled={isLoadingChat}
            />
            <button
              className="bg-pink-500 text-white font-bold px-4 py-2 rounded-lg shadow hover:bg-pink-600 transition disabled:opacity-60"
              onClick={handleSendMessage}
              disabled={isLoadingChat || !userInput.trim()}
            >
              Send
            </button>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {sampleQuestions.map((q, i) => (
              <button
                key={i}
                className="bg-pink-100 text-pink-700 px-3 py-1 rounded-lg text-sm hover:bg-pink-200 transition"
                onClick={() => setUserInput(q)}
                type="button"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
} 