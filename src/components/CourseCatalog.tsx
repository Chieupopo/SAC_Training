import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Award,
  ChevronRight,
  Plus,
  Play,
  FileText,
  Shield,
  Layers,
  Sparkles,
  ArrowRight,
  X,
  FileUp,
  Presentation,
  Trash2,
  ChevronLeft,
  Download,
  ExternalLink,
  HelpCircle,
  Maximize2,
  Check,
  AlertCircle,
  FileCheck,
  UploadCloud,
  FileSearch,
  Video,
  Youtube,
  Tv,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { useTraining } from '../context/TrainingContext';
import { TrainingCourse, CourseLesson, QuizQuestion } from '../types';
import { PdfCanvasViewer } from './PdfCanvasViewer';
import { extractYouTubeId, getYouTubeEmbedUrl, SAMPLE_YOUTUBE_LECTURES } from '../utils/youtube';

interface CourseCatalogProps {
  onStartQuiz: (course: TrainingCourse) => void;
}

export const CourseCatalog: React.FC<CourseCatalogProps> = ({ onStartQuiz }) => {
  const {
    courses,
    progressRecords,
    currentUser,
    hasPermission,
    addNewCourse,
    updateCourse,
    deleteCourse,
    showToast,
  } = useTraining();

  const [filterCategory, setFilterCategory] = useState<'all' | 'Sales' | 'Technical'>('all');
  const [selectedCourseDetail, setSelectedCourseDetail] = useState<TrainingCourse | null>(null);
  const [detailTab, setDetailTab] = useState<'video' | 'pdf' | 'lessons' | 'quiz'>('video');
  const [pdfViewMode, setPdfViewMode] = useState<'embedded_pdf' | 'interactive_slides'>('embedded_pdf');
  const [currentSlidePage, setCurrentSlidePage] = useState(1);

  // Course Deletion Confirmation Modal State
  const [courseToDelete, setCourseToDelete] = useState<TrainingCourse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Add lesson to existing course modal
  const [isAddLessonModalOpen, setIsAddLessonModalOpen] = useState(false);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonDuration, setNewLessonDuration] = useState('30 phút');
  const [newLessonPoints, setNewLessonPoints] = useState('');

  // Course Creation Wizard State
  const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);

  // Step 1: Basic Info (Tên & Mã khóa học)
  const [courseCode, setCourseCode] = useState('');
  const [courseTitle, setCourseTitle] = useState('');
  const [courseCategory, setCourseCategory] = useState<'Sales' | 'Technical'>('Sales');
  const [courseLevel, setCourseLevel] = useState<'Cơ bản' | 'Nâng cao' | 'Chuyên sâu'>('Cơ bản');
  const [courseHours, setCourseHours] = useState(8);
  const [courseDesc, setCourseDesc] = useState('');
  const [courseObjectives, setCourseObjectives] = useState<string[]>([
    'Nắm vững kiến thức cốt lõi của giải pháp',
    'Thực hành triển khai và thuyết trình giải pháp',
    'Vượt qua bài kiểm tra chuẩn hóa cuối khóa',
  ]);
  const [newObjInput, setNewObjInput] = useState('');

  // Step 2: Content Delivery Mode (Video YouTube hoặc Slide PDF)
  const [contentDeliveryMode, setContentDeliveryMode] = useState<'video' | 'pdf' | 'both'>('video');
  const [youtubeUrlInput, setYoutubeUrlInput] = useState('https://www.youtube.com/watch?v=M988_fsOSWo');
  const [videoDurationInput, setVideoDurationInput] = useState('18 phút');

  // PDF Slides State
  const [pdfFileName, setPdfFileName] = useState('');
  const [pdfFileUrl, setPdfFileUrl] = useState('');
  const [pdfPagesCount, setPdfPagesCount] = useState(25);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [wizardLessons, setWizardLessons] = useState<CourseLesson[]>([
    {
      id: 'les_w_1',
      title: 'Học phần 1: Tổng quan bài giảng & Kiến trúc giải pháp',
      duration: '30 phút',
      type: 'video',
      keyPoints: ['Định vị giá trị cốt lõi', 'Kiến trúc giải pháp tổng quan'],
    },
    {
      id: 'les_w_2',
      title: 'Học phần 2: Thực hành tình huống & Quy chuẩn kỹ thuật',
      duration: '45 phút',
      type: 'interactive',
      keyPoints: ['Xử lý ca thực tế', 'Tài liệu hướng dẫn triển khai'],
    },
  ]);
  const [tempLessonTitle, setTempLessonTitle] = useState('');
  const [tempLessonDuration, setTempLessonDuration] = useState('30 phút');
  const [tempLessonKeyPoints, setTempLessonKeyPoints] = useState('');

  // Step 3: Final Quiz (Bài kiểm tra cuối khóa)
  const [quizPassScore, setQuizPassScore] = useState(80);
  const [quizDuration, setQuizDuration] = useState(15);
  const [wizardQuestions, setWizardQuestions] = useState<QuizQuestion[]>([
    {
      id: 'qw_1',
      question: 'Yếu tố quan trọng nhất để đảm bảo chất lượng giải pháp là gì?',
      options: [
        'Tuân thủ nghiêm ngặt tiêu chuẩn SLA và quy trình kiểm thử',
        'Bỏ qua các bước kiểm tra an ninh mạng',
        'Chỉ triển khai trên một máy chủ duy nhất',
        'Không cần lập tài liệu hướng dẫn',
      ],
      correctAnswer: 0,
      explanation: 'SLA cam kết và quy trình kiểm thử là tiêu chuẩn hàng đầu trong môi trường doanh nghiệp.',
    },
    {
      id: 'qw_2',
      question: 'Khi khách hàng yêu cầu tài liệu chứng minh, cần cung cấp tài liệu nào?',
      options: [
        'Hồ sơ năng lực, chứng chỉ bảo mật và tài liệu kỹ thuật chuẩn',
        'Từ chối cung cấp vì bí mật',
        'Gửi link không có bản quyền',
        'Hẹn khách hàng sau 3 tháng',
      ],
      correctAnswer: 0,
      explanation: 'Hồ sơ năng lực và chứng chỉ bảo mật chính thức tạo dựng niềm tin tuyệt đối với đối tác.',
    },
  ]);

  // Question editing in wizard
  const [newQTitle, setNewQTitle] = useState('');
  const [newQOptA, setNewQOptA] = useState('');
  const [newQOptB, setNewQOptB] = useState('');
  const [newQOptC, setNewQOptC] = useState('');
  const [newQOptD, setNewQOptD] = useState('');
  const [newQCorrect, setNewQCorrect] = useState<number>(0);
  const [newQExplanation, setNewQExplanation] = useState('');

  const filteredCourses = courses.filter((c) => {
    if (filterCategory === 'all') return true;
    return c.category === filterCategory;
  });

  const canManageCourses = hasPermission('manage_courses');
  const canDeleteCourses = hasPermission('delete_course') || currentUser.role === 'admin';

  // Handle PDF/PPTX file upload using FileReader
  const handlePdfFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingPdf(true);
      setPdfFileName(file.name);
      const isPpt = file.name.toLowerCase().endsWith('.pptx') || file.name.toLowerCase().endsWith('.ppt');
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setPdfFileUrl(result);
        setPdfPagesCount(Math.max(1, Math.floor(file.size / 45000)) || 15);
        setIsUploadingPdf(false);
        if (isPpt) {
          showToast(`Đã đính kèm file PowerPoint: ${file.name}. Có thể xem dạng Slide 16:9 hoặc tải về.`, 'info');
        } else {
          showToast(`Đã tải lên và đính kèm file PDF: ${file.name}`, 'success');
        }
      };
      reader.onerror = () => {
        setIsUploadingPdf(false);
        showToast('Lỗi khi đọc file. Vui lòng thử lại.', 'warning');
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload or replace PDF/PPTX for an existing course
  const handleUploadPdfForExistingCourse = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedCourseDetail) {
      const isPpt = file.name.toLowerCase().endsWith('.pptx') || file.name.toLowerCase().endsWith('.ppt');
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        const pageEst = Math.max(1, Math.floor(file.size / 45000)) || 15;
        const updated = {
          pdfSlideName: file.name,
          pdfSlideUrl: result,
          pdfSlidePagesCount: pageEst,
        };
        updateCourse(selectedCourseDetail.id, updated);
        setSelectedCourseDetail({ ...selectedCourseDetail, ...updated });
        if (isPpt) {
          setPdfViewMode('interactive_slides');
          showToast(`Đã đính kèm file PowerPoint: ${file.name}. Đã mở chế độ Slide trình chiếu.`, 'info');
        } else {
          setPdfViewMode('embedded_pdf');
          showToast(`Đã cập nhật file PDF mới cho khóa học: ${file.name}`, 'success');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUsePresetPdf = (presetType: 'sales' | 'tech') => {
    if (presetType === 'sales') {
      setPdfFileName('Giao_Trinh_Sales_Enterprise_Cloud_2026.pdf');
      setPdfFileUrl('https://raw.githubusercontent.com/mozilla/pdf.js/master/web/compressed.tracemonkey-pldi-09.pdf');
      setPdfPagesCount(28);
    } else {
      setPdfFileName('Giao_Trinh_Technical_Architecture_Kubernetes_2026.pdf');
      setPdfFileUrl('https://raw.githubusercontent.com/mozilla/pdf.js/master/web/compressed.tracemonkey-pldi-09.pdf');
      setPdfPagesCount(34);
    }
    showToast('Đã áp dụng mẫu slide giáo trình chuẩn hóa.', 'info');
  };

  // Add lesson in wizard
  const handleAddWizardLesson = () => {
    if (!tempLessonTitle.trim()) {
      showToast('Vui lòng nhập tiêu đề bài học', 'warning');
      return;
    }
    const newLes: CourseLesson = {
      id: `les_${Date.now()}`,
      title: tempLessonTitle.trim(),
      duration: tempLessonDuration || '30 phút',
      type: contentDeliveryMode === 'video' ? 'video' : 'document',
      keyPoints: tempLessonKeyPoints
        ? tempLessonKeyPoints.split('\n').filter((k) => k.trim())
        : ['Nắm vững kiến thức trọng tâm bài học'],
    };
    setWizardLessons((prev) => [...prev, newLes]);
    setTempLessonTitle('');
    setTempLessonKeyPoints('');
    showToast('Đã thêm bài học vào giáo trình.', 'success');
  };

  // Add question in wizard
  const handleAddWizardQuestion = () => {
    if (!newQTitle.trim() || !newQOptA.trim() || !newQOptB.trim()) {
      showToast('Vui lòng nhập câu hỏi và ít nhất 2 đáp án A, B', 'warning');
      return;
    }
    const options = [newQOptA, newQOptB, newQOptC || 'Phương án khác', newQOptD || 'Tất cả các phương án trên'];
    const newQuestion: QuizQuestion = {
      id: `q_${Date.now()}`,
      question: newQTitle.trim(),
      options,
      correctAnswer: newQCorrect,
      explanation: newQExplanation || 'Đáp án chính xác theo giáo trình quy chuẩn.',
    };
    setWizardQuestions((prev) => [...prev, newQuestion]);
    setNewQTitle('');
    setNewQOptA('');
    setNewQOptB('');
    setNewQOptC('');
    setNewQOptD('');
    setNewQExplanation('');
    showToast('Đã thêm câu hỏi vào đề kiểm tra cuối khóa.', 'success');
  };

  // Submit complete course creation
  const handleFinalSubmitCourse = () => {
    if (!courseTitle.trim() || !courseCode.trim()) {
      showToast('Vui lòng nhập tên và mã khóa học', 'warning');
      setWizardStep(1);
      return;
    }
    if (wizardQuestions.length === 0) {
      showToast('Vui lòng tạo ít nhất 1 câu hỏi cho bài kiểm tra cuối khóa', 'warning');
      setWizardStep(3);
      return;
    }

    const courseId = `course_${Date.now()}`;
    const newCourseObj: TrainingCourse = {
      id: courseId,
      code: courseCode.toUpperCase().trim(),
      title: courseTitle.trim(),
      category: courseCategory,
      level: courseLevel,
      estimatedHours: courseHours,
      icon: courseCategory === 'Sales' ? 'PackageCheck' : 'Layers',
      description: courseDesc || 'Khóa học đào tạo chuyên môn theo quy chuẩn doanh nghiệp.',
      objectives: courseObjectives.length > 0 ? courseObjectives : [
        'Nắm vững kiến thức cốt lõi của khóa học',
        'Vượt qua bài kiểm tra chuẩn hóa cuối khóa',
      ],
      contentType: contentDeliveryMode,
      youtubeUrl: (contentDeliveryMode === 'video' || contentDeliveryMode === 'both') ? (youtubeUrlInput.trim() || undefined) : undefined,
      videoDuration: videoDurationInput || '20 phút',
      pdfSlideName: pdfFileName || (contentDeliveryMode === 'pdf' ? `Giao_Trinh_${courseCode.toUpperCase()}_Slide.pdf` : undefined),
      pdfSlidePagesCount: pdfPagesCount || 20,
      pdfSlideUrl: pdfFileUrl || (contentDeliveryMode === 'pdf' ? 'https://raw.githubusercontent.com/mozilla/pdf.js/master/web/compressed.tracemonkey-pldi-09.pdf' : undefined),
      lessons: wizardLessons.length > 0 ? wizardLessons : [
        {
          id: `les_${Date.now()}_1`,
          title: 'Tổng quan bài giảng & Nội dung đào tạo',
          duration: '45 phút',
          type: contentDeliveryMode === 'video' ? 'video' : 'document',
          keyPoints: ['Giới thiệu giải pháp', 'Các điều khoản cam kết'],
        },
      ],
      quiz: {
        id: `quiz_${courseId}`,
        courseId,
        title: `Bài kiểm tra cuối khóa: ${courseTitle}`,
        passScorePercentage: quizPassScore,
        durationMinutes: quizDuration,
        questions: wizardQuestions,
      },
    };

    addNewCourse(newCourseObj);
    setIsAddCourseModalOpen(false);

    // Reset wizard
    setWizardStep(1);
    setCourseTitle('');
    setCourseCode('');
    setCourseDesc('');
    setPdfFileName('');
    setPdfFileUrl('');
  };

  // Execute Course Deletion
  const handleConfirmDelete = async () => {
    if (!courseToDelete) return;
    setIsDeleting(true);
    try {
      await deleteCourse(courseToDelete.id);
      if (selectedCourseDetail?.id === courseToDelete.id) {
        setSelectedCourseDetail(null);
      }
      setCourseToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  // Add lesson to existing course
  const handleAddLessonToExistingCourse = () => {
    if (!selectedCourseDetail || !newLessonTitle.trim()) {
      showToast('Vui lòng nhập tiêu đề bài giảng', 'warning');
      return;
    }
    const newLesson: CourseLesson = {
      id: `les_${Date.now()}`,
      title: newLessonTitle.trim(),
      duration: newLessonDuration || '30 phút',
      type: selectedCourseDetail.youtubeUrl ? 'video' : 'document',
      keyPoints: newLessonPoints
        ? newLessonPoints.split('\n').filter((k) => k.trim())
        : ['Nắm vững kiến thức bài học'],
    };

    const updatedLessons = [...selectedCourseDetail.lessons, newLesson];
    updateCourse(selectedCourseDetail.id, { lessons: updatedLessons });
    setSelectedCourseDetail({ ...selectedCourseDetail, lessons: updatedLessons });
    setIsAddLessonModalOpen(false);
    setNewLessonTitle('');
    setNewLessonPoints('');
    showToast('Đã thêm bài giảng mới vào giáo trình!', 'success');
  };

  // Compute total slides in interactive deck based on actual course structure
  const totalDeckSlides = selectedCourseDetail
    ? 2 + selectedCourseDetail.lessons.length + 1
    : 1;

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            Học Viện Đào Tạo Doanh Nghiệp (Training Academy)
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            Hạng Mục Đào Tạo Sản Phẩm (Sales & Technical)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Học tập qua video YouTube bài giảng trực quan, tài liệu giáo trình và hoàn tất bài kiểm tra trắc nghiệm cuối khóa.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {canManageCourses && (
            <button
              onClick={() => {
                setWizardStep(1);
                setIsAddCourseModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-500/20 transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo khóa học mới (Video / PDF & Bài thi)</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Segmented Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              filterCategory === 'all'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tất cả phân hệ ({courses.length})
          </button>
          <button
            onClick={() => setFilterCategory('Sales')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              filterCategory === 'Sales'
                ? 'bg-white text-blue-700 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Phân hệ Sales ({courses.filter((c) => c.category === 'Sales').length})
          </button>
          <button
            onClick={() => setFilterCategory('Technical')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              filterCategory === 'Technical'
                ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Phân hệ Technical ({courses.filter((c) => c.category === 'Technical').length})
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1.5 text-rose-600 font-medium">
            <Youtube className="w-3.5 h-3.5" />
            Có Video YouTube bài giảng
          </span>
          <span>·</span>
          <span className="flex items-center gap-1.5 text-blue-600">
            <Presentation className="w-3.5 h-3.5" />
            Có Slide PDF
          </span>
          <span>·</span>
          <span className="flex items-center gap-1.5 text-amber-600">
            <Award className="w-3.5 h-3.5" />
            Thi trắc nghiệm chuẩn hóa
          </span>
        </div>
      </div>

      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCourses.map((course) => {
          const userProgress = progressRecords.find(
            (p) => p.courseId === course.id && p.userId === currentUser.id
          );
          const isPassed = userProgress?.quizPassed;
          const hasScore = userProgress?.quizScore !== undefined;
          const hasVideo = Boolean(course.youtubeUrl);

          return (
            <div
              key={course.id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group relative"
            >
              <div>
                {/* Course Header Banner */}
                <div
                  className={`p-6 border-b border-slate-100 ${
                    course.category === 'Sales'
                      ? 'bg-linear-to-r from-blue-50/70 via-sky-50/30 to-white'
                      : 'bg-linear-to-r from-indigo-50/70 via-slate-50/50 to-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-800 shadow-2xs">
                        {course.code}
                      </span>
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          course.category === 'Sales'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-indigo-100 text-indigo-700'
                        }`}
                      >
                        {course.category} Track
                      </span>
                      <span className="text-[11px] font-medium text-slate-500 bg-white/80 px-2 py-0.5 rounded border border-slate-200/60">
                        {course.level}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{course.estimatedHours}h</span>
                      </div>

                      {/* Admin Delete Button on Card */}
                      {canDeleteCourses && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCourseToDelete(course);
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Xóa khóa học này (Quyền Quản trị viên)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>
                </div>

                {/* Course Details: Video YouTube Badge & PDF Badge */}
                <div className="p-6 space-y-4">
                  {/* YouTube Video Banner if available */}
                  {hasVideo ? (
                    <div className="p-3 bg-rose-50/70 border border-rose-200/80 rounded-xl flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                          <Play className="w-4 h-4 fill-white" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-rose-950 truncate flex items-center gap-1.5">
                            <span>Video Bài Giảng YouTube</span>
                            <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded font-semibold">HD</span>
                          </div>
                          <div className="text-[11px] text-rose-700 truncate">
                            Thời lượng: {course.videoDuration || '20 phút'} · Học qua video trực quan
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedCourseDetail(course);
                          setDetailTab('video');
                        }}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors shrink-0 shadow-2xs"
                      >
                        Xem Video
                      </button>
                    </div>
                  ) : (
                    /* PDF Slide Info Box */
                    <div className="p-3 bg-blue-50/50 border border-blue-200/70 rounded-xl flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                          <Presentation className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 truncate">
                            {course.pdfSlideName || 'Giao_Trinh_Khoa_Hoc.pdf'}
                          </div>
                          <div className="text-[11px] text-blue-700">
                            Tài liệu giáo trình chính thức
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedCourseDetail(course);
                          setDetailTab('pdf');
                          setPdfViewMode('embedded_pdf');
                          setCurrentSlidePage(1);
                        }}
                        className="px-2.5 py-1 bg-white hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg border border-blue-200 transition-colors shrink-0"
                      >
                        Mở Giáo Trình
                      </button>
                    </div>
                  )}

                  {/* Objectives */}
                  <div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Mục tiêu chuyên môn
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-600">
                      {course.objectives.slice(0, 3).map((obj, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                          <span>{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Bottom counters */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-slate-400" />
                      <span>{course.lessons.length} bài học</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-medium text-blue-700">
                      <Award className="w-4 h-4 text-amber-500" />
                      <span>Thi cuối khóa: {course.quiz.questions.length} câu</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Course Bottom Action Bar */}
              <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-3">
                <div className="text-xs">
                  {isPassed ? (
                    <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Đã đạt ({userProgress?.quizScore}%)</span>
                    </div>
                  ) : hasScore ? (
                    <div className="text-rose-600 font-semibold">
                      Chưa đạt ({userProgress?.quizScore}% - Cần thi lại)
                    </div>
                  ) : (
                    <span className="text-slate-400">Chưa thi cuối khóa</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedCourseDetail(course);
                      setDetailTab(course.youtubeUrl ? 'video' : 'pdf');
                      setPdfViewMode('embedded_pdf');
                      setCurrentSlidePage(1);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Xem bài giảng
                  </button>

                  <button
                    onClick={() => onStartQuiz(course)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors"
                  >
                    <span>Làm bài trắc nghiệm</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================== */}
      {/* MODAL 1: VIEW & LEARN (XEM VIDEO YOUTUBE & BÀI HỌC) */}
      {/* ========================================================== */}
      {selectedCourseDetail && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-blue-100 text-blue-700">
                  {selectedCourseDetail.code}
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {selectedCourseDetail.title}
                  </h3>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Phân hệ {selectedCourseDetail.category} · Cấp độ: {selectedCourseDetail.level} · {selectedCourseDetail.estimatedHours} giờ đào tạo
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Admin Delete Course inside modal */}
                {canDeleteCourses && (
                  <button
                    onClick={() => setCourseToDelete(selectedCourseDetail)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa khóa học</span>
                  </button>
                )}

                <button
                  onClick={() => setSelectedCourseDetail(null)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="px-6 pt-3 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2 overflow-x-auto">
                {selectedCourseDetail.youtubeUrl && (
                  <button
                    onClick={() => setDetailTab('video')}
                    className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 -mb-px whitespace-nowrap ${
                      detailTab === 'video'
                        ? 'border-rose-600 text-rose-600 bg-white font-bold'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Youtube className="w-4 h-4 text-rose-600" />
                    <span>Video Bài Giảng YouTube</span>
                  </button>
                )}

                <button
                  onClick={() => setDetailTab('pdf')}
                  className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 -mb-px whitespace-nowrap ${
                    detailTab === 'pdf'
                      ? 'border-blue-600 text-blue-600 bg-white font-bold'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Presentation className="w-4 h-4" />
                  <span>Tài Liệu & Slide Giáo Trình</span>
                </button>

                <button
                  onClick={() => setDetailTab('lessons')}
                  className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 -mb-px whitespace-nowrap ${
                    detailTab === 'lessons'
                      ? 'border-blue-600 text-blue-600 bg-white font-bold'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Danh Mục Bài Giảng ({selectedCourseDetail.lessons.length})</span>
                </button>

                <button
                  onClick={() => setDetailTab('quiz')}
                  className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 -mb-px whitespace-nowrap ${
                    detailTab === 'quiz'
                      ? 'border-blue-600 text-blue-600 bg-white font-bold'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Award className="w-4 h-4" />
                  <span>Bài Kiểm Tra Cuối Khóa ({selectedCourseDetail.quiz.questions.length} câu)</span>
                </button>
              </div>

              {canManageCourses && detailTab === 'lessons' && (
                <button
                  onClick={() => setIsAddLessonModalOpen(true)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold mb-1 shadow-2xs whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm bài giảng vào giáo trình</span>
                </button>
              )}
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto grow">
              {/* TAB VIDEO YOUTUBE: HỌC VIÊN XEM VIDEO VÀ HỌC THEO */}
              {detailTab === 'video' && selectedCourseDetail.youtubeUrl && (
                <div className="space-y-5">
                  {/* YouTube Player Frame */}
                  <div className="bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-800 aspect-16/9 w-full relative">
                    <iframe
                      src={getYouTubeEmbedUrl(selectedCourseDetail.youtubeUrl) || selectedCourseDetail.youtubeUrl}
                      title={`Video bài giảng: ${selectedCourseDetail.title}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="w-full h-full border-0"
                    />
                  </div>

                  {/* Video Guide & Key Learning Highlights */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Youtube className="w-5 h-5 text-rose-600" />
                        <h4 className="text-sm font-bold text-slate-900">
                          Hướng Dẫn Học Theo Video Bài Giảng
                        </h4>
                      </div>
                      <span className="text-xs text-slate-500 font-mono">
                        Thời lượng: {selectedCourseDetail.videoDuration || '20 phút'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {selectedCourseDetail.description}
                    </p>

                    <div className="pt-2 border-t border-slate-200">
                      <div className="text-xs font-bold text-slate-800 mb-2">
                        Các điểm kiến thức cốt lõi cần ghi nhớ trong video:
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {selectedCourseDetail.objectives.map((obj, i) => (
                          <div
                            key={i}
                            className="p-2.5 bg-white border border-slate-200 rounded-lg flex items-start gap-2 text-xs text-slate-700"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{obj}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action Bar after Watching */}
                  <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-bold text-blue-950">
                        Đã hoàn tất theo dõi video bài giảng?
                      </div>
                      <div className="text-[11px] text-blue-700 mt-0.5">
                        Làm bài kiểm tra trắc nghiệm cuối khóa để đánh giá năng lực và cấp chứng chỉ.
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const target = selectedCourseDetail;
                        setSelectedCourseDetail(null);
                        onStartQuiz(target);
                      }}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors whitespace-nowrap flex items-center justify-center gap-2"
                    >
                      <Award className="w-4 h-4 text-amber-300" />
                      <span>Bắt đầu làm bài thi cuối khóa &rarr;</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: PDF SLIDE VIEWER */}
              {detailTab === 'pdf' && (
                <div className="space-y-4">
                  {/* Mode Selector & Upload Toolbar */}
                  <div className="p-3 bg-slate-900 text-white rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <Presentation className="w-4 h-4 text-blue-400 shrink-0" />
                      <span className="font-semibold truncate">
                        {selectedCourseDetail.pdfSlideName || 'Tài_Liệu_Giao_Trinh.pdf'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700">
                        <button
                          onClick={() => setPdfViewMode('embedded_pdf')}
                          className={`px-2.5 py-1 text-[11px] font-semibold rounded transition-colors ${
                            pdfViewMode === 'embedded_pdf'
                              ? 'bg-blue-600 text-white'
                              : 'text-slate-300 hover:text-white'
                          }`}
                        >
                          Trình xem PDF
                        </button>
                        <button
                          onClick={() => setPdfViewMode('interactive_slides')}
                          className={`px-2.5 py-1 text-[11px] font-semibold rounded transition-colors ${
                            pdfViewMode === 'interactive_slides'
                              ? 'bg-blue-600 text-white'
                              : 'text-slate-300 hover:text-white'
                          }`}
                        >
                          Slide bài giảng ({totalDeckSlides} slide)
                        </button>
                      </div>

                      <label className="cursor-pointer flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded text-[11px] font-semibold transition-colors">
                        <UploadCloud className="w-3 h-3 text-blue-400" />
                        <span>Đổi file</span>
                        <input
                          type="file"
                          accept=".pdf,.pptx,.ppt,application/pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.ms-powerpoint"
                          onChange={handleUploadPdfForExistingCourse}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {pdfViewMode === 'embedded_pdf' && (
                    <div className="space-y-3">
                      {selectedCourseDetail.pdfSlideUrl ? (
                        <PdfCanvasViewer
                          pdfUrl={selectedCourseDetail.pdfSlideUrl}
                          fileName={selectedCourseDetail.pdfSlideName}
                          className="min-h-[520px]"
                        />
                      ) : (
                        <div className="p-12 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 flex flex-col items-center justify-center text-center">
                          <FileText className="w-12 h-12 text-slate-400 mb-2" />
                          <h4 className="text-sm font-bold text-slate-800">
                            Chưa có file bài giảng PDF/PowerPoint nào được đính kèm
                          </h4>
                          <p className="text-xs text-slate-500 mt-1 max-w-sm">
                            Vui lòng chọn một file PDF hoặc PowerPoint (.pptx) từ máy tính của bạn để đính kèm giáo trình.
                          </p>
                          <label className="mt-4 cursor-pointer px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors">
                            <span>Tải file bài giảng (PDF / PPTX)</span>
                            <input
                              type="file"
                              accept=".pdf,.pptx,.ppt,application/pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.ms-powerpoint"
                              onChange={handleUploadPdfForExistingCourse}
                              className="hidden"
                            />
                          </label>
                        </div>
                      )}
                    </div>
                  )}

                  {pdfViewMode === 'interactive_slides' && (
                    <div className="space-y-4">
                      {/* Slide Controls Bar */}
                      <div className="flex items-center justify-between bg-slate-100 p-2.5 rounded-xl border border-slate-200 text-xs">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setCurrentSlidePage((prev) => Math.max(1, prev - 1))}
                            disabled={currentSlidePage <= 1}
                            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <span className="font-mono font-bold text-slate-800 tabular-nums">
                            Slide {currentSlidePage} / {totalDeckSlides}
                          </span>
                          <button
                            onClick={() => setCurrentSlidePage((prev) => Math.min(totalDeckSlides, prev + 1))}
                            disabled={currentSlidePage >= totalDeckSlides}
                            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Slide Canvas */}
                      <div className="border border-slate-200 rounded-xl bg-slate-900 p-4 sm:p-8 flex items-center justify-center min-h-[420px] shadow-lg relative overflow-hidden">
                        <div className="w-full max-w-2xl aspect-16/9 bg-white rounded-xl shadow-2xl border border-slate-200 p-6 sm:p-8 flex flex-col justify-between text-slate-900">
                          {/* Slide Header */}
                          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                                N
                              </div>
                              <span className="text-xs font-bold text-slate-800">
                                {selectedCourseDetail.category} Track · NexusLearn
                              </span>
                            </div>
                            <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                              {selectedCourseDetail.code}
                            </span>
                          </div>

                          <div className="py-4">
                            {currentSlidePage === 1 && (
                              <div className="space-y-3">
                                <div className="text-xs font-bold uppercase tracking-wider text-blue-600">
                                  Giáo Trình Đào Tạo Doanh Nghiệp
                                </div>
                                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                                  {selectedCourseDetail.title}
                                </h1>
                                <p className="text-xs text-slate-600 leading-relaxed pt-1">
                                  {selectedCourseDetail.description}
                                </p>
                              </div>
                            )}

                            {currentSlidePage === 2 && (
                              <div className="space-y-3">
                                <div className="text-xs font-bold uppercase tracking-wider text-blue-600">
                                  Mục Tiêu Đào Tạo Cốt Lõi
                                </div>
                                <div className="space-y-2 pt-2">
                                  {selectedCourseDetail.objectives.map((obj, oi) => (
                                    <div
                                      key={oi}
                                      className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl flex items-start gap-2.5 text-xs text-slate-800"
                                    >
                                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                                      <span className="font-medium">{obj}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {currentSlidePage > 2 && currentSlidePage <= 2 + selectedCourseDetail.lessons.length && (() => {
                              const lessonIndex = currentSlidePage - 3;
                              const lesson = selectedCourseDetail.lessons[lessonIndex];
                              if (!lesson) return null;

                              return (
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                                      Bài Học Số {lessonIndex + 1}
                                    </span>
                                    <span className="text-xs font-mono font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                      {lesson.duration}
                                    </span>
                                  </div>
                                  <h2 className="text-lg font-bold text-slate-900 leading-snug">
                                    {lesson.title}
                                  </h2>
                                  <div className="space-y-2 pt-2">
                                    {lesson.keyPoints.map((kp, kpi) => (
                                      <div
                                        key={kpi}
                                        className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-2 text-xs text-slate-700"
                                      >
                                        <div className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                                        <span>{kp}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            })()}

                            {currentSlidePage === totalDeckSlides && (
                              <div className="space-y-3 text-center py-2">
                                <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 mx-auto flex items-center justify-center">
                                  <Award className="w-6 h-6" />
                                </div>
                                <h2 className="text-lg font-bold text-slate-900">
                                  {selectedCourseDetail.quiz.title}
                                </h2>
                                <button
                                  onClick={() => {
                                    const target = selectedCourseDetail;
                                    setSelectedCourseDetail(null);
                                    onStartQuiz(target);
                                  }}
                                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
                                >
                                  Bắt đầu làm bài thi cuối khóa ngay &rarr;
                                </button>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 pt-3">
                            <span>{selectedCourseDetail.title}</span>
                            <span>Slide {currentSlidePage} / {totalDeckSlides}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: LESSONS CURRICULUM */}
              {detailTab === 'lessons' && (
                <div className="space-y-4">
                  <div className="space-y-3">
                    {selectedCourseDetail.lessons.map((lesson, idx) => (
                      <div
                        key={lesson.id}
                        className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-200 transition-colors shadow-2xs"
                      >
                        <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[11px]">
                              {idx + 1}
                            </span>
                            <span className="text-sm">{lesson.title}</span>
                          </div>
                          <span className="text-slate-400 font-mono text-xs">{lesson.duration}</span>
                        </div>

                        <div className="mt-3 pl-7 space-y-1.5">
                          {lesson.keyPoints.map((kp, kpi) => (
                            <div
                              key={kpi}
                              className="text-xs text-slate-600 flex items-center gap-2"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                              <span>{kp}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: FINAL QUIZ PREVIEW */}
              {detailTab === 'quiz' && (
                <div className="space-y-5">
                  <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-amber-900">
                        {selectedCourseDetail.quiz.title}
                      </h4>
                      <div className="text-xs text-amber-800 mt-0.5">
                        Chuẩn hoàn thành: <strong>{selectedCourseDetail.quiz.passScorePercentage}%</strong> · Thời gian: <strong>{selectedCourseDetail.quiz.durationMinutes} phút</strong>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const target = selectedCourseDetail;
                        setSelectedCourseDetail(null);
                        onStartQuiz(target);
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors whitespace-nowrap"
                    >
                      Vào làm bài thi ngay
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Danh sách câu hỏi trắc nghiệm ({selectedCourseDetail.quiz.questions.length} câu)
                    </div>

                    {selectedCourseDetail.quiz.questions.map((q, qidx) => (
                      <div
                        key={q.id}
                        className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs"
                      >
                        <div className="font-semibold text-slate-900">
                          Câu {qidx + 1}: {q.question}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-2">
                          {q.options.map((opt, optIdx) => (
                            <div
                              key={optIdx}
                              className={`p-2 rounded-lg text-xs ${
                                optIdx === q.correctAnswer
                                  ? 'bg-emerald-100 text-emerald-900 font-semibold border border-emerald-300'
                                  : 'text-slate-600 bg-white border border-slate-200'
                              }`}
                            >
                              {String.fromCharCode(65 + optIdx)}. {opt}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-500">
                Toàn bộ dữ liệu được quản lý và bảo vệ trên Firestore Cloud.
              </span>
              <button
                onClick={() => {
                  const target = selectedCourseDetail;
                  setSelectedCourseDetail(null);
                  onStartQuiz(target);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors"
              >
                Bắt đầu làm bài kiểm tra cuối khóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* MODAL 2: CONFIRM DELETE COURSE (QUẢN TRỊ VIÊN XÓA KHÓA HỌC) */}
      {/* ========================================================== */}
      {courseToDelete && (
        <div className="fixed inset-0 z-70 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="p-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
                <Trash2 className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Xác Nhận Xóa Vĩnh Viễn Khóa Học?
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Bạn đang chuẩn bị xóa khóa học:
                </p>
                <div className="mt-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800">
                  [{courseToDelete.code}] {courseToDelete.title}
                </div>
                <p className="text-[11px] text-rose-600 mt-2">
                  Lưu ý: Hành động này sẽ xóa vĩnh viễn khóa học, toàn bộ đề thi trắc nghiệm và tiến độ liên quan khỏi cơ sở dữ liệu.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setCourseToDelete(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                  className="flex items-center gap-1.5 px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
                >
                  {isDeleting ? (
                    <span>Đang xóa...</span>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xác nhận xóa vĩnh viễn</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* MODAL 3: ADD LESSON TO EXISTING COURSE */}
      {/* ========================================================== */}
      {isAddLessonModalOpen && selectedCourseDetail && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Thêm Bài Giảng Mới Vào Giáo Trình
              </h3>
              <button
                onClick={() => setIsAddLessonModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tiêu đề bài giảng *
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Kỹ thuật phân tích bảng giá và chi phí hạ tầng"
                  value={newLessonTitle}
                  onChange={(e) => setNewLessonTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Thời lượng dự kiến
                </label>
                <input
                  type="text"
                  placeholder="30 phút, 45 phút..."
                  value={newLessonDuration}
                  onChange={(e) => setNewLessonDuration(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Các điểm cốt lõi bài học (mỗi dòng một ý)
                </label>
                <textarea
                  rows={3}
                  placeholder="Phương pháp tính toán TCO&#10;Kịch bản so sánh đối thủ&#10;Cam kết bảo mật"
                  value={newLessonPoints}
                  onChange={(e) => setNewLessonPoints(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddLessonModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleAddLessonToExistingCourse}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                >
                  Lưu bài giảng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* MODAL 4: CREATE COURSE WIZARD (TẠO KHÓA HỌC: VIDEO / PDF & BÀI THI) */}
      {/* ========================================================== */}
      {isAddCourseModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Wizard Header */}
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Tạo Khóa Đào Tạo Mới (Quy Trình 3 Bước)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Thiết lập tên/mã khóa học, nhúng video YouTube bài giảng hoặc slide PDF, và bộ câu hỏi trắc nghiệm
                </p>
              </div>
              <button
                onClick={() => setIsAddCourseModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step Indicators */}
            <div className="px-6 py-3 border-b border-slate-200 bg-white grid grid-cols-3 gap-2 shrink-0">
              <button
                onClick={() => setWizardStep(1)}
                className={`flex items-center gap-2 p-2 rounded-lg text-left text-xs transition-colors ${
                  wizardStep === 1
                    ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  wizardStep === 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  1
                </span>
                <span className="truncate">1. Tên & Mã khóa</span>
              </button>

              <button
                onClick={() => setWizardStep(2)}
                className={`flex items-center gap-2 p-2 rounded-lg text-left text-xs transition-colors ${
                  wizardStep === 2
                    ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  wizardStep === 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  2
                </span>
                <span className="truncate">2. Video / Slide PDF</span>
              </button>

              <button
                onClick={() => setWizardStep(3)}
                className={`flex items-center gap-2 p-2 rounded-lg text-left text-xs transition-colors ${
                  wizardStep === 3
                    ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  wizardStep === 3 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  3
                </span>
                <span className="truncate">3. Bài kiểm tra cuối khóa</span>
              </button>
            </div>

            {/* Step Body */}
            <div className="p-6 overflow-y-auto grow space-y-4">
              {/* STEP 1: TÊN & MÃ KHÓA HỌC */}
              {wizardStep === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-1">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Mã khóa học *
                      </label>
                      <input
                        type="text"
                        placeholder="SAL-103, TEC-203..."
                        value={courseCode}
                        onChange={(e) => setCourseCode(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono uppercase"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Tên khóa học *
                      </label>
                      <input
                        type="text"
                        placeholder="Ví dụ: Chiến Lược Chốt Sale Giải Pháp Hybrid Cloud B2B"
                        value={courseTitle}
                        onChange={(e) => setCourseTitle(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Phân hệ đào tạo
                      </label>
                      <select
                        value={courseCategory}
                        onChange={(e) => setCourseCategory(e.target.value as 'Sales' | 'Technical')}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Sales">Sales (Kinh doanh)</option>
                        <option value="Technical">Technical (Kỹ thuật)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Cấp độ
                      </label>
                      <select
                        value={courseLevel}
                        onChange={(e) => setCourseLevel(e.target.value as any)}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Cơ bản">Cơ bản</option>
                        <option value="Nâng cao">Nâng cao</option>
                        <option value="Chuyên sâu">Chuyên sâu</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Thời lượng đào tạo (giờ)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={60}
                        value={courseHours}
                        onChange={(e) => setCourseHours(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Mô tả tổng quan khóa học *
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Mô tả mục đích, đối tượng học viên và lợi ích khóa học mang lại..."
                      value={courseDesc}
                      onChange={(e) => setCourseDesc(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Course Objectives */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Mục tiêu đào tạo chuyên môn
                    </label>
                    <div className="space-y-1.5 mb-2">
                      {courseObjectives.map((obj, i) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                          <span className="text-slate-800">{obj}</span>
                          <button
                            type="button"
                            onClick={() => setCourseObjectives(courseObjectives.filter((_, idx) => idx !== i))}
                            className="text-slate-400 hover:text-rose-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Thêm mục tiêu mới..."
                        value={newObjInput}
                        onChange={(e) => setNewObjInput(e.target.value)}
                        className="grow px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newObjInput.trim()) {
                            setCourseObjectives([...courseObjectives, newObjInput.trim()]);
                            setNewObjInput('');
                          }
                        }}
                        className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold"
                      >
                        + Thêm mục tiêu
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: NỘI DUNG BÀI GIẢNG (VIDEO YOUTUBE HOẶC SLIDE PDF) */}
              {wizardStep === 2 && (
                <div className="space-y-5">
                  {/* Select Delivery Mode */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-2">
                      Hình thức truyền tải bài giảng chính *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setContentDeliveryMode('video')}
                        className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-colors ${
                          contentDeliveryMode === 'video'
                            ? 'bg-rose-50 border-rose-400 text-rose-950 font-bold ring-2 ring-rose-500/20'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          contentDeliveryMode === 'video' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          <Youtube className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold">Video YouTube Bài Giảng</div>
                          <div className="text-[11px] text-slate-500 font-normal mt-0.5">
                            Học viên xem video trực quan và học theo từng bước thực hành.
                          </div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setContentDeliveryMode('pdf')}
                        className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-colors ${
                          contentDeliveryMode === 'pdf'
                            ? 'bg-blue-50 border-blue-400 text-blue-950 font-bold ring-2 ring-blue-500/20'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          contentDeliveryMode === 'pdf' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          <Presentation className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold">Tài Liệu Slide PDF / PPTX</div>
                          <div className="text-[11px] text-slate-500 font-normal mt-0.5">
                            Đính kèm file giáo trình PDF hoặc slide thuyết trình.
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* MODE 1: YOUTUBE VIDEO CONFIG */}
                  {(contentDeliveryMode === 'video' || contentDeliveryMode === 'both') && (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Youtube className="w-4 h-4 text-rose-600" />
                          <span>Đường dẫn Video YouTube bài giảng *</span>
                        </label>
                        <span className="text-[11px] text-slate-500">Hỗ trợ link youtube.com hoặc youtu.be</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          placeholder="Ví dụ: https://www.youtube.com/watch?v=M988_fsOSWo"
                          value={youtubeUrlInput}
                          onChange={(e) => setYoutubeUrlInput(e.target.value)}
                          className="sm:col-span-2 px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                        />
                        <input
                          type="text"
                          placeholder="Thời lượng (vd: 18:45)"
                          value={videoDurationInput}
                          onChange={(e) => setVideoDurationInput(e.target.value)}
                          className="sm:col-span-1 px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                        />
                      </div>

                      {/* Quick Sample Video Buttons */}
                      <div className="pt-1">
                        <div className="text-[11px] font-semibold text-slate-500 mb-1.5">
                          Gợi ý video bài giảng mẫu chuẩn:
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {SAMPLE_YOUTUBE_LECTURES.map((sample, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setYoutubeUrlInput(sample.url);
                                setVideoDurationInput(sample.duration);
                                showToast(`Đã chọn video mẫu: ${sample.title}`, 'info');
                              }}
                              className="px-2.5 py-1 text-[11px] bg-white border border-slate-200 hover:border-rose-300 text-slate-700 rounded-lg transition-colors flex items-center gap-1"
                            >
                              <Play className="w-2.5 h-2.5 fill-rose-600 text-rose-600" />
                              <span className="truncate max-w-[200px]">{sample.title}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Live Embedded YouTube Video Preview */}
                      {extractYouTubeId(youtubeUrlInput) && (
                        <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
                          <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                            <span>Khung phát video bài giảng xem trước:</span>
                            <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" /> Video hợp lệ
                            </span>
                          </div>
                          <div className="aspect-16/9 w-full bg-black rounded-xl overflow-hidden shadow-md">
                            <iframe
                              src={getYouTubeEmbedUrl(youtubeUrlInput) || ''}
                              title="YouTube Preview Player"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              className="w-full h-full border-0"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* MODE 2: PDF / PPTX CONFIG */}
                  {contentDeliveryMode === 'pdf' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">
                        Slide Giáo Trình Khóa Học (Hỗ trợ file PDF hoặc PowerPoint .pptx) *
                      </label>

                      <div className="p-5 border-2 border-dashed border-blue-200 rounded-2xl bg-blue-50/30 flex flex-col items-center justify-center text-center">
                        <Presentation className="w-10 h-10 text-blue-600 mb-2" />

                        {pdfFileName ? (
                          <div className="space-y-1">
                            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Đã tải lên: {pdfFileName}</span>
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {pdfFileName.toLowerCase().endsWith('.pptx') || pdfFileName.toLowerCase().endsWith('.ppt')
                                ? 'File PowerPoint hợp lệ. Hệ thống sẽ tối ưu hóa hiển thị dạng Slide 16:9.'
                                : 'File PDF hợp lệ và sẵn sàng hiển thị trong khóa học.'}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="text-xs font-bold text-slate-800">
                              Tải lên slide bài giảng PDF hoặc PowerPoint (.pptx) từ máy tính
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              Hỗ trợ tệp .pdf, .pptx, .ppt dung lượng đến 50MB
                            </div>
                          </div>
                        )}

                        <div className="mt-3 flex items-center gap-2">
                          <label className="cursor-pointer px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs">
                            <span>{pdfFileName ? 'Chọn file khác' : 'Chọn file từ máy (PDF / PPTX)'}</span>
                            <input
                              type="file"
                              accept=".pdf,.pptx,.ppt,application/pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.ms-powerpoint"
                              onChange={handlePdfFileChange}
                              className="hidden"
                            />
                          </label>

                          <button
                            type="button"
                            onClick={() => handleUsePresetPdf(courseCategory === 'Sales' ? 'sales' : 'tech')}
                            className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                          >
                            Dùng slide mẫu có sẵn
                          </button>
                        </div>
                      </div>

                      {/* Live Canvas Preview of Uploaded PDF inside Step 2 */}
                      {pdfFileUrl && (
                        <div className="mt-4 space-y-2">
                          <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                            <span>Xem trước file giáo trình vừa tải lên:</span>
                            <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> File sẵn sàng hiển thị
                            </span>
                          </div>
                          <PdfCanvasViewer
                            pdfUrl={pdfFileUrl}
                            fileName={pdfFileName}
                            className="max-h-[380px]"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Add Lessons To Curriculum */}
                  <div className="border-t border-slate-100 pt-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Danh sách các bài giảng trong giáo trình ({wizardLessons.length})
                      </h4>
                    </div>

                    <div className="space-y-2 mb-3">
                      {wizardLessons.map((l, idx) => (
                        <div
                          key={l.id}
                          className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-bold text-slate-800">
                              Bài {idx + 1}: {l.title}
                            </span>
                            <span className="text-slate-400 ml-2">({l.duration})</span>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {l.keyPoints.join(' · ')}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setWizardLessons((prev) => prev.filter((_, i) => i !== idx))
                            }
                            className="text-slate-400 hover:text-rose-600 p-1"
                            title="Xóa bài học này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2 text-xs">
                      <div className="font-semibold text-slate-800">Thêm bài giảng mới vào giáo trình</div>
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="text"
                          placeholder="Tên bài giảng..."
                          value={tempLessonTitle}
                          onChange={(e) => setTempLessonTitle(e.target.value)}
                          className="col-span-2 px-3 py-1.5 border border-slate-200 rounded-lg"
                        />
                        <input
                          type="text"
                          placeholder="Thời lượng (vd: 35 phút)"
                          value={tempLessonDuration}
                          onChange={(e) => setTempLessonDuration(e.target.value)}
                          className="col-span-1 px-3 py-1.5 border border-slate-200 rounded-lg"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Điểm trọng tâm bài học..."
                        value={tempLessonKeyPoints}
                        onChange={(e) => setTempLessonKeyPoints(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                      />
                      <div className="text-right">
                        <button
                          type="button"
                          onClick={handleAddWizardLesson}
                          className="px-3 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold"
                        >
                          + Thêm vào giáo trình
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: BÀI KIỂM TRA TRẮC NGHIỆM CUỐI KHÓA */}
              {wizardStep === 3 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Điểm chuẩn đạt (%) *
                      </label>
                      <input
                        type="number"
                        min={50}
                        max={100}
                        value={quizPassScore}
                        onChange={(e) => setQuizPassScore(Number(e.target.value))}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Thời gian làm bài (Phút) *
                      </label>
                      <input
                        type="number"
                        min={5}
                        max={60}
                        value={quizDuration}
                        onChange={(e) => setQuizDuration(Number(e.target.value))}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-mono font-bold"
                      />
                    </div>
                  </div>

                  {/* Question List */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 uppercase tracking-wider">
                        Bộ câu hỏi bài kiểm tra ({wizardQuestions.length} câu)
                      </span>
                    </div>

                    {wizardQuestions.map((q, qi) => (
                      <div
                        key={q.id}
                        className="p-3 bg-white border border-slate-200 rounded-xl text-xs space-y-1.5 relative group"
                      >
                        <div className="flex items-start justify-between">
                          <span className="font-bold text-slate-900">
                            Câu {qi + 1}: {q.question}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setWizardQuestions((prev) => prev.filter((_, i) => i !== qi))
                            }
                            className="text-slate-400 hover:text-rose-600 p-1"
                            title="Xóa câu hỏi này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-600 pl-2">
                          {q.options.map((opt, oi) => (
                            <div
                              key={oi}
                              className={
                                oi === q.correctAnswer
                                  ? 'font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded'
                                  : ''
                              }
                            >
                              {String.fromCharCode(65 + oi)}. {opt}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add New Question Form */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
                    <div className="font-bold text-slate-900">Thêm câu hỏi mới vào đề thi</div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Nội dung câu hỏi *
                      </label>
                      <input
                        type="text"
                        placeholder="Nhập nội dung câu hỏi trắc nghiệm..."
                        value={newQTitle}
                        onChange={(e) => setNewQTitle(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                          Đáp án A *
                        </label>
                        <input
                          type="text"
                          placeholder="Phương án A..."
                          value={newQOptA}
                          onChange={(e) => setNewQOptA(e.target.value)}
                          className="w-full px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                          Đáp án B *
                        </label>
                        <input
                          type="text"
                          placeholder="Phương án B..."
                          value={newQOptB}
                          onChange={(e) => setNewQOptB(e.target.value)}
                          className="w-full px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                          Đáp án C
                        </label>
                        <input
                          type="text"
                          placeholder="Phương án C..."
                          value={newQOptC}
                          onChange={(e) => setNewQOptC(e.target.value)}
                          className="w-full px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                          Đáp án D
                        </label>
                        <input
                          type="text"
                          placeholder="Phương án D..."
                          value={newQOptD}
                          onChange={(e) => setNewQOptD(e.target.value)}
                          className="w-full px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                          Phương án đúng
                        </label>
                        <select
                          value={newQCorrect}
                          onChange={(e) => setNewQCorrect(Number(e.target.value))}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-emerald-700"
                        >
                          <option value={0}>Đáp án A là đáp án đúng</option>
                          <option value={1}>Đáp án B là đáp án đúng</option>
                          <option value={2}>Đáp án C là đáp án đúng</option>
                          <option value={3}>Đáp án D là đáp án đúng</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                          Giải thích đáp án
                        </label>
                        <input
                          type="text"
                          placeholder="Lý do phương án này đúng..."
                          value={newQExplanation}
                          onChange={(e) => setNewQExplanation(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                    </div>

                    <div className="text-right pt-1">
                      <button
                        type="button"
                        onClick={handleAddWizardQuestion}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
                      >
                        + Thêm câu hỏi vào đề
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Wizard Footer Nav */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <div>
                {wizardStep > 1 ? (
                  <button
                    type="button"
                    onClick={() => setWizardStep((prev) => (prev - 1) as any)}
                    className="flex items-center gap-1 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100"
                  >
                    <ChevronLeft className="w-4 h-4" /> Quay lại bước {wizardStep - 1}
                  </button>
                ) : (
                  <span className="text-xs text-slate-400">Bước 1 trên 3</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {wizardStep < 3 ? (
                  <button
                    type="button"
                    onClick={() => setWizardStep((prev) => (prev + 1) as any)}
                    className="flex items-center gap-1 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                  >
                    <span>Tiếp theo: Bước {wizardStep + 1}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleFinalSubmitCourse}
                    className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Lưu & Xuất Bản Khóa Học</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
