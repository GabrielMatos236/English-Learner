import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api, getStudentId, setStudentId } from '../lib/api.js'

function shuffle(items) {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export default function Practice() {
  const { studentId: linkStudentId } = useParams()
  const navigate = useNavigate()
  const [studentId] = useState(() => linkStudentId ?? getStudentId())
  const [info, setInfo] = useState(null)
  const [stage, setStage] = useState('loading') // loading | noStudent | ready | generating | exercises | summary
  const [error, setError] = useState('')
  const [session, setSession] = useState(null) // { exercises, mock }
  const [answers, setAnswers] = useState([]) // true/false por exercício

  // Link do professor (/pratica/<id>): guarda o id e limpa a URL.
  useEffect(() => {
    if (linkStudentId) {
      setStudentId(linkStudentId)
      navigate('/pratica', { replace: true })
    }
  }, [linkStudentId, navigate])

  useEffect(() => {
    if (!studentId) {
      setStage('noStudent')
      return
    }
    api
      .getPracticeInfo(studentId)
      .then((data) => {
        setInfo(data)
        setStage('ready')
      })
      .catch(() => {
        setStudentId(null)
        setStage('noStudent')
      })
  }, [studentId])

  async function generate() {
    setStage('generating')
    setError('')
    try {
      const data = await api.generatePractice(studentId)
      setSession({
        mock: data.mock,
        exercises: data.exercises.map((exercise) => ({ ...exercise, shuffledOptions: shuffle(exercise.options) })),
      })
      setInfo((current) => ({ ...current, topics: data.topics }))
      setAnswers([])
      setStage('exercises')
    } catch (err) {
      setError(err.message)
      setStage(session ? 'summary' : 'ready')
    }
  }

  if (stage === 'loading') {
    return (
      <main className="page narrow">
        <div className="spinner" />
      </main>
    )
  }

  if (stage === 'noStudent') {
    return (
      <main className="page narrow">
        <Link to="/aluno" className="backLink">← Voltar</Link>
        <div className="card center">
          <div className="bigEmoji">🔐</div>
          <h2>Practice ainda trancado</h2>
          <p className="muted">
            Faça o teste primeiro neste aparelho, ou abra o link de prática que o seu professor te mandou.
          </p>
          <Link to="/teste" className="button primary">Fazer o teste</Link>
        </div>
      </main>
    )
  }

  if (stage === 'exercises') {
    const index = answers.length
    const exercise = session.exercises[index]
    return (
      <main className="page narrow">
        <div className="quizHeader">
          <span className="badge">Practice</span>
          <span className="muted small">{index + 1} de {session.exercises.length}</span>
        </div>
        <div className="progressBar"><div style={{ width: `${(index / session.exercises.length) * 100}%` }} /></div>
        {session.mock && <p className="note small">Modo exemplo: sem chave do Gemini, os exercícios vêm do próprio teste.</p>}
        <ExerciseCard
          key={index}
          exercise={exercise}
          studentId={studentId}
          isLast={index === session.exercises.length - 1}
          onNext={(isCorrect) => {
            const nextAnswers = [...answers, isCorrect]
            setAnswers(nextAnswers)
            if (nextAnswers.length >= session.exercises.length) setStage('summary')
          }}
        />
      </main>
    )
  }

  const firstName = info?.name?.split(' ')[0]
  const correctCount = answers.filter(Boolean).length

  return (
    <main className="page narrow">
      <Link to="/aluno" className="backLink">← Voltar</Link>
      <div className="card">
        {stage === 'summary' ? (
          <div className="center">
            <div className="bigEmoji">{correctCount === answers.length ? '🏆' : correctCount >= answers.length / 2 ? '💪' : '📚'}</div>
            <h2>{correctCount} de {answers.length} certas!</h2>
            <p className="muted">Quer mais uma rodada? Cada vez vêm exercícios diferentes.</p>
          </div>
        ) : (
          <>
            <h1>Hi, {firstName}! 👋</h1>
            <p className="muted">
              Seu nível: <strong>{info.level}</strong>. A IA vai criar 5 exercícios
              {info.isPreview ? ' pra você já ir conhecendo o primeiro assunto das aulas:' : ' sobre o que você já aprendeu:'}
            </p>
          </>
        )}

        <ul className="topicChips">
          {info.topics.map((topic) => (
            <li key={topic.id}><span className="levelTag">{topic.levelId}</span>{topic.name}</li>
          ))}
        </ul>

        {error && <p className="errorText">{error}</p>}

        <div className="actions">
          <button className="button primary" disabled={stage === 'generating'} onClick={generate}>
            {stage === 'generating' ? 'Criando exercícios…' : stage === 'summary' ? 'Gerar mais' : 'Gerar exercícios ✨'}
          </button>
        </div>
      </div>
    </main>
  )
}

function ExerciseCard({ exercise, studentId, isLast, onNext }) {
  const [selected, setSelected] = useState(null)
  const [checked, setChecked] = useState(false)
  const [flagState, setFlagState] = useState('idle') // idle | sending | sent
  const isCorrect = selected === exercise.correctOption

  async function flag() {
    setFlagState('sending')
    try {
      const { shuffledOptions, ...payload } = exercise
      await api.flagExercise(studentId, payload)
      setFlagState('sent')
    } catch {
      setFlagState('idle')
    }
  }

  function optionClass(option) {
    if (!checked) return selected === option ? 'selected' : ''
    if (option === exercise.correctOption) return 'correct'
    if (option === selected) return 'incorrect'
    return 'dimmed'
  }

  return (
    <div className="card">
      {exercise.context && <blockquote className="passage" lang="en">{exercise.context}</blockquote>}
      <h2 className="prompt" lang="en">{exercise.question}</h2>

      <div className="optionList">
        {exercise.shuffledOptions.map((option, index) => (
          <button
            key={option}
            lang="en"
            disabled={checked}
            className={`option ${optionClass(option)}`}
            onClick={() => setSelected(option)}
          >
            <span className="optionKey">{index + 1}</span>
            {option}
          </button>
        ))}
      </div>

      {checked && (
        <div className={`feedback ${isCorrect ? 'good' : 'bad'}`}>
          <strong>{isCorrect ? 'Isso aí! 🎉' : `Quase! A certa é “${exercise.correctOption}”.`}</strong>
          {exercise.explanation && <p>{exercise.explanation}</p>}
        </div>
      )}

      <div className="actions spread">
        <button className="button ghost small" disabled={flagState !== 'idle'} onClick={flag}>
          {flagState === 'sent' ? 'Aviso enviado ✓' : '⚑ Acho que essa tá errada'}
        </button>
        {checked ? (
          <button className="button primary" onClick={() => onNext(isCorrect)}>
            {isLast ? 'Ver resultado' : 'Próxima →'}
          </button>
        ) : (
          <button className="button primary" disabled={selected === null} onClick={() => setChecked(true)}>
            Verificar
          </button>
        )}
      </div>
    </div>
  )
}
