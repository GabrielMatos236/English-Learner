// Transforma o mapa de tópicos (topicStatus) num relatório pro professor:
// nível estimado, mapa por nível e a trilha sugerida.

import { levels, topicById } from '../data/curriculum.js'
import { TopicStatus } from './engine.js'

const REACHED_LEVEL_RATIO = 0.7

export const statusLabels = {
  [TopicStatus.mastered]: { icon: '✅', text: 'Domina' },
  [TopicStatus.shaky]: { icon: '⚠️', text: 'Instável' },
  [TopicStatus.missing]: { icon: '❌', text: 'Não sabe' },
  [TopicStatus.untested]: { icon: '•', text: 'Não testado' },
}

// Nível estimado = último nível (em sequência) em que ela tem pelo menos 70% de domínio,
// contando "domina" como 1 ponto e "instável" como meio ponto.
export function estimateLevel(topicStatus) {
  let reached = null
  for (const level of levels) {
    const score = level.topics.reduce((sum, topic) => {
      const status = topicStatus[topic.id]
      if (status === TopicStatus.mastered) return sum + 1
      if (status === TopicStatus.shaky) return sum + 0.5
      return sum
    }, 0)
    if (score / level.topics.length >= REACHED_LEVEL_RATIO) reached = level
    else break
  }

  if (!reached) {
    return { id: 'pre-A1', label: 'Pré-A1', description: 'Ainda construindo a base do A1.' }
  }
  const nextLevel = levels[levels.indexOf(reached) + 1]
  return {
    id: reached.id,
    label: reached.id,
    description: nextLevel
      ? `Consolidou o ${reached.id}. Próximo passo: ${nextLevel.id}.`
      : `Consolidou o ${reached.id}, o nível mais alto do teste.`,
  }
}

export function buildLevelMap(topicStatus) {
  return levels.map((level) => ({
    id: level.id,
    name: level.name,
    topics: level.topics.map((topic) => ({
      id: topic.id,
      name: topic.name,
      status: topicStatus[topic.id] ?? TopicStatus.untested,
    })),
  }))
}

// Trilha sugerida:
// - pula o que ela domina;
// - tópicos instáveis ANTES do primeiro buraco viram "revisão rápida";
// - a partir do primeiro "não sabe" / "não testado", tudo vira "aula".
export function buildLearningPath(topicStatus) {
  const path = []
  let foundFirstGap = false

  for (const level of levels) {
    for (const topic of level.topics) {
      const status = topicStatus[topic.id] ?? TopicStatus.untested
      if (status === TopicStatus.mastered) continue

      if (status === TopicStatus.missing || status === TopicStatus.untested) foundFirstGap = true
      const type = status === TopicStatus.shaky && !foundFirstGap ? 'review' : 'lesson'

      path.push({ topicId: topic.id, name: topic.name, levelId: level.id, status, type })
    }
  }
  return path
}

export function groupMistakesByTopic(answers) {
  const groups = {}
  for (const answer of answers ?? []) {
    if (answer.correct) continue
    const topic = topicById[answer.topicId]
    if (!topic) continue
    const question = topic.questions.find((item) => item.id === answer.questionId)
    if (!question) continue
    groups[topic.id] ??= { topicId: topic.id, topicName: topic.name, levelId: topic.levelId, items: [] }
    groups[topic.id].items.push({
      prompt: question.prompt,
      passage: topic.passage,
      chosen: answer.chosen,
      correctOption: question.options[0],
    })
  }
  return Object.values(groups)
}

export function buildReport(result) {
  const topicStatus = result.topicStatus ?? {}
  const answers = result.answers ?? []
  return {
    level: estimateLevel(topicStatus),
    levelMap: buildLevelMap(topicStatus),
    path: buildLearningPath(topicStatus),
    mistakes: groupMistakesByTopic(answers),
    totalQuestions: answers.length,
    totalCorrect: answers.filter((answer) => answer.correct).length,
    dontKnowCount: answers.filter((answer) => answer.chosen === null).length,
  }
}
