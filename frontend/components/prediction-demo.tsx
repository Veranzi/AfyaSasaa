"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, CheckCircle, Clock, TrendingUp, ArrowRight, MapPin, Brain, User, Ruler, ChartLine, FlaskConical, Stethoscope, Bot } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { useGoogleSheet } from "@/hooks/useGoogleSheet"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import React, { useRef } from "react"

const OVARIAN_DATA_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSOrLbxUb6jmar3LIp2tFGHHimYL7Tl6zZTRNqJohoWBaq7sk0UHkxTKPwknP3muI5rx2kE6PwSyrKk/pub?gid=0&single=true&output=csv";

const SYMPTOMS = [
  "Pelvic pain",
  "Nausea",
  "Bloating",
  "Fatigue",
  "Irregular periods",
]
const ULTRASOUND_OPTIONS = [
  "Septated cyst",
  "Hemorrhagic cyst",
  "Solid mass",
  "Complex cyst",
  "Simple cyst",
]
const MENOPAUSE_OPTIONS = [
  "Post-menopausal",
  "Pre-menopausal",
]

export function PredictionDemo() {
  const [activeTab, setActiveTab] = useState<'prediction' | 'chatbot' | 'explanation'>("prediction")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [recommendation, setRecommendation] = useState("")
  const [messages, setMessages] = useState([{ role: "assistant", content: "Hello! I'm your medical assistant. I can answer questions about ovarian cysts and provide information based on medical data. How can I help you today?" }])
  const [userInput, setUserInput] = useState("")
  const [isLoadingChat, setIsLoadingChat] = useState(false)
  const [sampleQuestions, setSampleQuestions] = useState([
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
  ])
  const [age, setAge] = useState(18)
  const [menopause, setMenopause] = useState(MENOPAUSE_OPTIONS[0])
  const [size, setSize] = useState(1)
  const [growth, setGrowth] = useState(0)
  const [ca125, setCa125] = useState(0)
  const [ultrasound, setUltrasound] = useState(ULTRASOUND_OPTIONS[0])
  const [symptoms, setSymptoms] = useState<string[]>([])
  const [result, setResult] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [llmReport, setLlmReport] = useState("");
  const [interpretation, setInterpretation] = useState("");
  const [probabilities, setProbabilities] = useState<{ [label: string]: number } | null>(null);
  const [predictedClass, setPredictedClass] = useState<string | null>(null);
  const [confidencePercent, setConfidencePercent] = useState<number | null>(null);
  const [followupQuestion, setFollowupQuestion] = useState("");
  const [followupResponse, setFollowupResponse] = useState("");
  const ovarianSheet = useGoogleSheet(OVARIAN_DATA_CSV);
  const [patientName, setPatientName] = useState("");
  const [patientId, setPatientId] = useState("");
  const printRef = useRef<HTMLDivElement>(null);

  // Helper for rendering probabilities safely
  const probabilityEntries: [string, number][] = probabilities
    ? Object.entries(probabilities).map(([label, prob]) => [label, Number(prob)])
    : [];

  const handleSymptomChange = (symptom: string) => {
    setSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setResult("")
    setInterpretation("");
    setLlmReport("");
    setProbabilities(null);
    setPredictedClass(null);
    setConfidencePercent(null);
    setFollowupResponse("");
    // Range validation
    if (age < 18 || age > 90) {
      setError("Age must be between 18 and 90."); return;
    }
    if (size < 0.1 || size > 20) {
      setError("Cyst size must be between 0.1 and 20 cm."); return;
    }
    if (growth < -5 || growth > 10) {
      setError("Cyst growth rate must be between -5 and 10 cm/month."); return;
    }
    if (ca125 < 0 || ca125 > 2000) {
      setError("CA-125 level must be between 0 and 2000."); return;
    }
    setLoading(true)
    const payload = {
      data: [
        age,
        menopause,
        size,
        growth,
        ca125,
        ultrasound,
        symptoms.join(", ")
      ]
    }
    try {
      const response = await fetch("https://veranziverah.app.modelbit.com/v1/predict_ovarian_cyst_managementt/latest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
      const data = await response.json()
      if (data.data) {
        const { predicted_class, confidence_percent, interpretation, probabilities, llm_report } = data.data;
        setPredictedClass(predicted_class);
        setConfidencePercent(confidence_percent);
        setInterpretation(interpretation);
        setLlmReport(llm_report);
        setProbabilities(probabilities);
        let probText = "";
        if (probabilities && typeof probabilities === 'object') {
          probText = "Probabilities:\n";
          for (const [label, prob] of Object.entries(probabilities)) {
            probText += `- ${label}: ${(prob * 100).toFixed(2)}%\n`;
          }
        }
        setResult(
          `Prediction: ${predicted_class}\n` +
          `Confidence: ${confidence_percent}%\n\n` +
          `${interpretation ? interpretation.split(". ")[0] + ".\n\n" : ""}` + // show only first sentence
          probText
        );
      } else {
        setResult("Error: No prediction returned.")
      }
    } catch (error: unknown) {
      setResult("Error: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setLoading(false)
    }
  }

  const handleFollowup = async () => {
    setFollowupResponse("");
    if (!predictedClass || !confidencePercent) {
      setFollowupResponse("Run prediction first.");
      return;
    }
    const payload = { data: [predictedClass, confidencePercent, followupQuestion] };
    try {
      const response = await fetch("https://veranziverah.app.modelbit.com/v1/interpret_and_follow_up/latest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      setFollowupResponse(result.data?.data?.followup || "No answer returned.");
    } catch (error) {
      setFollowupResponse("Error: " + (error instanceof Error ? error.message : String(error)));
    }
  }

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;
    const newMessage = { role: "user", content: userInput };
    setMessages(prev => [...prev, newMessage]);
    const currentInput = userInput;
    setUserInput("");
    setIsLoadingChat(true);
    try {
      const res = await fetch("https://veranziverah.app.modelbit.com/v1/ovarian_cyst_knowledge_assistant/latest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: currentInput }),
      });
      const data = await res.json();
      if (res.ok) {
        const responseText = data.data?.answer?.replaceAll("\n", "\n") || "No answer found.";
        setMessages(prev => [...prev, { role: "assistant", content: responseText }]);
      } else {
        setMessages(prev => [...prev, { role: "assistant", content: "I apologize, but I encountered an error. Please try again." }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: "assistant", content: "I apologize, but I encountered an error. Please try again." }]);
    } finally {
      setIsLoadingChat(false);
    }
  }

  return (
    <section className="py-10 min-h-screen bg-gradient-to-br from-[#f5f7fa] to-[#ffe4ef] font-sans">
      <div className="container px-0 max-w-full h-full">
        <div className="flex flex-col md:flex-row gap-2 md:gap-4 h-full min-h-[80vh]">
          {/* Sidebar Tabs */}
          <div className="flex flex-row md:flex-col w-full md:w-64 bg-pink-50 rounded-2xl p-2 md:p-4 gap-2 md:gap-4 items-stretch mb-4 md:mb-0">
            <div className="flex flex-row md:flex-col gap-2 md:gap-4 w-full mt-4">
              <button
                className={`tab-btn w-full px-6 py-3 rounded-xl font-semibold shadow transition-all text-lg text-left ${activeTab === 'prediction' ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white' : 'bg-white text-pink-700 hover:bg-pink-100 border border-pink-200'}`}
                onClick={() => setActiveTab('prediction')}
              >
                Cyst Prediction
              </button>
              <button
                className={`tab-btn w-full px-6 py-3 rounded-xl font-semibold shadow transition-all text-lg text-left ${activeTab === 'chatbot' ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white' : 'bg-white text-pink-700 hover:bg-pink-100 border border-pink-200'}`}
                onClick={() => setActiveTab('chatbot')}
              >
                Medical Chatbot
              </button>
              <button
                className={`tab-btn w-full px-6 py-3 rounded-xl font-semibold shadow transition-all text-lg text-left ${activeTab === 'explanation' ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white' : 'bg-white text-pink-700 hover:bg-pink-100 border border-pink-200'}`}
                onClick={() => setActiveTab('explanation')}
                disabled={!result}
              >
                Explanation
              </button>
            </div>
          </div>
          {/* Main Content */}
          <div className="flex-1 pr-4 md:pr-16 flex items-stretch">
            <div className="tab-content bg-white rounded-2xl shadow-xl p-2 md:p-4 animate-fadeIn w-full h-full flex flex-col justify-center">
              {activeTab === 'prediction' && (
                <>
                  <h2 className="text-2xl font-bold text-center mb-2 text-pink-700 flex items-center justify-center gap-2">Ovarian Cyst Management Predictor</h2>
                  <p className="text-center mb-6 text-gray-500">Fill in the patient details to get management recommendations</p>
                  <form onSubmit={handleSubmit} className="space-y-6 w-full text-base md:text-lg">
                    {error && <div className="text-red-600 text-center font-semibold mb-2">{error}</div>}
                    <div className="form-row flex flex-col md:flex-row gap-4 md:gap-6 mb-2 w-full">
                      <div className="form-col flex-1 min-w-0 w-full">
                        <div className="form-group mb-2 w-full">
                          <Label htmlFor="patientName" className="font-semibold text-base md:text-lg flex items-center gap-2">Patient Name</Label>
                          <Input
                            id="patientName"
                            type="text"
                            placeholder="Enter patient name"
                            className="form-control mt-1 rounded-lg border border-pink-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 shadow-sm w-full text-base md:text-lg"
                            value={patientName}
                            onChange={e => setPatientName(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="form-col flex-1 min-w-0 w-full">
                        <div className="form-group mb-2 w-full">
                          <Label htmlFor="patientId" className="font-semibold text-base md:text-lg flex items-center gap-2">Patient ID</Label>
                          <Input
                            id="patientId"
                            type="text"
                            placeholder="Enter patient ID"
                            className="form-control mt-1 rounded-lg border border-pink-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 shadow-sm w-full text-base md:text-lg"
                            value={patientId}
                            onChange={e => setPatientId(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="form-row flex flex-col md:flex-row gap-4 md:gap-6 mb-2 w-full">
                      <div className="form-col flex-1 min-w-0 w-full">
                        <div className="form-group mb-2 w-full">
                          <Label htmlFor="age" className="font-semibold text-base md:text-lg flex items-center gap-2"><User className="w-4 h-4 text-pink-500" /> Age</Label>
                          <Input
                            id="age"
                            type="number"
                            min={18}
                            max={90}
                            placeholder="18–90"
                            className="form-control mt-1 rounded-lg border border-pink-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 shadow-sm w-full text-base md:text-lg"
                            value={age}
                            onChange={e => setAge(Number(e.target.value))}
                            required
                          />
                        </div>
                      </div>
                      <div className="form-col flex-1 min-w-0 w-full">
                        <div className="form-group mb-2 w-full">
                          <Label htmlFor="menopauseStatus" className="font-semibold text-base md:text-lg flex items-center gap-2"><User className="w-4 h-4 text-rose-500" /> Menopause Status</Label>
                          <Select
                            value={menopause}
                            onValueChange={value => setMenopause(value)}
                          >
                            <SelectTrigger className="form-control mt-1 rounded-lg border border-pink-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 shadow-sm w-full text-base md:text-lg">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              {MENOPAUSE_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    <div className="form-row flex flex-col md:flex-row gap-4 md:gap-6 mb-2 w-full">
                      <div className="form-col flex-1 min-w-0 w-full">
                        <div className="form-group mb-2 w-full">
                          <Label htmlFor="cystSize" className="font-semibold text-base md:text-lg flex items-center gap-2"><Ruler className="w-4 h-4 text-pink-500" /> Cyst Size (cm)</Label>
                          <Input
                            id="cystSize"
                            type="number"
                            step="0.1"
                            min={0.1}
                            max={20}
                            placeholder="0.1–20"
                            className="form-control mt-1 rounded-lg border border-pink-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 shadow-sm w-full text-base md:text-lg"
                            value={size}
                            onChange={e => setSize(Number(e.target.value))}
                            required
                          />
                        </div>
                      </div>
                      <div className="form-col flex-1 min-w-0 w-full">
                        <div className="form-group mb-2 w-full">
                          <Label htmlFor="cystGrowthRate" className="font-semibold text-base md:text-lg flex items-center gap-2"><ChartLine className="w-4 h-4 text-rose-500" /> Growth Rate (cm/month)</Label>
                          <Input
                            id="cystGrowthRate"
                            type="number"
                            step="0.01"
                            min={-5}
                            max={10}
                            placeholder="-5 to 10"
                            className="form-control mt-1 rounded-lg border border-pink-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 shadow-sm w-full text-base md:text-lg"
                            value={growth}
                            onChange={e => setGrowth(Number(e.target.value))}
                            required
                          />
                        </div>
                      </div>
                    </div>
                    <div className="form-group mb-2 w-full">
                      <Label htmlFor="ca125" className="font-semibold text-base md:text-lg flex items-center gap-2"><FlaskConical className="w-4 h-4 text-pink-400" /> CA-125 Level (U/mL)</Label>
                      <Input
                        id="ca125"
                        type="number"
                        min={0}
                        max={2000}
                        placeholder="0–2000"
                        className="form-control mt-1 rounded-lg border border-pink-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 shadow-sm w-full text-base md:text-lg"
                        value={ca125}
                        onChange={e => setCa125(Number(e.target.value))}
                        required
                      />
                    </div>
                    <div className="form-group mb-2 w-full">
                      <Label htmlFor="ultrasoundFeatures" className="font-semibold text-base md:text-lg flex items-center gap-2"><FlaskConical className="w-4 h-4 text-rose-400" /> Ultrasound Features</Label>
                      <Select
                        value={ultrasound}
                        onValueChange={value => setUltrasound(value)}
                      >
                        <SelectTrigger className="form-control mt-1 rounded-lg border border-pink-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 shadow-sm w-full text-base md:text-lg">
                          <SelectValue placeholder="Select feature" />
                        </SelectTrigger>
                        <SelectContent>
                          {ULTRASOUND_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="symptom-group mb-4">
                      <strong>Reported Symptoms:</strong><br />
                      {SYMPTOMS.map(symptom => (
                        <label key={symptom} className="inline-flex items-center mr-4">
                          <input
                            type="checkbox"
                            className="form-checkbox"
                            checked={symptoms.includes(symptom)}
                            onChange={() => handleSymptomChange(symptom)}
                          />
                          <span className="ml-2">{symptom}</span>
                        </label>
                      ))}
                    </div>
                    <Button
                      type="submit"
                      className="submit-btn bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-bold text-lg rounded-xl shadow-lg py-4 px-8 w-full sm:w-56 mx-auto block transition-all duration-200 hover:scale-105 hover:shadow-xl justify-center flex"
                      disabled={loading}
                    >
                      {loading ? (<span className="flex items-center justify-center gap-2"><Clock className="animate-spin w-5 h-5" /> Processing...</span>) : <span className="w-full text-center">Recommend</span>}
                    </Button>
                  </form>
                  {result && (
                    <div className="result-container mt-8 p-6 rounded-lg bg-pink-50 border-l-4 border-pink-400 w-full">
                      <h3 className="result-title text-lg font-bold flex items-center gap-2 text-pink-700 mb-2">Prediction Result</h3>
                      <pre className="result-content text-pink-700 text-xl font-semibold whitespace-pre-wrap">{result}</pre>
                      {(interpretation || llmReport) && (
                        <button className="mt-4 underline text-pink-700 hover:text-pink-900" onClick={() => setActiveTab('explanation')}>
                          See Explanation
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
              {activeTab === 'explanation' && result && (
                <div className="explanation-container mt-8 p-6 rounded-lg bg-pink-50 border-l-4 border-pink-400 w-full" id="print-section" ref={printRef}>
                  <div className="mb-4 flex flex-col md:flex-row md:items-center md:gap-8">
                    <div><strong>Patient Name:</strong> {patientName || <span className="italic text-gray-400">N/A</span>}</div>
                    <div><strong>Patient ID:</strong> {patientId || <span className="italic text-gray-400">N/A</span>}</div>
                  </div>
                  <button
                    className="mb-4 ml-auto block bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-bold py-2 px-6 rounded-lg shadow-lg print:hidden"
                    onClick={() => {
                      const printContents = document.getElementById('print-section')?.innerHTML;
                      const originalContents = document.body.innerHTML;
                      if (printContents) {
                        document.body.innerHTML = printContents;
                        window.print();
                        document.body.innerHTML = originalContents;
                        window.location.reload();
                      }
                    }}
                  >
                    Print
                  </button>
                  <h3 className="text-lg font-bold flex items-center gap-2 text-pink-700 mb-2">Clinical Explanation & Report</h3>
                  <div className="mb-4">
                    <strong>Interpretation:</strong>
                    <div className="whitespace-pre-wrap">{interpretation}</div>
                  </div>
                  {probabilityEntries.length > 0 && (
                    <div className="mb-4">
                      <strong>Probabilities:</strong>
                      <pre className="whitespace-pre-wrap">
                        {probabilityEntries.map(([label, prob]) =>
                          `- ${label}: ${(prob * 100).toFixed(2)}%`
                        ).join("\n")}
                      </pre>
                    </div>
                  )}
                  {llmReport && (
                    <div className="mb-4">
                      <strong>🧠 Clinical LLM Report:</strong>
                      <div className="whitespace-pre-wrap">{llmReport}</div>
                    </div>
                  )}
                  {/* Follow-up Section */}
                  <div className="followup mt-8">
                    <h4 className="font-bold mb-2">🔁 Clinician Follow-up</h4>
                    <div className="flex flex-col sm:flex-row gap-2 mb-2">
                      <input
                        type="text"
                        className="border rounded px-2 py-1 flex-1"
                        placeholder="Enter a follow-up question"
                        value={followupQuestion}
                        onChange={e => setFollowupQuestion(e.target.value)}
                      />
                      <Button type="button" onClick={handleFollowup}>Ask</Button>
                    </div>
                    <pre className="bg-gray-100 border p-2 whitespace-pre-wrap min-h-[40px]">{followupResponse}</pre>
                  </div>
                </div>
              )}
              {activeTab === 'chatbot' && (
                <div className="chat-container w-full">
                  <div className="chat-header bg-gradient-to-r from-pink-600 to-rose-600 text-white py-4 px-6 rounded-t-xl text-xl font-bold flex items-center gap-2 justify-center">
                    <Bot className="w-6 h-6 text-white" /> Medical Assistant
                  </div>
                  <div className="chat-messages h-80 md:h-96 p-2 sm:p-4 overflow-y-auto bg-[#fff0f6] w-full">
                    {messages.map((message, idx) => (
                      <div key={idx} className={`message mb-4 p-4 rounded-lg max-w-[80%] ${message.role === 'user' ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white ml-auto rounded-br-none' : 'bg-white text-pink-900 mr-auto rounded-bl-none border border-pink-100'}`}>
                        {message.content}
                      </div>
                    ))}
                    {isLoadingChat && (
                      <div className="message bot-message mb-4 p-4 rounded-lg max-w-[80%] bg-white text-pink-900 mr-auto rounded-bl-none border border-pink-100">
                        <span className="flex items-center gap-2"><Clock className="animate-spin w-4 h-4 text-pink-500" /> Thinking...</span>
                      </div>
                    )}
                  </div>
                  <div className="chat-input flex p-2 sm:p-4 bg-white border-t border-pink-100 w-full">
                    <Input
                      placeholder="Ask a medical question..."
                      className="flex-1 rounded-lg border border-pink-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 shadow-sm"
                      value={userInput}
                      onChange={e => setUserInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                      disabled={isLoadingChat}
                    />
                    <Button
                      className="ml-3 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white rounded-lg px-6 font-semibold border-0"
                      onClick={handleSendMessage}
                      disabled={isLoadingChat}
                    >
                      {isLoadingChat ? (<span className="flex items-center gap-2"><Clock className="animate-spin w-4 h-4" /> Sending...</span>) : (<span className="flex items-center gap-2"><ArrowRight className="w-4 h-4" /> Send</span>)}
                    </Button>
                  </div>
                  {sampleQuestions.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-center text-pink-700 font-semibold mb-2">Sample Questions</h3>
                      <div className="suggestions flex flex-wrap gap-2 justify-center w-full">
                        {sampleQuestions.map((question, idx) => (
                          <Button
                            key={idx}
                            variant="outline"
                            className="suggestion text-xs rounded-full border-pink-200 hover:bg-pink-100 text-pink-700"
                            onClick={() => setUserInput(question)}
                          >
                            {question}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Footer */}
        <footer className="text-center py-8 text-pink-400 mt-10 text-base flex items-center justify-center gap-3">
          <img src="/AfyaSasa logo.png" alt="AfyaSasa Logo" className="inline-block h-6 w-6 object-contain rounded-full mr-1" />
          <span className="font-bold text-pink-700 text-lg">AfyaSasa</span>
          <span className="text-pink-400">&copy; {new Date().getFullYear()}</span>
        </footer>
      </div>
    </section>
  )
}

// Helper icon for clipboard list (since Lucide doesn't have one)
function ClipboardList(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="9" y="2" width="6" height="4" rx="1" /><path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" /><path d="M9 12h6" /><path d="M9 16h6" /></svg>
  )
}

