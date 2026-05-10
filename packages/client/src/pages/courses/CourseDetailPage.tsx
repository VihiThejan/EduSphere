import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  BarChart3,
  BookOpen,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  Clock3,
  Download,
  FileText,
  LayoutDashboard,
  ListChecks,
  Lock,
  PlayCircle,
  Settings,
  ShoppingBag,
  Star,
  TrendingUp,
  Users,
  GraduationCap,
} from 'lucide-react';
import { Course, Lesson, USER_ROLES } from '@edusphere/shared';
import { AppFooter, AppHeader, AppNavItem, AppSidebar } from '@/components/common';
import { coursesApi } from '@/services/api/courses.api';
import { analyticsApi } from '@/services/api/analytics.api';
import { useAuthStore } from '@/store/authStore';
import CourseCheckoutModal from '@/components/courses/CourseCheckoutModal';
import { config } from '@/config';

// ── helpers ──────────────────────────────────────────────────────────────────

const formatDuration = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m}m`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
};

const formatTotalDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
};

const formatPrice = (course: Course): string => {
  const amount = course.pricing.discountPrice ?? course.pricing.amount;
  if (amount <= 0) return 'FREE';
  return `LKR ${amount.toLocaleString()}`;
};

const categoryFallback: Record<string, string> = {
  programming:
    'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80',
  mathematics:
    'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=1200&q=80',
  physics:
    'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&w=1200&q=80',
  chemistry:
    'https://images.unsplash.com/photo-1532187643603-ba119ca4109e?auto=format&fit=crop&w=1200&q=80',
  biology:
    'https://images.unsplash.com/photo-1530210124550-912dc1381cb8?auto=format&fit=crop&w=1200&q=80',
  engineering:
    'https://images.unsplash.com/photo-1581092919535-7146ff1a5905?auto=format&fit=crop&w=1200&q=80',
  business:
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
  design:
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
  languages:
    'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
  other:
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
};

// ── component ─────────────────────────────────────────────────────────────────

const CourseDetailPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated, user, logout } = useAuthStore();

  const [enrolled, setEnrolled] = React.useState(false);
  const [feedbackMessage, setFeedbackMessage] = React.useState<string | null>(null);
  const [expandedLessonId, setExpandedLessonId] = React.useState<string | null>(null);
  const [completedLessonIds, setCompletedLessonIds] = React.useState<Set<string>>(new Set());
  const [markingLessonId, setMarkingLessonId] = React.useState<string | null>(null);
  const [showCheckoutModal, setShowCheckoutModal] = React.useState(false);
  const [downloadingCert, setDownloadingCert] = React.useState(false);
  /** Store video refs keyed by lessonId for interval-based saves */
  const videoRefs = React.useRef<Map<string, HTMLVideoElement>>(new Map());
  /** Track active save intervals per lesson */
  const saveIntervalsRef = React.useRef<Map<string, ReturnType<typeof setInterval>>>(new Map());

  const isStudent = !!user?.roles.includes(USER_ROLES.STUDENT);

  // ── nav items ──────────────────────────────────────────────────────────────

  const headerItems: AppNavItem[] = [
    { label: 'Courses', href: '/courses', active: true },
    { label: 'Kuppi', href: '/courses' },
    { label: 'Faculties', href: '/courses' },
    { label: 'My Learning', href: '/dashboard' },
  ];

  const sidebarPrimaryItems: AppNavItem[] = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Courses', href: '/courses', icon: BookOpen, active: true },
    { label: 'My Learning', href: '#', icon: Clock3 },
    { label: 'Marketplace', href: '/marketplace', icon: ShoppingBag },
    { label: 'Listings', href: '#', icon: ListChecks },
  ];

  const sidebarSecondaryItems: AppNavItem[] = [
    { label: 'Analytics', href: '#', icon: BarChart3 },
    { label: 'Settings', href: '#', icon: Settings },
  ];

  // ── queries ────────────────────────────────────────────────────────────────

  const {
    data: course,
    isLoading: courseLoading,
    isError: courseError,
  } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => coursesApi.getCourse(courseId!),
    enabled: !!courseId,
  });

  const { data: lessons, isLoading: lessonsLoading } = useQuery({
    queryKey: ['course-lessons', courseId],
    queryFn: () => coursesApi.getLessons(courseId!),
    enabled: !!courseId,
  });

  // ── enrollment check on page load ──────────────────────────────────────────

  const isOwner = !!(course && user && course.instructorId === user._id);

  const { data: enrollmentStatus } = useQuery({
    queryKey: ['enrollment-check', courseId],
    queryFn: () => coursesApi.checkEnrollment(courseId!),
    enabled: !!courseId && isAuthenticated && isStudent && !isOwner,
  });

  // Sync enrollment status from server
  React.useEffect(() => {
    if (enrollmentStatus?.isEnrolled && enrollmentStatus.status === 'active') {
      setEnrolled(true);
    }
  }, [enrollmentStatus]);

  const enrollmentDbStatus = enrollmentStatus?.status ?? null;

  // Owner (tutor who created the course) always has full access
  const hasFullAccess = enrolled || isOwner;

  // ── progress query (only when enrolled) ────────────────────────────────────

  const { data: progressData } = useQuery({
    queryKey: ['course-progress', courseId],
    queryFn: () => coursesApi.getCourseProgress(courseId!),
    enabled: !!courseId && enrolled && isStudent,
  });

  // Keep completedLessonIds in sync with server data
  React.useEffect(() => {
    if (progressData?.lessons) {
      const ids = new Set(
        progressData.lessons.filter((l) => l.isCompleted).map((l) => l._id)
      );
      setCompletedLessonIds(ids);
    }
  }, [progressData]);

  const progressPercent = progressData?.enrollment.progressPercentage ?? 0;
  const totalLessons = progressData?.course.totalLessons ?? 0;
  const completedCount = completedLessonIds.size;

  // ── mark lesson completed mutation ─────────────────────────────────────────

  const markCompleteMutation = useMutation({
    mutationFn: ({ lessonId }: { lessonId: string }) =>
      coursesApi.markLessonCompleted(courseId!, lessonId),
    onMutate: ({ lessonId }) => {
      setMarkingLessonId(lessonId);
    },
    onSuccess: (_data, { lessonId }) => {
      setCompletedLessonIds((prev) => new Set(prev).add(lessonId));
      setMarkingLessonId(null);
      // Refetch progress to get accurate percentage & auto-completion status
      void queryClient.invalidateQueries({ queryKey: ['course-progress', courseId] });
      void queryClient.invalidateQueries({ queryKey: ['student-dashboard'] });
      void queryClient.invalidateQueries({ queryKey: ['my-learning'] });
    },
    onError: () => {
      setMarkingLessonId(null);
    },
  });

  const handleMarkComplete = (lessonId: string) => {
    if (completedLessonIds.has(lessonId) || markingLessonId === lessonId) return;
    markCompleteMutation.mutate({ lessonId });
  };

  // ── watch progress save (fire-and-forget, every 10s) ───────────────────────

  const saveWatchProgressMutation = useMutation({
    mutationFn: (vars: { lessonId: string; watchedPosition: number; videoDuration: number }) =>
      coursesApi.saveWatchProgress(courseId!, vars.lessonId, vars.watchedPosition, vars.videoDuration),
    onSuccess: (data, vars) => {
      // Always refresh course progress so the progress bar updates in real-time
      void queryClient.invalidateQueries({ queryKey: ['course-progress', courseId] });
      void queryClient.invalidateQueries({ queryKey: ['my-learning'] });

      if (data.autoCompleted) {
        // Lesson was auto-completed by server (90% threshold)
        setCompletedLessonIds((prev) => new Set(prev).add(vars.lessonId));
        stopSaveInterval(vars.lessonId);
        void queryClient.invalidateQueries({ queryKey: ['student-dashboard'] });
      }
    },
  });

  const startSaveInterval = (lessonId: string) => {
    // Don't start if already running or lesson already completed
    if (saveIntervalsRef.current.has(lessonId) || completedLessonIds.has(lessonId)) return;

    const interval = setInterval(() => {
      const videoEl = videoRefs.current.get(lessonId);
      if (!videoEl || videoEl.paused || videoEl.ended) return;

      saveWatchProgressMutation.mutate({
        lessonId,
        watchedPosition: Math.floor(videoEl.currentTime),
        videoDuration: Math.floor(videoEl.duration || 0),
      });
    }, 10_000); // every 10 seconds

    saveIntervalsRef.current.set(lessonId, interval);
  };

  const stopSaveInterval = (lessonId: string) => {
    const interval = saveIntervalsRef.current.get(lessonId);
    if (interval) {
      clearInterval(interval);
      saveIntervalsRef.current.delete(lessonId);
    }
  };

  /** Save progress immediately (on pause, on end, on collapse) */
  const saveProgressNow = (lessonId: string) => {
    const videoEl = videoRefs.current.get(lessonId);
    if (!videoEl || !enrolled) return;

    const pos = Math.floor(videoEl.currentTime);
    const dur = Math.floor(videoEl.duration || 0);
    if (dur > 0) {
      saveWatchProgressMutation.mutate({
        lessonId,
        watchedPosition: pos,
        videoDuration: dur,
      });
    }
  };

  // Cleanup all intervals on unmount
  React.useEffect(() => {
    return () => {
      saveIntervalsRef.current.forEach((interval) => clearInterval(interval));
      saveIntervalsRef.current.clear();
    };
  }, []);

  // When a lesson is collapsed, save progress and stop interval
  const prevExpandedRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (prevExpandedRef.current && prevExpandedRef.current !== expandedLessonId) {
      saveProgressNow(prevExpandedRef.current);
      stopSaveInterval(prevExpandedRef.current);
    }
    prevExpandedRef.current = expandedLessonId;
  }, [expandedLessonId]);

  // ── enroll mutation ────────────────────────────────────────────────────────

  const enrollMutation = useMutation({
    mutationFn: () => coursesApi.enrollInCourse(courseId!),
    onSuccess: () => {
      setEnrolled(true);
      setFeedbackMessage('Successfully enrolled! You can now access all course lessons.');
      void queryClient.invalidateQueries({ queryKey: ['student-dashboard'] });
      void queryClient.invalidateQueries({ queryKey: ['enrollment-check', courseId] });
      void queryClient.invalidateQueries({ queryKey: ['my-learning'] });
    },
    onError: () => {
      setFeedbackMessage('You are already enrolled in this course.');
    },
  });

  const handleEnroll = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!isStudent) {
      setFeedbackMessage('Only student accounts can enroll in courses.');
      return;
    }
    // Paid course → open checkout modal
    const price = course?.pricing.discountPrice ?? course?.pricing.amount ?? 0;
    if (price > 0) {
      setShowCheckoutModal(true);
      return;
    }
    // Free course → enroll directly
    enrollMutation.mutate();
  };

  const handleDownloadCertificate = async () => {
    if (!courseId || !course) return;
    setDownloadingCert(true);
    try {
      const cert = await analyticsApi.getCertificate(courseId);
      // Build a simple printable certificate page
      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Certificate of Completion</title>
  <style>
    body { font-family: Georgia, serif; background: #f8f7f2; margin: 0; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .cert { background: white; border: 8px double #1e3a5f; padding: 60px 80px; max-width: 740px; text-align: center; box-shadow: 0 8px 40px rgba(0,0,0,.12); }
    .cert h1 { font-size: 2.8rem; color: #1e3a5f; margin-bottom: 8px; }
    .cert .sub { font-size: 1.1rem; color: #666; margin-bottom: 36px; }
    .cert .name { font-size: 2.2rem; color: #1e3a5f; border-bottom: 2px solid #1e3a5f; display: inline-block; padding-bottom: 4px; margin: 12px 0 28px; }
    .cert .course { font-size: 1.5rem; font-weight: bold; color: #333; margin-bottom: 12px; }
    .cert .meta { font-size: 0.9rem; color: #888; margin-top: 24px; }
    .cert .badge { display: inline-block; background: #1e3a5f; color: white; padding: 6px 20px; border-radius: 999px; font-size: 0.85rem; margin-top: 32px; }
  </style>
</head>
<body>
  <div class="cert">
    <h1>Certificate of Completion</h1>
    <p class="sub">This is to certify that</p>
    <div class="name">${cert.studentName}</div>
    <p>has successfully completed the course</p>
    <div class="course">${cert.courseTitle}</div>
    <p>Instructor: ${cert.instructorName} &nbsp;|&nbsp; Level: ${cert.level}</p>
    <p class="meta">Completed on ${new Date(cert.completedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    <div class="badge">EduSphere Verified</div>
  </div>
</body>
</html>`;
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Certificate_${course.title.replace(/\s+/g, '_')}.html`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setFeedbackMessage(err?.response?.data?.error?.message ?? 'Could not generate certificate. Complete all lessons first.');
    } finally {
      setDownloadingCert(false);
    }
  };

  // ── render helpers ─────────────────────────────────────────────────────────

  const renderSkeleton = () => (
    <div className="flex flex-1 flex-col gap-6 px-4 py-8 md:px-8 animate-pulse">
      <div className="h-64 rounded-2xl bg-slate-200" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-8 w-3/4 rounded bg-slate-200" />
          <div className="h-4 w-1/2 rounded bg-slate-200" />
          <div className="h-32 rounded bg-slate-200" />
        </div>
        <div className="h-64 rounded-xl bg-slate-200" />
      </div>
    </div>
  );

  const renderLessonRow = (lesson: Lesson, index: number) => {
    const isExpanded = expandedLessonId === lesson._id;
    const canAccess = hasFullAccess || lesson.isFree;
    const video = lesson.video;
    const documents = lesson.documents;
    const videoUrl = video?.cloudUrl;
    const isCompleted = completedLessonIds.has(lesson._id);
    const lessonProgress = progressData?.lessons.find((l) => l._id === lesson._id);
    const watchPct = lessonProgress?.watchProgress?.watchPercentage ?? 0;

    const handleLessonClick = () => {
      if (!canAccess) return;
      setExpandedLessonId(isExpanded ? null : lesson._id);
    };

    return (
      <div key={lesson._id} className={`overflow-hidden rounded-xl border bg-white shadow-sm ${isCompleted ? 'border-green-200' : 'border-slate-100'}`}>
        <button
          type="button"
          onClick={handleLessonClick}
          className={`flex w-full items-center gap-4 px-4 py-3 text-left transition ${
            canAccess ? 'hover:bg-slate-50 cursor-pointer' : 'cursor-default opacity-80'
          } ${isExpanded ? 'bg-primary-900/5' : ''}`}
        >
          {/* Lesson number or check icon */}
          {isCompleted ? (
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
              <CheckCircle size={18} />
            </span>
          ) : (
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-900/10 text-sm font-bold text-primary-900">
              {index + 1}
            </span>
          )}
          <div className="flex flex-1 flex-col">
            <span className={`text-sm font-semibold ${isCompleted ? 'text-green-700' : 'text-slate-800'}`}>
              {lesson.title}
            </span>
            {lesson.description && (
              <span className="text-xs text-slate-500">{lesson.description}</span>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            {isCompleted && (
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                Completed
              </span>
            )}
            {!isCompleted && enrolled && watchPct > 0 && (
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                {Math.round(watchPct)}% watched
              </span>
            )}
            {documents && documents.length > 0 && (
              <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-amber-700">
                <FileText size={12} />
                {documents.length} doc{documents.length > 1 ? 's' : ''}
              </span>
            )}
            {lesson.duration > 0 && (
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {formatDuration(lesson.duration)}
              </span>
            )}
            {lesson.isFree ? (
              <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">
                <PlayCircle size={12} />
                Preview
              </span>
            ) : !hasFullAccess ? (
              <Lock size={13} className="text-slate-400" />
            ) : null}
            {canAccess && (
              isExpanded ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />
            )}
          </div>
        </button>

        {/* Expanded content */}
        {isExpanded && canAccess && (
          <div className="border-t border-slate-100 px-4 py-4 bg-slate-50/50">
            {/* Video Player — with resume, periodic save, and auto-complete */}
            {videoUrl && (
              <div className="mb-4">
                <video
                  key={videoUrl}
                  controls
                  controlsList="nodownload"
                  className="w-full max-h-[480px] rounded-lg bg-black"
                  src={videoUrl}
                  preload="metadata"
                  ref={(el) => {
                    if (el) videoRefs.current.set(lesson._id, el);
                    else videoRefs.current.delete(lesson._id);
                  }}
                  onLoadedMetadata={async (e) => {
                    // Resume from last saved position
                    if (!enrolled) return;
                    try {
                      const wp = await coursesApi.getLessonWatchProgress(courseId!, lesson._id);
                      if (wp && wp.watchedPosition > 0) {
                        const videoEl = e.currentTarget;
                        // Don't seek if already completed — start from beginning
                        if (!completedLessonIds.has(lesson._id)) {
                          videoEl.currentTime = wp.watchedPosition;
                        }
                      }
                    } catch {
                      // No saved progress — start from beginning
                    }
                  }}
                  onPlay={() => {
                    if (enrolled) startSaveInterval(lesson._id);
                  }}
                  onPause={() => {
                    if (enrolled) {
                      saveProgressNow(lesson._id);
                      stopSaveInterval(lesson._id);
                    }
                  }}
                  onTimeUpdate={(e) => {
                    // Auto-complete at 90% watch threshold
                    if (!enrolled || isCompleted) return;
                    const videoEl = e.currentTarget;
                    if (videoEl.duration > 0) {
                      const pct = (videoEl.currentTime / videoEl.duration) * 100;
                      if (pct >= 90) {
                        handleMarkComplete(lesson._id);
                        stopSaveInterval(lesson._id);
                      }
                    }
                  }}
                  onEnded={() => {
                    if (enrolled) {
                      saveProgressNow(lesson._id);
                      stopSaveInterval(lesson._id);
                      if (!isCompleted) {
                        handleMarkComplete(lesson._id);
                      }
                    }
                  }}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            )}

            {!videoUrl && (
              <div className="mb-4 flex items-center justify-center rounded-lg bg-slate-100 py-12 text-slate-400">
                <div className="flex flex-col items-center gap-1">
                  <PlayCircle size={32} />
                  <span className="text-sm">No video available for this lesson</span>
                </div>
              </div>
            )}

            {/* Documents / labsheets */}
            {documents && documents.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Labsheets & Documents
                </h4>
                <div className="flex flex-col gap-2">
                  {documents.map((doc) => (
                    <a
                      key={doc._id}
                      href={`${config.apiUrl}/documents/${doc._id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-2.5 hover:border-primary-900/30 hover:shadow-sm transition"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-red-100 text-red-600">
                        <FileText size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 truncate">{doc.originalName}</p>
                        <p className="text-xs text-slate-400">{doc.mimetype === 'application/pdf' ? 'PDF' : 'Document'} · {(doc.size / 1024).toFixed(0)} KB</p>
                      </div>
                      <Download size={16} className="text-slate-400 shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Completed indicator */}
            {enrolled && isCompleted && (
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
                <CheckCircle size={16} />
                Lesson completed
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // ── main render ────────────────────────────────────────────────────────────

  const thumbnail = course?.thumbnail || (course ? categoryFallback[course.category] : undefined);
  const priceLabel = course ? formatPrice(course) : '';
  const isFree = course ? (course.pricing.discountPrice ?? course.pricing.amount) <= 0 : false;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <AppHeader
        navItems={headerItems}
        isAuthenticated={isAuthenticated}
        userName={user?.profile.firstName}
        userMeta={isAuthenticated ? 'Student Dashboard' : undefined}
        avatarUrl={user?.profile.avatar}
        onLogout={
          isAuthenticated
            ? () => {
                void logout();
              }
            : undefined
        }
      />

      <div className="flex flex-1">
        <AppSidebar
          primaryItems={sidebarPrimaryItems}
          secondaryItems={sidebarSecondaryItems}
          streakDays={0}
        />

        <main className="flex flex-1 flex-col min-w-0">
          {/* breadcrumb */}
          <div className="flex items-center gap-2 px-6 pt-6 text-sm text-slate-500 md:px-8">
            <Link to="/courses" className="hover:text-primary-900 transition">
              Courses
            </Link>
            <ChevronRight size={14} />
            <span className="truncate font-medium text-slate-700">
              {course?.title ?? 'Course Detail'}
            </span>
          </div>

          {courseLoading ? (
            renderSkeleton()
          ) : courseError || !course ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 py-24 text-center">
              <BookOpen size={48} className="text-slate-300" />
              <p className="text-lg font-semibold text-slate-600">Course not found</p>
              <Link
                to="/courses"
                className="rounded-lg bg-primary-900 px-5 py-2 text-sm font-semibold text-white hover:bg-primary-900/90 transition"
              >
                Back to Courses
              </Link>
            </div>
          ) : (
            <div className="px-4 py-6 md:px-8">
              {/* ── hero banner ─────────────────────────────────────── */}
              <div className="relative mb-8 h-52 w-full overflow-hidden rounded-2xl sm:h-64 md:h-72">
                <img
                  src={thumbnail}
                  alt={course.title}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = categoryFallback.other;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6">
                  <span className="mb-2 inline-block rounded-full bg-primary-900/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
                    {course.category}
                  </span>
                  <h1 className="text-2xl font-extrabold text-white sm:text-3xl">{course.title}</h1>
                  {course.instructorName && (
                    <p className="mt-1 text-sm text-slate-300">
                      by{' '}
                      <span className="font-semibold text-white">{course.instructorName}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* ── left column ─────────────────────────────────── */}
                <div className="flex flex-col gap-6 lg:col-span-2">
                  {/* stats row */}
                  <div className="flex flex-wrap gap-4 rounded-xl border border-slate-100 bg-white px-6 py-4 shadow-sm">
                    <StatChip
                      icon={<Star size={15} className="text-amber-400" />}
                      label={
                        course.stats.reviewCount > 0
                          ? `${course.stats.avgRating.toFixed(1)} (${course.stats.reviewCount} reviews)`
                          : 'No reviews yet'
                      }
                    />
                    <StatChip
                      icon={<Users size={15} className="text-primary-900" />}
                      label={`${course.stats.enrollmentCount.toLocaleString()} students`}
                    />
                    <StatChip
                      icon={<BookOpen size={15} className="text-primary-900" />}
                      label={`${course.stats.totalLessons} lessons`}
                    />
                    <StatChip
                      icon={<Clock size={15} className="text-primary-900" />}
                      label={formatTotalDuration(course.stats.totalDuration)}
                    />
                    <StatChip
                      icon={<TrendingUp size={15} className="text-primary-900" />}
                      label={course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                    />
                  </div>

                  {/* description */}
                  <div className="rounded-xl border border-slate-100 bg-white px-6 py-5 shadow-sm">
                    <h2 className="mb-3 text-base font-bold text-slate-800">About this course</h2>
                    <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">
                      {course.description}
                    </p>
                    {course.tags.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {course.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* course preview video */}
                  {(() => {
                    const previewLesson = lessons && [...lessons].sort((a, b) => a.order - b.order).find((l) => l.isFree && l.video?.cloudUrl);
                    const previewUrl = previewLesson?.video?.cloudUrl ?? null;
                    if (!previewUrl) return null;
                    return (
                      <div className="rounded-xl border border-slate-100 bg-white px-6 py-5 shadow-sm">
                        <h2 className="mb-3 text-base font-bold text-slate-800 flex items-center gap-2">
                          <PlayCircle size={18} className="text-primary-900" />
                          Course Preview
                        </h2>
                        <video
                          controls
                          controlsList="nodownload"
                          className="w-full rounded-lg bg-black max-h-[420px]"
                          src={previewUrl}
                          poster={thumbnail}
                          preload="metadata"
                        >
                          Your browser does not support the video tag.
                        </video>
                        <p className="mt-2 text-xs text-slate-500">Free preview — {previewLesson!.title}</p>
                      </div>
                    );
                  })()}

                  {/* lessons */}
                  <div className="rounded-xl border border-slate-100 bg-white px-6 py-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-base font-bold text-slate-800">
                        Course Content
                        {lessons && (
                          <span className="ml-2 text-sm font-normal text-slate-500">
                            ({lessons.length} lessons)
                          </span>
                        )}
                      </h2>
                      {enrolled && totalLessons > 0 && (
                        <span className="text-sm font-semibold text-slate-600">
                          {completedCount}/{totalLessons} completed
                        </span>
                      )}
                    </div>

                    {/* Inline progress bar for enrolled students */}
                    {enrolled && totalLessons > 0 && (
                      <div className="mb-4">
                        <div className="h-2 w-full rounded-full bg-slate-100">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${
                              progressPercent === 100 ? 'bg-green-500' : 'bg-primary-900'
                            }`}
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                    )}
                    {lessonsLoading ? (
                      <div className="space-y-3 animate-pulse">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className="h-12 rounded-xl bg-slate-100" />
                        ))}
                      </div>
                    ) : lessons && lessons.length > 0 ? (
                      <div className="flex flex-col gap-2">
                        {[...lessons]
                          .sort((a, b) => a.order - b.order)
                          .map((lesson, idx) => renderLessonRow(lesson, idx))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">
                        No lessons have been added to this course yet.
                      </p>
                    )}
                  </div>
                </div>

                {/* ── enrollment card ──────────────────────────────── */}
                <div className="lg:col-span-1">
                  <div className="sticky top-24 rounded-2xl border border-slate-100 bg-white p-6 shadow-md">
                    <div className="mb-1 text-3xl font-extrabold text-slate-900">{priceLabel}</div>
                    {course.pricing.discountPrice != null &&
                      course.pricing.discountPrice < course.pricing.amount && (
                        <div className="mb-3 text-sm text-slate-400 line-through">
                          LKR {course.pricing.amount.toLocaleString()}
                        </div>
                      )}

                    {feedbackMessage && (
                      <div
                        className={`mb-4 rounded-lg px-4 py-3 text-sm ${
                          enrolled || isOwner
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-red-50 text-red-600'
                        }`}
                      >
                        {feedbackMessage}
                      </div>
                    )}

                    {isOwner ? (
                      <div className="space-y-3">
                        <div className="rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-700">
                          You are the instructor of this course.
                        </div>
                        <Link
                          to="/dashboard"
                          className="block w-full rounded-xl bg-primary-900 py-3 text-center text-sm font-bold text-white transition hover:bg-primary-900/90"
                        >
                          Go to Dashboard
                        </Link>
                      </div>
                    ) : enrolled ? (
                      <div className="space-y-3">
                        <div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                          {progressData?.enrollment.status === 'completed'
                            ? '🎉 You have completed this course!'
                            : 'You are enrolled in this course.'}
                        </div>

                        {/* Progress bar */}
                        <div>
                          <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                            <span>{completedCount} / {totalLessons} lessons</span>
                            <span className="font-semibold text-slate-700">{progressPercent}%</span>
                          </div>
                          <div className="h-2.5 w-full rounded-full bg-slate-100">
                            <div
                              className={`h-2.5 rounded-full transition-all duration-500 ${
                                progressPercent === 100 ? 'bg-green-500' : 'bg-primary-900'
                              }`}
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                        </div>

                        {/* Certificate download — only at 100% */}
                        {progressPercent >= 100 && (
                          <button
                            onClick={() => void handleDownloadCertificate()}
                            disabled={downloadingCert}
                            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-emerald-500 py-2.5 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-50"
                          >
                            <GraduationCap size={15} />
                            {downloadingCert ? 'Generating…' : 'Download Certificate'}
                          </button>
                        )}

                        <Link
                          to="/dashboard"
                          className="block w-full rounded-xl bg-emerald-600 py-3 text-center text-sm font-bold text-white transition hover:bg-emerald-700"
                        >
                          Go to My Learning
                        </Link>
                      </div>
                    ) : enrollmentDbStatus === 'dropped' ? (
                      <div className="space-y-3">
                        <div className="rounded-lg bg-amber-50 px-4 py-3 text-center text-sm text-amber-800">
                          You previously dropped this course.
                        </div>
                        <button
                          onClick={handleEnroll}
                          disabled={enrollMutation.isPending}
                          className="w-full rounded-xl bg-primary-900 py-3 text-sm font-bold text-white transition hover:bg-primary-900/90 disabled:opacity-60"
                        >
                          {enrollMutation.isPending ? 'Re-enrolling…' : 'Re-enroll in this Course'}
                        </button>
                      </div>
                    ) : enrollmentDbStatus === 'completed' ? (
                      <div className="space-y-3">
                        <div className="rounded-lg bg-green-50 px-4 py-3 text-center text-sm text-green-800">
                          ✓ You have already completed this course.
                        </div>
                        <Link
                          to="/dashboard"
                          className="block w-full rounded-xl bg-emerald-600 py-3 text-center text-sm font-bold text-white transition hover:bg-emerald-700"
                        >
                          Go to My Learning
                        </Link>
                      </div>
                    ) : (
                      <button
                        onClick={handleEnroll}
                        disabled={enrollMutation.isPending}
                        className="w-full rounded-xl bg-primary-900 py-3 text-sm font-bold text-white transition hover:bg-primary-900/90 disabled:opacity-60"
                      >
                        {enrollMutation.isPending
                          ? 'Enrolling…'
                          : isFree
                          ? 'Enroll for Free'
                          : `Enroll — ${priceLabel}`}
                      </button>
                    )}

                    <ul className="mt-5 space-y-2 text-sm text-slate-600">
                      <li className="flex items-center gap-2">
                        <BookOpen size={14} className="text-primary-900 shrink-0" />
                        {course.stats.totalLessons} lessons
                      </li>
                      <li className="flex items-center gap-2">
                        <Clock size={14} className="text-primary-900 shrink-0" />
                        {formatTotalDuration(course.stats.totalDuration)} total
                      </li>
                      <li className="flex items-center gap-2">
                        <TrendingUp size={14} className="text-primary-900 shrink-0" />
                        {course.level.charAt(0).toUpperCase() + course.level.slice(1)} level
                      </li>
                      <li className="flex items-center gap-2">
                        <Users size={14} className="text-primary-900 shrink-0" />
                        {course.stats.enrollmentCount.toLocaleString()} enrolled
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <AppFooter />

      {/* Checkout modal for paid courses */}
      {showCheckoutModal && course && courseId && (
        <CourseCheckoutModal
          courseId={courseId}
          courseTitle={course.title}
          priceAmount={course.pricing.discountPrice ?? course.pricing.amount}
          priceCurrency={course.pricing.currency}
          onClose={() => setShowCheckoutModal(false)}
          onEnrolled={() => {
            setShowCheckoutModal(false);
            setEnrolled(true);
            setFeedbackMessage('Successfully enrolled! You can now access all course lessons.');
            void queryClient.invalidateQueries({ queryKey: ['student-dashboard'] });
            void queryClient.invalidateQueries({ queryKey: ['enrollment-check', courseId] });
            void queryClient.invalidateQueries({ queryKey: ['my-learning'] });
          }}
        />
      )}
    </div>
  );
};

// ── small helper component ────────────────────────────────────────────────────

const StatChip: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
  <div className="flex items-center gap-1.5 text-sm text-slate-600">
    {icon}
    <span>{label}</span>
  </div>
);

export default CourseDetailPage;
