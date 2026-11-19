import { $ } from "./dom.js";
import { TEXT, TIMING } from "./config.js";
import { state } from "./state.js";
import { formatDuration } from "./quiz-logic.js";
import { fetchLeaderboard, openStream } from "./api.js";

let prevKeys = null;
let lastSig = null;
let liveOk = false;

export const isLive = () => liveOk;

function setViewers(viewers) {
  if (typeof viewers === "number") {
    $("liveText").textContent = TEXT.board.viewers(viewers);
  }
}

function createRow(row, i, isFirstRender) {
  const tr = document.createElement("tr");
  tr.style.setProperty("--i", i);
  if (isFirstRender) tr.classList.add("enter");
  if (i < 3) tr.classList.add(`top${i + 1}`);
  if (row.time === state.myTime) tr.classList.add("me");
  if (prevKeys && !prevKeys.has(row.time)) tr.classList.add("fresh");
  tr.innerHTML = `<td class="rank"><span class="badge">${i + 1}</span></td><td class="nm"></td><td class="pt">${row.score}</td><td class="tm">${formatDuration(row.duration)}</td>`;
  tr.querySelector(".nm").textContent = row.name;
  return tr;
}

export function renderBoard(rows, viewers) {
  const body = $("boardBody");
  const sig = JSON.stringify(rows) + state.myTime;
  if (sig === lastSig) { setViewers(viewers); return; }
  lastSig = sig;

  const isFirstRender = prevKeys === null;
  body.innerHTML = "";
  if (rows.length === 0) {
    body.innerHTML = `<tr><td colspan="4" class="empty">${TEXT.board.empty}</td></tr>`;
  }
  rows.forEach((row, i) => body.appendChild(createRow(row, i, isFirstRender)));

  prevKeys = new Set(rows.map(r => r.time));
  setViewers(viewers);
}

export async function loadLeaderboard() {
  try {
    renderBoard(await fetchLeaderboard());
  } catch (e) {
    $("status").textContent = TEXT.board.loadFailed;
  }
}

function setLive(on) {
  liveOk = on;
  $("live").className = on ? "live" : "live off";
  if (!on) $("liveText").textContent = TEXT.board.reconnecting;
}

function connectLive() {
  openStream(
    d => { setLive(true); renderBoard(d.rows, d.viewers); },
    () => setLive(false)
  );
}

export function initLeaderboard() {
  loadLeaderboard();
  connectLive();
  setInterval(() => { if (!liveOk) loadLeaderboard(); }, TIMING.leaderboardPoll);
}
