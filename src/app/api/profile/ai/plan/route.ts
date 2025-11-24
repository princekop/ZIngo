import { NextRequest, NextResponse } from 'next/server'

function allGeminiKeys() {
  const env = process.env as Record<string, string | undefined>
  return [
    env.GEMINI_API_KEY_PLAN_DESIGNER,
    env.GEMINI_BOT_KEY,
    env.GEMINI_API_KEY_1,
    env.GEMINI_API_KEY_2,
    env.GEMINI_API_KEY_3,
    env.GEMINI_API_KEY_4,
    env.GEMINI_API_KEY,
  ].filter(Boolean) as string[]
}

const MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash'

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json()
    const keys = allGeminiKeys()
    const key = keys[0]
    if (!key) return NextResponse.json({ error: 'Missing Gemini API key' }, { status: 400 })

    const sys = `You are a senior UX/site editor. Break the user's goal into a compact 3-4 step plan focused on editing a profile webpage. Steps should be specific like: layout, visuals, content, and code blocks (HTML/CSS/JS). Return JSON: { steps: [{ id, title, detail }] }.`
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(MODEL)}:generateContent?key=${encodeURIComponent(key)}`
    const body = {
      contents: [ { role: 'user', parts: [ { text: `${sys}\nPROMPT: ${prompt}` } ] } ],
      generationConfig: { temperature: 0.5, maxOutputTokens: 768 }
    }

    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (!res.ok) return NextResponse.json({ error: 'Plan request failed', detail: await res.text() }, { status: 502 })
    const data = await res.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''

    let plan: any = null
    try {
      const trimmed = String(text).trim()
      const jsonText = trimmed.startsWith('```') ? trimmed.replace(/^```[a-z]*\n?/i,'').replace(/```\s*$/,'') : trimmed
      plan = JSON.parse(jsonText)
    } catch {
      // fallback very small plan
      plan = { steps: [
        { id: 'layout', title: 'Layout', detail: 'Adjust section layout and structure' },
        { id: 'content', title: 'Content', detail: 'Improve headings, copy and calls to action' },
        { id: 'visuals', title: 'Visuals', detail: 'Refine colors, spacing and images' }
      ] }
    }

    // Normalize
    if (!Array.isArray(plan.steps)) plan.steps = []
    plan.steps = plan.steps.slice(0, 4)

    return NextResponse.json(plan)
  } catch (e: any) {
    return NextResponse.json({ error: 'Plan failed', message: e?.message }, { status: 500 })
  }
}
