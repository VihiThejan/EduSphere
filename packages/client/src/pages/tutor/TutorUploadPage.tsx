import React, { useCallback, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import {
  COURSE_CATEGORIES,
  COURSE_LEVELS,
  CourseCategory,
  CourseLevel,
} from '@edusphere/shared';
import { tutorApi } from '@/services/api/tutor.api';

// ---------- Types ----------

type AccessType = 'paid' | 'free';

interface BasicInfo {
  title: string;
  description: string;
  category: CourseCategory;
  level: CourseLevel;
  tags: string;
}

interface PricingInfo {
  accessType: AccessType;
  amount: number;
  enableCertificate: boolean;
}

export type FileKind = 'video' | 'document';

export interface UploadedFile {
  id: string; // local temp id
  remoteId?: string; // server-returned id
  name: string;
  size: number;
  kind: FileKind;
  progress: number; // 0-100
  status: 'uploading' | 'done' | 'error';
  errorMessage?: string;
}

// ---------- Helpers ----------

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// ---------- Sub-components ----------

interface StepIndicatorProps {
  currentStep: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  const steps = [
    { label: 'Basic Info', icon: 'info', step: 1 },
    { label: 'Course Content', icon: 'play_circle', step: 2 },
    { label: 'Pricing & Settings', icon: 'payments', step: 3 },
  ];

  return (
    <div className="mb-10">
      <div className="relative flex items-center justify-between">
        {/* Background track */}
        <div className="absolute top-5 left-0 w-full h-0.5 bg-slate-200 z-0" />
        {/* Progress fill */}
        <div
          className="absolute top-5 left-0 h-0.5 bg-emerald-500 z-0 transition-all duration-500"
          style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
        />

        {steps.map(({ label, icon, step }) => {
          const isDone = currentStep > step;
          const isActive = currentStep === step;

          return (
            <div key={step} className="relative z-10 flex flex-col items-center gap-2">
              <div
                className={[
                  'size-10 rounded-full flex items-center justify-center transition-all',
                  isDone
                    ? 'bg-emerald-500 text-white'
                    : isActive
                    ? 'bg-primary-900 text-white ring-4 ring-primary-900/20'
                    : 'bg-white border-2 border-slate-200 text-slate-400',
                ].join(' ')}
              >
                {isDone ? (
                  <span className="material-symbols-outlined text-xl">check</span>
                ) : (
                  <span className="material-symbols-outlined text-xl">{icon}</span>
                )}
              </div>
              <span
                className={`text-xs font-bold ${
                  isActive ? 'text-primary-900' : 'text-slate-400'
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---------- Toast ----------

interface Toast {
  id: string;
  type: 'success' | 'error';
  message: string;
}

// ---------- Main Component ----------

const TutorUploadPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  // Toast state
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: Toast['type'], message: string) => {
    const id = generateId();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  // Multi-step state
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1 – Basic Info
  const [basicInfo, setBasicInfo] = useState<BasicInfo>({
    title: '',
    description: '',
    category: 'mathematics',
    level: 'beginner',
    tags: '',
  });

  // Course ID created after Step 1 is saved
  const [courseId, setCourseId] = useState<string | null>(null);

  // Step 2 – Uploaded files
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const [isDraggingVideo, setIsDraggingVideo] = useState(false);
  const [isDraggingDoc, setIsDraggingDoc] = useState(false);

  // Step 3 – Pricing
  const [pricing, setPricing] = useState<PricingInfo>({
    accessType: 'paid',
    amount: 15000,
    enableCertificate: true,
  });

  // ---- Mutations ----

  const createCourseMutation = useMutation({
    mutationFn: () =>
      tutorApi.createCourse({
        title: basicInfo.title,
        description: basicInfo.description,
        category: basicInfo.category as CourseCategory,
        level: basicInfo.level as CourseLevel,
        pricing: {
          amount: pricing.amount,
          currency: 'LKR',
        },
        tags: basicInfo.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      }),
    onSuccess: (course) => {
      setCourseId(course._id);
      setStep(2);
      addToast('success', 'Course created! Now upload your content.');
    },
    onError: () => {
      addToast('error', 'Failed to create course. Please try again.');
    },
  });

  const publishCourseMutation = useMutation({
    mutationFn: () => {
      if (!courseId) throw new Error('No course ID');
      return tutorApi.updateCourse(courseId, {
        pricing: {
          amount: pricing.accessType === 'paid' ? pricing.amount : 0,
          currency: 'LKR',
        },
        status: 'published',
      });
    },
    onSuccess: () => {
      addToast('success', 'Course published successfully!');
      setTimeout(() => navigate('/dashboard'), 1500);
    },
    onError: () => {
      addToast('error', 'Failed to publish course. Please try again.');
    },
  });

  const saveDraftMutation = useMutation({
    mutationFn: () => {
      if (!courseId) throw new Error('No course ID');
      return tutorApi.updateCourse(courseId, {
        pricing: {
          amount: pricing.accessType === 'paid' ? pricing.amount : 0,
          currency: 'LKR',
        },
        status: 'draft',
      });
    },
    onSuccess: () => {
      addToast('success', 'Draft saved!');
    },
    onError: () => {
      addToast('error', 'Failed to save draft.');
    },
  });

  // ---- File upload helpers ----

  /** Upload a single document (PDF/DOCX) with per-file progress. */
  const uploadDocument = useCallback(
    async (file: File) => {
      const localId = generateId();

      setUploadedFiles((prev) => [
        ...prev,
        { id: localId, name: file.name, size: file.size, kind: 'document', progress: 0, status: 'uploading' },
      ]);

      try {
        const result = await tutorApi.uploadDocument(file, courseId ?? undefined, (p) => {
          setUploadedFiles((prev) =>
            prev.map((f) => (f.id === localId ? { ...f, progress: p.percentage } : f))
          );
        });
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === localId ? { ...f, remoteId: result.documentId, progress: 100, status: 'done' } : f
          )
        );
      } catch {
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === localId ? { ...f, status: 'error', errorMessage: 'Upload failed.' } : f
          )
        );
        addToast('error', `Failed to upload ${file.name}`);
      }
    },
    [courseId, addToast]
  );

  /**
   * Upload one or more video files using direct Cloudinary upload (fast path).
   * Flow: get signature → POST directly to Cloudinary CDN → confirm metadata with server.
   * Single file  → individual progress entry
   * Multiple files → combined progress entry, then split into per-file entries on finish
   */
  const uploadVideos = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;

      if (files.length === 1) {
        // Single file – individual progress entry
        const file = files[0];
        const localId = generateId();

        setUploadedFiles((prev) => [
          ...prev,
          { id: localId, name: file.name, size: file.size, kind: 'video', progress: 0, status: 'uploading' },
        ]);

        try {
          // Step 1: get Cloudinary signature (tiny JSON request)
          const sig = await tutorApi.getVideoUploadSignature();

          // Step 2: upload directly to Cloudinary CDN — progress reflects actual CDN transfer
          const cloudData = await tutorApi.uploadVideoDirectly(file, sig, (p) => {
            setUploadedFiles((prev) =>
              prev.map((f) => (f.id === localId ? { ...f, progress: p.percentage } : f))
            );
          });

          // Step 3: save metadata to DB
          const result = await tutorApi.confirmVideoUpload({
            cloudinaryId: cloudData.cloudinaryId,
            secureUrl: cloudData.secureUrl,
            originalName: file.name,
            size: file.size,
            mimetype: file.type,
          });

          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.id === localId ? { ...f, remoteId: result.videoId, progress: 100, status: 'done' } : f
            )
          );
        } catch {
          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.id === localId ? { ...f, status: 'error', errorMessage: 'Upload failed.' } : f
            )
          );
          addToast('error', `Failed to upload ${file.name}`);
        }
      } else {
        // Bulk – one combined progress entry; files upload in parallel directly to Cloudinary
        const bulkId = generateId();
        const totalSize = files.reduce((s, f) => s + f.size, 0);
        const label = `${files.length} videos (bulk upload)`;

        setUploadedFiles((prev) => [
          ...prev,
          { id: bulkId, name: label, size: totalSize, kind: 'video', progress: 0, status: 'uploading' },
        ]);

        // Track per-file loaded bytes for a combined progress bar
        const loadedPerFile = new Array<number>(files.length).fill(0);

        try {
          const results = await Promise.all(
            files.map((file, i) =>
              tutorApi.getVideoUploadSignature()
                .then((sig) =>
                  tutorApi.uploadVideoDirectly(file, sig, (p) => {
                    loadedPerFile[i] = p.loaded;
                    const totalLoaded = loadedPerFile.reduce((a, b) => a + b, 0);
                    setUploadedFiles((prev) =>
                      prev.map((f) =>
                        f.id === bulkId
                          ? { ...f, progress: Math.round((totalLoaded * 100) / totalSize) }
                          : f
                      )
                    );
                  })
                )
                .then((cloudData) =>
                  tutorApi.confirmVideoUpload({
                    cloudinaryId: cloudData.cloudinaryId,
                    secureUrl: cloudData.secureUrl,
                    originalName: file.name,
                    size: file.size,
                    mimetype: file.type,
                  })
                )
            )
          );

          // Replace the single bulk entry with one entry per uploaded video
          setUploadedFiles((prev) => {
            const without = prev.filter((f) => f.id !== bulkId);
            const newEntries: UploadedFile[] = results.map((r, i) => ({
              id: generateId(),
              remoteId: r.videoId,
              name: files[i]?.name ?? r.originalName,
              size: r.size,
              kind: 'video',
              progress: 100,
              status: 'done',
            }));
            return [...without, ...newEntries];
          });

          addToast('success', `${results.length} video${results.length > 1 ? 's' : ''} uploaded successfully`);
        } catch {
          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.id === bulkId ? { ...f, status: 'error', errorMessage: 'Bulk upload failed.' } : f
            )
          );
          addToast('error', 'Bulk video upload failed. Please try again.');
        }
      }
    },
    [addToast]
  );

  // ---- File validation ----
  const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo', 'video/avi'];
  const ALLOWED_VIDEO_EXTS = ['.mp4', '.mov', '.webm', '.avi'];
  const ALLOWED_DOC_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  const ALLOWED_DOC_EXTS = ['.pdf', '.doc', '.docx'];
  const MAX_VIDEO_BYTES = 500 * 1024 * 1024; // 500 MB
  const MAX_DOC_BYTES   = 50  * 1024 * 1024; // 50 MB

  const validateFile = useCallback(
    (file: File, kind: FileKind): string | null => {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      if (kind === 'video') {
        if (!ALLOWED_VIDEO_TYPES.includes(file.type) && !ALLOWED_VIDEO_EXTS.includes(ext)) {
          return `"${file.name}" is not a supported video format. Allowed: MP4, MOV, WebM, AVI.`;
        }
        if (file.size > MAX_VIDEO_BYTES) {
          return `"${file.name}" exceeds the 500 MB video size limit (${formatBytes(file.size)}).`;
        }
        if (file.size === 0) {
          return `"${file.name}" is empty and cannot be uploaded.`;
        }
      } else {
        if (!ALLOWED_DOC_TYPES.includes(file.type) && !ALLOWED_DOC_EXTS.includes(ext)) {
          return `"${file.name}" is not a supported document format. Allowed: PDF, DOC, DOCX.`;
        }
        if (file.size > MAX_DOC_BYTES) {
          return `"${file.name}" exceeds the 50 MB document size limit (${formatBytes(file.size)}).`;
        }
        if (file.size === 0) {
          return `"${file.name}" is empty and cannot be uploaded.`;
        }
      }
      return null;
    },
    [addToast]
  );

  const handleFileSelect = useCallback(
    (files: FileList | null, kind: FileKind) => {
      if (!files || files.length === 0) return;
      const arr = Array.from(files);

      // Validate each file before uploading
      const valid: File[] = [];
      for (const file of arr) {
        const error = validateFile(file, kind);
        if (error) {
          addToast('error', error);
        } else {
          valid.push(file);
        }
      }

      if (valid.length === 0) return;

      if (kind === 'video') {
        void uploadVideos(valid);
      } else {
        valid.forEach((file) => void uploadDocument(file));
      }
    },
    [uploadVideos, uploadDocument, validateFile, addToast]
  );

  const removeFile = useCallback(
    async (file: UploadedFile) => {
      if (file.remoteId) {
        try {
          if (file.kind === 'video') await tutorApi.deleteVideo(file.remoteId);
          else await tutorApi.deleteDocument(file.remoteId);
        } catch {
          addToast('error', 'Could not remove file from server.');
        }
      }
      setUploadedFiles((prev) => prev.filter((f) => f.id !== file.id));
    },
    [addToast]
  );

  // ---- Step navigation ----

  const handleStep1Next = () => {
    if (!basicInfo.title.trim() || basicInfo.title.length < 5) {
      addToast('error', 'Course title must be at least 5 characters.');
      return;
    }
    if (!basicInfo.description.trim() || basicInfo.description.length < 20) {
      addToast('error', 'Description must be at least 20 characters.');
      return;
    }
    createCourseMutation.mutate();
  };

  const handleStep2Next = () => {
    const doneFiles = uploadedFiles.filter((f) => f.status === 'done');
    const uploading  = uploadedFiles.some((f) => f.status === 'uploading');

    if (uploading) {
      addToast('error', 'Please wait — files are still uploading.');
      return;
    }
    if (doneFiles.length === 0) {
      addToast('error', 'Upload at least one video or document before continuing.');
      return;
    }
    const hasVideo = doneFiles.some((f) => f.kind === 'video');
    if (!hasVideo) {
      addToast('error', 'At least one video lesson is required to create a course.');
      return;
    }
    setStep(3);
  };

  const tutorName = user?.profile?.firstName
    ? `${user.profile.firstName} ${user.profile.lastName ?? ''}`.trim()
    : 'Tutor';
  const tutorRole = user?.roles?.includes('admin') ? 'Admin' : 'Senior Lecturer';
  const avatarUrl =
    user?.profile?.avatar ||
    'https://lh3.googleusercontent.com/aida-public/AB6AXuB6QOubLhZUUC8d4Ng_Cs_AO6E0JqT2er3FY-8qaumZseBmDo7dCHBDHUfndCoZmQ2hYJwGf9if9vL_Mh7eJnW0VTjB8_Alq5vUYogvwzhQLLo8M_tl5OCeCSKdKo6A5a7Kzi3cw4EF2sorNBC7FtPL5FTgOGIU0tEA-1bPMRgfgb-CLSoK_mdWrtk794MPuyTExOqs_rNnlTTXZf3vn_cNeM1Vc21KGAqkYf1FpPeM9Z2T8ab-q6UHLfES4G8MgjRmziWyBbmkdlI';

  const uploadedCount = uploadedFiles.length;
  const uploadProgress =
    uploadedFiles.length > 0
      ? Math.round(
          uploadedFiles.reduce((s, f) => s + f.progress, 0) / uploadedFiles.length
        )
      : 0;

  // ---- Render ----

  return (
    <div className="flex min-h-screen overflow-hidden bg-slate-50 text-slate-900">
      {/* ---- Toast Container ---- */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white pointer-events-auto transition-all ${
              t.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>

      {/* ---- Sidebar ---- */}
      <aside className="w-64 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="size-10 bg-primary-900 rounded-lg flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-2xl">school</span>
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight text-primary-900">EduSphere</h1>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
              Tutor Portal
            </p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {[
            { href: '/dashboard', icon: 'dashboard', label: 'Dashboard', active: false },
            { href: '/tutor/upload', icon: 'book_2', label: 'My Courses', active: true },
            { href: '#', icon: 'group', label: 'Students', active: false },
            { href: '#', icon: 'analytics', label: 'Analytics', active: false },
            { href: '#', icon: 'settings', label: 'Settings', active: false },
          ].map(({ href, icon, label, active }) => (
            <Link
              key={label}
              to={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm ${
                active
                  ? 'bg-primary-900/10 text-primary-900 font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 font-medium'
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {icon}
              </span>
              {label}
            </Link>
          ))}
        </nav>

        {/* Sidebar footer – upload progress */}
        <div className="p-4 border-t border-slate-200">
          <div className="bg-primary-900/5 rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-primary-900">Upload Progress</span>
              <span className="text-xs font-bold text-primary-900">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-2">
              {uploadedCount === 0
                ? 'No files uploaded yet'
                : `${uploadedFiles.filter((f) => f.status === 'done').length} / ${uploadedCount} files uploaded`}
            </p>
          </div>
        </div>
      </aside>

      {/* ---- Main Content ---- */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight">Upload Course Content</h2>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative hidden md:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                search
              </span>
              <input
                type="text"
                placeholder="Search resources..."
                className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm w-56 focus:ring-2 focus:ring-primary-900/20 outline-none"
              />
            </div>

            {/* Actions */}
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg relative">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
              <span className="material-symbols-outlined">chat_bubble</span>
            </button>

            <div className="h-8 w-px bg-slate-200" />

            {/* Profile */}
            <div className="flex items-center gap-3 cursor-pointer group">
              <img
                src={avatarUrl}
                alt="Profile"
                className="size-9 rounded-full object-cover bg-slate-200"
              />
              <div className="hidden lg:block">
                <p className="text-sm font-bold leading-none">{tutorName}</p>
                <p className="text-[10px] text-slate-500 font-medium">{tutorRole}</p>
              </div>
              <button
                onClick={() => logout()}
                className="hidden lg:block text-xs text-slate-400 hover:text-red-500 ml-1"
                title="Logout"
              >
                <span className="material-symbols-outlined text-base">logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="p-8 max-w-5xl mx-auto w-full">
          <StepIndicator currentStep={step} />

          {/* ======================== STEP 1: Basic Info ======================== */}
          {step === 1 && (
            <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-900">info</span>
                Basic Information
              </h3>

              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-700">
                    Course Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={basicInfo.title}
                    onChange={(e) => setBasicInfo((p) => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. Advanced Mathematics for Engineering"
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary-900/20 focus:border-primary-900 outline-none transition"
                  />
                  <p className="text-xs text-slate-400 mt-1">Minimum 5 characters</p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-700">
                    Course Description <span className="text-red-500">*</span>
                  </label>
                  <div className="border border-slate-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary-900/20 focus-within:border-primary-900 transition">
                    <div className="bg-slate-50 p-2 border-b border-slate-200 flex gap-1">
                      {['format_bold', 'format_italic', 'format_list_bulleted', 'link'].map((icon) => (
                        <button
                          key={icon}
                          type="button"
                          className="p-1 hover:bg-slate-200 rounded"
                        >
                          <span className="material-symbols-outlined text-sm">{icon}</span>
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={basicInfo.description}
                      onChange={(e) =>
                        setBasicInfo((p) => ({ ...p, description: e.target.value }))
                      }
                      placeholder="Describe what students will learn, prerequisites, and course outcomes..."
                      rows={4}
                      className="w-full px-4 py-3 border-none focus:ring-0 outline-none resize-none"
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Minimum 20 characters</p>
                </div>

                {/* Category & Level */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-slate-700">
                      Category
                    </label>
                    <select
                      value={basicInfo.category}
                      onChange={(e) =>
                        setBasicInfo((p) => ({
                          ...p,
                          category: e.target.value as CourseCategory,
                        }))
                      }
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary-900/20 focus:border-primary-900 outline-none transition bg-white capitalize"
                    >
                      {COURSE_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat} className="capitalize">
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-slate-700">
                      Level
                    </label>
                    <select
                      value={basicInfo.level}
                      onChange={(e) =>
                        setBasicInfo((p) => ({ ...p, level: e.target.value as CourseLevel }))
                      }
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary-900/20 focus:border-primary-900 outline-none transition bg-white"
                    >
                      {COURSE_LEVELS.map((lvl) => (
                        <option key={lvl} value={lvl} className="capitalize">
                          {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-700">
                    Tags{' '}
                    <span className="font-normal text-slate-400">(comma separated)</span>
                  </label>
                  <input
                    type="text"
                    value={basicInfo.tags}
                    onChange={(e) => setBasicInfo((p) => ({ ...p, tags: e.target.value }))}
                    placeholder="e.g. calculus, differentiation, integrals"
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary-900/20 focus:border-primary-900 outline-none transition"
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleStep1Next}
                    disabled={createCourseMutation.isPending}
                    className="px-8 py-2.5 rounded-lg bg-primary-900 text-white font-bold text-sm hover:bg-primary-800 shadow-lg shadow-primary-900/20 transition disabled:opacity-60 flex items-center gap-2"
                  >
                    {createCourseMutation.isPending ? (
                      <>
                        <span className="material-symbols-outlined text-base animate-spin">
                          progress_activity
                        </span>
                        Creating…
                      </>
                    ) : (
                      <>
                        Continue to Content
                        <span className="material-symbols-outlined text-base">arrow_forward</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* ======================== STEP 2: Course Content ======================== */}
          {step === 2 && (
            <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary-900">cloud_upload</span>
                  Course Content
                </h3>
                <span className="text-xs font-bold text-slate-400 uppercase">Step 2 of 3</span>
              </div>

              {/* Upload zones */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {/* Video Drop Zone */}
                <div
                  onClick={() => videoInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingVideo(true);
                  }}
                  onDragLeave={() => setIsDraggingVideo(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingVideo(false);
                    handleFileSelect(e.dataTransfer.files, 'video');
                  }}
                  className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center bg-slate-50/50 cursor-pointer group transition-colors ${
                    isDraggingVideo
                      ? 'border-primary-900 bg-primary-900/5'
                      : 'border-slate-200 hover:border-primary-900/50'
                  }`}
                >
                  <div className="size-12 bg-primary-900/10 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-primary-900 text-3xl">
                      movie
                    </span>
                  </div>
                  <p className="text-sm font-bold">Upload Video Lessons</p>
                  <p className="text-xs text-slate-500 mt-1">MP4, MOV — max 500 MB</p>
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/mp4,video/quicktime,video/avi,video/webm"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFileSelect(e.target.files, 'video')}
                  />
                </div>

                {/* Document Drop Zone */}
                <div
                  onClick={() => docInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingDoc(true);
                  }}
                  onDragLeave={() => setIsDraggingDoc(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingDoc(false);
                    handleFileSelect(e.dataTransfer.files, 'document');
                  }}
                  className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center bg-slate-50/50 cursor-pointer group transition-colors ${
                    isDraggingDoc
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-slate-200 hover:border-emerald-400'
                  }`}
                >
                  <div className="size-12 bg-emerald-500/10 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-emerald-600 text-3xl">
                      description
                    </span>
                  </div>
                  <p className="text-sm font-bold">Upload Reading Material</p>
                  <p className="text-xs text-slate-500 mt-1">PDF, DOCX — max 50 MB</p>
                  <input
                    ref={docInputRef}
                    type="file"
                    accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFileSelect(e.target.files, 'document')}
                  />
                </div>
              </div>

              {/* Uploaded file list */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Uploaded Resources ({uploadedFiles.length})
                  </p>

                  {uploadedFiles.map((file) => (
                    <div
                      key={file.id}
                      className={`flex items-center gap-4 p-4 border rounded-lg transition-shadow ${
                        file.status === 'uploading'
                          ? 'border-primary-900/20 bg-primary-900/5'
                          : file.status === 'error'
                          ? 'border-red-200 bg-red-50'
                          : 'border-slate-100 hover:shadow-md'
                      }`}
                    >
                      {/* Icon */}
                      <div
                        className={`size-10 rounded flex items-center justify-center flex-shrink-0 ${
                          file.kind === 'video'
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-red-100 text-red-600'
                        }`}
                      >
                        <span className="material-symbols-outlined">
                          {file.kind === 'video' ? 'videocam' : 'picture_as_pdf'}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-sm font-bold truncate">{file.name}</p>
                          {file.status === 'uploading' ? (
                            <span className="text-xs font-bold text-primary-900 italic ml-2 flex-shrink-0">
                              {file.progress}%
                            </span>
                          ) : file.status === 'error' ? (
                            <span className="text-xs font-bold text-red-500 ml-2 flex-shrink-0">
                              Failed
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400 ml-2 flex-shrink-0">
                              {formatBytes(file.size)}
                            </span>
                          )}
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              file.status === 'error'
                                ? 'bg-red-400'
                                : file.status === 'uploading'
                                ? 'bg-primary-900'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${file.progress}%` }}
                          />
                        </div>
                        {file.errorMessage && (
                          <p className="text-xs text-red-500 mt-1">{file.errorMessage}</p>
                        )}
                      </div>

                      {/* Remove button */}
                      <button
                        onClick={() => removeFile(file)}
                        disabled={file.status === 'uploading'}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-30 transition flex-shrink-0"
                      >
                        <span className="material-symbols-outlined text-xl">
                          {file.status === 'uploading' ? 'close' : 'delete'}
                        </span>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {uploadedFiles.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-slate-400 gap-2">
                  <span className="material-symbols-outlined text-4xl">cloud_upload</span>
                  <p className="text-sm">No files uploaded yet. Drag & drop or click above.</p>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-100">
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800 transition"
                >
                  <span className="material-symbols-outlined text-base">arrow_back</span>
                  Back
                </button>
                {(() => {
                  const hasVideo   = uploadedFiles.some((f) => f.kind === 'video' && f.status === 'done');
                  const isUploading = uploadedFiles.some((f) => f.status === 'uploading');
                  const canProceed  = hasVideo && !isUploading;
                  return (
                    <div className="flex flex-col items-end gap-1">
                      <button
                        onClick={handleStep2Next}
                        disabled={!canProceed}
                        title={
                          isUploading
                            ? 'Wait for uploads to finish'
                            : !hasVideo
                            ? 'Upload at least one video lesson to continue'
                            : ''
                        }
                        className={`px-8 py-2.5 rounded-lg font-bold text-sm transition flex items-center gap-2
                          ${canProceed
                            ? 'bg-primary-900 text-white hover:bg-primary-800 shadow-lg shadow-primary-900/20'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          }`}
                      >
                        {isUploading ? (
                          <>
                            <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                            Uploading…
                          </>
                        ) : (
                          <>
                            Continue to Pricing
                            <span className="material-symbols-outlined text-base">arrow_forward</span>
                          </>
                        )}
                      </button>
                      {!hasVideo && !isUploading && (
                        <p className="text-xs text-amber-600 flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">info</span>
                          At least one video lesson is required
                        </p>
                      )}
                    </div>
                  );
                })()}
              </div>
            </section>
          )}

          {/* ======================== STEP 3: Pricing ======================== */}
          {step === 3 && (
            <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-900">sell</span>
                Pricing &amp; Access
              </h3>

              <div className="flex flex-col md:flex-row gap-8">
                {/* Access Type */}
                <div className="flex-1 space-y-4">
                  <label className="block text-sm font-semibold text-slate-700">
                    Course Access Type
                  </label>
                  <div className="flex gap-4">
                    {(['paid', 'free'] as const).map((type) => (
                      <label key={type} className="flex-1 cursor-pointer">
                        <input
                          type="radio"
                          name="pricing"
                          checked={pricing.accessType === type}
                          onChange={() => setPricing((p) => ({ ...p, accessType: type }))}
                          className="hidden peer"
                        />
                        <div className="p-4 border-2 border-slate-100 rounded-xl peer-checked:border-primary-900 peer-checked:bg-primary-900/5 text-center transition-all">
                          <span className="material-symbols-outlined text-2xl mb-1 block">
                            {type === 'paid' ? 'paid' : 'redeem'}
                          </span>
                          <p className="font-bold text-sm capitalize">{type} Course</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Fee */}
                <div className="flex-1 space-y-4">
                  <label className="block text-sm font-semibold text-slate-700">
                    Set Fee (LKR)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                      Rs.
                    </span>
                    <input
                      type="number"
                      min={0}
                      value={pricing.amount}
                      disabled={pricing.accessType === 'free'}
                      onChange={(e) =>
                        setPricing((p) => ({ ...p, amount: Number(e.target.value) }))
                      }
                      className="w-full pl-12 pr-4 py-3 rounded-lg border border-slate-200 font-bold focus:ring-2 focus:ring-primary-900/20 focus:border-primary-900 outline-none transition disabled:bg-slate-100 disabled:text-slate-400"
                    />
                  </div>
                  <p className="text-xs text-slate-400">
                    Tutor receives <strong>85%</strong> after platform fees.
                    {pricing.accessType === 'paid' && pricing.amount > 0 && (
                      <span className="ml-1 text-emerald-600 font-medium">
                        ≈ Rs.{' '}
                        {(pricing.amount * 0.85).toLocaleString('en-LK', {
                          minimumFractionDigits: 0,
                        })}{' '}
                        net
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Certificate toggle */}
              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={pricing.enableCertificate}
                    onClick={() =>
                      setPricing((p) => ({ ...p, enableCertificate: !p.enableCertificate }))
                    }
                    className={`relative inline-block w-12 h-6 rounded-full transition-colors ${
                      pricing.enableCertificate ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`absolute top-1 bg-white size-4 rounded-full shadow transition-transform ${
                        pricing.enableCertificate ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className="text-sm font-medium">Enable Certificate of Completion</span>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(2)}
                    className="flex items-center gap-1 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 transition"
                  >
                    <span className="material-symbols-outlined text-base">arrow_back</span>
                    Back
                  </button>

                  <button
                    onClick={() => saveDraftMutation.mutate()}
                    disabled={saveDraftMutation.isPending}
                    className="px-6 py-2.5 rounded-lg font-bold text-sm text-slate-600 hover:bg-slate-100 transition disabled:opacity-60"
                  >
                    {saveDraftMutation.isPending ? 'Saving…' : 'Save Draft'}
                  </button>

                  <button
                    onClick={() => publishCourseMutation.mutate()}
                    disabled={publishCourseMutation.isPending}
                    className="px-8 py-2.5 rounded-lg bg-primary-900 text-white font-bold text-sm hover:bg-primary-800 shadow-lg shadow-primary-900/20 transition disabled:opacity-60 flex items-center gap-2"
                  >
                    {publishCourseMutation.isPending ? (
                      <>
                        <span className="material-symbols-outlined text-base animate-spin">
                          progress_activity
                        </span>
                        Publishing…
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-base">publish</span>
                        Publish Course
                      </>
                    )}
                  </button>
                </div>
              </div>
            </section>
          )}
        </main>

        {/* Mobile footer actions */}
        <footer className="md:hidden sticky bottom-0 bg-white border-t border-slate-200 p-4 flex gap-2">
          <button
            onClick={() => saveDraftMutation.mutate()}
            disabled={!courseId || saveDraftMutation.isPending}
            className="flex-1 py-3 rounded-lg bg-slate-100 font-bold text-sm disabled:opacity-50"
          >
            Save Draft
          </button>
          <button
            onClick={() => publishCourseMutation.mutate()}
            disabled={!courseId || publishCourseMutation.isPending}
            className="flex-1 py-3 rounded-lg bg-primary-900 text-white font-bold text-sm disabled:opacity-50"
          >
            Publish
          </button>
        </footer>
      </div>
    </div>
  );
};

export default TutorUploadPage;
