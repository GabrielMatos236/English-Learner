// POST /api/flags { studentId, exercise } → a aluna avisa que acha que um exercício da IA está errado.
// Os avisos ficam guardados no registro dela e aparecem no painel do professor.

import { updateResult, acquireCooldown } from './_lib/store.js'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const MAX_FLAGS = 30

const text = (value, max) => (typeof value === 'string' ? value.trim().slice(0, max) : '')

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { studentId, exercise } = req.body ?? {}
    if (typeof studentId !== 'string' || !UUID_PATTERN.test(studentId)) {
      return res.status(400).json({ error: 'Link inválido' })
    }

    const flag = {
      topicId: text(exercise?.topicId, 60),
      context: text(exercise?.context, 1200),
      question: text(exercise?.question, 600),
      options: Array.isArray(exercise?.options) ? exercise.options.slice(0, 4).map((option) => text(option, 200)) : [],
      correctOption: text(exercise?.correctOption, 200),
      createdAt: new Date().toISOString(),
    }
    if (!flag.question) return res.status(400).json({ error: 'Exercício inválido' })

    if (!(await acquireCooldown(`flag:${studentId}`, 3))) {
      return res.status(429).json({ error: 'Espera um pouquinho.' })
    }

    const updated = await updateResult(studentId, (record) => {
      record.flags = [flag, ...(record.flags ?? [])].slice(0, MAX_FLAGS)
      return record
    })
    if (!updated) return res.status(404).json({ error: 'Aluna não encontrada' })

    return res.status(201).json({ ok: true })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro interno' })
  }
}
