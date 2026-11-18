import { $ } from "./dom.js";
import { startQuiz, nextQuestion, restartQuiz } from "./quiz.js";
import { initLeaderboard } from "./leaderboard.js";
import { initCardGlow } from "./card-glow.js";

$("startBtn").addEventListener("click", startQuiz);
$("playerName").addEventListener("keydown", e => { if (e.key === "Enter") startQuiz(); });
$("nextBtn").addEventListener("click", nextQuestion);
$("restartBtn").addEventListener("click", restartQuiz);

initLeaderboard();
initCardGlow();
