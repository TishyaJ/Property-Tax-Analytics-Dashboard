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
        <div className="rounded-2xl flex flex-col h-[420px]"
            style={{ background: 'linear-gradient(135deg, #1e293b 0%, #162032 100%)', boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}>

            {/* Header */}
            <div className="px-5 py-3.5 flex items-center gap-2.5"
                style={{ borderBottom: '1px solid #1e3a5f' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
                    style={{ background: 'linear-gradient(135deg, #14b8a6, #0ea5e9)' }}>
                    🤖
                </div>
                <span className="font-semibold text-sm text-white">UPYOG AI Assistant</span>
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ background: 'rgba(20,184,166,0.15)', color: '#2dd4bf', border: '1px solid rgba(45,212,191,0.3)' }}>
                    {activeProvider}
                </span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
                style={{ scrollbarWidth: 'thin', scrollbarColor: '#334155 transparent' }}>
                {messages.map((msg, i) => (
                    <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div
                            className="max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap"
                            style={msg.role === 'user'
                                ? { background: 'linear-gradient(135deg, #14b8a6, #0ea5e9)', color: '#fff', borderBottomRightRadius: '4px' }
                                : { background: '#0f172a', color: '#cbd5e1', border: '1px solid #1e3a5f', borderBottomLeftRadius: '4px' }
                            }
                        >
                            {msg.text}
                        </div>
                        {msg.role === 'assistant' && msg.provider && (
                            <span className="text-[10px] mt-0.5 px-1" style={{ color: '#334155' }}>
                                via {msg.provider}
                            </span>
                        )}
                    </div>
                ))}
                {loading && (
                    <div className="flex items-start">
                        <div className="rounded-2xl px-4 py-2.5 text-sm flex gap-1.5 items-center"
                            style={{ background: '#0f172a', border: '1px solid #1e3a5f', color: '#475569', borderBottomLeftRadius: '4px' }}>
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 flex gap-2" style={{ borderTop: '1px solid #1e3a5f' }}>
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about the property data…"
                    disabled={loading}
                    aria-label="Chat input"
                    className="flex-1 rounded-xl px-3 py-2 text-sm focus:outline-none"
                    style={{
                        background: '#0f172a',
                        border: '1px solid #334155',
                        color: '#e2e8f0',
                    }}
                />
                <button
                    onClick={send}
                    disabled={loading || !input.trim()}
                    aria-label="Send message"
                    className="rounded-xl px-4 py-2 text-sm font-semibold transition-opacity disabled:opacity-40"
                    style={{ background: 'linear-gradient(135deg, #14b8a6, #0ea5e9)', color: '#fff' }}
                >
                    Send
                </button>
            </div>
        </div>
    )
}
