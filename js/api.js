const API = "";

export async function postScore(payload) {
  const res = await fetch(`${API}/api/score`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Lỗi máy chủ");
  return res.json();
}

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
