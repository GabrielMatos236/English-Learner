import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <main className="page home">
      <header className="hero">
        <span className="badge">English placement</span>
        <h1>Teste de nivelamento de inglês</h1>
        <p className="muted">
          Um teste rápido e adaptativo: ele sobe de nível enquanto você acerta e para quando encontra o seu
          ponto de partida.
        </p>
      </header>

      <div className="entryGrid">
        <Link to="/teste" className="entryCard">
          <span className="entryIcon">✏️</span>
          <strong>Sou aluno(a)</strong>
          <span className="muted">Fazer o teste (uns 15–25 minutos)</span>
        </Link>
        <Link to="/professor" className="entryCard">
          <span className="entryIcon">🔒</span>
          <strong>Área do professor</strong>
          <span className="muted">Ver resultados e trilhas</span>
        </Link>
      </div>
    </main>
  )
}
