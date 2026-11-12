// Autenticação simples da área do professor.
// - A senha fica numa variável de ambiente (ADMIN_PASSWORD), nunca no front.
// - Depois do login, o servidor devolve um token assinado com HMAC que vale 12h.
//   Formato: "<expiraEm>.<assinatura>". Sem banco de sessões, sem lib externa.

import crypto from 'node:crypto'

const TOKEN_TTL_MS = 12 * 60 * 60 * 1000

function getSecret() {
  const secret = process.env.AUTH_SECRET || process.env.ADMIN_PASSWORD
  if (!secret) throw new Error('Defina ADMIN_PASSWORD (e de preferência AUTH_SECRET) nas variáveis de ambiente.')
  return secret
}

function sign(payload) {
  return crypto.createHmac('sha256', getSecret()).update(payload).digest('base64url')
}

function safeEqual(a, b) {
  const hashA = crypto.createHash('sha256').update(String(a)).digest()
  const hashB = crypto.createHash('sha256').update(String(b)).digest()
  return crypto.timingSafeEqual(hashA, hashB)
}

export function checkPassword(password) {
  const expected = process.env.ADMIN_PASSWORD
  if (!expected || typeof password !== 'string') return false
  return safeEqual(password, expected)
}

export function createToken() {
  const expiresAt = String(Date.now() + TOKEN_TTL_MS)
  return `${expiresAt}.${sign(expiresAt)}`
}

export function verifyToken(token) {
  if (typeof token !== 'string') return false
  const [expiresAt, signature] = token.split('.')
  if (!expiresAt || !signature) return false
  if (!safeEqual(signature, sign(expiresAt))) return false
  return Number(expiresAt) > Date.now()
}

// Retorna true se autorizado; senão já responde 401 e retorna false.
export function requireAuth(req, res) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (verifyToken(token)) return true
  res.status(401).json({ error: 'Não autorizado' })
  return false
}
