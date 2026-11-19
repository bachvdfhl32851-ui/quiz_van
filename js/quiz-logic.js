import { TEXT } from "./config.js";

// Chỉ còn các hàm hiển thị. Chấm điểm và đáp án đúng nằm hoàn toàn trên server.
export const isCorrect = (question, index) => (index ?? null) === question.answer;

// 83.4 giây -> "1:23.4"
export function formatDuration(seconds) {
  if (seconds === null || seconds === undefined || Number.isNaN(Number(seconds))) return "—";
  const tenths = Math.round(Number(seconds) * 10);
  const m = Math.floor(tenths / 600);
  const s = (tenths % 600) / 10;
  return `${m}:${s.toFixed(1).padStart(4, "0")}`;
}

export const isLastQuestion = (current, total) => current === total - 1;

export const isTrap = question => question.level === "Bẫy";

export function resultMessage(score, total) {
  if (score === total) return TEXT.result.perfect;
  if (score >= total / 2) return TEXT.result.good;
  return TEXT.result.retry;
}
