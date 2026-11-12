import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, getToken, setToken, UnauthorizedError } from '../lib/api.js'
import { estimateLevel } from '../lib/report.js'
import ResultReport from '../components/ResultReport.jsx'

const dateFormatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' })

export default function TeacherArea() {
  const [token, setTokenState] = useState(getToken)

  function handleLogin(newToken) {
    setToken(newToken)
    setTokenState(newToken)
  }

  const handleLogout = useCallback(() => {
    setToken(null)
    setTokenState(null)
  }, [])

  return token ? <Dashboard onLogout={handleLogout} /> : <LoginForm onLogin={handleLogin} />
}

function LoginForm({ onLogin }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { token } = await api.login(password)
      onLogin(token)
    } catch (err) {
      setError(err instanceof UnauthorizedError ? 'Senha incorreta.' : 'Não consegui conectar. Tenta de novo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="page narrow">
      <Link to="/" className="backLink">← Voltar</Link>
      <form className="card" onSubmit={handleSubmit}>
        <h1>Área do professor 🔒</h1>
        <label className="field">
          <span>Senha</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoFocus
            autoComplete="current-password"
          />
        </label>
        {error && <p className="errorText">{error}</p>}
        <div className="actions">
          <button className="button primary" disabled={!password || loading}>
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </div>
      </form>
    </main>
  )
}

function Dashboard({ onLogout }) {
  const [results, setResults] = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  const [error, setError] = useState('')

  const loadResults = useCallback(async () => {
    setError('')
    try {
      setResults(await api.listResults())
    } catch (err) {
      if (err instanceof UnauthorizedError) onLogout()
      else setError('Não consegui carregar os resultados.')
    }
  }, [onLogout])

  useEffect(() => {
    loadResults()
  }, [loadResults])

  async function handleDelete(id) {
    try {
      await api.deleteResult(id)
      setSelectedId(null)
      setResults((current) => current.filter((result) => result.id !== id))
    } catch (err) {
      if (err instanceof UnauthorizedError) onLogout()
      else setError('Não consegui excluir.')
    }
  }

  async function handleUpdate(id, changes) {
    const previous = results
    // Atualização otimista: a tela muda na hora e só volta atrás se o servidor recusar.
    setResults((current) =>
      current.map((result) => {
        if (result.id !== id) return result
        const optimistic = { ...result }
        if (changes.taughtTopics) optimistic.taughtTopics = changes.taughtTopics
        if (changes.clearFlags) optimistic.flags = []
        return optimistic
      })
    )
    try {
      const updated = await api.updateResult(id, changes)
      setResults((current) => current.map((result) => (result.id === id ? updated : result)))
    } catch (err) {
      setResults(previous)
      if (err instanceof UnauthorizedError) onLogout()
      else setError('Não consegui salvar a alteração.')
    }
  }

  const selectedResult = results?.find((result) => result.id === selectedId)

  return (
    <main className="page wide">
      <div className="topBar">
        <Link to="/" className="backLink">← Início</Link>
        <div className="actions">
          <button className="button ghost small" onClick={loadResults}>Atualizar</button>
          <button className="button ghost small" onClick={onLogout}>Sair</button>
        </div>
      </div>

      {error && <p className="errorText">{error}</p>}

      {selectedResult ? (
        <ResultReport
          result={selectedResult}
          onBack={() => setSelectedId(null)}
          onDelete={() => handleDelete(selectedResult.id)}
          onUpdate={(changes) => handleUpdate(selectedResult.id, changes)}
        />
      ) : (
        <section>
          <h1>Resultados</h1>
          {results === null && <div className="spinner" />}
          {results?.length === 0 && (
            <div className="card center muted">
              Nenhum resultado ainda. Manda o link <code>/teste</code> pra aluna. 🙂
            </div>
          )}
          <div className="resultList">
            {results?.map((result) => {
              const level = estimateLevel(result.topicStatus)
              return (
                <button key={result.id} className="resultRow" onClick={() => setSelectedId(result.id)}>
                  <div>
                    <strong>{result.name}</strong>
                    <span className="muted small">{dateFormatter.format(new Date(result.finishedAt))}</span>
                  </div>
                  <span className="rowBadges">
                    {result.flags?.length > 0 && <span className="flagPill">⚑ {result.flags.length}</span>}
                    <span className="levelPill">{level.label}</span>
                  </span>
                </button>
              )
            })}
          </div>
        </section>
      )}
    </main>
  )
}
