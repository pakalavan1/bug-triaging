const apiPath = (path) => {
  const base = import.meta.env.VITE_API_URL || 'https://bug-triaging-1.onrender.com'
  return `${base.replace(/\/$/, '')}${path}`
}

export async function predictBug(payload) {
  const res = await fetch(apiPath('/predict'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    let msg = res.statusText
    if (data?.detail) {
      msg = Array.isArray(data.detail)
        ? data.detail.map((e) => e.msg || e).join('; ')
        : String(data.detail)
    }
    throw new Error(msg)
  }
  return data
}

export async function fetchBugs() {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 10000)
  try {
    const res = await fetch(apiPath('/bugs'), { signal: controller.signal })
    clearTimeout(timer)
    const data = await res.json().catch(() => null)
    if (!res.ok) {
      throw new Error(data?.detail || res.statusText)
    }
    return data
  } catch (e) {
    clearTimeout(timer)
    if (e.name === 'AbortError') throw new Error('Request timed out. Is the backend running?')
    throw e
  }
}
