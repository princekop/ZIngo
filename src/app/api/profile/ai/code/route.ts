import { NextRequest, NextResponse } from 'next/server'

function keyPool() {
  const env = process.env as Record<string, string | undefined>
  const keys = [
    env.GEMINI_API_KEY_PLAN_DESIGNER,
    env.GEMINI_BOT_KEY,
    env.GEMINI_API_KEY_1,
    env.GEMINI_API_KEY_2,
    env.GEMINI_API_KEY_3,
    env.GEMINI_API_KEY_4,
    env.GEMINI_API_KEY,
  ].filter(Boolean) as string[]
  return keys.length ? keys : []
}

const MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash'

async function genPart(key: string, prompt: string, part: 'html'|'css'|'js') {
  const sys = `Generate ONLY ${part.toUpperCase()} code for a profile website section. No prose, no fences. Keep it minimal but production-ready.`
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(MODEL)}:generateContent?key=${encodeURIComponent(key)}`
  const body = {
    contents: [ { role: 'user', parts: [ { text: `${sys}\nPROMPT: ${prompt}` } ] } ],
    generationConfig: { temperature: 0.6, maxOutputTokens: 2048 }
  }
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  if (!res.ok) throw new Error(await res.text())
  const data = await res.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
  // strip fences if returned
  const trimmed = String(text).trim()
  const cleaned = trimmed.startsWith('```') ? trimmed.replace(/^```[a-z]*\n?/i,'').replace(/```\s*$/,'') : trimmed
  return cleaned
}

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json()
    const keys = keyPool()
    if (!keys.length) return NextResponse.json({ error: 'Missing Gemini API key' }, { status: 400 })

    const parts: Array<'html'|'css'|'js'> = ['html','css','js']
    // assign different keys to each part in round-robin
    const tasks = parts.map((p, i) => genPart(keys[i % keys.length], prompt, p).then(code => ({ part: p, code })).catch(e => ({ part: p, code: '', error: String(e?.message || e) })))
    const results = await Promise.all(tasks)
    const out: Record<string, string> = { html: '', css: '', js: '' }
    for (const r of results) {
      if (!('error' in r) && r.code) out[r.part] = r.code
    }
    return NextResponse.json({ parts: out })
  } catch (e: any) {
    return NextResponse.json({ error: 'Code generation failed', message: e?.message }, { status: 500 })
  }
}
