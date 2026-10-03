import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  UserPlus,
  BarChart2,
  Send,
  MoreVertical,
  CheckCircle,
  AlertTriangle,
  Clock,
  Shield,
  X,
  FileSpreadsheet,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { useTraining } from '../context/TrainingContext';
import { UserAccount, UserRoleType, DepartmentType } from '../types';

interface EmployeeRosterProps {
  onSelectUser: (user: UserAccount) => void;
}

export const EmployeeRoster: React.FC<EmployeeRosterProps> = ({ onSelectUser }) => {
  const {
    allUsers,
    roles,
    currentUser,
    updateUserRole,
    addNewUser,
    deleteUser,
    hasPermission,
    triggerManualReminder,
    showToast,
  } = useTraining();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<'all' | DepartmentType>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

  // Delete User Confirmation Modal State
  const [userToDelete, setUserToDelete] = useState<UserAccount | null>(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  // New user form state
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserDept, setNewUserDept] = useState<DepartmentType>('Sales');
  const [newUserRole, setNewUserRole] = useState<UserRoleType>('sales_staff');
  const [newUserPosition, setNewUserPosition] = useState('');

  // Filtering
  const filteredUsers = allUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.position.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === 'all' || user.department === selectedDept;
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) {
      showToast('Vui lòng điền đầy đủ họ tên và email', 'warning');
      return;
    }

    addNewUser({
      name: newUserName,
      email: newUserEmail,
      department: newUserDept,
      role: newUserRole,
      position: newUserPosition || (newUserDept === 'Sales' ? 'Chuyên viên Kinh doanh' : 'Kỹ sư Kỹ thuật'),
      joinDate: new Date().toISOString().split('T')[0],
      assignedTrackId: newUserDept === 'Sales' ? 'sales_track' : 'tech_track',
      completionRate: 0,
      averageScore: 0,
      completedCoursesCount: 0,
      totalAssignedCourses: 4,
      lastActive: 'Mới tạo',
      status: 'on_track',
      competencies: [
        { skill: 'Kiến thức Sản phẩm Tổng thể', score: 50 },
        { skill: 'Chiến lược Giải pháp B2B', score: 50 },
        { skill: 'Kiến trúc Hạ tầng Cloud', score: 50 },
        { skill: 'Bảo mật & Tuân thủ ISO', score: 50 },
        { skill: 'Xử lý Phản đối & Đàm phán', score: 50 },
        { skill: 'Khắc phục Sự cố Hệ thống', score: 50 },
      ],
    });

    setIsAddUserModalOpen(false);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPosition('');
  };

  const canManageRoles = hasPermission('manage_roles_permissions');
  const canDeleteUsers = hasPermission('delete_user') || currentUser.role === 'admin';
  const canExport = hasPermission('export_reports');

  return (
    <div className="space-y-6">
      {/* Page Title & Controls */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Theo Dõi Tiến Độ Đào Tạo Nhân Sự
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Bảng theo dõi thời gian thực kết quả kiểm tra trắc nghiệm, lộ trình học tập và phân quyền từng nhân sự.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {canExport && (
            <button
              onClick={() => showToast('Đã xuất báo cáo đào tạo định kỳ dạng CSV/Excel thành công.', 'success')}
              className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Xuất báo cáo</span>
            </button>
          )}

          {canManageRoles && (
            <button
              onClick={() => setIsAddUserModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-500/20 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>Thêm nhân sự mới</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên, email, vị trí..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg shrink-0">
            <button
              onClick={() => setSelectedDept('all')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                selectedDept === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả ({allUsers.length})
            </button>
            <button
              onClick={() => setSelectedDept('Sales')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                selectedDept === 'Sales'
                  ? 'bg-white text-blue-700 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Khối Sales
            </button>
            <button
              onClick={() => setSelectedDept('Technical')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                selectedDept === 'Technical'
                  ? 'bg-white text-indigo-700 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Khối Technical
            </button>
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none shrink-0"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="completed">Đã hoàn thành</option>
            <option value="on_track">Đúng lộ trình</option>
            <option value="behind">Chậm tiến độ</option>
          </select>
        </div>
      </div>

      {/* High-Density Data Grid Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Nhân sự & Chức vụ</th>
                <th className="py-3 px-4">Phòng ban</th>
                <th className="py-3 px-4">Vai trò tài khoản</th>
                <th className="py-3 px-4">Tiến độ khóa học</th>
                <th className="py-3 px-4 text-right">Điểm trắc nghiệm</th>
                <th className="py-3 px-4 text-center">Trạng thái</th>
                <th className="py-3 px-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Không tìm thấy nhân sự phù hợp với điều kiện tìm kiếm.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const roleConfig = roles.find((r) => r.id === user.role);

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Name & Avatar */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                            {user.name
                              .split(' ')
                              .slice(-2)
                              .map((w) => w[0])
                              .join('')}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                              <span>{user.name}</span>
                              {user.id === currentUser.id && (
                                <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded font-bold">
                                  Bạn
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500">{user.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="py-3 px-4">
                        <span
                          className={`font-medium ${
                            user.department === 'Sales'
                              ? 'text-blue-700'
                              : user.department === 'Technical'
                              ? 'text-indigo-700'
                              : 'text-slate-700'
                          }`}
                        >
                          {user.department}
                        </span>
                      </td>

                      {/* Role Selector / Display */}
                      <td className="py-3 px-4">
                        {canManageRoles ? (
                          <select
                            value={user.role}
                            onChange={(e) => updateUserRole(user.id, e.target.value as UserRoleType)}
                            className="text-xs bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            {roles.map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="font-medium text-slate-700">
                            {roleConfig?.name || user.role}
                          </span>
                        )}
                      </td>

                      {/* Progress Bar */}
                      <td className="py-3 px-4 min-w-[160px]">
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="font-mono font-bold text-slate-800 tabular-nums">
                            {user.completionRate}%
                          </span>
                          <span className="text-slate-400">
                            {user.completedCoursesCount}/{user.totalAssignedCourses} khóa
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              user.completionRate >= 90
                                ? 'bg-emerald-500'
                                : user.completionRate >= 50
                                ? 'bg-blue-600'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${user.completionRate}%` }}
                          />
                        </div>
                      </td>

                      {/* Quiz Average Score */}
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`font-mono font-bold tabular-nums text-sm ${
                            user.averageScore >= 80
                              ? 'text-emerald-600'
                              : user.averageScore > 0
                              ? 'text-amber-600'
                              : 'text-slate-400'
                          }`}
                        >
                          {user.averageScore > 0 ? `${user.averageScore}đ` : 'Chưa thi'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
                            user.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : user.status === 'on_track'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {user.status === 'completed' && <CheckCircle className="w-3 h-3" />}
                          {user.status === 'behind' && <AlertTriangle className="w-3 h-3" />}
                          {user.status === 'completed'
                            ? 'Hoàn thành'
                            : user.status === 'on_track'
                            ? 'Đúng hạn'
                            : 'Chậm hạn'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onSelectUser(user)}
                            className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold transition-colors"
                            title="Xem biểu đồ kỹ năng và kết quả trắc nghiệm"
                          >
                            <BarChart2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Biểu đồ</span>
                          </button>

                          <button
                            onClick={() => triggerManualReminder(user.name)}
                            className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Gửi thông báo nhắc nhở tự động"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete User Action Button */}
                          {canDeleteUsers && (
                            <button
                              onClick={() => setUserToDelete(user)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Xóa nhân sự khỏi hệ thống (Quyền Quản trị viên)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Hiển thị {filteredUsers.length} / {allUsers.length} nhân sự</span>
          <span>Dữ liệu điểm số đồng bộ trực tiếp từ hệ thống thi trắc nghiệm</span>
        </div>
      </div>

      {/* Delete User Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="p-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
                <Trash2 className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Xác Nhận Xóa Nhân Sự Khỏi Hệ Thống?
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Bạn đang chuẩn bị xóa tài khoản nhân sự:
                </p>
                <div className="mt-2.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 text-left space-y-1">
                  <div className="font-bold text-slate-900 text-sm">{userToDelete.name}</div>
                  <div className="text-slate-500 text-[11px]">{userToDelete.email}</div>
                  <div className="text-blue-700 text-[11px]">
                    Phòng ban: {userToDelete.department} · Vị trí: {userToDelete.position}
                  </div>
                </div>
                <p className="text-[11px] text-rose-600 mt-2.5 leading-relaxed">
                  Lưu ý: Hành động này sẽ xóa vĩnh viễn hồ sơ nhân sự, lịch sử làm bài thi trắc nghiệm và dữ liệu tiến độ trên Cloud Firestore.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  type="button"
                  disabled={isDeletingUser}
                  onClick={() => setUserToDelete(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  disabled={isDeletingUser}
                  onClick={async () => {
                    setIsDeletingUser(true);
                    try {
                      await deleteUser(userToDelete.id);
                      setUserToDelete(null);
                    } finally {
                      setIsDeletingUser(false);
                    }
                  }}
                  className="flex items-center gap-1.5 px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
                >
                  {isDeletingUser ? (
                    <span>Đang xóa...</span>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xác nhận xóa</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Thêm Nhân Sự Vào Lộ Trình Đào Tạo
              </h3>
              <button
                onClick={() => setIsAddUserModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Họ và tên nhân sự *
                </label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Ví dụ: Hoàng Minh Đức"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Địa chỉ Email doanh nghiệp *
                </label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="duc.hoang@company.vn"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phòng ban
                  </label>
                  <select
                    value={newUserDept}
                    onChange={(e) => {
                      const dept = e.target.value as DepartmentType;
                      setNewUserDept(dept);
                      setNewUserRole(dept === 'Sales' ? 'sales_staff' : 'tech_staff');
                    }}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Sales">Khối Sales</option>
                    <option value="Technical">Khối Technical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Vai trò hệ thống
                  </label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as UserRoleType)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Chức danh công việc
                </label>
                <input
                  type="text"
                  value={newUserPosition}
                  onChange={(e) => setNewUserPosition(e.target.value)}
                  placeholder="Ví dụ: Senior Cloud Sales Rep"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
                >
                  Lưu & Cấp quyền
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
