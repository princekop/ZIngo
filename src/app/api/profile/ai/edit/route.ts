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
    const { prompt, form, selection } = await req.json()
    const key = pickGeminiKey()
    if (!key) return NextResponse.json({ error: 'Missing Gemini API key in env' }, { status: 400 })

    const sys = `You are a site editor assistant. You will receive a JSON 'form' that contains a website profile configuration with a 'sections' array. Optionally a 'selection' tells which section index to modify.\n\nRules:\n- Prefer modifying the selected section only when provided.\n- If selection is null and the prompt asks for whole-page changes, edit titles/colors/text conservatively.\n- You MAY suggest adding at most ONE new section (zero or one). Never more.\n- Return a JSON object with shape: { updatedSections: Section[], insertNewSectionAfter?: number }\n- 'updatedSections' must be the entire sections array after your edits.\n- If you add a new section, set 'insertNewSectionAfter' to the index after which it was inserted (or -1 for beginning).\n- Keep data stable; do not erase unrelated sections.`

    const payload = {
      contents: [
        { role: 'user', parts: [ { text: `${sys}\nPROMPT: ${prompt}\nSELECTION: ${JSON.stringify(selection)}\nFORM: ${JSON.stringify(form)}` } ] }
      ],
      generationConfig: { temperature: 0.5, maxOutputTokens: 1536 }
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(DEFAULT_MODEL)}:generateContent?key=${encodeURIComponent(key)}`
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    if (!res.ok) {
      const t = await res.text()
      return NextResponse.json({ error: 'Gemini request failed', detail: t }, { status: 502 })
    }
    const data = await res.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
    let out: any = null
    try {
      const trimmed = String(text).trim()
      const jsonText = trimmed.startsWith('```') ? trimmed.replace(/^```[a-z]*\n?/i,'').replace(/```\s*$/,'') : trimmed
      out = JSON.parse(jsonText)
    } catch {
      return NextResponse.json({ error: 'Model did not return JSON' }, { status: 500 })
    }

    if (!out || !Array.isArray(out.updatedSections)) {
      return NextResponse.json({ error: 'Malformed response' }, { status: 500 })
    }

    // Enforce guard: at most +1 section compared to input
    const inputLen = Array.isArray(form?.sections) ? form.sections.length : 0
    if (out.updatedSections.length > inputLen + 1) {
      out.updatedSections = out.updatedSections.slice(0, inputLen + 1)
    }

    return NextResponse.json(out)
  } catch (e: any) {
    return NextResponse.json({ error: 'AI edit failed', message: e?.message }, { status: 500 })
  }
}
