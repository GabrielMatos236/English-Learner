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
}
