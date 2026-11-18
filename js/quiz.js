import { $, reduceMotion } from "./dom.js";
import { questions } from "./data/questions.js";
import { ANONYMOUS_NAME, TEXT, TIMING } from "./config.js";
import { state } from "./state.js";
import { morph } from "./animations.js";
import { postScore } from "./api.js";
import { isLive, loadLeaderboard } from "./leaderboard.js";
import { isCorrect, isLastQuestion, resultMessage } from "./quiz-logic.js";
import * as view from "./quiz-view.js";

const total = questions.length;
let leaving = false;

function showQuestion() {
  state.answered = false;
  view.renderQuestion({
    question: questions[state.current],
    number: state.current + 1,
    total,
    isLast: isLastQuestion(state.current, total),
    onSelect: selectAnswer
  });
}

function selectAnswer(index) {
  if (state.answered) return;
  state.answered = true;

  const question = questions[state.current];
  if (isCorrect(question, index)) state.score++;
  view.showAnswer({
    chosen: index,
    correct: question.answer,
    number: state.current + 1,
    total
  });
}

async function submitScore() {
  if (state.submitted) return;
  state.submitted = true;
  view.setStatus(TEXT.submit.sending);
  try {
    const data = await postScore({ name: state.playerName, score: state.score, total });
    state.myTime = data.time;
    view.setStatus(TEXT.submit.saved);
  } catch (e) {
    view.setStatus(TEXT.submit.failed);
  }
  if (!isLive()) loadLeaderboard();
}

function showResult() {
  morph(() => view.showResultScreen(state.score, total, resultMessage(state.score, total)));
  submitScore();
}

export function startQuiz() {
  state.playerName = $("playerName").value.trim() || ANONYMOUS_NAME;
  state.current = 0;
  state.score = 0;
  state.submitted = false;
  state.myTime = null;
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
