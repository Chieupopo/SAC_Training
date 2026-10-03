import React from 'react';
import { X, Check, Shield, User, Key, ArrowRight } from 'lucide-react';
import { useTraining } from '../context/TrainingContext';
import { PERMISSION_DEFINITIONS } from '../data/mockData';

interface RoleSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RoleSwitcherModal: React.FC<RoleSwitcherModalProps> = ({ isOpen, onClose }) => {
  const { allUsers, currentUser, switchUser, roles } = useTraining();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Mô Phỏng & Đổi Vai Trò Tài Khoản
              </h2>
              <p className="text-xs text-slate-500">
                Chọn tài khoản bên dưới để kiểm tra giao diện và phân quyền tương ứng
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content: List of Users & their Roles */}
        <div className="p-6 space-y-3 max-h-[75vh] overflow-y-auto">
          {allUsers.map((user) => {
            const isCurrent = user.id === currentUser.id;
            const roleConfig = roles.find((r) => r.id === user.role);

            return (
              <div
                key={user.id}
                onClick={() => {
                  switchUser(user.id);
                  onClose();
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isCurrent
                    ? 'border-blue-500 bg-blue-50/40 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50/60'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                      isCurrent ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {user.name
                      .split(' ')
                      .slice(-2)
                      .map((w) => w[0])
                      .join('')}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 text-sm">{user.name}</span>
                      {isCurrent && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                          <Check className="w-3 h-3" /> Đang dùng
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {user.position} · <span className="font-medium text-slate-700">{user.department}</span>
                    </div>

                    <div className="mt-2 text-xs text-slate-600 flex items-center gap-1.5 flex-wrap">
                      <span className="font-medium text-blue-700 bg-white border border-blue-200 px-2 py-0.5 rounded text-[11px]">
                        {roleConfig?.name || user.role}
                      </span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-500 text-[11px]">
                        {roleConfig?.permissions.length || 0} quyền được cấp
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <div className="text-left md:text-right text-xs">
                    <div className="text-slate-400 text-[11px]">Tiến độ học tập</div>
                    <div className="font-bold text-slate-900 font-mono tabular-nums">
                      {user.completionRate}% · {user.averageScore}đ
                    </div>
                  </div>
                  <button
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                      isCurrent
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-blue-600 hover:text-white'
                    }`}
                  >
                    <span>{isCurrent ? 'Đang chọn' : 'Đổi sang'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
          <span>Hệ thống áp dụng phân quyền tự động theo Role-Based Access Control (RBAC).</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 font-medium text-xs transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
