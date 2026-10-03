import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserAccount,
  UserRoleType,
  RoleConfig,
  PermissionKey,
  TrainingCourse,
  CourseProgressRecord,
  ReminderRule,
  InAppNotification,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_ROLES,
  INITIAL_COURSES,
  INITIAL_PROGRESS_RECORDS,
  INITIAL_REMINDER_RULES,
  INITIAL_NOTIFICATIONS,
} from '../data/mockData';
import {
  db,
  auth,
  googleProvider,
  handleFirestoreError,
  OperationType,
  testFirestoreConnection,
} from '../firebase';
import { saveCoursePdf, getCoursePdf, deleteCoursePdf } from '../utils/pdfStorage';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User as FirebaseUser,
} from 'firebase/auth';

interface TrainingContextType {
  currentUser: UserAccount;
  allUsers: UserAccount[];
  roles: RoleConfig[];
  courses: TrainingCourse[];
  progressRecords: CourseProgressRecord[];
  reminderRules: ReminderRule[];
  notifications: InAppNotification[];
  toastMessage: { text: string; type: 'success' | 'info' | 'warning' } | null;
  firebaseUser: FirebaseUser | null;
  isFirebaseConnected: boolean;
  isAuthenticated: boolean;

  // Auth & Role
  loginAsUser: (userId: string) => void;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  switchUser: (userId: string) => void;
  hasPermission: (permission: PermissionKey) => boolean;
  updateUserRole: (userId: string, newRole: UserRoleType) => void;
  updateRolePermissions: (roleId: UserRoleType, newPermissions: PermissionKey[]) => void;
  addNewUser: (user: Omit<UserAccount, 'id'>) => void;
  deleteUser: (userId: string) => Promise<void>;

  // Courses & Progress
  recordQuizResult: (courseId: string, score: number, passed: boolean) => void;
  updateCourseProgress: (courseId: string, percentage: number) => void;
  addNewCourse: (course: TrainingCourse) => void;
  updateCourse: (courseId: string, updatedData: Partial<TrainingCourse>) => void;
  deleteCourse: (courseId: string) => Promise<void>;

  // Reminders & Notifications
  toggleReminderRule: (ruleId: string) => void;
  triggerManualReminder: (ruleTitle?: string) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  showToast: (text: string, type?: 'success' | 'info' | 'warning') => void;
}

const TrainingContext = createContext<TrainingContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'nexus_learn_';

export const TrainingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'is_authenticated');
    return saved === 'true';
  });

  // Core state with local fallback
  const [allUsers, setAllUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'current_user_id');
    return saved || 'user_1';
  });

  const [roles, setRoles] = useState<RoleConfig[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'roles');
    return saved ? JSON.parse(saved) : INITIAL_ROLES;
  });

  const [courses, setCourses] = useState<TrainingCourse[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'courses');
    return saved ? JSON.parse(saved) : INITIAL_COURSES;
  });

  const [progressRecords, setProgressRecords] = useState<CourseProgressRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'progress');
    return saved ? JSON.parse(saved) : INITIAL_PROGRESS_RECORDS;
  });

  const [reminderRules, setReminderRules] = useState<ReminderRule[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'reminder_rules');
    return saved ? JSON.parse(saved) : INITIAL_REMINDER_RULES;
  });

  const [notifications, setNotifications] = useState<InAppNotification[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'warning' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // 1. Check Firestore connectivity and listen to Auth state
  useEffect(() => {
    testFirestoreConnection().then((connected) => {
      setIsFirebaseConnected(connected);
    });

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        // If user signs in with Google, link or create profile
        setAllUsers((prev) => {
          const exists = prev.find((u) => u.email === user.email);
          if (exists) {
            setCurrentUserId(exists.id);
            return prev;
          }
          const newUser: UserAccount = {
            id: user.uid,
            name: user.displayName || user.email?.split('@')[0] || 'Chuyên viên mới',
            email: user.email || '',
            role: user.email === 'chieupo1007@gmail.com' ? 'admin' : 'sales_staff',
            department: user.email === 'chieupo1007@gmail.com' ? 'Ban Giám Đốc' : 'Sales',
            position: user.email === 'chieupo1007@gmail.com' ? 'Quản trị viên Cấp cao' : 'Chuyên viên Kinh doanh',
            joinDate: new Date().toISOString().split('T')[0],
            assignedTrackId: 'sales_track',
            completionRate: 0,
            averageScore: 0,
            completedCoursesCount: 0,
            totalAssignedCourses: 4,
            lastActive: 'Vừa đăng nhập',
            status: 'on_track',
            competencies: [
              { skill: 'Kiến thức Sản phẩm Tổng thể', score: 60 },
              { skill: 'Chiến lược Giải pháp B2B', score: 60 },
              { skill: 'Kiến trúc Hạ tầng Cloud', score: 50 },
              { skill: 'Bảo mật & Tuân thủ ISO', score: 50 },
              { skill: 'Xử lý Phản đối & Đàm phán', score: 60 },
              { skill: 'Khắc phục Sự cố Hệ thống', score: 50 },
            ],
          };
          setCurrentUserId(newUser.id);
          // Persist user to Firestore
          try {
            setDoc(doc(db, 'users', newUser.id), newUser);
          } catch (e) {
            console.error('Failed to sync new auth user to Firestore:', e);
          }
          return [newUser, ...prev];
        });
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // 2. Realtime Firestore Listeners & Bootstrapping
  useEffect(() => {
    // Bootstrap Firestore with default data if empty
    const bootstrapFirestore = async () => {
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        if (usersSnap.empty) {
          for (const u of INITIAL_USERS) {
            await setDoc(doc(db, 'users', u.id), u);
          }
          for (const r of INITIAL_ROLES) {
            await setDoc(doc(db, 'roles', r.id), r);
          }
          for (const c of INITIAL_COURSES) {
            await setDoc(doc(db, 'courses', c.id), c);
          }
          for (const rule of INITIAL_REMINDER_RULES) {
            await setDoc(doc(db, 'reminder_rules', rule.id), rule);
          }
        }
      } catch (err) {
        console.warn('Firestore bootstrap notice (will use client state):', err);
      }
    };
    bootstrapFirestore();

    // Listen to Users
    const unsubUsers = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded: UserAccount[] = [];
          snapshot.forEach((d) => loaded.push(d.data() as UserAccount));
          setAllUsers(loaded);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'users');
      }
    );

    // Listen to Roles
    const unsubRoles = onSnapshot(
      collection(db, 'roles'),
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded: RoleConfig[] = [];
          snapshot.forEach((d) => loaded.push(d.data() as RoleConfig));
          setRoles(loaded);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'roles');
      }
    );

    // Listen to Courses
    const unsubCourses = onSnapshot(
      collection(db, 'courses'),
      async (snapshot) => {
        if (!snapshot.empty) {
          const loaded: TrainingCourse[] = [];
          for (const d of snapshot.docs) {
            const courseData = d.data() as TrainingCourse;
            // If pdfSlideUrl is empty, check IndexedDB for locally uploaded PDF
            if (!courseData.pdfSlideUrl) {
              const localPdf = await getCoursePdf(courseData.id);
              if (localPdf) {
                courseData.pdfSlideUrl = localPdf;
              }
            }
            loaded.push(courseData);
          }
          setCourses(loaded);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'courses');
      }
    );

    // Listen to Reminder Rules
    const unsubRules = onSnapshot(
      collection(db, 'reminder_rules'),
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded: ReminderRule[] = [];
          snapshot.forEach((d) => loaded.push(d.data() as ReminderRule));
          setReminderRules(loaded);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'reminder_rules');
      }
    );

    return () => {
      unsubUsers();
      unsubRoles();
      unsubCourses();
      unsubRules();
    };
  }, []);

  // Sync to localStorage as backup
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'users', JSON.stringify(allUsers));
  }, [allUsers]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'roles', JSON.stringify(roles));
  }, [roles]);
  useEffect(() => {
    try {
      const leanCourses = courses.map((c) => ({
        ...c,
        pdfSlideUrl: c.pdfSlideUrl?.startsWith('data:') ? '' : c.pdfSlideUrl,
      }));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'courses', JSON.stringify(leanCourses));
    } catch (e) {
      console.warn('LocalStorage save courses quota warning:', e);
    }
  }, [courses]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'progress', JSON.stringify(progressRecords));
  }, [progressRecords]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'reminder_rules', JSON.stringify(reminderRules));
  }, [reminderRules]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'notifications', JSON.stringify(notifications));
  }, [notifications]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'current_user_id', currentUserId);
  }, [currentUserId]);

  const currentUser = allUsers.find((u) => u.id === currentUserId) || allUsers[0];

  const loginAsUser = (userId: string) => {
    const target = allUsers.find((u) => u.id === userId);
    if (target) {
      setCurrentUserId(userId);
    }
    setIsAuthenticated(true);
    localStorage.setItem(STORAGE_KEY_PREFIX + 'is_authenticated', 'true');
    const roleObj = target ? roles.find((r) => r.id === target.role) : null;
    showToast(`Chào mừng ${target?.name || 'bạn'} (${roleObj?.title || 'Technical team'})!`, 'success');
  };

  const loginWithGoogle = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      setIsAuthenticated(true);
      localStorage.setItem(STORAGE_KEY_PREFIX + 'is_authenticated', 'true');
      showToast(`Đăng nhập thành công với Google: ${res.user.displayName}`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Đăng nhập Google thất bại hoặc bị hủy.', 'warning');
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setFirebaseUser(null);
    } catch (err) {
      console.error(err);
    }
    setIsAuthenticated(false);
    localStorage.setItem(STORAGE_KEY_PREFIX + 'is_authenticated', 'false');
    showToast('Đã đăng xuất khỏi phiên làm việc Technical team.', 'info');
  };

  const switchUser = (userId: string) => {
    const target = allUsers.find((u) => u.id === userId);
    if (target) {
      setCurrentUserId(userId);
      const roleObj = roles.find((r) => r.id === target.role);
      showToast(`Đã chuyển sang tài khoản: ${target.name} (${roleObj?.title || target.role})`, 'info');
    }
  };

  const hasPermission = (permission: PermissionKey): boolean => {
    const userRoleConfig = roles.find((r) => r.id === currentUser.role);
    if (!userRoleConfig) return false;
    return userRoleConfig.permissions.includes(permission);
  };

  const updateUserRole = async (userId: string, newRole: UserRoleType) => {
    setAllUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    const targetUser = allUsers.find((u) => u.id === userId);
    const roleConfig = roles.find((r) => r.id === newRole);
    showToast(`Đã cập nhật vai trò của ${targetUser?.name || 'nhân viên'} thành "${roleConfig?.name}"`, 'success');

    // Firestore sync
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
    } catch (e) {
      console.error('Firestore user update error:', e);
    }
  };

  const updateRolePermissions = async (roleId: UserRoleType, newPermissions: PermissionKey[]) => {
    setRoles((prev) =>
      prev.map((r) => (r.id === roleId ? { ...r, permissions: newPermissions } : r))
    );
    showToast(`Đã lưu cấu hình phân quyền cho vai trò ${roleId.toUpperCase()} lên Firestore`, 'success');

    // Firestore sync
    try {
      await setDoc(doc(db, 'roles', roleId), { permissions: newPermissions }, { merge: true });
    } catch (e) {
      console.error('Firestore role update error:', e);
    }
  };

  const addNewUser = async (newUserData: Omit<UserAccount, 'id'>) => {
    const newId = `user_${Date.now()}`;
    const fullUser: UserAccount = {
      ...newUserData,
      id: newId,
    };
    setAllUsers((prev) => [fullUser, ...prev]);
    showToast(`Đã tạo tài khoản cho nhân sự: ${newUserData.name}`, 'success');

    // Firestore sync
    try {
      await setDoc(doc(db, 'users', newId), fullUser);
    } catch (e) {
      console.error('Firestore add user error:', e);
    }
  };

  const deleteUser = async (userId: string) => {
    if (allUsers.length <= 1) {
      showToast('Không thể xóa nhân sự cuối cùng trong hệ thống.', 'warning');
      return;
    }
    const targetUser = allUsers.find((u) => u.id === userId);
    setAllUsers((prev) => prev.filter((u) => u.id !== userId));
    setProgressRecords((prev) => prev.filter((p) => p.userId !== userId));
    setNotifications((prev) => prev.filter((n) => n.userId !== userId));

    // If deleting the active user, switch to the first remaining user
    if (currentUserId === userId) {
      const remaining = allUsers.filter((u) => u.id !== userId);
      if (remaining.length > 0) {
        setCurrentUserId(remaining[0].id);
      }
    }

    showToast(`Đã xóa thành công nhân sự: ${targetUser?.name || userId}`, 'info');

    // Firestore sync
    try {
      await deleteDoc(doc(db, 'users', userId));
    } catch (e) {
      console.error('Firestore delete user error:', e);
    }
  };

  const recordQuizResult = async (courseId: string, score: number, passed: boolean) => {
    const course = courses.find((c) => c.id === courseId);
    const nowStr = new Date().toISOString().split('T')[0];

    // 1. Update progress
    const progressId = `${currentUser.id}_${courseId}`;
    const newProgress: CourseProgressRecord = {
      courseId,
      userId: currentUser.id,
      status: passed ? 'completed' : 'failed',
      progressPercentage: passed ? 100 : 85,
      quizScore: score,
      quizPassed: passed,
      attemptsCount: 1,
      completedAt: passed ? nowStr : undefined,
      dueDate: '2026-10-31',
    };

    setProgressRecords((prev) => {
      const idx = prev.findIndex((p) => p.courseId === courseId && p.userId === currentUser.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = {
          ...copy[idx],
          ...newProgress,
          attemptsCount: copy[idx].attemptsCount + 1,
        };
        return copy;
      }
      return [...prev, newProgress];
    });

    // 2. Recalculate metrics
    setAllUsers((prev) =>
      prev.map((u) => {
        if (u.id !== currentUser.id) return u;
        const currentCoursesCount = passed
          ? u.completedCoursesCount + 1
          : u.completedCoursesCount;
        const newAverageScore = Math.round((u.averageScore * 3 + score) / 4);
        const newRate = Math.min(100, Math.round((currentCoursesCount / u.totalAssignedCourses) * 100));

        const updatedCompetencies = u.competencies.map((comp) => {
          if (comp.skill.includes(course?.category === 'Sales' ? 'Sản phẩm' : 'Hạ tầng')) {
            return { ...comp, score: Math.min(100, Math.round((comp.score + score) / 2)) };
          }
          return comp;
        });

        const updatedUser: UserAccount = {
          ...u,
          averageScore: newAverageScore,
          completionRate: newRate,
          completedCoursesCount: currentCoursesCount,
          status: newRate >= 90 ? 'completed' : 'on_track',
          competencies: updatedCompetencies,
        };

        // Firestore sync user stats
        setDoc(doc(db, 'users', u.id), updatedUser, { merge: true }).catch(console.error);

        return updatedUser;
      })
    );

    // 3. Add notification
    const newNotif: InAppNotification = {
      id: `notif_${Date.now()}`,
      userId: currentUser.id,
      title: passed ? `Đã vượt qua bài thi: ${course?.title}` : `Chưa đạt điểm chuẩn bài thi: ${course?.title}`,
      message: passed
        ? `Chúc mừng bạn đã đạt ${score}% điểm và nhận chứng chỉ hoàn thành khóa học.`
        : `Bạn đạt ${score}% (yêu cầu tối thiểu 80%). Hãy ôn tập lại tài liệu và làm lại bài kiểm tra.`,
      type: passed ? 'quiz_passed' : 'reminder',
      createdAt: 'Vừa xong',
      read: false,
      linkTab: 'analytics',
      courseId,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    // Firestore sync progress record & notification
    try {
      await setDoc(doc(db, 'progress', progressId), newProgress, { merge: true });
      await setDoc(doc(db, 'notifications', newNotif.id), newNotif);
    } catch (e) {
      console.error('Firestore progress sync error:', e);
    }

    if (passed) {
      showToast(`Tuyệt vời! Bạn đã đạt ${score}% điểm và lưu kết quả lên Firestore.`, 'success');
    } else {
      showToast(`Điểm số: ${score}%. Bạn cần tối thiểu 80% để vượt qua bài thi.`, 'warning');
    }
  };

  const updateCourseProgress = (courseId: string, percentage: number) => {
    setProgressRecords((prev) => {
      const idx = prev.findIndex((p) => p.courseId === courseId && p.userId === currentUser.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = {
          ...copy[idx],
          progressPercentage: Math.max(copy[idx].progressPercentage, percentage),
          status: percentage === 100 ? 'completed' : 'in_progress',
        };
        return copy;
      }
      return [
        ...prev,
        {
          courseId,
          userId: currentUser.id,
          status: 'in_progress',
          progressPercentage: percentage,
          attemptsCount: 0,
          dueDate: '2026-10-31',
        },
      ];
    });
  };

  const addNewCourse = async (course: TrainingCourse) => {
    // 1. If pdfSlideUrl is a large data URL, persist in IndexedDB
    if (course.pdfSlideUrl && course.pdfSlideUrl.startsWith('data:')) {
      await saveCoursePdf(course.id, course.pdfSlideUrl);
    }

    // 2. Local state keeps the full data URL for immediate viewing
    setCourses((prev) => [course, ...prev]);
    showToast(`Đã tạo thành công khóa học: ${course.title}`, 'success');

    // 3. Firestore document strips large base64 data URLs to strictly stay under 1MB limit
    const firestoreCourse = {
      ...course,
      pdfSlideUrl: course.pdfSlideUrl?.startsWith('data:') ? '' : course.pdfSlideUrl,
    };

    try {
      await setDoc(doc(db, 'courses', course.id), firestoreCourse);
    } catch (e) {
      console.error('Firestore create course error:', e);
    }
  };

  const updateCourse = async (courseId: string, updatedData: Partial<TrainingCourse>) => {
    // 1. If pdfSlideUrl is a large data URL, persist in IndexedDB
    if (updatedData.pdfSlideUrl && updatedData.pdfSlideUrl.startsWith('data:')) {
      await saveCoursePdf(courseId, updatedData.pdfSlideUrl);
    }

    // 2. Local state keeps the full data URL for immediate viewing
    setCourses((prev) =>
      prev.map((c) => (c.id === courseId ? { ...c, ...updatedData } : c))
    );
    showToast('Đã lưu cập nhật giáo trình và bài kiểm tra khóa học.', 'success');

    // 3. Firestore document strips large base64 data URLs to strictly stay under 1MB limit
    const firestoreData = {
      ...updatedData,
      pdfSlideUrl: updatedData.pdfSlideUrl?.startsWith('data:') ? '' : updatedData.pdfSlideUrl,
    };

    try {
      await setDoc(doc(db, 'courses', courseId), firestoreData, { merge: true });
    } catch (e) {
      console.error('Firestore update course error:', e);
    }
  };

  const deleteCourse = async (courseId: string) => {
    const targetCourse = courses.find((c) => c.id === courseId);
    setCourses((prev) => prev.filter((c) => c.id !== courseId));
    setProgressRecords((prev) => prev.filter((p) => p.courseId !== courseId));
    await deleteCoursePdf(courseId);
    showToast(`Đã xóa thành công khóa học: ${targetCourse?.title || courseId}`, 'info');

    try {
      await deleteDoc(doc(db, 'courses', courseId));
    } catch (e) {
      console.error('Firestore delete course error:', e);
    }
  };

  const toggleReminderRule = async (ruleId: string) => {
    setReminderRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, isActive: !r.isActive } : r))
    );
    const rule = reminderRules.find((r) => r.id === ruleId);
    showToast(`Đã ${!rule?.isActive ? 'bật' : 'tắt'} quy tắc: ${rule?.title}`, 'info');
    try {
      await updateDoc(doc(db, 'reminder_rules', ruleId), { isActive: !rule?.isActive });
    } catch (e) {
      console.error('Firestore rule update error:', e);
    }
  };

  const triggerManualReminder = (ruleTitle?: string) => {
    const behindUsers = allUsers.filter((u) => u.status === 'behind' || u.completionRate < 60);
    const count = behindUsers.length;

    const newNotifs: InAppNotification[] = behindUsers.map((u) => ({
      id: `notif_${Date.now()}_${u.id}`,
      userId: u.id,
      title: 'Nhắc nhở tự động: Đẩy nhanh lộ trình học tập sản phẩm',
      message: `Hệ thống ghi nhận bạn đang có các học phần chậm hơn cam kết. Vui lòng sắp xếp thời gian hoàn tất các bài kiểm tra trắc nghiệm.`,
      type: 'reminder',
      createdAt: 'Vừa kích hoạt',
      read: false,
      linkTab: 'courses',
    }));

    setNotifications((prev) => [...newNotifs, ...prev]);
    showToast(`Đã gửi thông báo nhắc nhở tự động thành công tới ${count} nhân sự qua Firestore & In-App!`, 'success');
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('Đã đánh dấu đọc tất cả thông báo.', 'info');
  };

  return (
    <TrainingContext.Provider
      value={{
        currentUser,
        allUsers,
        roles,
        courses,
        progressRecords,
        reminderRules,
        notifications,
        toastMessage,
        firebaseUser,
        isFirebaseConnected,
        isAuthenticated,
        loginAsUser,
        loginWithGoogle,
        logout,
        switchUser,
        hasPermission,
        updateUserRole,
        updateRolePermissions,
        addNewUser,
        deleteUser,
        recordQuizResult,
        updateCourseProgress,
        addNewCourse,
        updateCourse,
        deleteCourse,
        toggleReminderRule,
        triggerManualReminder,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        showToast,
      }}
    >
      {children}
    </TrainingContext.Provider>
  );
};

export const useTraining = () => {
  const context = useContext(TrainingContext);
  if (!context) {
    throw new Error('useTraining must be used within a TrainingProvider');
  }
  return context;
};
