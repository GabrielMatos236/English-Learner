const TOKEN_KEY = 'teacherToken'

export function getToken() {
  try {
    return sessionStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token) {
  try {
    if (token) sessionStorage.setItem(TOKEN_KEY, token)
    else sessionStorage.removeItem(TOKEN_KEY)
  } catch {
    // sem storage disponível: o login só dura até recarregar a página
  }
}

export class UnauthorizedError extends Error {}

async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (auth) headers.Authorization = `Bearer ${getToken() ?? ''}`

  const response = await fetch(path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (response.status === 401) throw new UnauthorizedError()
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || `Erro ${response.status}`)
  return data
}

export const api = {
  login: (password) => request('/api/login', { method: 'POST', body: { password } }),
  submitResult: (payload) => request('/api/results', { method: 'POST', body: payload }),
  listResults: () => request('/api/results', { auth: true }),
  deleteResult: (id) => request(`/api/results?id=${encodeURIComponent(id)}`, { method: 'DELETE', auth: true }),
  updateResult: (id, changes) =>
    request(`/api/results?id=${encodeURIComponent(id)}`, { method: 'PATCH', body: changes, auth: true }),
  getPracticeInfo: (studentId) => request(`/api/practice?studentId=${encodeURIComponent(studentId)}`),
  generatePractice: (studentId) => request('/api/practice', { method: 'POST', body: { studentId } }),
  flagExercise: (studentId, exercise) => request('/api/flags', { method: 'POST', body: { studentId, exercise } }),
}

// Identidade da aluna neste navegador (o id do resultado do teste dela).
const STUDENT_ID_KEY = 'studentId'

export function getStudentId() {
  try {
    return localStorage.getItem(STUDENT_ID_KEY)
  } catch {
    return null
  }
}

export function setStudentId(id) {
  try {
    if (id) localStorage.setItem(STUDENT_ID_KEY, id)
    else localStorage.removeItem(STUDENT_ID_KEY)
  } catch {
    // sem storage: ela vai precisar abrir o link de prática de novo
  }
}
