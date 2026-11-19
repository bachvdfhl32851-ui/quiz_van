export const $ = id => document.getElementById(id);

export const startEl = $("start");
export const quizEl = $("quiz");
export const resultEl = $("result");
export const reviewEl = $("review");

export const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
