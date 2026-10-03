export type UserRoleType = 'admin' | 'sales_manager' | 'tech_manager' | 'sales_staff' | 'tech_staff';

export type DepartmentType = 'Sales' | 'Technical' | 'Ban Giám Đốc';

export type PermissionKey =
  | 'view_catalog'
  | 'take_quiz'
  | 'manage_courses'
  | 'delete_course'
  | 'delete_user'
  | 'assign_roadmaps'
  | 'view_personal_analytics'
  | 'view_team_analytics'
  | 'manage_reminders'
  | 'manage_roles_permissions'
  | 'export_reports';

export interface PermissionDefinition {
  key: PermissionKey;
  label: string;
  description: string;
  category: 'Đào tạo' | 'Báo cáo & Phân tích' | 'Quản trị hệ thống';
}

export interface RoleConfig {
  id: UserRoleType;
  name: string;
  title: string;
  badgeColor: string;
  description: string;
  permissions: PermissionKey[];
  isSystem?: boolean;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRoleType;
  department: DepartmentType;
  avatarUrl?: string;
  position: string;
  joinDate: string;
  assignedTrackId: 'sales_track' | 'tech_track' | 'both';
  completionRate: number; // 0 - 100
  averageScore: number; // 0 - 100
  completedCoursesCount: number;
  totalAssignedCourses: number;
  lastActive: string;
  status: 'active' | 'on_track' | 'behind' | 'completed';
  competencies: {
    skill: string;
    score: number; // 0 - 100
  }[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // index 0-3
  explanation: string;
}

export interface CourseQuiz {
  id: string;
  courseId: string;
  title: string;
  passScorePercentage: number;
  durationMinutes: number;
  questions: QuizQuestion[];
}

export interface CourseLesson {
  id: string;
  title: string;
  duration: string;
  type: 'video' | 'document' | 'interactive' | 'spec' | 'pdf';
  keyPoints: string[];
  pdfUrl?: string;
}

export interface TrainingCourse {
  id: string;
  code: string;
  title: string;
  category: 'Sales' | 'Technical';
  level: 'Cơ bản' | 'Nâng cao' | 'Chuyên sâu';
  estimatedHours: number;
  description: string;
  objectives: string[];
  icon: string;
  contentType?: 'video' | 'pdf' | 'both';
  youtubeUrl?: string;
  videoDuration?: string;
  pdfSlideUrl?: string;
  pdfSlideName?: string;
  pdfSlidePagesCount?: number;
  lessons: CourseLesson[];
  quiz: CourseQuiz;
  prerequisites?: string[];
}

export interface CourseProgressRecord {
  courseId: string;
  userId: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'failed';
  progressPercentage: number;
  quizScore?: number;
  quizPassed?: boolean;
  attemptsCount: number;
  completedAt?: string;
  dueDate: string;
}

export interface ReminderRule {
  id: string;
  title: string;
  triggerDaysBeforeDue: number; // e.g. 3 days before
  frequency: 'daily' | 'once' | 'weekly';
  channels: {
    inApp: boolean;
    email: boolean;
    slack: boolean;
  };
  isActive: boolean;
  targetDepartment: 'all' | 'Sales' | 'Technical';
  messageTemplate: string;
  lastTriggered?: string;
}

export interface InAppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'reminder' | 'deadline' | 'quiz_passed' | 'course_assigned' | 'system';
  createdAt: string;
  read: boolean;
  linkTab?: string;
  courseId?: string;
}
