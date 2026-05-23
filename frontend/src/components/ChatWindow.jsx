import { useState, useRef, useEffect } from 'react'
import { ensembleGenerate, buildSystemInstruction } from '../lib/aiEnsemble'
import { fetchSummary } from '../hooks/usePropertyData'

export default function ChatWindow() {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            text: 'Hi! Ask me anything about the UPYOG property tax data.\nTry: "Which city has the highest collection?" or "How many properties are rejected in Mumbai?"',
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
            const { text, provider } = await ensembleGenerate(
                question,
                buildSystemInstruction(summary || 'Data not yet loaded.')
            )
            setActiveProvider(provider)
            setMessages(prev => [...prev, { role: 'assistant', text, provider }])
        } catch (err) {
            setMessages(prev => [...prev, { role: 'assistant', text: `⚠️ ${err.message}` }])
        } finally {
            setLoading(false)
        }
    }

    const handleKeyDown = e => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm flex flex-col h-[420px]">

            {/* Header */}
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2.5">
                <span className="font-semibold text-sm text-slate-700">UPYOG AI Assistant</span>
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-medium bg-indigo-50 text-indigo-600 border border-indigo-100">
                    {activeProvider}
                </span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div
                            className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user'
                                ? 'bg-indigo-600 text-white rounded-br-sm'
                                : 'bg-slate-100 text-slate-700 rounded-bl-sm'
                                }`}
                        >
                            {msg.text}
                        </div>
                        {msg.role === 'assistant' && msg.provider && (
                            <span className="text-[10px] text-slate-400 mt-0.5 px-1">via {msg.provider}</span>
                        )}
                    </div>
                ))}
                {loading && (
                    <div className="flex items-start">
                        <div className="bg-slate-100 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5 items-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-slate-100 flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about the property data…"
                    disabled={loading}
                    aria-label="Chat input"
                    className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                />
                <button
                    onClick={send}
                    disabled={loading || !input.trim()}
                    aria-label="Send message"
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
                >
                    Send
                </button>
            </div>
        </div>
    )
}
