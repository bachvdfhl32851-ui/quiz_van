export const ANONYMOUS_NAME = "Ẩn danh";
export const LETTERS = ["A", "B", "C", "D"];

export const TIMING = {
  questionLeave: 220,
  morph: 700,
  ring: 1100,
  leaderboardPoll: 10000
};

export const SCORING = { base: 100, comboStep: 20, comboCap: 100 };

export const EASE = "cubic-bezier(.22, 1, .36, 1)";
export const RING_RADIUS = 52;

export const TEXT = {
  question: {
    progress: (n, total) => `Câu ${n} / ${total}`,
    next: "Câu tiếp theo",
    submit: "Nộp đáp án",
    finish: "Xem kết quả",
    levelNormal: "Câu thường",
    levelTrap: "Câu bẫy",
    correct: "Chính xác!",
    wrong: "Chưa đúng. Đáp án đúng đã được tô xanh.",
    gain: (points, streak) => streak > 1 ? `+${points} điểm (combo ×${streak})` : `+${points} điểm`,
    comboLost: "Mất chuỗi đúng liên tiếp.",
    allIn: "All in",
    allInOn: "All in: ĐANG BẬT (bấm để tắt)",
    allInWin: (before, after) => `ALL IN thành công! Điểm nhân đôi: ${before} → ${after} điểm.`,
    allInLose: lost => lost > 0 ? `ALL IN thất bại! Bạn mất hết ${lost} điểm.` : "ALL IN thất bại! Bạn chưa có điểm nào để mất.",
    scoreBox: (points, streak) => streak > 1 ? `${points} điểm · combo ×${streak}` : `${points} điểm`,
    skipped: "Bạn chưa chọn đáp án nên câu này tính sai. Đáp án đúng đã được tô xanh.",
    trapCorrect: "Chính xác! Câu này không có đáp án đúng, nộp mà không chọn là đúng.",
    trapWrong: "Chưa đúng. Câu bẫy này không có đáp án đúng, cần nộp mà không chọn đáp án nào."
  },
  result: {
    score: (score, total) => `Bạn đạt ${score} / ${total} điểm`,
    detail: (correct, total, best) => `Đúng ${correct} / ${total} câu · Chuỗi đúng dài nhất: ${best}`,
    perfect: "Xuất sắc! Bạn nắm rất vững công thức.",
    good: "Khá tốt! Hãy xem lại các câu sai.",
    retry: "Bạn nên đọc lại tài liệu và thử lần nữa."
  },
  review: {
    open: "Xem lại câu trả lời",
    back: "Quay lại kết quả",
    title: "Bài làm của bạn",
    summary: (correct, total, points) => `Đúng ${correct} / ${total} câu · ${points} điểm`,
    earned: points => `+${points} điểm`,
    allInWin: "ALL IN thắng",
    allInLose: lost => `ALL IN thua (-${lost} điểm)`,
    number: (n, total) => `Câu ${n} / ${total}`,
    yourPick: "Bạn chọn",
    rightAnswer: "Đáp án đúng",
    right: "Bạn trả lời đúng",
    wrong: "Bạn trả lời sai",
    skipped: "Bạn chưa trả lời câu này",
    trapRight: "Bạn nộp mà không chọn: đúng",
    trapWrong: "Câu bẫy: không có đáp án đúng, bạn đã chọn một đáp án",
    trapNote: "Không có đáp án đúng. Nộp mà không chọn mới được tính điểm."
  },
  submit: {
    sending: "Đang gửi điểm...",
    saved: "Đã lưu điểm. Dòng của bạn được tô sáng trên bảng.",
    failed: "Không kết nối được máy chủ, điểm chưa được lưu.",
    startFailed: "Không kết nối được máy chủ, chưa thể bắt đầu. Hãy thử lại.",
    startOutdated: "Máy chủ chưa chạy bản mới (không có /api/start). Hãy chạy lại server.py hoặc deploy lại, rồi tải lại trang bằng Ctrl+Shift+R.",
    startCode: code => `Máy chủ báo lỗi (mã ${code}). Xem Logs của máy chủ để biết chi tiết.`,
    startBug: "Có lỗi khi mở câu hỏi. Hãy tải lại trang bằng Ctrl+Shift+R rồi thử lại.",
    answerFailed: "Không gửi được đáp án, hãy bấm Nộp đáp án lại.",
    expired: "Phiên chơi đã hết hạn hoặc không còn. Hãy làm lại từ đầu."
  },
  board: {
    empty: "Chưa có ai chơi. Hãy là người đầu tiên.",
    loadFailed: "Không tải được bảng xếp hạng.",
    viewers: n => `Trực tiếp · ${n} người đang xem`,
    reconnecting: "Đang kết nối lại..."
  }
};
