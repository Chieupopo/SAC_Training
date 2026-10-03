import React from 'react';
import {
  TrendingUp,
  Award,
  Users,
  Clock,
  AlertCircle,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  Send,
  Sparkles,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { useTraining } from '../context/TrainingContext';
import { UserAccount } from '../types';

interface DashboardOverviewProps {
  onSelectUser: (user: UserAccount) => void;
  onNavigateTab: (tab: string) => void;
  onTakeQuizForCourse: (courseId: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  onSelectUser,
  onNavigateTab,
  onTakeQuizForCourse,
}) => {
  const { allUsers, courses, progressRecords, triggerManualReminder, hasPermission } = useTraining();

  // Aggregate KPI computations
  const totalUsers = allUsers.length;
  const avgCompletion = Math.round(
    allUsers.reduce((acc, u) => acc + u.completionRate, 0) / (totalUsers || 1)
  );
  const avgScore = Math.round(
    allUsers.reduce((acc, u) => acc + u.averageScore, 0) / (totalUsers || 1)
  );
  const behindCount = allUsers.filter((u) => u.status === 'behind').length;
  const completedCount = allUsers.filter((u) => u.status === 'completed').length;

  // Department breakdown
  const salesUsers = allUsers.filter((u) => u.department === 'Sales');
  const techUsers = allUsers.filter((u) => u.department === 'Technical');

  const salesAvg = Math.round(
    salesUsers.reduce((acc, u) => acc + u.completionRate, 0) / (salesUsers.length || 1)
  );
  const techAvg = Math.round(
    techUsers.reduce((acc, u) => acc + u.completionRate, 0) / (techUsers.length || 1)
  );

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Action Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            Hệ Thống Quản Trị Đào Tạo Sản Phẩm & Năng Lực
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            Bảng Điều Khiển Tiến Độ Đào Tạo
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Theo dõi hiệu suất hoàn thành các chuyên đề Sales & Technical, điểm thi trắc nghiệm và lịch nhắc nhở tự động.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {hasPermission('manage_reminders') && (
            <button
              onClick={() => triggerManualReminder()}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-xl text-xs font-bold transition-all shadow-2xs whitespace-nowrap"
            >
              <Send className="w-4 h-4 text-blue-600" />
              <span>Kích hoạt gửi nhắc nhở tự động</span>
            </button>
          )}

          <button
            onClick={() => onNavigateTab('courses')}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-blue-500/20 whitespace-nowrap"
          >
            <BookOpen className="w-4 h-4" />
            <span>Xem khóa đào tạo ({courses.length})</span>
          </button>
        </div>
      </div>

      {/* 4 Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Tỷ lệ hoàn thành chung</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2 font-mono tabular-nums">
            {avgCompletion}%
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-700"
              style={{ width: `${avgCompletion}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex justify-between">
            <span>Mục tiêu Q4: 85%</span>
            <span className="text-emerald-600 font-semibold">+12% so với tháng trước</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Điểm thi trắc nghiệm TB</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2 font-mono tabular-nums">
            {avgScore}
            <span className="text-sm font-normal text-slate-400"> / 100</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-700"
              style={{ width: `${avgScore}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex justify-between">
            <span>Điểm đạt chuẩn: 80đ</span>
            <span className="text-emerald-600 font-semibold">Tỷ lệ đậu: 91%</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Nhân sự tham gia lộ trình</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2 font-mono tabular-nums">
            {totalUsers}
            <span className="text-sm font-normal text-slate-400"> nhân sự</span>
          </div>
          <div className="mt-3 text-xs text-slate-500 flex items-center gap-2">
            <span className="text-blue-600 font-semibold">{salesUsers.length} Sales</span>
            <span>·</span>
            <span className="text-indigo-600 font-semibold">{techUsers.length} Technical</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2">100% tài khoản đã cấp lộ trình</div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Cảnh báo chậm tiến độ</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-amber-600 mt-2 font-mono tabular-nums">
            {behindCount}
            <span className="text-sm font-normal text-slate-400"> cần đôn đốc</span>
          </div>
          <div className="mt-3 text-xs text-slate-500">
            {behindCount > 0
              ? 'Đã kích hoạt cảnh báo tự động qua Email'
              : 'Tất cả nhân sự đều bám sát hạn chót'}
          </div>
          <div className="text-[11px] text-blue-600 font-semibold mt-2 cursor-pointer hover:underline" onClick={() => onNavigateTab('roster')}>
            Xem danh sách nhân viên &rarr;
          </div>
        </div>
      </div>

      {/* Grid: Department Performance Comparison + Quick Training Courses */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Department Track Comparison */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Hiệu Suất Đào Tạo Theo Khối (Sales vs Technical)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                So sánh tiến độ hoàn thành các chuyên đề sản phẩm theo từng bộ phận
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('roster')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>Chi tiết bảng nhân sự</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4 pt-1">
            {/* Sales Bar */}
            <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-100">
              <div className="flex items-center justify-between text-xs mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  <span className="font-bold text-slate-800">Khối Kinh Doanh (Sales Track)</span>
                  <span className="text-slate-400">({salesUsers.length} nhân viên)</span>
                </div>
                <div className="font-bold font-mono tabular-nums text-blue-600 text-sm">
                  {salesAvg}%
                </div>
              </div>
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-700"
                  style={{ width: `${salesAvg}%` }}
                />
              </div>
              <div className="text-[11px] text-slate-500 mt-2 flex justify-between">
                <span>Trọng tâm: Kỹ năng Demo giải pháp & Xử lý phản đối về giá</span>
                <span>Điểm thi TB: 81đ</span>
              </div>
            </div>

            {/* Technical Bar */}
            <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-100">
              <div className="flex items-center justify-between text-xs mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                  <span className="font-bold text-slate-800">Khối Kỹ Thuật (Technical Track)</span>
                  <span className="text-slate-400">({techUsers.length} kỹ sư)</span>
                </div>
                <div className="font-bold font-mono tabular-nums text-indigo-600 text-sm">
                  {techAvg}%
                </div>
              </div>
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-700"
                  style={{ width: `${techAvg}%` }}
                />
              </div>
              <div className="text-[11px] text-slate-500 mt-2 flex justify-between">
                <span>Trọng tâm: Kubernetes Microservices & Bảo mật API OAuth2/mTLS</span>
                <span>Điểm thi TB: 89đ</span>
              </div>
            </div>
          </div>

          {/* Quick Learner Spotlight Table */}
          <div className="pt-2 border-t border-slate-100">
            <div className="text-xs font-bold text-slate-900 mb-3 uppercase tracking-wider">
              Nhân sự tiêu biểu & Bảng thành tích
            </div>
            <div className="divide-y divide-slate-100">
              {allUsers.slice(0, 4).map((user) => (
                <div
                  key={user.id}
                  onClick={() => onSelectUser(user)}
                  className="py-2.5 flex items-center justify-between hover:bg-slate-50/80 px-2 rounded-lg transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                      {user.name
                        .split(' ')
                        .slice(-2)
                        .map((w) => w[0])
                        .join('')}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{user.name}</div>
                      <div className="text-[11px] text-slate-500">{user.position}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono">
                    <div className="text-right">
                      <div className="text-slate-900 font-semibold">{user.completionRate}%</div>
                      <div className="text-[10px] text-slate-400">{user.averageScore}đ trắc nghiệm</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Urgent Roadmaps & Interactive Course Quick Access */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Khóa Học Trọng Tâm
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Làm bài kiểm tra trắc nghiệm ngay
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('courses')}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                Xem tất cả
              </button>
            </div>

            <div className="space-y-3">
              {courses.slice(0, 3).map((course) => (
                <div
                  key={course.id}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/20 transition-all flex flex-col gap-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {course.code}
                      </span>
                      <span className="text-xs font-semibold text-slate-900 line-clamp-1">
                        {course.title}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                      {course.estimatedHours}h
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {course.description}
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                      <span className="font-medium text-slate-700">{course.lessons.length} bài học</span>
                      <span>·</span>
                      <span className="text-emerald-600 font-semibold">{course.quiz.questions.length} câu trắc nghiệm</span>
                    </div>
                    <button
                      onClick={() => onTakeQuizForCourse(course.id)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors"
                    >
                      Thi trắc nghiệm
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
