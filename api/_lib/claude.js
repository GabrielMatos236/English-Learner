// Geração de exercícios com o Claude (API da Anthropic), IA principal do Practice.
//
// Pra garantir JSON no formato certo, usamos "tool use": declaramos uma ferramenta
// "save_exercises" com o schema dos exercícios e obrigamos o Claude a chamá-la
// (tool_choice). O que interessa é o "input" que ele manda pra ferramenta.

import { sanitizeExercises, EXERCISE_COUNT } from './gemini.js'

const DEFAULT_MODEL = 'claude-haiku-5-5'
const REQUEST_TIMEOUT_MS = 30000

function buildInputSchema(topicIds) {
  return {
    type: 'object',
    properties: {
      exercises: {
        type: 'array',
        minItems: EXERCISE_COUNT,
        maxItems: EXERCISE_COUNT,
        items: {
          type: 'object',
          properties: {
            topicId: { type: 'string', enum: topicIds },
            context: { type: 'string', description: 'Texto curto opcional (leitura ou mini-diálogo). Vazio se não precisar.' },
            question: { type: 'string' },
            options: { type: 'array', items: { type: 'string' }, minItems: 4, maxItems: 4 },
            answerIndex: { type: 'integer', minimum: 0, maximum: 3 },
            explanation: { type: 'string', description: 'Explicação em português do Brasil.' },
          },
          required: ['topicId', 'question', 'options', 'answerIndex', 'explanation'],
        },
      },
    },
    required: ['exercises'],
  }
}

export async function callClaude({ systemInstruction, userPrompt, topicIds }) {
  const model = process.env.CLAUDE_MODEL || DEFAULT_MODEL
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 4000,
        system: systemInstruction,
        messages: [{ role: 'user', content: userPrompt }],
        tools: [
          {
            name: 'save_exercises',
            description: 'Salva os exercícios gerados para a aluna.',
            input_schema: buildInputSchema(topicIds),
          },
        ],
        tool_choice: { type: 'tool', name: 'save_exercises' },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => '')
      const error = new Error(`Claude (${model}) respondeu ${response.status}: ${errorText.slice(0, 300)}`)
      error.status = response.status
      throw error
    }

    const data = await response.json()
    const toolCall = data.content?.find((block) => block.type === 'tool_use' && block.name === 'save_exercises')
    if (!toolCall) throw new Error(`Claude (${model}) não devolveu os exercícios`)

    return { exercises: sanitizeExercises(toolCall.input?.exercises, topicIds), model }
  } finally {
    clearTimeout(timeout)
  }
}
