import React from 'react';
import {
  Bell,
  Shield,
  Layers,
  BookOpen,
  BarChart3,
  Users,
  Clock,
  Cloud,
  UserCheck,
} from 'lucide-react';
import { useTraining } from '../context/TrainingContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenNotifications: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenNotifications,
}) => {
  const {
    currentUser,
    roles,
    notifications,
    hasPermission,
    firebaseUser,
  } = useTraining();

  const unreadCount = notifications.filter((n) => !n.read).length;
  const currentRoleConfig = roles.find((r) => r.id === currentUser.role);

  const navItems = [
    { id: 'dashboard', label: 'Bảng điều khiển', icon: BarChart3, show: true },
    { id: 'courses', label: 'Khóa học', icon: BookOpen, show: true },
    {
      id: 'roster',
      label: 'Nhân sự',
      icon: Users,
      show: hasPermission('view_team_analytics') || hasPermission('view_personal_analytics'),
    },
    {
      id: 'reminders',
      label: 'Nhắc nhở',
      icon: Clock,
      show: hasPermission('manage_reminders'),
    },
    {
      id: 'roles',
      label: 'Phân quyền',
      icon: Shield,
      show: hasPermission('manage_roles_permissions'),
    },
    {
      id: 'account',
      label: 'Tài khoản',
      icon: UserCheck,
      show: true,
    },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-6">
          {/* Zone 1: Wordmark Brand Title (Preserved from shrinking) */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 text-left group focus:outline-none shrink-0"
              title="Về Bảng điều khiển SAC Training"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/30 group-hover:bg-blue-700 transition-colors shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div className="whitespace-nowrap flex items-center gap-2">
                <span className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 font-sans">
                  SAC <span className="text-blue-600">Training</span>
                </span>
                <span className="hidden xl:inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  <Cloud className="w-3 h-3" /> Cloud
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links (Clean, streamlined, and fit neatly on one line) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 shrink-0">
            {navItems
              .filter((item) => item.show)
              .map((item) => {
                const isActive = activeTab === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs xl:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
          </nav>

          {/* Zone 3: Compact Right Actions (Notification + User Profile trigger) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors focus:outline-none"
              aria-label="Thông báo"
              title="Thông báo hệ thống"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* User Profile Button: Navigates directly to Account tab */}
            <button
              onClick={() => setActiveTab('account')}
              className={`flex items-center gap-2.5 pl-2.5 pr-3 py-1.5 rounded-xl border transition-all ${
                activeTab === 'account'
                  ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
              }`}
              title="Nhấn để xem trang Tài khoản, chuyển đổi quyền hoặc đăng xuất"
            >
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-2xs shrink-0">
                {currentUser.name
                  .split(' ')
                  .slice(-2)
                  .map((w) => w[0])
                  .join('')}
              </div>

              <div className="hidden sm:block text-left leading-tight">
                <div className="text-xs font-bold text-slate-900 truncate max-w-[110px] xl:max-w-[140px]">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-slate-500 truncate max-w-[110px] xl:max-w-[140px]">
                  {currentRoleConfig?.title || currentUser.role}
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile & Medium Screen Horizontal Nav Tabs */}
        <div className="lg:hidden flex items-center gap-1 py-2 overflow-x-auto border-t border-slate-100 scrollbar-none">
          {navItems
            .filter((item) => item.show)
            .map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
        </div>
      </div>
    </header>
  );
};
