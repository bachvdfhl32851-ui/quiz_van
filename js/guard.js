import { $ } from "./dom.js";
import { RING_RADIUS, TEXT, TIMING } from "./config.js";
import { fetchSessionState } from "./api.js";
import { resultMessage } from "./quiz-logic.js";

const POLL_MS = 1000;

let session = null;
let truth = null;
let total = 0;
let max = 0;
let timer = null;
let observer = null;
let resultShownAt = 0;

const hidden = id => $(id).classList.contains("hidden");

function setText(id, text) {
  const el = $(id);
  if (el.textContent !== text) el.textContent = text;
}

function paint() {
  if (!truth) return;

  setText("scoreBox", TEXT.question.scoreBox(truth.points, truth.streak));

  if (truth.done && !hidden("result")) {
    setText("score", TEXT.result.score(truth.points, max));
    setText("detail", TEXT.result.detail(truth.correct, total, truth.best));
    setText("message", resultMessage(truth.points, max));
    setText("ringTotal", `/ ${max}`);

    // Trong lúc vòng tròn đang chạy hiệu ứng, số hiện tại nhỏ hơn hoặc bằng điểm thật là hợp lệ.
    const animating = performance.now() - resultShownAt < TIMING.ring + 300;
    const shown = Number($("ringNum").textContent);
    if (Number.isNaN(shown) || shown > truth.points || (!animating && shown !== truth.points)) {
      $("ringNum").textContent = truth.points;
    }

    const circumference = 2 * Math.PI * RING_RADIUS;
    const expected = circumference * (1 - truth.points / max);
    const fg = $("ringFg");
    if (Math.abs(parseFloat(fg.style.strokeDashoffset) - expected) > 0.5) {
      fg.style.strokeDashoffset = expected;
    }
  }

  if (truth.done && !hidden("review")) {
    setText("reviewSummary", TEXT.review.summary(truth.correct, total, truth.points));
  }

  if (observer) observer.takeRecords(); // bỏ qua thay đổi do chính mình vừa vẽ
}

async function poll() {
  if (!session) return;
  try {
    const s = await fetchSessionState(session);
    if (truth && s.answered < truth.answered) return; // phản hồi cũ
    truth = s;
    total = s.total;
    max = s.max;
    paint();
  } catch (e) {
    // mất mạng hoặc phiên hết hạn: giữ nguyên, lần sau thử lại
  }
}

export function begin(sessionId, totalQuestions, maxPoints) {
  session = sessionId;
  total = totalQuestions;
  max = maxPoints;
  truth = { answered: 0, points: 0, streak: 0, best: 0, correct: 0, done: false };
  resultShownAt = 0;
  clearInterval(timer);
  timer = setInterval(poll, POLL_MS);

  if (!observer) {
    observer = new MutationObserver(paint);
    const opts = { subtree: true, childList: true, characterData: true };
    observer.observe($("scoreBox"), opts);
    observer.observe($("result"), { ...opts, attributes: true, attributeFilter: ["style"] });
    observer.observe($("reviewSummary"), opts);
  }
}

// Gọi ngay sau khi server trả kết quả một câu, để không phải đợi lần hỏi tiếp theo.
export function update(next) {
  truth = { ...truth, ...next };
  paint();
}

export function markResultShown() {
  resultShownAt = performance.now();
}
