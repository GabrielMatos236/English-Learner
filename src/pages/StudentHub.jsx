import { Link } from 'react-router-dom'
import { getStudentId } from '../lib/api.js'

export default function StudentHub() {
  const hasStudentId = Boolean(getStudentId())

  return (
    <main className="page home">
      <Link to="/" className="backLink">← Voltar</Link>
      <header className="hero compact">
        <h1>O que vamos fazer hoje?</h1>
      </header>

      <div className="entryGrid">
        <Link to="/teste" className="entryCard">
          <span className="entryIcon">🧪</span>
          <strong>Test your Knowledge</strong>
          <span className="muted">Pra eu saber se tu é burra ou inteligente!! (15–25 minutos)</span>
        </Link>
        <Link to="/pratica" className="entryCard">
          <span className="entryIcon">🏋️</span>
          <strong>Practice</strong>
          <span className="muted">
            {hasStudentId
              ? 'Exercícios novos com o que você já aprendeu'
              : 'Libera depois do teste (ou com o link do professor)'}
          </span>
        </Link>
      </div>
    </main>
  )
}
