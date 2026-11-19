const API = "";

async function post(path, payload) {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = new Error("Lỗi máy chủ");
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export const startGame = name => post("/api/start", { name });

export const sendAnswer = ({ session, index, allIn }) =>
  post("/api/answer", { session, index, all_in: allIn });

export const fetchSessionState = session => post("/api/state", { session });

export async function fetchLeaderboard() {
  const res = await fetch(`${API}/api/leaderboard`);
  return res.json();
}

export function openStream(onData, onError) {
  if (!window.EventSource) return false;
  const es = new EventSource(`${API}/api/stream`);
  es.onmessage = e => onData(JSON.parse(e.data));
  es.onerror = onError;
  return true;
}
