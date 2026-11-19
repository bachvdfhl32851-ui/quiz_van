import { $ } from "./dom.js";
import { TEXT } from "./config.js";
import { formatDuration } from "./quiz-logic.js";

// Đồng hồ chỉ để hiển thị. Thời gian thật do server đo (từ lúc bắt đầu đến lúc nộp câu cuối).
let base = 0;
let since = 0;
let running = false;
let id = null;

const show = seconds => { $("timerBox").textContent = TEXT.question.timer(formatDuration(seconds)); };

function tick() {
  if (running) show(base + (performance.now() - since) / 1000);
}

export function start(elapsed = 0) {
  base = elapsed;
  since = performance.now();
  running = true;
  clearInterval(id);
  id = setInterval(tick, 100);
  tick();
}

// Chỉnh lại theo giờ của server để đồng hồ không bị lệch.
export function sync(elapsed) {
  if (!running || typeof elapsed !== "number") return;
  base = elapsed;
  since = performance.now();
}

export function stop(finalSeconds) {
  running = false;
  clearInterval(id);
  if (typeof finalSeconds === "number") show(finalSeconds);
}
