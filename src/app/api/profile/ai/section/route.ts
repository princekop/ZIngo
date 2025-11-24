import { NextRequest, NextResponse } from 'next/server'

function pickGeminiKey() {
  const env = process.env as Record<string, string | undefined>
  return (
    env.GEMINI_API_KEY_PLAN_DESIGNER ||
    env.GEMINI_BOT_KEY ||
    env.GEMINI_API_KEY_1 ||
    env.GEMINI_API_KEY_2 ||
    env.GEMINI_API_KEY_3 ||
    env.GEMINI_API_KEY_4 ||
    env.GEMINI_API_KEY ||
    ''
  )
}

const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash'

export async function POST(req: NextRequest) {
  try {
    const { prompt, type } = await req.json()
    const key = pickGeminiKey()
    if (!key) return NextResponse.json({ error: 'Missing Gemini API key in env' }, { status: 400 })
    const schema = {
      type: 'object',
      properties: {
        kind: { type: 'string', enum: ['hero','text','image','gallery','links','contact'] },
        title: { type: 'string' },
        subtitle: { type: 'string' },
        text: { type: 'string' },
        images: { type: 'array', items: { type: 'object', properties: { url: { type: 'string' }, caption: { type: 'string' } } } },
        links: { type: 'array', items: { type: 'object', properties: { label: { type: 'string' }, url: { type: 'string' } } } },
      },
      required: ['kind']
    }

    const sys = `You generate a single JSON object for a web profile section. Do not include backticks. No prose. Schema: ${JSON.stringify(schema)}. If kind is 'hero', prefer short catchy title & subtitle. If 'gallery', return up to 6 images with captions. If 'links', return 3-6 link buttons.`

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(DEFAULT_MODEL)}:generateContent?key=${encodeURIComponent(key)}`
    const body = {
      contents: [
        { role: 'user', parts: [ { text: `${sys}\nType: ${type || 'auto'}\nPrompt: ${prompt || ''}` } ] }
      ],
      generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
    }
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (!res.ok) {
      const t = await res.text()
      return NextResponse.json({ error: 'Gemini request failed', detail: t }, { status: 502 })
    }
    const data = await res.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || data?.candidates?.[0]?.content?.parts?.[0]?.inlineData || ''
    // Try to parse a JSON object from the model output
    let section: any = null
    try {
      const trimmed = String(text).trim()
      const jsonText = trimmed.startsWith('```') ? trimmed.replace(/^```[a-z]*\n?/i,'').replace(/```\s*$/,'') : trimmed
      section = JSON.parse(jsonText)
    } catch {
      section = { kind: 'text', title: 'Generated', text: text }
    }
    return NextResponse.json({ section })
  } catch (e: any) {
    return NextResponse.json({ error: 'AI section generation failed', message: e?.message }, { status: 500 })
  }
}
