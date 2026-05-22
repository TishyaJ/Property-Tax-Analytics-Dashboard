/**
 * AI Ensemble — fires all configured providers in parallel.
 * Returns the first successful response. Providers with missing keys
 * or exhausted quotas (429) are silently skipped.
 *
 * Providers (priority order):
 *   1. Groq / Llama-3.3-70b  — fastest, most generous free tier
 *   2. Gemini 2.5 Flash       — Google AI Studio free tier
 *   3. GPT-4o-mini            — OpenAI free trial / paid
 *   4. Claude Haiku           — Anthropic free trial / paid
 *
 * All SDKs are lazy-imported so they don't bloat the initial bundle.
 */

const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY
const OPENAI_KEY = import.meta.env.VITE_OPENAI_API_KEY
const CLAUDE_KEY = import.meta.env.VITE_CLAUDE_API_KEY
const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY

const isSet = key => key && !key.startsWith('REPLACE_WITH') && !key.startsWith('your_')

// ── Individual provider callers ──────────────────────────────────────────────

async function callGemini(question, systemInstruction) {
    if (!isSet(GEMINI_KEY)) throw new Error('NO_KEY')
    const { GoogleGenerativeAI } = await import('@google/generative-ai')
    const genAI = new GoogleGenerativeAI(GEMINI_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash', systemInstruction })
    const result = await model.generateContent(question)
    return result.response.text()
}

async function callOpenAI(question, systemInstruction) {
    if (!isSet(OPENAI_KEY)) throw new Error('NO_KEY')
    const { default: OpenAI } = await import('openai')
    const client = new OpenAI({ apiKey: OPENAI_KEY, dangerouslyAllowBrowser: true })
    const res = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: question },
        ],
        max_tokens: 512,
    })
    return res.choices[0].message.content
}

async function callClaude(question, systemInstruction) {
    if (!isSet(CLAUDE_KEY)) throw new Error('NO_KEY')
    const { default: Anthropic } = await import('@anthropic-ai/sdk')
    const client = new Anthropic({ apiKey: CLAUDE_KEY, dangerouslyAllowBrowser: true })
    const res = await client.messages.create({
        model: 'claude-haiku-4-5',
        max_tokens: 512,
        system: systemInstruction,
        messages: [{ role: 'user', content: question }],
    })
    return res.content[0].text
}

async function callGroq(question, systemInstruction) {
    if (!isSet(GROQ_KEY)) throw new Error('NO_KEY')
    const { default: OpenAI } = await import('openai')
    const client = new OpenAI({
        apiKey: GROQ_KEY,
        baseURL: 'https://api.groq.com/openai/v1',
        dangerouslyAllowBrowser: true,
    })
    const res = await client.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: question },
        ],
        max_tokens: 512,
    })
    return res.choices[0].message.content
}

// ── Ensemble runner ──────────────────────────────────────────────────────────

const PROVIDERS = [
    { name: 'Groq / Llama-3.3', fn: callGroq },
    { name: 'Gemini 2.5 Flash', fn: callGemini },
    { name: 'GPT-4o-mini', fn: callOpenAI },
    { name: 'Claude Haiku', fn: callClaude },
]

const SKIPPABLE = ['NO_KEY', '429', 'quota', 'rate limit', 'rate_limit', 'ratelimiterror']
const isSkippable = err =>
    SKIPPABLE.some(s => err?.message?.toLowerCase().includes(s.toLowerCase()))

/**
 * Races all providers in parallel.
 * Returns { text, provider } from whichever responds first without error.
 */
export async function ensembleGenerate(question, systemInstruction) {
    const attempts = PROVIDERS.map(({ name, fn }) =>
        fn(question, systemInstruction)
            .then(text => ({ text, provider: name }))
            .catch(err => Promise.reject({ name, err }))
    )

    try {
        return await Promise.any(attempts)
    } catch (aggregateErr) {
        const errors = aggregateErr.errors ?? []
        const allSkippable = errors.every(e => isSkippable(e.err))

        if (allSkippable) {
            throw new Error(
                'All AI providers are either unconfigured or have hit their quota. ' +
                'Add at least one API key to frontend/.env, or wait for the daily quota reset.'
            )
        }

        const real = errors.find(e => !isSkippable(e.err))
        throw real ? real.err : new Error('All providers failed.')
    }
}
