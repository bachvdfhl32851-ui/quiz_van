const API = "";

const questions = [
  {
    level: "Khó",
    question: "Theo tài liệu, vì sao vua Quang Trung cần người hiền tài sau khi đất nước vừa lập lại hòa bình?",
    options: [
      "Để tổ chức lại việc thi cử theo khoa cử cũ",
      "Để xây dựng đất nước sau khi hòa bình được lập lại",
      "Để chuẩn bị cho cuộc chinh phạt phương Bắc",
      "Để thay thế hoàn toàn các quan lại triều Nguyễn"
    ],
    answer: 1
  },
  {
    level: "Khó",
    question: "Trong Tôi có một ước mơ, Martin Luther King dựa vào văn kiện nào để khẳng định chân lý bình đẳng?",
    options: [
      "Hiến chương Liên Hợp Quốc",
      "Tuyên ngôn Nhân quyền và Dân quyền của Pháp",
      "Tuyên ngôn Độc lập của Mỹ",
      "Công ước Geneva"
    ],
    answer: 2
  },
  {
    level: "Khó",
    question: "Trong Một thời đại trong thi ca, Hoài Thanh nhận ra sự chuyển dịch cốt lõi nào trong thơ ca?",
    options: [
      "Từ thơ Đường luật sang thơ tự do",
      "Từ chữ \"ta\" của cộng đồng sang chữ \"tôi\" của cá nhân",
      "Từ chữ Hán sang chữ Quốc ngữ",
      "Từ thơ lục bát sang thơ song thất"
    ],
    answer: 1
  },
  {
    level: "Khó",
    question: "Trong công thức 5 bước, bước nào có nhiệm vụ sắp xếp luận điểm theo logic: thực trạng → nguyên nhân/yêu cầu → giải pháp → ý nghĩa?",
    options: ["Bước 1", "Bước 2", "Bước 3", "Bước 5"],
    answer: 2
  },
  {
    level: "Khó",
    question: "Hoài Thanh viết tiểu luận Một thời đại trong thi ca năm nào?",
    options: ["1938", "1945", "1960", "Không có đáp án nào đúng"],
    answer: 3
  },
  {
    level: "Khó",
    question: "Vua Quang Trung thuộc triều đại nào?",
    options: ["Triều Nguyễn", "Triều Lê sơ", "Nhà Minh", "Không có đáp án nào đúng"],
    answer: 3
  }
];

let current = 0;
let score = 0;
let answered = false;
let playerName = "";
let submitted = false;
let myTime = null;
let prevKeys = null;
let liveOk = false;

const $ = id => document.getElementById(id);
const startEl = $("start");
const quizEl = $("quiz");
const resultEl = $("result");
const LETTERS = ["A", "B", "C", "D"];

function showQuestion() {
  answered = false;
  const q = questions[current];

  $("progress").textContent = `Câu ${current + 1} / ${questions.length}`;
  $("barFill").style.width = `${(current / questions.length) * 100}%`;
  $("level").textContent = q.level === "Bẫy" ? "Câu bẫy" : "Câu khó";
  $("level").className = q.level === "Bẫy" ? "level trap" : "level";
  $("question").textContent = q.question;
  $("feedback").textContent = "";
  $("nextBtn").disabled = true;
  $("nextBtn").textContent = current === questions.length - 1 ? "Xem kết quả" : "Câu tiếp theo";

  const optionsEl = $("options");
  optionsEl.innerHTML = "";
  q.options.forEach((text, index) => {
    const btn = document.createElement("button");
    btn.className = "option";
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = LETTERS[index];
    const label = document.createElement("span");
    label.textContent = text;
    btn.append(tag, label);
    btn.addEventListener("click", () => selectAnswer(index));
    optionsEl.appendChild(btn);
  });
}

function selectAnswer(index) {
  if (answered) return;
  answered = true;

  const q = questions[current];
  const buttons = $("options").querySelectorAll(".option");
  buttons.forEach(btn => btn.disabled = true);
  buttons[q.answer].classList.add("correct");
  $("barFill").style.width = `${((current + 1) / questions.length) * 100}%`;

  if (index === q.answer) {
    score++;
    $("feedback").textContent = "Chính xác!";
    $("feedback").className = "ok";
  } else {
    buttons[index].classList.add("wrong");
    $("feedback").textContent = "Chưa đúng. Đáp án đúng đã được tô xanh.";
    $("feedback").className = "bad";
  }
  $("nextBtn").disabled = false;
}

async function submitScore() {
  if (submitted) return;
  submitted = true;
  $("status").textContent = "Đang gửi điểm...";
  try {
    const res = await fetch(`${API}/api/score`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: playerName, score, total: questions.length })
    });
    if (!res.ok) throw new Error("Lỗi máy chủ");
    const data = await res.json();
    myTime = data.time;
    $("status").textContent = "Đã lưu điểm. Dòng của bạn được tô sáng trên bảng.";
  } catch (e) {
    $("status").textContent = "Không kết nối được máy chủ, điểm chưa được lưu.";
  }
  if (!liveOk) loadLeaderboard();
}

function renderBoard(rows, viewers) {
  const body = $("boardBody");
  body.innerHTML = "";
  if (rows.length === 0) {
    body.innerHTML = `<tr><td colspan="3" class="empty">Chưa có ai chơi. Hãy là người đầu tiên.</td></tr>`;
  }
  const keys = new Set(rows.map(r => r.time));
  rows.forEach((r, i) => {
    const tr = document.createElement("tr");
    if (i < 3) tr.classList.add(`top${i + 1}`);
    if (r.time === myTime) tr.classList.add("me");
    if (prevKeys && !prevKeys.has(r.time)) tr.classList.add("fresh");
    tr.innerHTML = `<td class="rank"><span class="badge">${i + 1}</span></td><td class="nm"></td><td class="pt">${r.score} / ${r.total}</td>`;
    tr.querySelector(".nm").textContent = r.name;
    body.appendChild(tr);
  });
  prevKeys = keys;
  if (typeof viewers === "number") {
    $("liveText").textContent = `Trực tiếp · ${viewers} người đang xem`;
  }
}

async function loadLeaderboard() {
  try {
    const res = await fetch(`${API}/api/leaderboard`);
    renderBoard(await res.json());
  } catch (e) {
    $("status").textContent = "Không tải được bảng xếp hạng.";
  }
}

function setLive(on) {
  liveOk = on;
  $("live").className = on ? "live" : "live off";
  if (!on) $("liveText").textContent = "Đang kết nối lại...";
}

function connectLive() {
  if (!window.EventSource) return;
  const es = new EventSource(`${API}/api/stream`);
  es.onmessage = e => {
    setLive(true);
    const d = JSON.parse(e.data);
    renderBoard(d.rows, d.viewers);
  };
  es.onerror = () => setLive(false);
}

function showResult() {
  quizEl.classList.add("hidden");
  resultEl.classList.remove("hidden");
  $("score").textContent = `${playerName} đạt ${score} / ${questions.length} điểm`;

  if (score === questions.length) {
    $("message").textContent = "Xuất sắc! Bạn nắm rất vững công thức.";
  } else if (score >= questions.length / 2) {
    $("message").textContent = "Khá tốt! Hãy xem lại các câu sai.";
  } else {
    $("message").textContent = "Bạn nên đọc lại tài liệu và thử lần nữa.";
  }
  submitScore();
}

function startQuiz() {
  playerName = $("playerName").value.trim() || "Ẩn danh";
  current = 0;
  score = 0;
  submitted = false;
  myTime = null;
  startEl.classList.add("hidden");
  resultEl.classList.add("hidden");
  quizEl.classList.remove("hidden");
  showQuestion();
}

$("startBtn").addEventListener("click", startQuiz);
$("playerName").addEventListener("keydown", e => { if (e.key === "Enter") startQuiz(); });
$("nextBtn").addEventListener("click", () => {
  if (current < questions.length - 1) {
    current++;
    showQuestion();
  } else {
    showResult();
  }
});
$("restartBtn").addEventListener("click", () => {
  resultEl.classList.add("hidden");
  startEl.classList.remove("hidden");
  $("playerName").value = "";
  $("status").textContent = "";
});

loadLeaderboard();
connectLive();
setInterval(() => { if (!liveOk) loadLeaderboard(); }, 10000);