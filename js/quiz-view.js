import { $, startEl, quizEl, resultEl, reviewEl } from "./dom.js";
import { LETTERS, TEXT } from "./config.js";
import { reveal, animateRing } from "./animations.js";
import { isTrap, isCorrect, formatDuration } from "./quiz-logic.js";

export function showStartScreen() {
  resultEl.classList.add("hidden");
  reviewEl.classList.add("hidden");
  reveal(startEl);
}

export function showQuizScreen() {
  startEl.classList.add("hidden");
  resultEl.classList.add("hidden");
  reviewEl.classList.add("hidden");
  reveal(quizEl);
}

export function showResultScreen({ points, max, message, correct, total, best, duration }) {
  quizEl.classList.add("hidden");
  reviewEl.classList.add("hidden");
  reveal(resultEl);
  animateRing(points, max);
  $("score").textContent = TEXT.result.score(points, max);
  $("detail").textContent = TEXT.result.detail(correct, total, best);
  $("timeInfo").textContent = TEXT.result.time(formatDuration(duration));
  $("message").textContent = message;
}

function createOption(text, index, onSelect) {
  const btn = document.createElement("button");
  btn.className = "option";
  btn.setAttribute("aria-pressed", "false");
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
  $("progress").textContent = TEXT.question.progress(number, total);
  $("barFill").style.width = `${((number - 1) / total) * 100}%`;
  $("question").textContent = question.question;
  $("feedback").textContent = "";
  $("feedback").className = "";
  $("submitBtn").classList.remove("hidden");
  $("allInBtn").classList.toggle("hidden", $("allInBtn").dataset.available === "false");
  $("nextBtn").classList.add("hidden");
  $("nextBtn").textContent = isLast ? TEXT.question.finish : TEXT.question.next;

  const optionsEl = $("options");
  optionsEl.innerHTML = "";
  question.options.forEach((text, index) => optionsEl.appendChild(createOption(text, index, onSelect)));

  const stage = $("stage");
  stage.classList.remove("leaving", "enter");
  void stage.offsetWidth;
  stage.classList.add("enter");
}

export function markSelected(index) {
  $("options").querySelectorAll(".option").forEach((btn, i) => {
    const on = i === index;
    btn.classList.toggle("selected", on);
    btn.setAttribute("aria-pressed", String(on));
  });
}

export function setAllInAvailable(available) {
  const btn = $("allInBtn");
  btn.dataset.available = String(available);
  btn.classList.toggle("hidden", !available);
}

export function setAllInArmed(on) {
  const btn = $("allInBtn");
  btn.classList.toggle("armed", on);
  btn.setAttribute("aria-pressed", String(on));
  btn.textContent = on ? TEXT.question.allInOn : TEXT.question.allIn;
}

export function setScoreBox(points, streak) {
  $("scoreBox").textContent = TEXT.question.scoreBox(points, streak);
}

export function showAnswer({ chosen, correct, trap, ok, points, allIn, pointsBefore, pointsAfter, streak, lostStreak, number, total }) {
  const buttons = $("options").querySelectorAll(".option");
  buttons.forEach(btn => {
    btn.disabled = true;
    btn.classList.remove("selected");
  });
  $("barFill").style.width = `${(number / total) * 100}%`;

  if (correct !== null && correct !== undefined) buttons[correct].classList.add("correct");
  if (chosen !== null && chosen !== undefined && chosen !== correct) buttons[chosen].classList.add("wrong");

  let message;
  if (trap) message = ok ? TEXT.question.trapCorrect : TEXT.question.trapWrong;
  else if (ok) message = TEXT.question.correct;
  else message = chosen === null ? TEXT.question.skipped : TEXT.question.wrong;

  if (ok) message += ` ${TEXT.question.gain(points, streak)}`;
  else if (lostStreak) message += ` ${TEXT.question.comboLost}`;
  if (allIn) {
    message += ok
      ? ` ${TEXT.question.allInWin(pointsBefore, pointsAfter)}`
      : ` ${TEXT.question.allInLose(pointsBefore)}`;
  }
  $("feedback").textContent = message;
  $("feedback").className = ok ? "ok" : "bad";
  $("submitBtn").classList.add("hidden");
  $("allInBtn").classList.add("hidden");
  $("nextBtn").classList.remove("hidden");
}

export function hideCurrentQuestion() {
  $("stage").classList.add("leaving");
}

export function showError(text) {
  $("feedback").textContent = text;
  $("feedback").className = "bad";
}

export function setStatus(text) {
  $("status").textContent = text;
}

export function setStartError(text) {
  $("startError").textContent = text;
}

export function resetStartScreen() {
  $("playerName").value = "";
  setStatus("");
  setStartError("");
}

function createReviewOption(text, index, question, chosen) {
  const isRight = index === question.answer;
  const isChosen = index === chosen;

  const item = document.createElement("div");
  item.className = "rv-option";
  if (isRight) item.classList.add("correct");
  else if (isChosen) item.classList.add("wrong");

  const tag = document.createElement("span");
  tag.className = "tag";
  tag.textContent = LETTERS[index];

  const label = document.createElement("span");
  label.className = "rv-text";
  label.textContent = text;

  item.append(tag, label);

  const notes = [];
  if (isChosen) notes.push(TEXT.review.yourPick);
  if (isRight && !isChosen) notes.push(TEXT.review.rightAnswer);
  if (notes.length) {
    const note = document.createElement("span");
    note.className = "rv-note";
    note.textContent = notes.join(" · ");
    item.appendChild(note);
  }
  return item;
}

function createReviewCard(question, i, total, chosen, earned, allIn) {
  const answered = chosen !== undefined && chosen !== null;
  const trap = isTrap(question);
  const ok = isCorrect(question, chosen);

  const card = document.createElement("article");
  card.className = "rv-card " + (ok ? "ok" : "bad");
  card.style.setProperty("--i", i);

  const head = document.createElement("div");
  head.className = "rv-head";

  const num = document.createElement("span");
  num.className = "rv-num";
  num.textContent = TEXT.review.number(i + 1, total);

  const verdict = document.createElement("span");
  verdict.className = "rv-verdict";
  if (trap) verdict.textContent = ok ? TEXT.review.trapRight : TEXT.review.trapWrong;
  else verdict.textContent = !answered ? TEXT.review.skipped : ok ? TEXT.review.right : TEXT.review.wrong;

  if (allIn) verdict.textContent += ok ? ` · ${TEXT.review.allInWin}` : ` · ${TEXT.review.allInLose(-earned)}`;
  if (earned > 0) verdict.textContent += ` · ${TEXT.review.earned(earned)}`;
  head.append(num, verdict);

  const q = document.createElement("h3");
  q.className = "rv-question";
  q.textContent = question.question;

  const list = document.createElement("div");
  list.className = "rv-options";
  question.options.forEach((text, index) =>
    list.appendChild(createReviewOption(text, index, question, chosen))
  );

  card.append(head, q, list);
  if (trap) {
    const note = document.createElement("p");
    note.className = "rv-trap";
    note.textContent = question.note ? `${TEXT.review.trapNote} ${question.note}` : TEXT.review.trapNote;
    card.appendChild(note);
  }
  return card;
}

export function showReviewScreen({ questions, answers, earned, allIn = [], score, points }) {
  const total = questions.length;
  resultEl.classList.add("hidden");
  $("reviewSummary").textContent = TEXT.review.summary(score, total, points);

  const listEl = $("reviewList");
  listEl.innerHTML = "";
  questions.forEach((question, i) =>
    listEl.appendChild(createReviewCard(question, i, total, answers[i], earned[i], allIn[i]))
  );
  reveal(reviewEl);
  window.scrollTo({ top: 0 });
}

export function hideReviewScreen() {
  reviewEl.classList.add("hidden");
  reveal(resultEl);
}
