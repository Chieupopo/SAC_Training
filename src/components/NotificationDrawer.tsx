import React from 'react';
import {
  X,
  Bell,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Award,
  Layers,
  Check,
} from 'lucide-react';
import { useTraining } from '../context/TrainingContext';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
}) => {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useTraining();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Trung Tâm Thông Báo</h3>
            <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
              {notifications.filter((n) => !n.read).length} mới
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={markAllNotificationsAsRead}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              title="Đánh dấu tất cả đã đọc"
            >
              Đã đọc tất cả
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="grow overflow-y-auto divide-y divide-slate-100 p-2">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              Hiện không có thông báo mới nào.
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => {
                  markNotificationAsRead(notif.id);
                  if (notif.linkTab) {
                    onNavigateTab(notif.linkTab);
                    onClose();
                  }
                }}
                className={`p-4 rounded-xl transition-all cursor-pointer ${
                  notif.read ? 'bg-white opacity-70 hover:opacity-100' : 'bg-blue-50/40 hover:bg-blue-50/70'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    {notif.type === 'deadline' && (
                      <Clock className="w-4 h-4 text-amber-500" />
                    )}
                    {notif.type === 'quiz_passed' && (
                      <Award className="w-4 h-4 text-emerald-600" />
                    )}
                    {notif.type === 'reminder' && (
                      <AlertTriangle className="w-4 h-4 text-rose-500" />
                    )}
                    {notif.type === 'system' && (
                      <Layers className="w-4 h-4 text-blue-600" />
                    )}
                  </div>

                  <div className="grow">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-900 leading-snug">
                        {notif.title}
                      </h4>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {notif.message}
                    </p>
                    <div className="text-[10px] text-slate-400 mt-2 font-mono">
                      {notif.createdAt}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 text-xs text-slate-500 text-center">
          Thông báo nhắc nhở tự động được đồng bộ với tiến độ cá nhân của bạn.
        </div>
      </div>
    </div>
  );
};
