const TOKEN_KEY = 'chronos_token'
export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (t) => (t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY))

export class ApiError extends Error {
  constructor(message, status) { super(message); this.status = status }
}

async function request(method, url, body) {
  const headers = { 'Content-Type': 'application/json' }
  const t = getToken()
  if (t) headers.Authorization = 'Bearer ' + t
  let res
  try {
    res = await fetch('/api' + url, { method, headers, body: body ? JSON.stringify(body) : undefined })
  } catch {
    throw new ApiError('No se pudo conectar con el servidor', 0)
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new ApiError(data.error || 'Error inesperado', res.status)
  return data
}

export const api = {
  get: (u) => request('GET', u),
  post: (u, b) => request('POST', u, b || {}),
  put: (u, b) => request('PUT', u, b || {})
}
