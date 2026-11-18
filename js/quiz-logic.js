import { TEXT } from "./config.js";

export const isCorrect = (question, index) => index === question.answer;

export const isLastQuestion = (current, total) => current === total - 1;

export const isTrap = question => question.level === "Bẫy";

export function resultMessage(score, total) {
  if (score === total) return TEXT.result.perfect;
  if (score >= total / 2) return TEXT.result.good;
  return TEXT.result.retry;
}
