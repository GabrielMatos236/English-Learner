import crypto from 'node:crypto'
import { requireAuth } from './_lib/auth.js'
import { saveResult, listResults, deleteResult } from './_lib/store.js'

const validStatuses = new Set(['mastered', 'shaky', 'missing', 'untested'])

// Validação básica: o endpoint de envio é público (a aluna não tem senha),
// então só aceitamos o formato esperado e com tamanhos razoáveis.
function parseSubmission(body) {
  if (!body || typeof body !== 'object') return null

  const name = typeof body.name === 'string' ? body.name.trim().slice(0, 60) : ''
  if (!name) return null

  const { topicStatus, answers } = body
  if (!topicStatus || typeof topicStatus !== 'object') return null
  const statusEntries = Object.entries(topicStatus)
  if (statusEntries.length === 0 || statusEntries.length > 100) return null
  if (!statusEntries.every(([key, value]) => typeof key === 'string' && validStatuses.has(value))) return null

  if (!Array.isArray(answers) || answers.length > 300) return null
  const cleanAnswers = answers.map((answer) => ({
    levelId: String(answer?.levelId ?? '').slice(0, 10),
    topicId: String(answer?.topicId ?? '').slice(0, 60),
    questionId: String(answer?.questionId ?? '').slice(0, 60),
    chosen: answer?.chosen === null ? null : String(answer?.chosen ?? '').slice(0, 200),
    correct: answer?.correct === true,
  }))

  return {
    id: crypto.randomUUID(),
    name,
    topicStatus,
    answers: cleanAnswers,
    stoppedAtLevel: typeof body.stoppedAtLevel === 'string' ? body.stoppedAtLevel.slice(0, 10) : null,
    startedAt: typeof body.startedAt === 'string' ? body.startedAt.slice(0, 40) : null,
    finishedAt: new Date().toISOString(),
  }
}

export default async function handler(req, res) {
  try {
    if (req.method === 'POST') {
      const result = parseSubmission(req.body)
      if (!result) return res.status(400).json({ error: 'Dados inválidos' })
      await saveResult(result)
      return res.status(201).json({ ok: true })
    }

    if (req.method === 'GET') {
      if (!requireAuth(req, res)) return
      return res.status(200).json(await listResults())
    }

    if (req.method === 'DELETE') {
      if (!requireAuth(req, res)) return
      const id = typeof req.query?.id === 'string' ? req.query.id : ''
      if (!id) return res.status(400).json({ error: 'Informe o id' })
      await deleteResult(id)
      return res.status(200).json({ ok: true })
    }

    res.setHeader('Allow', 'GET, POST, DELETE')
    return res.status(405).json({ error: 'Método não permitido' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro interno' })
  }
}
