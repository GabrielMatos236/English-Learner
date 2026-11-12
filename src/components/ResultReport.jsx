import { useState } from 'react'
import { buildReport, statusLabels } from '../lib/report.js'
import { topicById } from '../data/curriculum.js'

const dateFormatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long', timeStyle: 'short' })

function formatDuration(startedAt, finishedAt) {
  if (!startedAt) return null
  const minutes = Math.round((new Date(finishedAt) - new Date(startedAt)) / 60000)
  if (!Number.isFinite(minutes) || minutes < 0) return null
  return minutes < 1 ? 'menos de 1 min' : `${minutes} min`
}

export default function ResultReport({ result, onBack, onDelete, onUpdate }) {
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [copied, setCopied] = useState(false)
  const taughtTopics = result.taughtTopics ?? []
  const flags = result.flags ?? []
  const practiceLink = `${window.location.origin}/pratica/${result.id}`

  // Marca/desmarca "dei aula". A ordem importa: as últimas marcadas são as que o Practice prioriza.
  function toggleTaught(topicId) {
    const next = taughtTopics.includes(topicId)
      ? taughtTopics.filter((id) => id !== topicId)
      : [...taughtTopics, topicId]
    onUpdate({ taughtTopics: next })
  }

  async function copyPracticeLink() {
    try {
      await navigator.clipboard.writeText(practiceLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Copia o link:', practiceLink)
    }
  }

  const pathItemProps = { taughtTopics, onToggle: toggleTaught }
  const report = buildReport(result)
  const duration = formatDuration(result.startedAt, result.finishedAt)
  const reviews = report.path.filter((item) => item.type === 'review')
  const lessons = report.path.filter((item) => item.type === 'lesson' && item.status !== 'untested')
  const untested = report.path.filter((item) => item.status === 'untested')

  return (
    <section className="report">
      <button className="backLink asButton" onClick={onBack}>← Todos os resultados</button>

      <div className="reportHeader card">
        <div>
          <h1>{result.name}</h1>
          <p className="muted small">
            {dateFormatter.format(new Date(result.finishedAt))}
            {duration && ` · ${duration}`}
            {` · ${report.totalCorrect}/${report.totalQuestions} acertos`}
            {report.dontKnowCount > 0 && ` · ${report.dontKnowCount}× “não sei”`}
          </p>
        </div>
        <div className="levelBox">
          <span className="levelBig">{report.level.label}</span>
          <span className="muted small">{report.level.description}</span>
        </div>
      </div>

      <div className="card practiceLinkCard">
        <div>
          <h2>🏋️ Link do Practice</h2>
          <p className="muted small">
            Se ela fizer o teste e o Practice no mesmo aparelho, já funciona sozinho. Em outro celular ou computador, manda este link.
          </p>
        </div>
        <div className="linkRow">
          <code>{practiceLink}</code>
          <button className="button secondary small" onClick={copyPracticeLink}>{copied ? 'Copiado ✓' : 'Copiar'}</button>
        </div>
      </div>

      {result.stoppedAtLevel && (
        <p className="note">
          O teste parou no <strong>{result.stoppedAtLevel}</strong> porque metade ou mais desse nível ficou fraco.
          O que vem depois aparece como “não testado”.
        </p>
      )}

      <div className="reportGrid">
        <div className="card">
          <h2>🧭 Trilha sugerida</h2>
          <p className="muted small">Marca o que você já deu em aula: isso entra no Practice dela, com prioridade pras últimas marcadas.</p>
          {report.path.length === 0 && <p className="muted">Ela dominou tudo que o teste cobre. 🎉</p>}

          {reviews.length > 0 && (
            <>
              <h3 className="pathSection">Revisões rápidas</h3>
              <p className="muted small">Ela já viu esses tópicos, mas ainda oscila. Dá pra revisar em poucos minutos dentro de outras aulas.</p>
              <ol className="pathList">
                {reviews.map((item) => <PathItem key={item.topicId} item={item} {...pathItemProps} />)}
              </ol>
            </>
          )}

          {lessons.length > 0 && (
            <>
              <h3 className="pathSection">Aulas, nesta ordem</h3>
              <ol className="pathList">
                {lessons.map((item) => <PathItem key={item.topicId} item={item} {...pathItemProps} />)}
              </ol>
            </>
          )}

          {untested.length > 0 && (
            <details className="mistakeGroup untestedGroup">
              <summary>Depois disso: {untested.length} tópicos ainda não testados</summary>
              <p className="muted small">O teste parou antes deles. Seguem a mesma ordem, mas vale sondar rapidinho em aula antes de ensinar do zero.</p>
              <ol className="pathList" start={lessons.length + 1}>
                {untested.map((item) => <PathItem key={item.topicId} item={item} {...pathItemProps} />)}
              </ol>
            </details>
          )}
        </div>

        <div className="card">
          <h2>🗺️ Mapa por tópico</h2>
          <div className="legend small muted">
            {Object.values(statusLabels).map((label) => (
              <span key={label.text}>{label.icon} {label.text}</span>
            ))}
          </div>
          {report.levelMap.map((level) => (
            <div key={level.id} className="mapLevel">
              <h3>{level.name}</h3>
              <ul className="mapList">
                {level.topics.map((topic) => (
                  <li key={topic.id} className={`status-${topic.status}`}>
                    <span>{statusLabels[topic.status].icon}</span>
                    {topic.name}
                    {taughtTopics.includes(topic.id) && <span className="tag" title="Você já deu essa aula">📘 aula dada</span>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {flags.length > 0 && (
        <div className="card">
          <div className="cardTitleRow">
            <h2>⚑ Exercícios que ela achou errados ({flags.length})</h2>
            <button className="button ghost small" onClick={() => onUpdate({ clearFlags: true })}>Limpar avisos</button>
          </div>
          <ul className="mistakeList">
            {flags.map((flag, index) => (
              <li key={index}>
                {flag.context && <blockquote className="passage small" lang="en">{flag.context}</blockquote>}
                <p lang="en">{flag.question}</p>
                <p className="small muted">
                  {topicById[flag.topicId]?.name ?? flag.topicId} · Opções: {flag.options.join(' / ')} · Gabarito da IA:{' '}
                  <span className="right">{flag.correctOption}</span>
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {report.mistakes.length > 0 && (
        <div className="card">
          <h2>🔍 O que ela errou</h2>
          {report.mistakes.map((group) => (
            <details key={group.topicId} className="mistakeGroup">
              <summary>
                <span className="levelTag">{group.levelId}</span> {group.topicName}{' '}
                <span className="muted small">({group.items.length})</span>
              </summary>
              {group.items[0]?.passage && (
                <blockquote className="passage small" lang="en">{group.items[0].passage}</blockquote>
              )}
              <ul className="mistakeList">
                {group.items.map((item, index) => (
                  <li key={index}>
                    <p lang="en">{item.prompt}</p>
                    <p className="small">
                      Respondeu: <span className="wrong">{item.chosen ?? 'Não sei'}</span> · Certo:{' '}
                      <span className="right">{item.correctOption}</span>
                    </p>
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </div>
      )}

      <div className="actions">
        {confirmingDelete ? (
          <>
            <span className="muted small">Excluir esse resultado de vez?</span>
            <button className="button ghost small" onClick={() => setConfirmingDelete(false)}>Cancelar</button>
            <button className="button danger small" onClick={onDelete}>Excluir</button>
          </>
        ) : (
          <button className="button ghost small" onClick={() => setConfirmingDelete(true)}>Excluir resultado</button>
        )}
      </div>
    </section>
  )
}

function PathItem({ item, taughtTopics, onToggle }) {
  const taught = taughtTopics.includes(item.topicId)
  return (
    <li className={`${item.status === 'untested' ? 'untested' : ''} ${taught ? 'taught' : ''}`}>
      <label className="pathItemLabel">
        <input type="checkbox" checked={taught} onChange={() => onToggle(item.topicId)} />
        <span>
          <span className="levelTag">{item.levelId}</span>
          {item.name}
          {item.status === 'shaky' && item.type === 'lesson' && <span className="tag">instável</span>}
        </span>
      </label>
    </li>
  )
}
