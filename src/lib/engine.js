// Motor adaptativo do teste.
//
// Ideia geral:
// - Percorre os níveis em ordem (A1 → A2 → B1 → B2) e, dentro de cada nível, os tópicos em ordem.
// - Tópico de gramática/vocabulário: pergunta até ter certeza.
//     2 acertos seguidos  → domina
//     2 erros seguidos    → não sabe
//     1 acerto + 1 erro   → faz a 3ª pergunta de desempate (2/3 = instável, 1/3 = não sabe)
// - Tópico de leitura: sempre as 3 perguntas (3/3 domina, 2/3 instável, ≤1 não sabe).
// - Ao fim de cada nível: se metade ou mais do nível ficou fraco (não sabe vale 1, instável vale 0,5),
//   o teste PARA ali e o resto é marcado como "não testado". Isso evita torturar a aluna com conteúdo
//   muito acima do nível dela.
//
// O estado é um objeto simples e as funções são puras (recebem o estado e devolvem um novo),
// então dá pra salvar no localStorage e testar fácil.

import { levels } from '../data/curriculum.js'

export const TopicStatus = {
  mastered: 'mastered',
  shaky: 'shaky',
  missing: 'missing',
  untested: 'untested',
}

const STOP_THRESHOLD = 0.5

export function createTest() {
  return {
    levelIndex: 0,
    topicIndex: 0,
    topicAnswers: {}, // { [topicId]: [true, false, ...] }
    topicStatus: {}, // { [topicId]: 'mastered' | 'shaky' | 'missing' | 'untested' }
    answers: [], // histórico completo, pra você ver os erros depois
    finished: false,
    stoppedAtLevel: null,
    startedAt: new Date().toISOString(),
  }
}

export function getCurrentQuestion(state) {
  if (state.finished) return null
  const level = levels[state.levelIndex]
  const topic = level.topics[state.topicIndex]
  const askedCount = state.topicAnswers[topic.id]?.length ?? 0
  return {
    level,
    levelNumber: state.levelIndex + 1,
    levelCount: levels.length,
    topic,
    question: topic.questions[askedCount],
  }
}

export function resolveTopic(topic, results) {
  const rightCount = results.filter(Boolean).length

  if (topic.kind === 'reading') {
    if (results.length < topic.questions.length) return null
    const total = topic.questions.length
    if (rightCount === total) return TopicStatus.mastered
    if (rightCount === total - 1) return TopicStatus.shaky
    return TopicStatus.missing
  }

  if (results.length === 2 && results[0] === results[1]) {
    return results[0] ? TopicStatus.mastered : TopicStatus.missing
  }
  if (results.length === 3) {
    return rightCount >= 2 ? TopicStatus.shaky : TopicStatus.missing
  }
  return null
}

export function levelWeakness(level, topicStatus) {
  const weakPoints = level.topics.reduce((sum, topic) => {
    const status = topicStatus[topic.id]
    if (status === TopicStatus.missing) return sum + 1
    if (status === TopicStatus.shaky) return sum + 0.5
    return sum
  }, 0)
  return weakPoints / level.topics.length
}

// chosenOption: texto da opção escolhida, ou null quando ela clica em "Não sei".
export function answerQuestion(state, chosenOption) {
  const current = getCurrentQuestion(state)
  if (!current) return state

  const { level, topic, question } = current
  const correctOption = question.options[0]
  const isCorrect = chosenOption === correctOption

  const topicResults = [...(state.topicAnswers[topic.id] ?? []), isCorrect]
  const next = {
    ...state,
    topicAnswers: { ...state.topicAnswers, [topic.id]: topicResults },
    answers: [
      ...state.answers,
      {
        levelId: level.id,
        topicId: topic.id,
        questionId: question.id,
        chosen: chosenOption,
        correct: isCorrect,
      },
    ],
  }

  const status = resolveTopic(topic, topicResults)
  if (!status) return next // ainda precisa de mais pergunta nesse tópico

  next.topicStatus = { ...next.topicStatus, [topic.id]: status }
  next.topicIndex += 1

  const levelFinished = next.topicIndex >= level.topics.length
  if (!levelFinished) return next

  const isLastLevel = next.levelIndex >= levels.length - 1
  const shouldStop = levelWeakness(level, next.topicStatus) >= STOP_THRESHOLD

  if (isLastLevel || shouldStop) {
    return finishTest(next, shouldStop ? level.id : null)
  }

  next.levelIndex += 1
  next.topicIndex = 0
  return next
}

function finishTest(state, stoppedAtLevel) {
  const topicStatus = { ...state.topicStatus }
  for (const level of levels) {
    for (const topic of level.topics) {
      if (!topicStatus[topic.id]) topicStatus[topic.id] = TopicStatus.untested
    }
  }
  return {
    ...state,
    topicStatus,
    finished: true,
    stoppedAtLevel,
    finishedAt: new Date().toISOString(),
  }
}
