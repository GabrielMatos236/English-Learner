// GET  /api/practice?studentId=…  → nome da aluna, nível e tópicos que vão cair (pra tela inicial do Practice)
// POST /api/practice { studentId } → gera exercícios novos com o Gemini
//
// Não tem senha: o studentId é um UUID impossível de adivinhar, então o link dela funciona como a chave.

import { getResult, acquireCooldown } from './_lib/store.js'
import { generateExercises } from './_lib/gemini.js'
import { pickPracticeTopics } from '../src/lib/learning.js'
import { estimateLevel } from '../src/lib/report.js'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const COOLDOWN_SECONDS = 20

function readStudentId(req) {
  const id = req.method === 'GET' ? req.query?.studentId : req.body?.studentId
  return typeof id === 'string' && UUID_PATTERN.test(id) ? id : null
}

function describeTopics(topics) {
  return topics.map((topic) => ({ id: topic.id, name: topic.name, levelId: topic.levelId }))
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET' && req.method !== 'POST') {
      res.setHeader('Allow', 'GET, POST')
      return res.status(405).json({ error: 'Método não permitido' })
    }

    const studentId = readStudentId(req)
    if (!studentId) return res.status(400).json({ error: 'Link inválido' })

    const record = await getResult(studentId)
    if (!record) return res.status(404).json({ error: 'Aluna não encontrada' })

    const level = estimateLevel(record.topicStatus ?? {})
    const { topics, isPreview } = pickPracticeTopics(record)

    if (req.method === 'GET') {
      return res.status(200).json({
        name: record.name,
        level: level.label,
        topics: describeTopics(topics),
        isPreview,
      })
    }

    if (!(await acquireCooldown(`practice:${studentId}`, COOLDOWN_SECONDS))) {
      return res.status(429).json({ error: `Calma! Espera uns ${COOLDOWN_SECONDS} segundinhos entre uma geração e outra.` })
    }

    let generated
    try {
      generated = await generateExercises({ topics, levelLabel: level.label, isPreview })
    } catch (error) {
      console.error('[practice] falha no Gemini:', error)
      const quotaHit = error.status === 429
      return res.status(502).json({
        error: quotaHit
          ? 'A IA atingiu o limite de uso por agora. Tenta de novo daqui a pouco.'
          : 'A IA não conseguiu gerar os exercícios. Tenta de novo.',
      })
    }

    if (generated.exercises.length < 2) {
      return res.status(502).json({ error: 'A IA devolveu exercícios com problema. Tenta de novo.' })
    }

    return res.status(200).json({
      exercises: generated.exercises,
      topics: describeTopics(topics),
      mock: generated.mock,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro interno' })
  }
}
