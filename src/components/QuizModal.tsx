import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  RotateCcw,
  Award,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TrainingCourse } from '../types';
import { useTraining } from '../context/TrainingContext';

interface QuizModalProps {
  course: TrainingCourse | null;
  isOpen: boolean;
  onClose: () => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({ course, isOpen, onClose }) => {
  const { recordQuizResult } = useTraining();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 mins

  const quiz = course?.quiz;
  const questions = quiz?.questions || [];

  // Reset state when opening a new course quiz
  useEffect(() => {
    if (isOpen) {
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setIsSubmitted(false);
      setTimeLeft((quiz?.durationMinutes || 15) * 60);
    }
  }, [isOpen, course]);

  // Timer countdown
  useEffect(() => {
    if (!isOpen || isSubmitted) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, isSubmitted]);

  if (!isOpen || !course || !quiz) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (optionIndex: number) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: optionIndex,
    }));
  };

  // Calculate score
  const calculateScore = () => {
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswer) {
        correctCount += 1;
      }
    });
    const percentage = Math.round((correctCount / questions.length) * 100);
    const passed = percentage >= quiz.passScorePercentage;
    return { correctCount, total: questions.length, percentage, passed };
  };

  const handleSubmitQuiz = () => {
    const { percentage, passed } = calculateScore();
    setIsSubmitted(true);
    recordQuizResult(course.id, percentage, passed);

    if (passed) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const isAllAnswered = answeredCount === questions.length;
  const { correctCount, percentage, passed } = calculateScore();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-linear-to-r from-blue-50/60 to-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                {course.code}
              </span>
              <span className="text-xs text-slate-500">Bài kiểm tra trắc nghiệm chuẩn hóa</span>
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-1">{quiz.title}</h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Timer */}
            {!isSubmitted && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-mono font-semibold text-slate-700">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span className="tabular-nums">{formatTime(timeLeft)}</span>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto grow">
          {!isSubmitted ? (
            /* ================= Taking Quiz State ================= */
            <div className="space-y-6">
              {/* Progress & Quick Question Jump */}
              <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
                <span>
                  Câu hỏi <strong className="text-slate-900 font-mono">{currentQuestionIndex + 1}</strong> / {questions.length}
                </span>
                <span className="text-blue-600 font-medium">
                  Đã trả lời: {answeredCount}/{questions.length}
                </span>
              </div>

              {/* Question pagination pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {questions.map((_, idx) => {
                  const isAnswered = selectedAnswers[idx] !== undefined;
                  const isCurrent = currentQuestionIndex === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`w-8 h-8 rounded-lg text-xs font-semibold font-mono transition-colors shrink-0 ${
                        isCurrent
                          ? 'bg-blue-600 text-white shadow-xs'
                          : isAnswered
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Current Question */}
              <div className="bg-slate-50/70 p-5 rounded-xl border border-slate-200">
                <p className="text-base font-semibold text-slate-900 leading-relaxed">
                  {questions[currentQuestionIndex].question}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {questions[currentQuestionIndex].options.map((opt, optIdx) => {
                  const isSelected = selectedAnswers[currentQuestionIndex] === optIdx;
                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectOption(optIdx)}
                      className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/50 shadow-xs ring-1 ring-blue-600/30'
                          : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full border flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                          isSelected
                            ? 'border-blue-600 bg-blue-600 text-white'
                            : 'border-slate-300 text-slate-500 bg-white'
                        }`}
                      >
                        {String.fromCharCode(65 + optIdx)}
                      </div>
                      <span className="text-sm text-slate-800 leading-relaxed font-normal">
                        {opt}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* ================= Results & Review State ================= */
            <div className="space-y-6">
              {/* Score Summary Banner */}
              <div
                className={`p-6 rounded-2xl border text-center ${
                  passed
                    ? 'bg-emerald-50/70 border-emerald-200'
                    : 'bg-amber-50/70 border-amber-200'
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-full mx-auto flex items-center justify-center mb-3 ${
                    passed ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                  }`}
                >
                  {passed ? <Award className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
                </div>

                <h3
                  className={`text-xl font-bold ${
                    passed ? 'text-emerald-900' : 'text-amber-900'
                  }`}
                >
                  {passed ? 'Chúc Mừng! Bạn Đã Vượt Qua Bài Thi' : 'Chưa Đạt Chuẩn Hoàn Thành'}
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Yêu cầu tối thiểu: <strong>{quiz.passScorePercentage}%</strong> điểm số chuẩn hóa
                </p>

                <div className="mt-4 flex items-center justify-center gap-6">
                  <div>
                    <div className="text-xs text-slate-500">Điểm số đạt được</div>
                    <div className="text-3xl font-extrabold font-mono tabular-nums text-slate-900 mt-0.5">
                      {percentage}%
                    </div>
                  </div>
                  <div className="h-8 w-px bg-slate-300" />
                  <div>
                    <div className="text-xs text-slate-500">Số câu đúng</div>
                    <div className="text-3xl font-extrabold font-mono tabular-nums text-slate-900 mt-0.5">
                      {correctCount}/{questions.length}
                    </div>
                  </div>
                </div>

                {passed && (
                  <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-white/80 border border-emerald-300 px-3.5 py-1.5 rounded-full shadow-2xs">
                    <CheckCircle2 className="w-4 h-4" /> Đã cập nhật vào hồ sơ năng lực & cấp chứng chỉ
                  </div>
                )}
              </div>

              {/* Detailed Question Review & Rationale */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Xem lại chi tiết đáp án & giải thích chuyên môn
                </h4>

                {questions.map((q, idx) => {
                  const userChoice = selectedAnswers[idx];
                  const isCorrect = userChoice === q.correctAnswer;

                  return (
                    <div
                      key={q.id}
                      className={`p-4 rounded-xl border ${
                        isCorrect
                          ? 'border-emerald-200 bg-emerald-50/20'
                          : 'border-rose-200 bg-rose-50/20'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="mt-0.5">
                          {isCorrect ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <XCircle className="w-5 h-5 text-rose-600" />
                          )}
                        </div>
                        <div className="grow">
                          <p className="text-sm font-semibold text-slate-900">
                            Câu {idx + 1}: {q.question}
                          </p>

                          <div className="mt-2.5 space-y-1.5 text-xs">
                            {q.options.map((opt, optIdx) => {
                              const isOptionCorrect = optIdx === q.correctAnswer;
                              const isUserPick = optIdx === userChoice;

                              return (
                                <div
                                  key={optIdx}
                                  className={`p-2 rounded-lg flex items-center justify-between ${
                                    isOptionCorrect
                                      ? 'bg-emerald-100/70 font-semibold text-emerald-900'
                                      : isUserPick
                                      ? 'bg-rose-100/70 font-semibold text-rose-900'
                                      : 'text-slate-600'
                                  }`}
                                >
                                  <span>
                                    {String.fromCharCode(65 + optIdx)}. {opt}
                                  </span>
                                  {isOptionCorrect && (
                                    <span className="text-[10px] text-emerald-700 bg-white px-2 py-0.5 rounded font-bold">
                                      Đáp án đúng
                                    </span>
                                  )}
                                  {!isOptionCorrect && isUserPick && (
                                    <span className="text-[10px] text-rose-700 bg-white px-2 py-0.5 rounded font-bold">
                                      Bạn đã chọn
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          <div className="mt-2.5 p-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 leading-relaxed">
                            <strong className="text-slate-800">Giải thích chuyên môn: </strong>
                            {q.explanation}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          {!isSubmitted ? (
            <>
              <button
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                className="flex items-center gap-1 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Câu trước
              </button>

              <div className="flex items-center gap-2">
                {currentQuestionIndex < questions.length - 1 ? (
                  <button
                    onClick={() =>
                      setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))
                    }
                    className="flex items-center gap-1 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    Câu tiếp theo <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitQuiz}
                    className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Nộp bài thi
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setCurrentQuestionIndex(0);
                  setSelectedAnswers({});
                  setTimeLeft((quiz.durationMinutes || 15) * 60);
                }}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Làm lại bài kiểm tra
              </button>

              <button
                onClick={onClose}
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
              >
                Hoàn tất & Đóng
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
