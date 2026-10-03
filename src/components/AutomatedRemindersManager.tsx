import React, { useState } from 'react';
import {
  Bell,
  Clock,
  Send,
  Mail,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  Settings,
  Plus,
  Play,
  RotateCw,
  Sparkles,
} from 'lucide-react';
import { useTraining } from '../context/TrainingContext';
import { ReminderRule } from '../types';

export const AutomatedRemindersManager: React.FC = () => {
  const {
    reminderRules,
    toggleReminderRule,
    triggerManualReminder,
    allUsers,
    showToast,
  } = useTraining();

  const [activeTab, setActiveTab] = useState<'rules' | 'history'>('rules');
  const [isProcessing, setIsProcessing] = useState(false);

  const behindUsers = allUsers.filter((u) => u.status === 'behind' || u.completionRate < 60);

  const handleManualRun = () => {
    setIsProcessing(true);
    setTimeout(() => {
      triggerManualReminder();
      setIsProcessing(false);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Hệ Thống Tự Động Hóa (Automation Engine)
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Hệ Thống Nhắc Nhở Lộ Trình Học Tập Tự Động
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Thiết lập các quy tắc thông báo tự động đôn đốc nhân viên hoàn thành khóa học, bài thi trắc nghiệm và báo cáo lên cấp quản lý.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            disabled={isProcessing}
            onClick={handleManualRun}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-500/20 transition-all disabled:opacity-50 whitespace-nowrap"
          >
            <Send className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
            <span>{isProcessing ? 'Đang gửi thông báo...' : 'Chạy kiểm tra & Gửi nhắc nhở ngay'}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Quy tắc đang kích hoạt</div>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-mono tabular-nums">
            {reminderRules.filter((r) => r.isActive).length} / {reminderRules.length}
          </div>
          <div className="text-[11px] text-emerald-600 mt-2 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Chạy tự động định kỳ vào 08:00 hàng ngày
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Đối tượng cần đôn đốc khẩn</div>
          <div className="text-2xl font-bold text-amber-600 mt-1 font-mono tabular-nums">
            {behindUsers.length} nhân sự
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            Có bài kiểm tra quá hạn hoặc điểm số dưới chuẩn 80%
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Kênh gửi thông báo</div>
          <div className="text-sm font-bold text-slate-900 mt-2 flex items-center gap-3">
            <span className="flex items-center gap-1 text-blue-600">
              <Bell className="w-4 h-4" /> In-App
            </span>
            <span className="flex items-center gap-1 text-slate-700">
              <Mail className="w-4 h-4" /> Email
            </span>
            <span className="flex items-center gap-1 text-indigo-600">
              <MessageSquare className="w-4 h-4" /> Slack
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2">Đã kết nối Webhook nội bộ</div>
        </div>
      </div>

      {/* Rules List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Các Quy Tắc Nhắc Nhở Tự Động Theo Lộ Trình
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Hệ thống quét hạn chót khóa học và tự động gửi thông báo theo các điều kiện sau:
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {reminderRules.map((rule) => (
            <div
              key={rule.id}
              className="p-5 hover:bg-slate-50/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      rule.isActive ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                  />
                  <h4 className="text-sm font-bold text-slate-900">{rule.title}</h4>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    Áp dụng: {rule.targetDepartment === 'all' ? 'Toàn công ty' : rule.targetDepartment}
                  </span>
                </div>

                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 font-mono">
                  &quot;{rule.messageTemplate}&quot;
                </p>

                <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                  <span>Tần suất: {rule.frequency === 'daily' ? 'Hàng ngày' : 'Một lần'}</span>
                  <span>·</span>
                  <div className="flex items-center gap-2">
                    <span>Kênh:</span>
                    {rule.channels.inApp && (
                      <span className="text-blue-600 font-semibold">In-App</span>
                    )}
                    {rule.channels.email && (
                      <span className="text-slate-700 font-semibold">Email</span>
                    )}
                    {rule.channels.slack && (
                      <span className="text-indigo-600 font-semibold">Slack</span>
                    )}
                  </div>
                  <span>·</span>
                  <span>Chạy gần nhất: {rule.lastTriggered || 'Chưa chạy'}</span>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                <button
                  onClick={() => toggleReminderRule(rule.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    rule.isActive
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {rule.isActive ? 'Đang kích hoạt' : 'Đã tạm dừng'}
                </button>

                <button
                  onClick={() => {
                    triggerManualReminder(rule.title);
                  }}
                  className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold border border-blue-200 transition-colors"
                >
                  Thử nghiệm gửi
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Hệ thống thông báo nhắc nhở tuân thủ múi giờ công ty GMT+7</span>
          <span>Tự động tạm dừng gửi nếu nhân viên đã hoàn thành và đạt bài thi</span>
        </div>
      </div>
    </div>
  );
};
