// GET /api/health → diagnóstico rápido da configuração (sem expor nenhum segredo).
// Abra no navegador quando algo não funcionar: mostra o que está faltando.

import { isRedisConfigured } from './_lib/store.js'
import { getActiveProviders } from './_lib/gemini.js'

export default function handler(req, res) {
  const checks = {
    database: isRedisConfigured ? 'ok' : 'FALTANDO: conecte o Upstash Redis ao projeto (Storage) e faça redeploy',
    adminPassword: process.env.ADMIN_PASSWORD ? 'ok' : 'FALTANDO: defina ADMIN_PASSWORD',
    authSecret: process.env.AUTH_SECRET ? 'ok' : 'opcional: defina AUTH_SECRET',
    gemini: process.env.GEMINI_API_KEY ? 'ok' : 'sem chave (GEMINI_API_KEY)',
    geminiModel: process.env.GEMINI_MODEL || 'gemini-3.8-flash (padrão)',
    claude: process.env.ANTHROPIC_API_KEY ? 'ok' : 'sem chave (ANTHROPIC_API_KEY)',
    claudeModel: process.env.CLAUDE_MODEL || 'claude-haiku-5-5 (padrão)',
    aiOrder: getActiveProviders().join(' → ') || 'nenhuma IA configurada: Practice usa exercícios de exemplo',
    deploy: process.env.VERCEL_GIT_COMMIT_MESSAGE || 'local',
  }
  res.setHeader('Cache-Control', 'no-store')
  return res.status(200).json(checks)
}
