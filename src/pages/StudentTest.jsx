import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { createTest, getCurrentQuestion, answerQuestion } from '../lib/engine.js'
import { getInstruction } from '../data/curriculum.js'
import { api } from '../lib/api.js'

const PROGRESS_KEY = 'placementProgress'

function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? 'null')
    return saved?.state && saved?.name ? saved : null
  } catch {
    return null
  }
}

function saveProgress(progress) {
  try {
    if (progress) localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress))
    else localStorage.removeItem(PROGRESS_KEY)
  } catch {
    // sem storage: segue sem salvar progresso
  }
}

function shuffle(items) {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export default function StudentTest() {
  const [savedProgress] = useState(loadProgress)
  const [name, setName] = useState(savedProgress?.name ?? '')
  const [testState, setTestState] = useState(null)
  const [stage, setStage] = useState('intro') // intro | quiz | sending | done | error

  useEffect(() => {
    if (stage === 'quiz' && testState && !testState.finished) saveProgress({ name, state: testState })
  }, [stage, testState, name])

  function startTest(resume) {
    setTestState(resume && savedProgress ? savedProgress.state : createTest())
    setStage('quiz')
  }

  async function submit(finalState) {
    setStage('sending')
    try {
      await api.submitResult({
        name: name.trim(),
        topicStatus: finalState.topicStatus,
        answers: finalState.answers,
        stoppedAtLevel: finalState.stoppedAtLevel,
        startedAt: finalState.startedAt,
      })
      saveProgress(null)
      setStage('done')
    } catch {
      setStage('error')
    }
  }

  function handleAnswer(chosenOption) {
    const nextState = answerQuestion(testState, chosenOption)
    setTestState(nextState)
    if (nextState.finished) submit(nextState)
  }

  if (stage === 'intro') {
    return (
      <main className="page narrow">
        <Link to="/" className="backLink">← Voltar</Link>
        <div className="card">
          <h1>Antes de começar 👋</h1>
          <ul className="tipList">
            <li>O teste se adapta: fica mais difícil conforme você acerta, e termina sozinho quando encontrar o seu nível.</li>
            <li><strong>Não chute!</strong> Se não souber, clique em <em>“Não sei”</em>. Chutar só bagunça o resultado e deixa as aulas menos certeiras.</li>
            <li>Sem dicionário nem tradutor. Ninguém espera que você acerte tudo.</li>
            <li>O resultado vai direto pro seu professor.</li>
          </ul>

          <label className="field">
            <span>Seu nome</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Como você se chama?"
              maxLength={60}
              autoFocus
            />
          </label>

          <div className="actions">
            {savedProgress && (
              <button className="button secondary" disabled={!name.trim()} onClick={() => startTest(true)}>
                Continuar de onde parei
              </button>
            )}
            <button className="button primary" disabled={!name.trim()} onClick={() => startTest(false)}>
              {savedProgress ? 'Começar do zero' : 'Começar'}
            </button>
          </div>
        </div>
      </main>
    )
  }

  if (stage === 'sending') {
    return (
      <main className="page narrow">
        <div className="card center">
          <div className="spinner" />
          <p>Enviando seu resultado…</p>
        </div>
      </main>
    )
  }

  if (stage === 'error') {
    return (
      <main className="page narrow">
        <div className="card center">
          <h2>Ops, não consegui enviar 😕</h2>
          <p className="muted">Suas respostas estão guardadas. Confere a internet e tenta de novo.</p>
          <button className="button primary" onClick={() => submit(testState)}>Tentar de novo</button>
        </div>
      </main>
    )
  }

  if (stage === 'done') {
    return (
      <main className="page narrow">
        <div className="card center">
          <div className="bigEmoji">🎉</div>
          <h2>Pronto, {name.trim().split(' ')[0]}!</h2>
          <p className="muted">Seu resultado já foi enviado. Agora é só esperar a primeira aula. 😉</p>
          <Link to="/" className="button secondary">Voltar ao início</Link>
        </div>
      </main>
    )
  }

  // key = id da questão: cada pergunta nova monta o componente do zero
  // (zera a seleção e embaralha as opções de novo).
  const currentQuestionId = getCurrentQuestion(testState)?.question.id
  return <QuizStep key={currentQuestionId} testState={testState} onAnswer={handleAnswer} />
}

function QuizStep({ testState, onAnswer }) {
  const current = getCurrentQuestion(testState)
  const [selected, setSelected] = useState(null)
  const [options] = useState(() => (current ? shuffle(current.question.options) : []))

  useEffect(() => {
    function onKeyDown(event) {
      if (event.target instanceof HTMLInputElement) return
      const index = Number(event.key) - 1
      if (index >= 0 && index < options.length) setSelected(options[index])
      if (event.key === 'Enter' && selected !== null) onAnswer(selected)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [options, selected, onAnswer])

  if (!current) return null
  const { topic, question, levelNumber, levelCount, level } = current
  const levelProgress = (testState.topicIndex / level.topics.length) * 100

  return (
    <main className="page narrow">
      <div className="quizHeader">
        <span className="badge">Parte {levelNumber} de {levelCount}</span>
        <span className="muted small">Pergunta {testState.answers.length + 1}</span>
      </div>
      <div className="progressBar"><div style={{ width: `${levelProgress}%` }} /></div>

      <div className="card">
        {topic.passage && <blockquote className="passage" lang="en">{topic.passage}</blockquote>}
        <p className="instruction">{getInstruction(topic)}</p>
        <h2 className="prompt" lang="en">{question.prompt}</h2>

        <div className="optionList">
          {options.map((option, index) => (
            <button
              key={option}
              lang="en"
              className={`option ${selected === option ? 'selected' : ''}`}
              onClick={() => setSelected(option)}
            >
              <span className="optionKey">{index + 1}</span>
              {option}
            </button>
          ))}
        </div>

        <div className="actions spread">
          <button className="button ghost" onClick={() => onAnswer(null)}>Não sei</button>
          <button className="button primary" disabled={selected === null} onClick={() => onAnswer(selected)}>
            Confirmar
          </button>
        </div>
      </div>
    </main>
  )
}
