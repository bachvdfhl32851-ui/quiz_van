export const ANONYMOUS_NAME = "Ẩn danh";
export const LETTERS = ["A", "B", "C", "D"];

export const TIMING = {
  questionLeave: 220,
  morph: 700,
  ring: 1100,
  leaderboardPoll: 10000
};

export const EASE = "cubic-bezier(.22, 1, .36, 1)";
export const RING_RADIUS = 52;

export const TEXT = {
  question: {
    progress: (n, total) => `Câu ${n} / ${total}`,
    next: "Câu tiếp theo",
    finish: "Xem kết quả",
    levelHard: "Câu khó",
    levelTrap: "Câu bẫy",
    correct: "Chính xác!",
    wrong: "Chưa đúng. Đáp án đúng đã được tô xanh."
  },
  result: {
    score: (score, total) => `Bạn đạt ${score} / ${total} điểm`,
    perfect: "Xuất sắc! Bạn nắm rất vững công thức.",
    good: "Khá tốt! Hãy xem lại các câu sai.",
    retry: "Bạn nên đọc lại tài liệu và thử lần nữa."
  },
  submit: {
    sending: "Đang gửi điểm...",
    saved: "Đã lưu điểm. Dòng của bạn được tô sáng trên bảng.",
    failed: "Không kết nối được máy chủ, điểm chưa được lưu."
  },
  board: {
    empty: "Chưa có ai chơi. Hãy là người đầu tiên.",
    loadFailed: "Không tải được bảng xếp hạng.",
    viewers: n => `Trực tiếp · ${n} người đang xem`,
    reconnecting: "Đang kết nối lại..."
  }
};
