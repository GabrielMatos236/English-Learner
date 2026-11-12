// O que a aluna "já sabe" e o que vale praticar.
// Usado pelo servidor (/api/practice) e pelo painel do professor.
//
// "Já sabe" = o que ela dominou no teste + o que o professor marcou como "dei aula".
// Prática = até 3 tópicos, nesta prioridade:
//   1. as 2 últimas aulas dadas (o que está fresco);
//   2. tópicos instáveis do teste (precisam de reforço);
//   3. qualquer outra coisa que ela já sabe (revisão espaçada).
// Se ela ainda não sabe nada, pratica o próximo tópico da trilha (uma prévia).

import { allTopics, topicById } from '../data/curriculum.js'
import { TopicStatus } from './engine.js'
import { buildLearningPath } from './report.js'

export const PRACTICE_TOPIC_COUNT = 3

export function getTaughtTopicIds(record) {
  return (record.taughtTopics ?? []).filter((id) => topicById[id])
}

export function getLearnedTopicIds(record) {
  const learned = new Set(getTaughtTopicIds(record))
  for (const topic of allTopics) {
    if (record.topicStatus?.[topic.id] === TopicStatus.mastered) learned.add(topic.id)
  }
  return allTopics.map((topic) => topic.id).filter((id) => learned.has(id))
}

function pickRandom(items, count, random) {
  const pool = [...items]
  const picked = []
  while (picked.length < count && pool.length) {
    picked.push(pool.splice(Math.floor(random() * pool.length), 1)[0])
  }
  return picked
}

export function pickPracticeTopics(record, random = Math.random) {
  const picked = getTaughtTopicIds(record).slice(-2).reverse()

  const shaky = allTopics
    .filter((topic) => record.topicStatus?.[topic.id] === TopicStatus.shaky && !picked.includes(topic.id))
    .map((topic) => topic.id)
  picked.push(...pickRandom(shaky, PRACTICE_TOPIC_COUNT - picked.length, random))

  const otherLearned = getLearnedTopicIds(record).filter((id) => !picked.includes(id))
  picked.push(...pickRandom(otherLearned, PRACTICE_TOPIC_COUNT - picked.length, random))

  if (picked.length === 0) {
    const nextLesson = buildLearningPath(record.topicStatus ?? {})[0]
    if (nextLesson) return { topics: [topicById[nextLesson.topicId]], isPreview: true }
  }

  return { topics: picked.map((id) => topicById[id]), isPreview: false }
}
