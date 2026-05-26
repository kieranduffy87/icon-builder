import express from 'express'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json({ limit: '10mb' }))

const API_KEY = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY
const MODEL = 'gemini-2.5-flash-image'
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`

if (!API_KEY) {
  console.warn('\n⚠️  No GOOGLE_API_KEY or GEMINI_API_KEY found in environment.')
  console.warn('   Set one to enable AI icon generation:')
  console.warn('   GOOGLE_API_KEY=your_key node server.js\n')
}

app.post('/api/generate-icon', async (req, res) => {
  if (!API_KEY) {
    return res.status(400).json({ error: 'No API key configured. Set GOOGLE_API_KEY environment variable.' })
  }

  const { prompt, style } = req.body
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' })
  }

  const styleHints = {
    minimal: 'minimalist, clean lines, simple geometry, lots of white space',
    geometric: 'geometric shapes, sharp edges, mathematical precision, symmetrical',
    organic: 'organic curves, natural flowing shapes, soft edges',
    tech: 'technical, circuit-like, digital, futuristic, cyberpunk',
    brand: 'professional logo mark, bold, distinctive, memorable brand identity',
    abstract: 'abstract art, creative, artistic interpretation, unique composition',
  }

  const styleDesc = styleHints[style] || styleHints.minimal

  const fullPrompt = `Design a single icon for: "${prompt}".
Style: ${styleDesc}.
Requirements: The icon must be a simple, clean vector-style icon on a pure transparent or white background.
It should be centered, use a single color (white or black), and work well at small sizes like 64x64px.
Think App Store icon quality — bold, recognizable, minimal detail.
Do NOT include any text, labels, or words in the image.
Square aspect ratio. No background pattern or decoration.`

  try {
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      }),
    })

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      const msg = errData.error?.message || `API error ${response.status}`
      console.error('Gemini API error:', response.status, msg)
      // Extract retry delay if rate limited
      if (response.status === 429) {
        const retryMatch = msg.match(/retry in ([\d.]+)s/)
        const retrySec = retryMatch ? Math.ceil(parseFloat(retryMatch[1])) : 60
        return res.status(429).json({ error: `Rate limited — try again in ${retrySec}s. Free tier has limited requests per minute.` })
      }
      return res.status(response.status).json({ error: msg })
    }

    const data = await response.json()
    const candidates = data.candidates || []

    const images = []
    for (const candidate of candidates) {
      const parts = candidate.content?.parts || []
      for (const part of parts) {
        if (part.inlineData) {
          images.push({
            data: part.inlineData.data,
            mimeType: part.inlineData.mimeType,
          })
        }
      }
    }

    if (images.length === 0) {
      return res.status(422).json({ error: 'No images generated. Try a different prompt.' })
    }

    res.json({ images })
  } catch (err) {
    console.error('Generation error:', err)
    res.status(500).json({ error: 'Failed to generate icon. Check your API key and try again.' })
  }
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true, hasKey: !!API_KEY })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`🎨 Icon generator API running on http://localhost:${PORT}`)
  if (API_KEY) {
    console.log('✅ API key configured')
  }
})
