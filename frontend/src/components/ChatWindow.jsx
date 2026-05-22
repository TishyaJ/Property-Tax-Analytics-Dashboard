/**
 * ChatWindow — AI chatbot backed by a multi-provider ensemble.
 * Fires Groq, Gemini, OpenAI, and Claude in parallel; uses the first response.
 * Strict guardrails: only answers UPYOG property tax questions.
 */
import { useState, useRef, useEffect } from 'react'
import { ensembleGenerate } from '../lib/aiEnsemble'
import { fetchSummary } from '../hooks/usePropertyData'

function buildSystemInstruction(summary) {
    return `You are an AI assistant embedded in the UPYOG Property Tax Analytics Dashboard.
Your ONLY purpose is to answer questions about:
1. Property tax data from the UPYOG platform
2. The 10 Indian cities (tenants): Delhi, Mumbai, Pune, Bengaluru, Chennai, Hyderabad, Ahmedabad, Kolkata, Jaipur, Lucknow
3. Property statuses (Approved, Rejected, Pending), collections, registrations, and related analytics

STRICT RULES:
- If the user asks ANYTHING unrelated to property taxes, UPYOG, or the data below, respond ONLY with:
  "I can only answer questions about the UPYOG property tax data. Please ask me something related to the dashboard."
- Do NOT answer questions about general knowledge, coding, news, weather, or any other topic.
- Be concise, factual, and base your answers on the data summary below.

--- DATA SUMMARY ---
${summary}
--- END OF DATA ---`
}

export default function ChatWindow() {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            text: 'Hi! I can answer questions about the UPYOG property tax data. Try: "Which city has the highest collection?" or "How many properties are rejected in Mumbai?"',
        },
    ])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [activeProvider, setActiveProvider] = useState('AI Ensemble')
    const [summary, setSummary] = useState(null)
    const bottomRef = useRef(null)

    useEffect(() => { fetchSummary().then(setSummary) }, [])
    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

    const send = async () => {
        const question = input.trim()
        if (!question || loading) return

        setMessages(prev => [...prev, { role: 'user', text: question }])
        setInput('')
        setLoading(true)

        try {
            const systemInstruction = buildSystemInstruction(summary || 'Data not yet loaded.')
            const { text, provider } = await ensembleGenerate(question, systemInstruction)
            setActiveProvider(provider)
            setMessages(prev => [...prev, { role: 'assistant', text, provider }])
        } catch (err) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                text: `⚠️ ${err.message}`,
            }])
        } finally {
            setLoading(false)
        }
    }

    const handleKeyDown = e => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
    }

    return (
        <div className="bg-white rounded-2xl shadow-md flex flex-col h-[480px]">
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <span className="text-xl">🤖</span>
                <h2 className="font-semibold text-gray-700">UPYOG AI Assistant</h2>
                <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                    {activeProvider}
                </span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div
                            className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user'
                                    ? 'bg-indigo-600 text-white rounded-br-sm'
                                    : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                                }`}
                        >
                            {msg.text}
                        </div>
                        {/* Show which provider answered */}
                        {msg.role === 'assistant' && msg.provider && (
                            <span className="text-[10px] text-gray-400 mt-0.5 px-1">via {msg.provider}</span>
                        )}
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm text-gray-500 animate-pulse">
                            Querying ensemble…
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-gray-100 flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about the property data…"
                    className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    disabled={loading}
                    aria-label="Chat input"
                />
                <button
                    onClick={send}
                    disabled={loading || !input.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl px-4 py-2 text-sm font-medium transition-colors"
                    aria-label="Send message"
                >
                    Send
                </button>
            </div>
        </div>
    )
}
