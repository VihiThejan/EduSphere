import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Star,
  Users,
  BookOpen,
  Award,
  Calendar,
  Mail,
  ChevronRight,
  ChevronLeft,
  MessageSquare,
  GraduationCap,
} from 'lucide-react';
import AppHeader from '../components/common/AppHeader';
import AppFooter from '../components/common/AppFooter';
import { useAuthStore } from '../store/authStore';
import { profileApi, ProfileCourse } from '../services/api/profile.api';
import { reviewsApi, CourseReview } from '../services/api/reviews.api';

// ── Helpers ───────────────────────────────────────────────────────────────

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

const formatDateShort = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
  });

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
};

const renderStars = (rating: number, size = 16) => {
  const stars = [];
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;
  for (let i = 0; i < 5; i++) {
    if (i < full) {
      stars.push(<Star key={i} size={size} className="fill-amber-400 text-amber-400" />);
    } else if (i === full && hasHalf) {
      stars.push(
        <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
          <Star size={size} className="text-slate-300" />
          <span className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
            <Star size={size} className="fill-amber-400 text-amber-400" />
          </span>
        </span>
      );
    } else {
      stars.push(<Star key={i} size={size} className="text-slate-300" />);
    }
  }
  return stars;
};

const defaultAvatar =
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80';

// ── Main ──────────────────────────────────────────────────────────────────

const ProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: authUser, isAuthenticated, logout } = useAuthStore();

  const isOwnProfile = !userId || userId === authUser?._id;
  const targetUserId = isOwnProfile ? authUser?._id : userId;

  const [reviewPage, setReviewPage] = useState(1);

  const {
    data: profileData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['user-profile', targetUserId],
    queryFn: () =>
      isOwnProfile
        ? profileApi.getMyProfile()
        : profileApi.getUserProfile(targetUserId!),
    enabled: !!targetUserId,
  });

  const isTutor = profileData?.user.roles.includes('tutor') ?? false;

  const { data: tutorReviewsData } = useQuery({
    queryKey: ['tutor-reviews', targetUserId, reviewPage],
    queryFn: () => reviewsApi.getTutorReviews(targetUserId!, reviewPage, 5),
    enabled: !!targetUserId && isTutor,
  });

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Courses', href: '/courses' },
    { label: 'Marketplace', href: '/marketplace' },
  ];

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50">
        <AppHeader
          navItems={navItems}
          isAuthenticated={isAuthenticated}
          userName={authUser ? `${authUser.profile.firstName} ${authUser.profile.lastName}` : undefined}
          onLogout={logout}
        />
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-900 border-t-transparent" />
            <p className="text-sm text-slate-500">Loading profile…</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50">
        <AppHeader
          navItems={navItems}
          isAuthenticated={isAuthenticated}
          userName={authUser ? `${authUser.profile.firstName} ${authUser.profile.lastName}` : undefined}
          onLogout={logout}
        />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-slate-700">Profile not found</h2>
            <p className="mt-2 text-sm text-slate-500">The user doesn't exist or couldn't load.</p>
            <Link to="/" className="mt-4 inline-block text-sm font-medium text-primary-900 hover:underline">
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { user, stats, courses } = profileData;
  const fullName = `${user.profile.firstName} ${user.profile.lastName}`;
  const memberSince = formatDateShort(user.createdAt);

  const reviews = tutorReviewsData?.reviews ?? [];
  const reviewStats = tutorReviewsData?.stats ?? { avgRating: stats.avgRating, totalReviews: stats.totalReviews };
  const reviewPagination = tutorReviewsData?.pagination;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <AppHeader
        navItems={navItems}
        isAuthenticated={isAuthenticated}
        userName={authUser ? `${authUser.profile.firstName} ${authUser.profile.lastName}` : undefined}
        avatarUrl={authUser?.profile.avatar}
        onLogout={logout}
      />

      {/* ── Hero / Profile Header ──────────────────────── */}
      <section className="relative bg-gradient-to-r from-primary-900 to-indigo-800">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDJ2LTJoMzR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        <div className="relative mx-auto max-w-6xl px-6 py-16 lg:px-8">
          <div className="flex flex-col items-center gap-6 md:flex-row md:items-end md:gap-8">
            {/* Avatar */}
            <div className="relative">
              <img
                src={user.profile.avatar || defaultAvatar}
                alt={fullName}
                className="h-32 w-32 rounded-full border-4 border-white object-cover shadow-xl md:h-40 md:w-40"
              />
              {isTutor && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 px-3 py-0.5 text-xs font-bold text-slate-900 shadow">
                  TUTOR
                </span>
              )}
            </div>

            {/* Name & Meta */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-white md:text-4xl">{fullName}</h1>
              <p className="mt-1 text-sm text-indigo-200">
                {isTutor ? 'Tutor & Instructor' : 'Student'} &bull; Member since {memberSince}
              </p>
              {user.profile.bio && (
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-indigo-100">
                  {user.profile.bio}
                </p>
              )}

              {isTutor && (
                <div className="mt-4 flex flex-wrap justify-center gap-3 md:justify-start">
                  <StatPill icon={<Users size={14} />} label={`${stats.totalStudents.toLocaleString()} Students`} />
                  <StatPill icon={<BookOpen size={14} />} label={`${stats.totalCourses} Courses`} />
                  <StatPill
                    icon={<Star size={14} className="fill-amber-400 text-amber-400" />}
                    label={`${reviewStats.avgRating > 0 ? reviewStats.avgRating : '—'} Rating`}
                  />
                  <StatPill icon={<MessageSquare size={14} />} label={`${reviewStats.totalReviews} Reviews`} />
                </div>
              )}
              {!isTutor && (
                <div className="mt-4 flex flex-wrap justify-center gap-3 md:justify-start">
                  <StatPill icon={<BookOpen size={14} />} label={`${stats.totalCourses} Enrolled Courses`} />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Content ─────────────────────────────────── */}
      <main className="mx-auto w-full max-w-6xl px-6 py-10 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* ── Left: Info ─────────────────────────── */}
          <div className="space-y-6 lg:col-span-1">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-slate-900">Details</h2>
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex items-center gap-3">
                  <Mail size={16} className="text-slate-400" />
                  <span className="truncate">{user.email}</span>
                </li>
                <li className="flex items-center gap-3">
                  <Calendar size={16} className="text-slate-400" />
                  <span>Joined {formatDate(user.createdAt)}</span>
                </li>
                <li className="flex items-center gap-3">
                  <GraduationCap size={16} className="text-slate-400" />
                  <span className="capitalize">{user.roles.join(', ')}</span>
                </li>
                {isTutor && reviewStats.avgRating > 0 && (
                  <li className="flex items-center gap-3">
                    <Award size={16} className="text-slate-400" />
                    <div className="flex items-center gap-1">
                      {renderStars(reviewStats.avgRating, 14)}
                      <span className="ml-1 font-medium text-slate-700">{reviewStats.avgRating}</span>
                      <span className="text-slate-400">({reviewStats.totalReviews})</span>
                    </div>
                  </li>
                )}
              </ul>
            </div>

            {isTutor && (
              <div className="grid grid-cols-2 gap-3">
                <QuickStatCard icon={<Users size={20} className="text-primary-600" />} value={stats.totalStudents.toLocaleString()} label="Students" />
                <QuickStatCard icon={<BookOpen size={20} className="text-emerald-600" />} value={String(stats.totalCourses)} label="Courses" />
                <QuickStatCard icon={<Star size={20} className="fill-amber-400 text-amber-400" />} value={reviewStats.avgRating > 0 ? String(reviewStats.avgRating) : '—'} label="Rating" />
                <QuickStatCard icon={<MessageSquare size={20} className="text-violet-600" />} value={String(reviewStats.totalReviews)} label="Reviews" />
              </div>
            )}
          </div>

          {/* ── Right: Courses + Reviews ───────────── */}
          <div className="space-y-8 lg:col-span-2">
            {isTutor && courses.length > 0 && (
              <section>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-900">Courses Taught</h2>
                  <span className="text-sm text-slate-500">{courses.length} course{courses.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {courses.map((course) => (
                    <CourseCard key={course._id} course={course} />
                  ))}
                </div>
              </section>
            )}

            {isTutor && courses.length === 0 && (
              <section className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
                <BookOpen size={40} className="mx-auto text-slate-300" />
                <p className="mt-3 text-sm text-slate-500">No courses published yet.</p>
              </section>
            )}

            {isTutor && (
              <section>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-900">Student Reviews</h2>
                  {reviewStats.totalReviews > 0 && (
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <div className="flex">{renderStars(reviewStats.avgRating, 14)}</div>
                      <span className="font-medium text-slate-700">{reviewStats.avgRating}</span>
                      <span>({reviewStats.totalReviews} review{reviewStats.totalReviews !== 1 ? 's' : ''})</span>
                    </div>
                  )}
                </div>

                {reviewStats.totalReviews > 0 && (
                  <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-4xl font-extrabold text-slate-900">{reviewStats.avgRating}</div>
                        <div className="mt-1 flex justify-center">{renderStars(reviewStats.avgRating, 16)}</div>
                        <p className="mt-1 text-xs text-slate-500">{reviewStats.totalReviews} ratings</p>
                      </div>
                    </div>
                  </div>
                )}

                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <ReviewCard key={review._id} review={review} />
                    ))}

                    {reviewPagination && reviewPagination.totalPages > 1 && (
                      <div className="flex items-center justify-center gap-3 pt-4">
                        <button
                          onClick={() => setReviewPage((p) => Math.max(1, p - 1))}
                          disabled={reviewPage <= 1}
                          className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
                        >
                          <ChevronLeft size={14} /> Previous
                        </button>
                        <span className="text-sm text-slate-500">
                          Page {reviewPagination.page} of {reviewPagination.totalPages}
                        </span>
                        <button
                          onClick={() => setReviewPage((p) => Math.min(reviewPagination.totalPages, p + 1))}
                          disabled={reviewPage >= reviewPagination.totalPages}
                          className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
                        >
                          Next <ChevronRight size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
                    <MessageSquare size={40} className="mx-auto text-slate-300" />
                    <p className="mt-3 text-sm text-slate-500">No reviews yet.</p>
                  </div>
                )}
              </section>
            )}

            {!isTutor && (
              <section className="rounded-xl border border-slate-200 bg-white p-8 text-center">
                <GraduationCap size={48} className="mx-auto text-slate-300" />
                <h3 className="mt-4 text-lg font-semibold text-slate-700">Student Profile</h3>
                <p className="mt-2 text-sm text-slate-500">
                  {isOwnProfile
                    ? 'Your enrolled courses and progress are on your dashboard.'
                    : `${user.profile.firstName} is a student on EduSphere.`}
                </p>
                {isOwnProfile && (
                  <Link to="/dashboard" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary-900 hover:underline">
                    Go to Dashboard <ChevronRight size={14} />
                  </Link>
                )}
              </section>
            )}
          </div>
        </div>
      </main>

      <AppFooter />
    </div>
  );
};

// ── Sub-components ────────────────────────────────────────────────────────

const StatPill: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
  <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium text-white backdrop-blur">
    {icon} {label}
  </span>
);

const QuickStatCard: React.FC<{ icon: React.ReactNode; value: string; label: string }> = ({
  icon,
  value,
  label,
}) => (
  <div className="flex flex-col items-center gap-1 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
    {icon}
    <span className="text-xl font-bold text-slate-900">{value}</span>
    <span className="text-xs text-slate-500">{label}</span>
  </div>
);

const CourseCard: React.FC<{ course: ProfileCourse }> = ({ course }) => {
  const price = course.pricing.discountPrice ?? course.pricing.amount;
  const originalPrice = course.pricing.discountPrice != null ? course.pricing.amount : undefined;

  return (
    <Link
      to={`/courses/${course._id}`}
      className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
        {course.thumbnail ? (
          <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover transition group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <BookOpen size={40} className="text-slate-300" />
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-primary-900/90 px-2.5 py-0.5 text-xs font-semibold text-white">
          {course.level}
        </span>
      </div>
      <div className="p-4">
        <h3 className="line-clamp-2 text-sm font-semibold text-slate-900 group-hover:text-primary-900">
          {course.title}
        </h3>
        <p className="mt-1 text-xs text-slate-500">{course.category}</p>
        <div className="mt-2 flex items-center gap-2">
          <div className="flex">{renderStars(course.stats.avgRating, 12)}</div>
          <span className="text-xs text-slate-500">({course.stats.reviewCount})</span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-slate-900">
              {course.pricing.currency} {price.toLocaleString()}
            </span>
            {originalPrice !== undefined && (
              <span className="text-xs text-slate-400 line-through">
                {course.pricing.currency} {originalPrice.toLocaleString()}
              </span>
            )}
          </div>
          <span className="text-xs text-slate-500">{course.stats.enrollmentCount} students</span>
        </div>
      </div>
    </Link>
  );
};

const ReviewCard: React.FC<{ review: CourseReview }> = ({ review }) => {
  const initial = review.student.firstName.charAt(0).toUpperCase();

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        {review.student.avatar ? (
          <img src={review.student.avatar} alt={review.student.firstName} className="h-10 w-10 rounded-full object-cover" />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">
            {initial}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {review.student.firstName} {review.student.lastName}
              </p>
              {review.courseName && (
                <p className="text-xs text-slate-500">{review.courseName}</p>
              )}
            </div>
            <span className="shrink-0 text-xs text-slate-400">{timeAgo(review.createdAt)}</span>
          </div>
          <div className="mt-1 flex">{renderStars(review.rating, 14)}</div>
          {review.comment && (
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{review.comment}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
