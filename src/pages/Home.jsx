import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <main className="page home">
      <header className="hero">
        <span className="badge">Copiei do Duolingo</span>
        <h1>English Learner</h1>
        <p className="muted">Descubra seu nível e pratique com exercícios novos sempre que quiser.</p>
      </header>

      <div className="entryGrid">
        <Link to="/aluno" className="entryCard">
          <span className="entryIcon"></span>
          <strong>Sou aluno(a)</strong>
          <span className="muted">Fazer o teste ou praticar</span>
        </Link>
        <Link to="/professor" className="entryCard">
          <span className="entryIcon"></span>
          <strong>Área do professor</strong>
          <span className="muted">Acesso Proibido em Bragança</span>
        </Link>
      </div>
    </main>
  )
}
