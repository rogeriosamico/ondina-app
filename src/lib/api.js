const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:3000";

const TIMEOUT_MS = 15000;
const RETRY_DELAY_MS = 800;

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// Uma tentativa com timeout. Respeita o signal de quem chamou.
async function attempt(url, signal) {
  const controller = new AbortController();
  const onAbort = () => controller.abort();
  signal?.addEventListener("abort", onAbort);
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", onAbort);
  }
}

// fetch com timeout e 1 retry em erro de rede, timeout ou 5xx.
// Se quem chamou abortou, o AbortError sobe sem retry.
async function request(url, { signal, retries = 1 } = {}) {
  for (let i = 0; ; i++) {
    let res;
    try {
      res = await attempt(url, signal);
    } catch (err) {
      if (signal?.aborted) throw err;
      if (i >= retries) throw new Error("Erro de rede");
      await wait(RETRY_DELAY_MS);
      continue;
    }
    if (res.ok) return res.json();
    if (res.status < 500 || i >= retries) throw new Error("Erro na API");
    await wait(RETRY_DELAY_MS);
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
  }
}

export function fetchForecastAll(date, signal) {
  return request(`${API_BASE}/forecast-all?date=${date}`, { signal });
}

export function fetchForecast(beach, date, signal) {
  return request(`${API_BASE}/forecast?beach=${encodeURIComponent(beach)}&date=${date}`, { signal });
}

export function fetchTide(date, beach, signal) {
  return request(`${API_BASE}/tide?date=${date}&beach=${encodeURIComponent(beach)}`, { signal });
}
