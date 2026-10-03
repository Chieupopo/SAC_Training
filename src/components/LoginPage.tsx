import React, { useState } from 'react';
import {
  Layers,
  Shield,
  Lock,
  Mail,
  Eye,
  EyeOff,
  CheckCircle2,
  Terminal,
  Cpu,
  Server,
  Cloud,
  ArrowRight,
  LogIn,
  Key,
  Users,
  Award,
  Sparkles,
} from 'lucide-react';
import { useTraining } from '../context/TrainingContext';

export const LoginPage: React.FC = () => {
  const { allUsers, loginAsUser, loginWithGoogle, roles } = useTraining();

  const [selectedUserId, setSelectedUserId] = useState<string>('user_3'); // Default to Lê Hoàng Nam (Tech Manager)
  const [emailInput, setEmailInput] = useState<string>('nam.le@enterprise.vn');
  const [passwordInput, setPasswordInput] = useState<string>('techteam2026');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Technical team members list
  const techUsers = allUsers.filter(
    (u) => u.department === 'Technical' || u.role === 'admin' || u.role === 'tech_manager' || u.role === 'tech_staff'
  );

  const handleSelectAccount = (userId: string) => {
    setSelectedUserId(userId);
    const u = allUsers.find((user) => user.id === userId);
    if (u) {
      setEmailInput(u.email);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      // Find matching user by email or fallback to selected
      const found = allUsers.find((u) => u.email.toLowerCase() === emailInput.trim().toLowerCase());
      loginAsUser(found ? found.id : selectedUserId);
      setIsSubmitting(false);
    }, 300);
  };

  const handleQuickLogin = (userId: string) => {
    loginAsUser(userId);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 font-sans selection:bg-blue-600 selection:text-white relative overflow-hidden">
      {/* Background Decorative Tech Grid & Glows */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative z-10">
        {/* Left Column: Brand & Technical Team Presentation */}
        <div className="lg:col-span-6 p-8 sm:p-10 flex flex-col justify-between bg-linear-to-br from-slate-900 via-slate-900 to-slate-950 border-b lg:border-b-0 lg:border-r border-slate-800">
          <div>
            {/* Logo & Portal Badge */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  SAC <span className="text-blue-500">Training</span>
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 font-mono">
                    Technical team
                  </span>
                  <span className="text-[11px] text-slate-400">Portal v2.6</span>
                </div>
              </div>
            </div>

            {/* Headline */}
            <div className="mt-8 space-y-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                Cổng Đào Tạo & Quản Trị Hệ Thống <br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 via-sky-300 to-indigo-300">
                  (Technical team)
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Nền tảng đào tạo chuyên sâu kiến trúc Cloud phân tán, Kubernetes Microservices, tiêu chuẩn bảo mật SLA và thi trắc nghiệm cấp chứng nhận nội bộ.
              </p>
            </div>

            {/* Technical Team Highlights */}
            <div className="mt-8 space-y-3.5">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-xs">
                <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Terminal className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-200">Kiến Trúc & Giải Pháp Kỹ Thuật</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    Học phần hạ tầng High Availability, Service Mesh Istio, Docker & K8s Cluster.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-xs">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Server className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-200">Học Theo Video Bài Giảng Trực Quan</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    Nhúng video YouTube bài giảng sắc nét, slide tài liệu kỹ thuật chuẩn hóa.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-xs">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-200">Đánh Giá & Phân Quyền Bảo Mật RBAC</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    Kiểm tra trắc nghiệm chuẩn hóa 80% đạt chuẩn và cấp chứng nhận năng lực kỹ thuật.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Security Assurance */}
          <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between text-slate-500 text-xs">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              Bảo mật phân quyền RBAC
            </span>
            <span className="flex items-center gap-1.5">
              <Cloud className="w-3.5 h-3.5 text-sky-400" />
              Cơ sở dữ liệu Cloud Firestore
            </span>
          </div>
        </div>

        {/* Right Column: Login Form & Quick Access */}
        <div className="lg:col-span-6 p-8 sm:p-10 bg-slate-900/90 flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-blue-400 uppercase tracking-wider font-mono">
                  Technical team · Đăng Nhập
                </div>
                <h2 className="text-xl font-bold text-white mt-1">
                  Xác Thực Tài Khoản
                </h2>
              </div>
              <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
            </div>

            {/* Google Sign In Quick Button */}
            <div className="mt-6">
              <button
                type="button"
                onClick={loginWithGoogle}
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-900 rounded-xl text-xs font-bold transition-all shadow-md active:scale-98"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Đăng nhập với Google</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <span className="relative px-3 bg-slate-900 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                hoặc tài khoản nội bộ
              </span>
            </div>

            {/* Email & Password Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email tài khoản Technical team
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="nam.le@enterprise.vn"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Mật khẩu truy cập
                  </label>
                  <span className="text-[11px] text-blue-400 cursor-pointer hover:underline">
                    Quên mật khẩu?
                  </span>
                </div>
                <div className="relative">
                  <Key className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-400">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                  />
                  <span>Ghi nhớ phiên làm việc Technical team</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/30 active:scale-98 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Đang xác thực...</span>
                ) : (
                  <>
                    <span>Đăng nhập vào Technical team</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick 1-Click Access for Reviewers & Technical Team Members */}
            <div className="mt-6 pt-5 border-t border-slate-800">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                <span>Chọn nhanh tài khoản Technical team:</span>
                <span className="text-[10px] text-blue-400">1-click truy cập</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {techUsers.slice(0, 4).map((user) => {
                  const roleObj = roles.find((r) => r.id === user.role);
                  const isCurrentSelected = user.id === selectedUserId;

                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => {
                        handleSelectAccount(user.id);
                        handleQuickLogin(user.id);
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        isCurrentSelected
                          ? 'bg-blue-500/15 border-blue-500 text-white ring-1 ring-blue-500'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="text-xs font-bold truncate text-slate-200">{user.name}</div>
                      <div className="text-[10px] text-blue-400 truncate mt-0.5 font-medium">
                        {roleObj?.title || user.position}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 text-center text-[11px] text-slate-500">
            Hệ thống đào tạo nội bộ SAC Training · Xác thực bảo mật cổng Technical team
          </div>
        </div>
      </div>
    </div>
  );
};
