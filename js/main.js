import { $ } from "./dom.js";
import { startQuiz, submitAnswer, toggleAllIn, nextQuestion, restartQuiz, openReview, closeReview } from "./quiz.js";
import { initLeaderboard } from "./leaderboard.js";
import { initCardGlow } from "./card-glow.js";

$("startBtn").addEventListener("click", startQuiz);
$("playerName").addEventListener("keydown", e => { if (e.key === "Enter") startQuiz(); });
$("submitBtn").addEventListener("click", submitAnswer);
$("allInBtn").addEventListener("click", toggleAllIn);
$("nextBtn").addEventListener("click", nextQuestion);
$("restartBtn").addEventListener("click", restartQuiz);
$("reviewBtn").addEventListener("click", openReview);
$("backBtn").addEventListener("click", closeReview);
$("reviewRestartBtn").addEventListener("click", restartQuiz);

initLeaderboard();
initCardGlow();
