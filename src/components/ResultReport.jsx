import { useState } from 'react'
import { buildReport, statusLabels } from '../lib/report.js'

const dateFormatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long', timeStyle: 'short' })

function formatDuration(startedAt, finishedAt) {
  if (!startedAt) return null
  const minutes = Math.round((new Date(finishedAt) - new Date(startedAt)) / 60000)
  if (!Number.isFinite(minutes) || minutes < 0) return null
  return minutes < 1 ? 'menos de 1 min' : `${minutes} min`
}

export default function ResultReport({ result, onBack, onDelete }) {
  const [confirmingDelete, setConfirmingDelete] = useState(false)
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

      {result.stoppedAtLevel && (
        <p className="note">
          O teste parou no <strong>{result.stoppedAtLevel}</strong> porque metade ou mais desse nível ficou fraco.
          O que vem depois aparece como “não testado”.
        </p>
      )}

      <div className="reportGrid">
        <div className="card">
          <h2>🧭 Trilha sugerida</h2>
          {report.path.length === 0 && <p className="muted">Ela dominou tudo que o teste cobre. 🎉</p>}

          {reviews.length > 0 && (
            <>
              <h3 className="pathSection">Revisões rápidas</h3>
              <p className="muted small">Ela já viu esses tópicos, mas ainda oscila. Dá pra revisar em poucos minutos dentro de outras aulas.</p>
              <ol className="pathList">
                {reviews.map((item) => <PathItem key={item.topicId} item={item} />)}
              </ol>
            </>
          )}

          {lessons.length > 0 && (
            <>
              <h3 className="pathSection">Aulas, nesta ordem</h3>
              <ol className="pathList">
                {lessons.map((item) => <PathItem key={item.topicId} item={item} />)}
              </ol>
            </>
          )}

          {untested.length > 0 && (
            <details className="mistakeGroup untestedGroup">
              <summary>Depois disso: {untested.length} tópicos ainda não testados</summary>
              <p className="muted small">O teste parou antes deles. Seguem a mesma ordem, mas vale sondar rapidinho em aula antes de ensinar do zero.</p>
              <ol className="pathList" start={lessons.length + 1}>
                {untested.map((item) => <PathItem key={item.topicId} item={item} />)}
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
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

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

function PathItem({ item }) {
  return (
    <li className={item.status === 'untested' ? 'untested' : ''}>
      <span className="levelTag">{item.levelId}</span>
      {item.name}
      {item.status === 'shaky' && item.type === 'lesson' && <span className="tag">instável</span>}
    </li>
  )
}
