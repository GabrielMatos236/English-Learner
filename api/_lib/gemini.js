// Geração de exercícios com o Gemini (Google AI Studio).
//
// - Pedimos a resposta em JSON com um schema fixo (responseSchema), assim a IA não devolve texto solto.
// - Mesmo assim, validamos tudo antes de mandar pro front: IA às vezes repete opção, erra o índice etc.
// - Sem GEMINI_API_KEY (ex.: rodando local), usamos exercícios de exemplo tirados do próprio currículo.
// - Nenhum dado pessoal vai pro Gemini: só os tópicos e o nível.

import { getInstruction } from '../../src/data/curriculum.js'

const DEFAULT_MODEL = 'gemini-2.5-flash'
const EXERCISE_COUNT = 5
const REQUEST_TIMEOUT_MS = 30000

function buildPrompt(topics, levelLabel, isPreview) {
  const topicList = topics
    .map((topic) => {
      const kind = topic.kind === 'reading' ? ' (leitura: inclua um texto curto de 2 a 4 frases em "context")' : ''
      const example = topic.questions[0]
      return `- id "${topic.id}": ${topic.name}${kind}. Exemplo do estilo: "${example.prompt}"`
    })
    .join('\n')

  const systemInstruction = `Você é um professor de inglês criando exercícios para uma aluna adulta brasileira.
Nível estimado dela: ${levelLabel} (escala CEFR). Use vocabulário e frases adequados a esse nível.

Regras:
- Gere exatamente ${EXERCISE_COUNT} exercícios de múltipla escolha, distribuídos entre os tópicos pedidos.
- Enunciado ("question") e opções em inglês. Use "___" para lacunas.
- Exatamente 4 opções por exercício, todas diferentes, com UMA única resposta correta sem ambiguidade.
- Os distratores devem ser erros típicos de brasileiros, não opções absurdas.
- Varie o formato: completar lacuna, escolher a frase correta, achar a palavra que encaixa no contexto.
- "answerIndex" é o índice (0 a 3) da opção correta.
- "explanation": 1 ou 2 frases em português do Brasil, explicando por que a resposta certa é a certa.
- "context" é opcional: use só para exercícios de leitura ou quando um mini-diálogo ajudar; senão, deixe vazio.
- Não repita exemplos óbvios de livro didático; crie frases do cotidiano.`

  const userPrompt = `${isPreview ? 'Ela ainda não teve aula; faça exercícios bem introdutórios deste tópico.\n' : ''}Tópicos para praticar:
${topicList}`

  return { systemInstruction, userPrompt }
}

function buildSchema(topicIds) {
  return {
    type: 'OBJECT',
    properties: {
      exercises: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            topicId: { type: 'STRING', enum: topicIds },
            context: { type: 'STRING' },
            question: { type: 'STRING' },
            options: { type: 'ARRAY', items: { type: 'STRING' } },
            answerIndex: { type: 'INTEGER' },
            explanation: { type: 'STRING' },
          },
          required: ['topicId', 'question', 'options', 'answerIndex', 'explanation'],
        },
      },
    },
    required: ['exercises'],
  }
}

// Valida e normaliza. Devolve só os exercícios que fazem sentido.
export function sanitizeExercises(rawExercises, topicIds) {
  if (!Array.isArray(rawExercises)) return []
  const clean = []
  for (const raw of rawExercises) {
    const question = typeof raw?.question === 'string' ? raw.question.trim() : ''
    const options = Array.isArray(raw?.options) ? raw.options.map((option) => String(option).trim()) : []
    const answerIndex = Number(raw?.answerIndex)
    const explanation = typeof raw?.explanation === 'string' ? raw.explanation.trim() : ''

    if (!question || question.length > 600) continue
    if (options.length !== 4 || options.some((option) => !option || option.length > 200)) continue
    if (new Set(options.map((option) => option.toLowerCase())).size !== 4) continue
    if (!Number.isInteger(answerIndex) || answerIndex < 0 || answerIndex > 3) continue

    clean.push({
      topicId: topicIds.includes(raw.topicId) ? raw.topicId : topicIds[0],
      context: typeof raw.context === 'string' ? raw.context.trim().slice(0, 1200) : '',
      question,
      options,
      correctOption: options[answerIndex],
      explanation: explanation.slice(0, 600),
    })
  }
  return clean.slice(0, EXERCISE_COUNT)
}

function mockExercises(topics) {
  const exercises = topics.flatMap((topic) =>
    topic.questions.map((question) => ({
      topicId: topic.id,
      context: topic.passage ?? '',
      question: question.prompt,
      options: question.options,
      correctOption: question.options[0],
      explanation: `Exercício de exemplo (${getInstruction(topic)}). Configure GEMINI_API_KEY para gerar exercícios novos com IA.`,
    }))
  )
  return exercises.slice(0, EXERCISE_COUNT)
}

export async function generateExercises({ topics, levelLabel, isPreview }) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return { exercises: mockExercises(topics), mock: true }

  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL
  const topicIds = topics.map((topic) => topic.id)
  const { systemInstruction, userPrompt } = buildPrompt(topics, levelLabel, isPreview)

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemInstruction }] },
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: buildSchema(topicIds),
            temperature: 1,
          },
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text().catch(() => '')
      const error = new Error(`Gemini respondeu ${response.status}: ${errorText.slice(0, 300)}`)
      error.status = response.status
      throw error
    }

    const data = await response.json()
    const text = (data.candidates?.[0]?.content?.parts ?? [])
      .filter((part) => typeof part.text === 'string' && !part.thought)
      .map((part) => part.text)
      .join('')

    const parsed = JSON.parse(text)
    return { exercises: sanitizeExercises(parsed.exercises, topicIds), mock: false }
  } finally {
    clearTimeout(timeout)
  }
}
