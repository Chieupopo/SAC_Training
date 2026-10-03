import React, { useState } from 'react';
import { TrainingProvider, useTraining } from './context/TrainingContext';
import { Navbar } from './components/Navbar';
import { DashboardOverview } from './components/DashboardOverview';
import { EmployeeRoster } from './components/EmployeeRoster';
import { CourseCatalog } from './components/CourseCatalog';
import { RolePermissionManager } from './components/RolePermissionManager';
import { AutomatedRemindersManager } from './components/AutomatedRemindersManager';
import { AccountProfilePage } from './components/AccountProfilePage';
import { LoginPage } from './components/LoginPage';
import { RoleSwitcherModal } from './components/RoleSwitcherModal';
import { IndividualPerformanceModal } from './components/IndividualPerformanceModal';
import { QuizModal } from './components/QuizModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { UserAccount, TrainingCourse } from './types';
import { CheckCircle, AlertCircle, Info, Sparkles, Shield, BookOpen, Layers } from 'lucide-react';

function MainApp() {
  const {
    currentUser,
    roles,
    courses,
    toastMessage,
    hasPermission,
    isAuthenticated,
  } = useTraining();

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isRoleSwitcherOpen, setIsRoleSwitcherOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Modal states
  const [selectedUserForDetail, setSelectedUserForDetail] = useState<UserAccount | null>(null);
  const [activeQuizCourse, setActiveQuizCourse] = useState<TrainingCourse | null>(null);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);

  const handleStartQuiz = (course: TrainingCourse) => {
    setActiveQuizCourse(course);
    setIsQuizModalOpen(true);
  };

  const currentRole = roles.find((r) => r.id === currentUser.role);

  // If not authenticated, display the Technical team Login Page
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 font-sans selection:bg-blue-600 selection:text-white">
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
            <div
              className={`px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2.5 backdrop-blur-md ${
                toastMessage.type === 'success'
                  ? 'bg-emerald-900/90 text-white border-emerald-700'
                  : toastMessage.type === 'warning'
                  ? 'bg-amber-900/90 text-white border-amber-700'
                  : 'bg-slate-900/90 text-white border-slate-700'
              }`}
            >
              {toastMessage.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />}
              {toastMessage.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />}
              {toastMessage.type === 'info' && <Info className="w-4 h-4 text-sky-400 shrink-0" />}
              <span>{toastMessage.text}</span>
            </div>
          </div>
        )}
        <LoginPage />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div
            className={`px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2.5 backdrop-blur-md ${
              toastMessage.type === 'success'
                ? 'bg-emerald-900/90 text-white border-emerald-700'
                : toastMessage.type === 'warning'
                ? 'bg-amber-900/90 text-white border-amber-700'
                : 'bg-slate-900/90 text-white border-slate-700'
            }`}
          >
            {toastMessage.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />}
            {toastMessage.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />}
            {toastMessage.type === 'info' && <Info className="w-4 h-4 text-sky-400 shrink-0" />}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Top Bar Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
      />

      {/* Main Viewport Content */}
      <main className="grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <DashboardOverview
            onSelectUser={(u) => setSelectedUserForDetail(u)}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onTakeQuizForCourse={(courseId) => {
              const target = courses.find((c) => c.id === courseId);
              if (target) handleStartQuiz(target);
            }}
          />
        )}

        {activeTab === 'courses' && (
          <CourseCatalog onStartQuiz={handleStartQuiz} />
        )}

        {activeTab === 'roster' && (
          <EmployeeRoster onSelectUser={(u) => setSelectedUserForDetail(u)} />
        )}

        {activeTab === 'reminders' && <AutomatedRemindersManager />}

        {activeTab === 'roles' && <RolePermissionManager />}

        {activeTab === 'account' && (
          <AccountProfilePage onNavigateTab={(tab) => setActiveTab(tab)} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
              S
            </div>
            <span className="font-bold text-slate-800">SAC Training Platform</span>
            <span>—</span>
            <span>Hệ thống đào tạo sản phẩm & phân quyền vai trò doanh nghiệp</span>
          </div>
          <div>Bảo mật chuẩn RBAC · Tự động hóa lộ trình Sales & Technical</div>
        </div>
      </footer>

      {/* Role Switcher Modal */}
      <RoleSwitcherModal
        isOpen={isRoleSwitcherOpen}
        onClose={() => setIsRoleSwitcherOpen(false)}
      />

      {/* Individual Performance Modal */}
      <IndividualPerformanceModal
        user={selectedUserForDetail}
        onClose={() => setSelectedUserForDetail(null)}
        onOpenQuizForCourse={(courseId) => {
          const course = courses.find((c) => c.id === courseId);
          if (course) handleStartQuiz(course);
        }}
      />

      {/* Quiz Modal */}
      <QuizModal
        course={activeQuizCourse}
        isOpen={isQuizModalOpen}
        onClose={() => setIsQuizModalOpen(false)}
      />

      {/* Notification Drawer */}
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onNavigateTab={(tab) => setActiveTab(tab)}
      />
    </div>
  );
}

export default function App() {
  return (
    <TrainingProvider>
      <MainApp />
    </TrainingProvider>
  );
}
