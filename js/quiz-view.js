import { $, startEl, quizEl, resultEl } from "./dom.js";
import { LETTERS, TEXT } from "./config.js";
import { reveal, animateRing } from "./animations.js";
import { isTrap } from "./quiz-logic.js";

export function showStartScreen() {
  resultEl.classList.add("hidden");
  reveal(startEl);
}

export function showQuizScreen() {
  startEl.classList.add("hidden");
  resultEl.classList.add("hidden");
  reveal(quizEl);
}

export function showResultScreen(score, total, message) {
  quizEl.classList.add("hidden");
  reveal(resultEl);
  animateRing(score, total);
  $("score").textContent = TEXT.result.score(score, total);
  $("message").textContent = message;
}

function createOption(text, index, onSelect) {
  const btn = document.createElement("button");
  btn.className = "option";
  btn.style.setProperty("--i", index);

  const tag = document.createElement("span");
  tag.className = "tag";
  tag.textContent = LETTERS[index];

  const label = document.createElement("span");
  label.textContent = text;

  btn.append(tag, label);
  btn.addEventListener("click", () => onSelect(index));
  return btn;
}

export function renderQuestion({ question, number, total, isLast, onSelect }) {
  const trap = isTrap(question);
  $("progress").textContent = TEXT.question.progress(number, total);
  $("barFill").style.width = `${((number - 1) / total) * 100}%`;
  $("level").textContent = trap ? TEXT.question.levelTrap : TEXT.question.levelHard;
  $("level").className = trap ? "level trap" : "level";
  $("question").textContent = question.question;
  $("feedback").textContent = "";
  $("feedback").className = "";
  $("nextBtn").disabled = true;
  $("nextBtn").textContent = isLast ? TEXT.question.finish : TEXT.question.next;

  const optionsEl = $("options");
  optionsEl.innerHTML = "";
  question.options.forEach((text, index) => optionsEl.appendChild(createOption(text, index, onSelect)));

  const stage = $("stage");
  stage.classList.remove("leaving", "enter");
  void stage.offsetWidth;
  stage.classList.add("enter");
}

export function showAnswer({ chosen, correct, number, total }) {
  const buttons = $("options").querySelectorAll(".option");
  buttons.forEach(btn => btn.disabled = true);
  buttons[correct].classList.add("correct");
  $("barFill").style.width = `${(number / total) * 100}%`;

  if (chosen === correct) {
    $("feedback").textContent = TEXT.question.correct;
    $("feedback").className = "ok";
  } else {
    buttons[chosen].classList.add("wrong");
    $("feedback").textContent = TEXT.question.wrong;
    $("feedback").className = "bad";
  }
  $("nextBtn").disabled = false;
}

export function hideCurrentQuestion() {
  $("stage").classList.add("leaving");
}

export function setStatus(text) {
  $("status").textContent = text;
}

export function resetStartScreen() {
  $("playerName").value = "";
  setStatus("");
}
