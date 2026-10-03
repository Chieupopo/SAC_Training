import React, { useState } from 'react';
import {
  User,
  Shield,
  LogOut,
  LogIn,
  CheckCircle2,
  Mail,
  Building,
  Briefcase,
  Calendar,
  Award,
  Key,
  Check,
  ChevronRight,
  Sparkles,
  Cloud,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useTraining } from '../context/TrainingContext';
import { PERMISSION_DEFINITIONS } from '../data/mockData';
import { UserRoleType } from '../types';

interface AccountProfilePageProps {
  onNavigateTab: (tab: string) => void;
}

export const AccountProfilePage: React.FC<AccountProfilePageProps> = ({ onNavigateTab }) => {
  const {
    currentUser,
    allUsers,
    roles,
    switchUser,
    firebaseUser,
    loginWithGoogle,
    logout,
    showToast,
  } = useTraining();

  const currentRole = roles.find((r) => r.id === currentUser.role);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            Hồ Sơ Cá Nhân & Quản Trị Phiên Làm Việc
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            Trung Tâm Tài Khoản & Phân Quyền
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Quản lý thông tin tài khoản đang đăng nhập, chuyển đổi vai trò kiểm tra hệ thống và xác thực Google.
          </p>
        </div>

        {/* Google Auth Status / Actions */}
        <div className="flex items-center gap-3">
          {firebaseUser ? (
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors shadow-2xs"
            >
              <LogOut className="w-4 h-4" />
              <span>Đăng xuất tài khoản ({firebaseUser.displayName?.split(' ')[0] || 'Google'})</span>
            </button>
          ) : (
            <button
              onClick={loginWithGoogle}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-500/20 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span>Đăng nhập với Google</span>
            </button>
          )}
        </div>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-blue-600/20 shrink-0">
              {currentUser.name
                .split(' ')
                .slice(-2)
                .map((w) => w[0])
                .join('')}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold text-slate-900">{currentUser.name}</h3>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${currentRole?.badgeColor || 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                  {currentRole?.title || currentUser.role}
                </span>
                <span className="text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Tài khoản hoạt động
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1.5">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {currentUser.email}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  Phòng ban {currentUser.department}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  {currentUser.position}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center min-w-[100px]">
              <div className="text-lg font-bold text-slate-900 font-mono">
                {currentUser.completionRate}%
              </div>
              <div className="text-[11px] text-slate-500">Tiến độ đào tạo</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center min-w-[100px]">
              <div className="text-lg font-bold text-emerald-600 font-mono">
                {currentUser.averageScore}đ
              </div>
              <div className="text-[11px] text-slate-500">Điểm thi TB</div>
            </div>
          </div>
        </div>

        {/* Google Authentication Box */}
        <div className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
              <Cloud className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">
                {firebaseUser ? 'Tài khoản Google đang kết nối' : 'Chưa đăng nhập tài khoản Google'}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {firebaseUser
                  ? `Đang liên kết với: ${firebaseUser.email} (Dữ liệu bảo mật đồng bộ Firestore)`
                  : 'Bạn có thể đăng nhập bằng tài khoản Google thật để đồng bộ bài học và chứng chỉ.'}
              </div>
            </div>
          </div>

          {firebaseUser ? (
            <button
              onClick={logout}
              className="px-4 py-2 border border-slate-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-slate-700 rounded-xl text-xs font-bold transition-colors whitespace-nowrap"
            >
              Đăng xuất Google
            </button>
          ) : (
            <button
              onClick={loginWithGoogle}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-colors whitespace-nowrap"
            >
              Đăng nhập tài khoản Google
            </button>
          )}
        </div>
      </div>

      {/* Role Switcher & Permission Inspector Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" />
              <h3 className="text-base font-bold text-slate-900">
                Chuyển Đổi Quyền & Vai Trò (Role Switcher)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Chọn nhân sự hoặc vai trò bên dưới để mô phỏng góc nhìn của từng cấp bậc trong doanh nghiệp.
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('roles')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Cấu hình chi tiết ma trận quyền (RBAC)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* User / Role Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {allUsers.map((user) => {
            const isSelected = user.id === currentUser.id;
            const userRole = roles.find((r) => r.id === user.role);

            return (
              <div
                key={user.id}
                onClick={() => {
                  switchUser(user.id);
                  showToast(`Đã chuyển đổi sang tài khoản: ${user.name} (${userRole?.name})`, 'success');
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-600/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50/70'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold font-mono text-slate-500 uppercase">
                      {userRole?.title || user.role}
                    </span>
                    {isSelected && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                        <Check className="w-3 h-3" /> Đang dùng
                      </span>
                    )}
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{user.name}</h4>
                  <div className="text-[11px] text-slate-500 mt-0.5">{user.email}</div>
                  <div className="text-[11px] text-blue-600 font-medium mt-1">
                    {user.department} · {user.position}
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{userRole?.permissions.length || 0} quyền hạn</span>
                  <span className="font-semibold text-slate-700">{user.completionRate}% hoàn thành</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Current Active Permissions List */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
            Quyền Hạn Đang Có Của Vai Trò [{currentRole?.name}] ({currentRole?.permissions.length || 0} quyền):
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {PERMISSION_DEFINITIONS.map((perm) => {
              const hasThisPerm = currentRole?.permissions.includes(perm.key);
              return (
                <div
                  key={perm.key}
                  className={`p-2.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                    hasThisPerm
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950 font-medium'
                      : 'bg-slate-50/50 border-slate-200 text-slate-400 opacity-60'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    hasThisPerm ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {hasThisPerm ? <Check className="w-3 h-3" /> : <Key className="w-2.5 h-2.5" />}
                  </div>
                  <div>
                    <div className="font-semibold">{perm.label}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5 leading-snug">{perm.description}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
