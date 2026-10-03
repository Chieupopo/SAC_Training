import React, { useState } from 'react';
import {
  Shield,
  Check,
  X,
  AlertCircle,
  Users,
  Lock,
  Unlock,
  Key,
  Info,
  Save,
  RotateCcw,
} from 'lucide-react';
import { useTraining } from '../context/TrainingContext';
import { PERMISSION_DEFINITIONS } from '../data/mockData';
import { UserRoleType, PermissionKey } from '../types';

export const RolePermissionManager: React.FC = () => {
  const { roles, updateRolePermissions, allUsers, updateUserRole, showToast } = useTraining();
  const [selectedRoleForDetail, setSelectedRoleForDetail] = useState<UserRoleType>('sales_manager');

  const handleTogglePermission = (roleId: UserRoleType, permKey: PermissionKey) => {
    const roleConfig = roles.find((r) => r.id === roleId);
    if (!roleConfig) return;

    if (roleId === 'admin' && permKey === 'manage_roles_permissions') {
      showToast('Không thể tước quyền quản trị tối cao của Super Admin!', 'warning');
      return;
    }

    const currentPerms = roleConfig.permissions;
    const hasPerm = currentPerms.includes(permKey);

    const newPerms = hasPerm
      ? currentPerms.filter((p) => p !== permKey)
      : [...currentPerms, permKey];

    updateRolePermissions(roleId, newPerms);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Quản Trị Hệ Thống (RBAC Security)
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Phân Quyền Truy Cập & Quản Lý Vai Trò Tài Khoản
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Thiết lập ma trận quyền hạn chi tiết cho từng cấp bậc: Quản lý (Manager), Chuyên viên (Staff) và Quản trị viên (Admin).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Tự động cập nhật tức thì khi bật/tắt quyền</span>
          </div>
        </div>
      </div>

      {/* Role Cards Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {roles.map((r) => {
          const usersInRole = allUsers.filter((u) => u.role === r.id);
          const isSelected = selectedRoleForDetail === r.id;

          return (
            <div
              key={r.id}
              onClick={() => setSelectedRoleForDetail(r.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/30 ring-2 ring-blue-600/20 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold font-mono text-slate-500 uppercase">
                    {r.title}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                    <Users className="w-3 h-3" />
                    <span>{usersInRole.length} người</span>
                  </div>
                </div>
                <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-1">
                  {r.name.split('(')[0]}
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {r.description}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="font-semibold text-blue-700">
                  {r.permissions.length} / {PERMISSION_DEFINITIONS.length} quyền
                </span>
                <span className="text-slate-400">
                  {isSelected ? 'Đang xem' : 'Chi tiết'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Granular Permission Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Ma Trận Phân Quyền Chi Tiết (Granular Access Control Matrix)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Nhấp vào công tắc bất kỳ để cấp hoặc thu hồi quyền truy cập tức thời cho nhóm vai trò.
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {PERMISSION_DEFINITIONS.length} Quyền × {roles.length} Vai trò
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3.5 px-4 min-w-[260px]">Chức Năng & Quyền Hạn</th>
                <th className="py-3.5 px-3 text-center">Super Admin</th>
                <th className="py-3.5 px-3 text-center">Sales Manager</th>
                <th className="py-3.5 px-3 text-center">Tech Manager</th>
                <th className="py-3.5 px-3 text-center">Sales Staff</th>
                <th className="py-3.5 px-3 text-center">Tech Staff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {PERMISSION_DEFINITIONS.map((perm) => (
                <tr key={perm.key} className="hover:bg-slate-50/70 transition-colors">
                  {/* Permission Name & Details */}
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{perm.label}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{perm.description}</div>
                    <span className="inline-block mt-1 text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded font-medium">
                      {perm.category}
                    </span>
                  </td>

                  {/* Toggles for each role */}
                  {roles.map((r) => {
                    const hasPerm = r.permissions.includes(perm.key);
                    const isAdminLocked = r.id === 'admin' && perm.key === 'manage_roles_permissions';

                    return (
                      <td key={r.id} className="py-3 px-3 text-center">
                        <button
                          disabled={isAdminLocked}
                          onClick={() => handleTogglePermission(r.id, perm.key)}
                          className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all ${
                            hasPerm
                              ? 'bg-blue-600 text-white shadow-2xs hover:bg-blue-700'
                              : 'bg-slate-100 text-slate-300 hover:bg-slate-200 hover:text-slate-500'
                          } ${isAdminLocked ? 'opacity-80 cursor-not-allowed' : 'cursor-pointer'}`}
                          title={`${hasPerm ? 'Đang được cấp quyền' : 'Không có quyền'} (Nhấp để đổi)`}
                        >
                          {hasPerm ? <Check className="w-4 h-4 stroke-[2.5]" /> : <X className="w-3.5 h-3.5" />}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span>Biểu tượng xanh: Được phép thao tác</span>
            <span className="text-slate-300">|</span>
            <span className="w-2 h-2 rounded-full bg-slate-300" />
            <span>Biểu tượng xám: Bị hạn chế quyền</span>
          </div>
          <span>Mô hình tuân thủ nguyên tắc đặc quyền tối thiểu (Least Privilege).</span>
        </div>
      </div>

      {/* User Reassignment Quick Table */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Danh Sách Tài Khoản & Gán Vai Trò Nhanh
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Phân bổ lại chức vụ và quyền hạn trực tiếp cho từng nhân sự trong công ty
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {allUsers.map((user) => (
            <div
              key={user.id}
              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {user.name
                    .split(' ')
                    .slice(-2)
                    .map((w) => w[0])
                    .join('')}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">{user.name}</div>
                  <div className="text-[11px] text-slate-500 truncate">{user.department}</div>
                </div>
              </div>

              <select
                value={user.role}
                onChange={(e) => updateUserRole(user.id, e.target.value as UserRoleType)}
                className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1 font-semibold text-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 shrink-0"
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
