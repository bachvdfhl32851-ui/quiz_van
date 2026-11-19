import { $, reduceMotion } from "./dom.js";
import { ANONYMOUS_NAME, TEXT, TIMING } from "./config.js";
import { state } from "./state.js";
import { morph } from "./animations.js";
import { startGame, sendAnswer } from "./api.js";
import { isLive, loadLeaderboard } from "./leaderboard.js";
import { isLastQuestion, isTrap, resultMessage } from "./quiz-logic.js";
import * as view from "./quiz-view.js";

let questions = [];
let total = 0;
let maxPoints = 0;
let leaving = false;
let busy = false;

function showQuestion() {
  state.answered = false;
  state.selected = null;
  state.allInArmed = false;
  view.setScoreBox(state.points, state.streak);
  view.setAllInAvailable(!state.allInUsed);
  view.setAllInArmed(false);
  view.renderQuestion({
    question: questions[state.current],
    number: state.current + 1,
    total,
    isLast: isLastQuestion(state.current, total),
    onSelect: selectAnswer
  });
}

function selectAnswer(index) {
  if (state.answered || busy) return;
  state.selected = state.selected === index ? null : index;
  view.markSelected(state.selected);
}

export function toggleAllIn() {
  if (state.answered || busy || state.allInUsed) return;
  state.allInArmed = !state.allInArmed;
  view.setAllInArmed(state.allInArmed);
}

export async function submitAnswer() {
  if (state.answered || busy) return;
  busy = true;
  const allIn = state.allInArmed && !state.allInUsed;
  const chosen = state.selected;

  let r;
  try {
    r = await sendAnswer({ session: state.session, index: chosen, allIn });
  } catch (e) {
    busy = false;
    view.showError(e.status === 404 ? TEXT.submit.expired : TEXT.submit.answerFailed);
    return;
  }
  busy = false;

  state.answered = true;
  state.allInArmed = false;
  if (r.all_in) state.allInUsed = true;

  const question = questions[state.current];
  question.answer = r.correct_index;
  if (r.note) question.note = r.note;

  const lostStreak = !r.ok && state.streak > 0;
  state.answers[state.current] = chosen;
  state.allIn[state.current] = r.all_in;
  state.score = r.correct_count;
  state.streak = r.streak;
  state.bestStreak = r.best_streak;
  state.points = r.total_points;
  state.earned[state.current] = r.total_points - r.points_before;
  if (r.done) state.myTime = r.time;

  view.showAnswer({
    chosen,
    correct: r.correct_index,
    trap: isTrap(question),
    ok: r.ok,
    points: r.points,
    allIn: r.all_in,
    pointsBefore: r.points_before,
    pointsAfter: r.total_points,
    streak: state.streak,
    lostStreak,
    number: state.current + 1,
    total
  });
  view.setScoreBox(state.points, state.streak);
}

function showResult() {
  morph(() => view.showResultScreen({
    points: state.points,
    max: maxPoints,
    message: resultMessage(state.points, maxPoints),
    correct: state.score,
    total,
    best: state.bestStreak
  }));
  // Điểm đã được server tự lưu khi nộp câu cuối.
  view.setStatus(TEXT.submit.saved);
  if (!isLive()) loadLeaderboard();
}

export async function startQuiz() {
  if (busy) return;
  busy = true;
  view.setStartError("");
  let game;
  try {
    game = await startGame($("playerName").value.trim() || ANONYMOUS_NAME);
  } catch (e) {
    busy = false;
    const code = e.status;
    view.setStartError(
      !code ? TEXT.submit.startFailed
        : [404, 405, 501].includes(code) ? TEXT.submit.startOutdated
        : TEXT.submit.startCode(code)
    );
    return;
  }
  busy = false;
  if (!game || !Array.isArray(game.questions) || !game.questions.length) {
    view.setStartError(TEXT.submit.startOutdated);
    return;
  }

  questions = game.questions.map(q => ({ ...q, answer: undefined }));
  total = game.total;
  maxPoints = game.max;
  state.session = game.session;
  state.playerName = $("playerName").value.trim() || ANONYMOUS_NAME;
  state.current = 0;
  state.score = 0;
  state.points = 0;
  state.streak = 0;
  state.bestStreak = 0;
  state.earned = [];
  state.allIn = [];
  state.allInUsed = false;
  state.allInArmed = false;
  state.answers = [];
  state.submitted = false;
  state.myTime = null;
  view.setStatus("");
  morph(() => {
    view.showQuizScreen();
    showQuestion();
  });
}

export function nextQuestion() {
  if (leaving) return;
  leaving = true;
  view.hideCurrentQuestion();
  setTimeout(() => {
    leaving = false;
    if (isLastQuestion(state.current, total)) {
      showResult();
    } else {
      state.current++;
      morph(showQuestion);
    }
  }, reduceMotion ? 0 : TIMING.questionLeave);
}

export function restartQuiz() {
  morph(view.showStartScreen);
  view.resetStartScreen();
}

export function openReview() {
  morph(() => view.showReviewScreen({
    questions,
    answers: state.answers,
    earned: state.earned,
    allIn: state.allIn,
    score: state.score,
    points: state.points
  }));
}

export function closeReview() {
  morph(view.hideReviewScreen);
}
