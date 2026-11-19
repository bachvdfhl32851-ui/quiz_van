import { TEXT } from "./config.js";

// Chỉ còn các hàm hiển thị. Chấm điểm và đáp án đúng nằm hoàn toàn trên server.
export const isCorrect = (question, index) => (index ?? null) === question.answer;

export const isLastQuestion = (current, total) => current === total - 1;

export const isTrap = question => question.level === "Bẫy";

export function resultMessage(score, total) {
  if (score === total) return TEXT.result.perfect;
  if (score >= total / 2) return TEXT.result.good;
  return TEXT.result.retry;
}
