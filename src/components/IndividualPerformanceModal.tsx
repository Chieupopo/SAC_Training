import React, { useState } from 'react';
import {
  X,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  FileCheck,
  Send,
} from 'lucide-react';
import { UserAccount, TrainingCourse } from '../types';
import { useTraining } from '../context/TrainingContext';

interface IndividualPerformanceModalProps {
  user: UserAccount | null;
  onClose: () => void;
  onOpenQuizForCourse?: (courseId: string) => void;
}

export const IndividualPerformanceModal: React.FC<IndividualPerformanceModalProps> = ({
  user,
  onClose,
  onOpenQuizForCourse,
}) => {
  const { courses, progressRecords, roles, triggerManualReminder } = useTraining();
  const [activeTab, setActiveTab] = useState<'radar' | 'courses' | 'quizzes'>('radar');

  if (!user) return null;

  const roleConfig = roles.find((r) => r.id === user.role);
  const userProgressList = progressRecords.filter((p) => p.userId === user.id);

  // Radar chart mathematical coordinates computation
  const competencies = user.competencies || [];
  const totalPoints = competencies.length;
  const radius = 100;
  const center = 140;

  const getCoordinates = (index: number, score: number) => {
    const angle = (Math.PI * 2 * index) / totalPoints - Math.PI / 2;
    const r = (radius * score) / 100;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  const radarPolygonPoints = competencies
    .map((c, i) => {
      const { x, y } = getCoordinates(i, c.score);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden animate-in fade-in duration-150">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 bg-linear-to-r from-blue-50/70 via-white to-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-bold text-base flex items-center justify-center shadow-sm shadow-blue-500/30">
              {user.name
                .split(' ')
                .slice(-2)
                .map((w) => w[0])
                .join('')}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-bold text-slate-900">{user.name}</h2>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
                  {roleConfig?.name || user.role}
                </span>
                <span
                  className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                    user.status === 'completed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : user.status === 'on_track'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {user.status === 'completed'
                    ? 'Xuất sắc'
                    : user.status === 'on_track'
                    ? 'Đúng lộ trình'
                    : 'Cần đốc thúc'}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                <span>{user.position}</span>
                <span>·</span>
                <span className="font-medium text-slate-700">{user.department}</span>
                <span>·</span>
                <span>{user.email}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top 4 KPI Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-slate-200 border-b border-slate-200">
          <div className="bg-white p-4 text-center">
            <div className="text-xs text-slate-500 font-medium">Tiến độ hoàn thành</div>
            <div className="text-2xl font-bold text-blue-600 mt-1 font-mono tabular-nums">
              {user.completionRate}%
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${user.completionRate}%` }}
              />
            </div>
          </div>

          <div className="bg-white p-4 text-center">
            <div className="text-xs text-slate-500 font-medium">Điểm thi trắc nghiệm TB</div>
            <div className="text-2xl font-bold text-slate-900 mt-1 font-mono tabular-nums">
              {user.averageScore}
              <span className="text-xs text-slate-400 font-normal"> / 100</span>
            </div>
            <div className="text-[11px] text-emerald-600 mt-2 font-medium flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Chuẩn đạt $\ge 80$%
            </div>
          </div>

          <div className="bg-white p-4 text-center">
            <div className="text-xs text-slate-500 font-medium">Khóa học hoàn thành</div>
            <div className="text-2xl font-bold text-slate-900 mt-1 font-mono tabular-nums">
              {user.completedCoursesCount}{' '}
              <span className="text-sm font-normal text-slate-400">/ {user.totalAssignedCourses}</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-2">
              Còn {user.totalAssignedCourses - user.completedCoursesCount} khóa chưa đạt
            </div>
          </div>

          <div className="bg-white p-4 text-center">
            <div className="text-xs text-slate-500 font-medium">Thời lượng đào tạo</div>
            <div className="text-2xl font-bold text-slate-900 mt-1 font-mono tabular-nums">
              {user.completedCoursesCount * 8 + 4}
              <span className="text-sm font-normal text-slate-400"> giờ</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-2">Đăng nhập: {user.lastActive}</div>
          </div>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="px-6 pt-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/40">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('radar')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 -mb-px ${
                activeTab === 'radar'
                  ? 'border-blue-600 text-blue-600 bg-white shadow-2xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Ma trận Kỹ năng & Radar
            </button>
            <button
              onClick={() => setActiveTab('courses')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 -mb-px ${
                activeTab === 'courses'
                  ? 'border-blue-600 text-blue-600 bg-white shadow-2xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Lộ trình & Bài thi ({courses.length})
            </button>
          </div>

          <button
            onClick={() => triggerManualReminder(user.name)}
            className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg transition-colors mb-2"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Gửi nhắc nhở cá nhân</span>
          </button>
        </div>

        {/* Tab 1: Radar Chart & Competency breakdown */}
        {activeTab === 'radar' && (
          <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 max-h-[60vh] overflow-y-auto">
            {/* Left: SVG Radar Chart */}
            <div className="md:col-span-6 flex flex-col items-center justify-center p-4 bg-slate-50/50 rounded-xl border border-slate-200/80">
              <div className="text-xs font-semibold text-slate-700 mb-2">
                Biểu đồ Radar Năng lực Cá nhân (Competency Matrix)
              </div>
              <div className="relative w-[280px] h-[280px]">
                <svg viewBox="0 0 280 280" className="w-full h-full">
                  {/* Concentric grid circles */}
                  {[0.25, 0.5, 0.75, 1].map((scale, i) => (
                    <circle
                      key={i}
                      cx={center}
                      cy={center}
                      r={radius * scale}
                      fill="none"
                      stroke="#E2E8F0"
                      strokeWidth="1"
                      strokeDasharray={scale === 1 ? 'none' : '3 3'}
                    />
                  ))}

                  {/* Radial axis lines */}
                  {competencies.map((_, i) => {
                    const { x, y } = getCoordinates(i, 100);
                    return (
                      <line
                        key={i}
                        x1={center}
                        y1={center}
                        x2={x}
                        y2={y}
                        stroke="#CBD5E1"
                        strokeWidth="1"
                      />
                    );
                  })}

                  {/* Polygon fill & stroke */}
                  <polygon
                    points={radarPolygonPoints}
                    fill="rgba(37, 99, 235, 0.18)"
                    stroke="#2563EB"
                    strokeWidth="2.5"
                  />

                  {/* Individual data nodes */}
                  {competencies.map((c, i) => {
                    const { x, y } = getCoordinates(i, c.score);
                    return (
                      <g key={i}>
                        <circle cx={x} cy={y} r="4.5" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2" />
                      </g>
                    );
                  })}
                </svg>
              </div>
              <div className="text-[11px] text-slate-500 mt-2 text-center">
                Màu xanh thể hiện ngưỡng năng lực thực tế dựa trên điểm trắc nghiệm và đánh giá khóa học.
              </div>
            </div>

            {/* Right: Competency Score Breakdown */}
            <div className="md:col-span-6 space-y-3">
              <div className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                Điểm số chi tiết từng trụ cột năng lực
              </div>
              {competencies.map((c, i) => (
                <div key={i} className="p-3 bg-white border border-slate-200 rounded-lg">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-800">{c.skill}</span>
                    <span className="font-bold text-blue-600 font-mono tabular-nums">{c.score}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        c.score >= 85
                          ? 'bg-blue-600'
                          : c.score >= 70
                          ? 'bg-sky-500'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${c.score}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                    <span>
                      {c.score >= 80 ? 'Đạt chuẩn xuất sắc' : 'Cần trau dồi thêm qua bài lab'}
                    </span>
                    <span>Chuẩn: 80%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Course by course list with Quiz Scores */}
        {activeTab === 'courses' && (
          <div className="p-6 max-h-[60vh] overflow-y-auto space-y-3">
            {courses.map((course) => {
              const record = userProgressList.find((p) => p.courseId === course.id);
              const isPassed = record?.quizPassed;
              const hasScore = record?.quizScore !== undefined;

              return (
                <div
                  key={course.id}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-200 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        course.category === 'Sales'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-indigo-100 text-indigo-700'
                      }`}
                    >
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-semibold text-slate-500">
                          {course.code}
                        </span>
                        <h4 className="text-sm font-semibold text-slate-900">{course.title}</h4>
                      </div>
                      <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                        <span>Phân hệ: {course.category}</span>
                        <span>·</span>
                        <span>{course.estimatedHours} giờ</span>
                        <span>·</span>
                        <span>Hạn chót: {record?.dueDate || '2026-10-31'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-2 md:pt-0 border-slate-100">
                    <div className="text-left md:text-right">
                      <div className="text-[11px] text-slate-400">Kết quả bài thi</div>
                      <div className="text-sm font-bold font-mono tabular-nums">
                        {hasScore ? (
                          <span className={isPassed ? 'text-emerald-600' : 'text-rose-600'}>
                            {record?.quizScore}% ({isPassed ? 'Đạt' : 'Chưa đạt'})
                          </span>
                        ) : (
                          <span className="text-slate-400 font-normal">Chưa làm bài thi</span>
                        )}
                      </div>
                    </div>

                    {isPassed ? (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Đã cấp chứng chỉ</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          onClose();
                          if (onOpenQuizForCourse) {
                            onOpenQuizForCourse(course.id);
                          }
                        }}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors"
                      >
                        Làm bài trắc nghiệm
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Dữ liệu được cập nhật thời gian thực sau mỗi bài làm trắc nghiệm và buổi đào tạo.
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
