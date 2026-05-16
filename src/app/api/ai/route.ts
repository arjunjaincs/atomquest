import { NextRequest } from 'next/server'
import Groq from 'groq-sdk'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, thrustArea, department, goalTitle, goalDescription, achievements, checkInData } = body

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey || apiKey === 'your-groq-api-key-here') {
      const fallbacks: Record<string, string> = {
        'suggest_titles': '1. Boost Revenue by 20% QoQ\n2. Cut Operational Costs by 15%\n3. Achieve 95% Customer Retention',
        'generate_description': `Achieve measurable improvement in ${thrustArea || 'key area'} by implementing data-driven strategies, tracking weekly milestones, and conducting bi-weekly reviews to ensure sustained progress.`,
        'improve_description': `Achieve measurable improvement through targeted initiatives with clear weekly milestones, bi-weekly reviews, and data-backed decision making to ensure on-track delivery.`,
        'suggest_kpi': 'Target: 100 | UoM: Numeric (Higher is Better) | Weightage: 20%',
        'summarize_checkin': 'Good progress this quarter — key milestones hit on schedule. Some areas need attention. Recommend focused effort on lagging items next quarter.',
      }
      return Response.json({ suggestion: fallbacks[action] || 'Configure GROQ_API_KEY in .env for AI-powered suggestions.' })
    }

    const groq = new Groq({ apiKey })

    let prompt = ''
    let maxTokens = 300

    switch (action) {
      case 'refine_title':
        prompt = `Refine this employee goal title to be more concise, professional, and measurable. Keep it under 10 words. Return ONLY the refined title, nothing else.

Original: "${goalTitle}"
Department: ${department}
Thrust Area: ${thrustArea}`
        maxTokens = 40
        break

      case 'rewrite_description':
        prompt = `Rewrite this goal description to be more SMART (Specific, Measurable, Achievable, Relevant, Time-bound). Keep it 2-3 sentences. Be professional. Return only the improved description, no labels or prefixes.

Original: "${goalDescription}"
Goal Title: "${goalTitle}"
Thrust Area: ${thrustArea}`
        maxTokens = 200
        break


      case 'suggest_kpi':
        prompt = `For this goal, suggest the best measurement approach:
Title: "${goalTitle}"
Thrust Area: ${thrustArea}

Return in this exact format (one line):
Target: [number] | UoM: [Numeric/Percentage/Timeline/Zero] | Direction: [Higher is Better/Lower is Better] | Weightage: [10-30]%

Pick the most appropriate UoM type. Be realistic with target numbers.`
        maxTokens = 80
        break

      case 'summarize_checkin':
        prompt = `Write a concise 2-3 sentence performance summary for a manager review based on this quarterly check-in data:
${checkInData || achievements}

Highlight wins, flag concerns, and suggest one action item. Be professional and direct.`
        maxTokens = 150
        break

      default:
        return Response.json({ error: 'Unknown action' }, { status: 400 })
    }

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: maxTokens,
    })

    const text = completion.choices[0]?.message?.content?.trim() || 'AI suggestion unavailable.'

    return Response.json({ suggestion: text })
  } catch (error) {
    console.error('AI error:', error)
    return Response.json({ suggestion: 'AI service temporarily unavailable. Please try again.' })
  }
}
