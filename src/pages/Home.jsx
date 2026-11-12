import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <main className="page home">
      <header className="hero">
        <span className="badge">Copiei do Duolingo</span>
        <h1>Teste de nivelamento de inglês</h1>
        <p className="muted">
          Pra eu saber se tu é burra ou inteligente!!
        </p>
      </header>

      <div className="entryGrid">
        <Link to="/teste" className="entryCard">
          <span className="entryIcon">✏️</span>
          <strong>Sou aluno(a)</strong>
          <span className="muted">Fazer o teste (15–25 minutos)</span>
        </Link>
        <Link to="/professor" className="entryCard">
          <span className="entryIcon">🔒</span>
          <strong>Área do professor</strong>
          <span className="muted">Acesso Proibido em Bragança</span>
        </Link>
      </div>
    </main>
  )
}
