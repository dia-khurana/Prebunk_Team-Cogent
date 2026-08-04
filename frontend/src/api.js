// Thin wrapper around the FastAPI backend. All endpoints live in ../backend.
const DEFAULT_API = "http://127.0.0.1:8000";

export const apiBase = () =>
  (localStorage.getItem("prebunk.api") || DEFAULT_API).replace(/\/$/, "");

export function setApiBase(url) {
  localStorage.setItem("prebunk.api", url || DEFAULT_API);
}

async function request(path, opts = {}) {
  const res = await fetch(apiBase() + path, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  if (!res.ok) {
    let detail = "Request failed";
    try {
      const j = await res.json();
      if (j.detail) detail = typeof j.detail === "string" ? j.detail : JSON.stringify(j.detail);
    } catch (_) {}
    throw new Error(`${detail} (HTTP ${res.status})`);
  }
  return res.json();
}

export const health = () => request("/health");
export const createSession = () => request("/session", { method: "POST" });
export const getPost = (sessionId) => request(`/post/${sessionId}`);
export const submitAnswer = (payload) =>
  request("/answer", { method: "POST", body: JSON.stringify(payload) });
export const getScore = (sessionId) => request(`/score/${sessionId}`);
