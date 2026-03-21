import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  FileCheck,
  GraduationCap,
  Play,
  ShieldCheck,
  ShoppingBag,
  TrendingUp,
  Users,
  Video,
} from 'lucide-react';
import { AppHeader, AppNavItem } from '@/components/common';
import { useAuthStore } from '@/store/authStore';

const HomePage: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuthStore();

  const headerItems: AppNavItem[] = [
    { label: 'Courses', href: '/courses' },
    { label: 'Marketplace', href: '/#showcase' },
    { label: 'Community', href: '/#highlights' },
    { label: 'About', href: '/#footer' },
  ];

  const showcaseCards = [
    {
      title: 'Kuppi Video Sessions',
      description:
        "Engage in live interactive peer-to-peer tutoring sessions. Break down complex topics with someone who's already mastered them.",
      icon: Video,
    },
    {
      title: 'Peer Courses',
      description:
        'Access high-quality courses created by top-performing students. Learn through student-friendly curriculum and practical insights.',
      icon: BookOpen,
    },
    {
      title: 'Marketplace',
      description:
        'Trade academic notes, books, and resources securely. Turn your hard work into extra income while helping others succeed.',
      icon: ShoppingBag,
    },
  ];

  const highlights = [
    {
      title: 'Progress Tracking',
      description: 'Monitor your learning milestones and track your performance over time.',
      icon: TrendingUp,
    },
    {
      title: 'Secure Payments',
      description: 'Transact with confidence using our encrypted and reliable gateway.',
      icon: ShieldCheck,
    },
    {
      title: 'Study Groups',
      description: 'Join specialized groups based on your major and university interests.',
      icon: Users,
    },
    {
      title: 'Note Verification',
      description: 'All marketplace resources are vetted for quality and relevance.',
      icon: FileCheck,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <AppHeader
        navItems={headerItems}
        isAuthenticated={isAuthenticated}
        userName={user?.profile.firstName}
        userMeta={isAuthenticated ? 'EduSphere Member' : undefined}
        avatarUrl={user?.profile.avatar}
        onLogout={
          isAuthenticated
            ? () => {
                void logout();
              }
            : undefined
        }
      />

      <main>
        <section className="px-4 pb-16 pt-10 sm:px-6 md:pt-16 lg:px-8 lg:pt-20">
          <div className="mx-auto grid w-full max-w-7xl items-center gap-12 md:grid-cols-2">
            <div className="space-y-8">
              <div className="space-y-4">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-800">
                  The student-first ecosystem
                </p>
                <h1 className="text-4xl font-black leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                  Peer Learning &amp; Academic Marketplace for{' '}
                  <span className="text-primary-800">University Students</span>
                </h1>
                <p className="max-w-xl text-base text-slate-600 sm:text-lg">
                  Empowering students through collaborative learning and a dedicated academic
                  marketplace for peer-led growth. Connect, learn, and trade with your university
                  community.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/courses"
                  className="inline-flex h-12 items-center justify-center rounded-xl bg-primary-900 px-6 text-sm font-bold text-white shadow-md shadow-primary-900/20 transition hover:bg-primary-800"
                >
                  Explore Courses
                </Link>
                <a
                  href="#showcase"
                  className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-bold text-slate-800 transition hover:bg-slate-100"
                >
                  Browse Marketplace
                </a>
              </div>

              <div className="flex items-center gap-3 text-sm text-slate-500">
                <div className="flex -space-x-2">
                  {['A', 'B', 'C'].map((label, index) => (
                    <span
                      key={label}
                      className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-50 bg-slate-300 text-xs font-semibold text-slate-700"
                      style={{ backgroundColor: index === 1 ? '#cbd5e1' : index === 2 ? '#94a3b8' : '#e2e8f0' }}
                    >
                      {label}
                    </span>
                  ))}
                </div>
                <p>Joined by 5,000+ students this month</p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-primary-200 via-primary-100 to-transparent blur-2xl" />
              <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80"
                  alt="Students collaborating"
                  className="aspect-video w-full object-cover"
                />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-xl border border-white/40 bg-white/90 p-4 backdrop-blur">
                  <div>
                    <p className="text-sm font-bold text-slate-900">Live: Advanced Algorithms</p>
                    <p className="text-xs text-slate-500">12 students currently learning</p>
                  </div>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-900 text-white">
                    <Play size={16} fill="currentColor" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="showcase" className="bg-white px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl space-y-10">
            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
                Empowering Your Academic Journey
              </h2>
              <p className="max-w-2xl text-slate-500">
                Everything you need to excel in your studies, built for the modern university
                experience.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {showcaseCards.map((card) => {
                const Icon = card.icon;

                return (
                  <article
                    key={card.title}
                    className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-slate-50 p-7 transition hover:-translate-y-1 hover:border-primary-300 hover:shadow-xl"
                  >
                    <span className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-primary-900 transition group-hover:bg-primary-900 group-hover:text-white">
                      <Icon size={22} />
                    </span>
                    <h3 className="text-xl font-bold text-slate-900">{card.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600">{card.description}</p>
                    <a
                      href="#"
                      className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary-800"
                    >
                      Learn More <ArrowRight size={16} />
                    </a>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="highlights" className="bg-slate-100 px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto grid w-full max-w-7xl gap-12 md:grid-cols-2 md:items-center">
            <div className="space-y-8">
              <div className="space-y-3">
                <h2 className="text-4xl font-black tracking-tight text-slate-900">
                  Why Choose EduSphere?
                </h2>
                <p className="max-w-xl text-slate-600">
                  Designed by students, for students, with essential tools for academic success.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {highlights.map((highlight) => {
                  const Icon = highlight.icon;

                  return (
                    <article
                      key={highlight.title}
                      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                      <Icon className="text-primary-900" size={18} />
                      <h4 className="mt-3 text-sm font-bold text-slate-900">{highlight.title}</h4>
                      <p className="mt-1 text-sm text-slate-500">{highlight.description}</p>
                    </article>
                  );
                })}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -right-6 -top-6 h-40 w-40 rounded-full bg-primary-200/60 blur-3xl" />
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-lg">
                <img
                  src="https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1000&q=80"
                  alt="Student writing notes"
                  className="w-full rounded-2xl object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl overflow-hidden rounded-[2rem] bg-primary-800 p-8 text-center text-white sm:p-14">
            <h2 className="mx-auto max-w-3xl text-3xl font-black tracking-tight sm:text-5xl">
              Ready to take your academic performance to the next level?
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-base text-primary-100 sm:text-lg">
              Join thousands of students across the country in the most active student marketplace.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                to="/register"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-white px-6 text-sm font-bold text-primary-900 transition hover:bg-blue-50"
              >
                Get Started Free
              </Link>
              <a
                href="#footer"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-white/40 bg-white/10 px-6 text-sm font-bold text-white transition hover:bg-white/20"
              >
                Contact Sales
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer id="footer" className="border-t border-slate-200 bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid w-full max-w-7xl gap-10 md:grid-cols-4">
          <div className="space-y-5">
            <Link to="/" className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-900 text-white">
                <GraduationCap size={18} />
              </span>
              <span className="text-lg font-extrabold tracking-tight text-slate-900">EduSphere</span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-500">
              The all-in-one platform for university students to share knowledge, resources, and
              grow together.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-900">Platform</h4>
            <ul className="space-y-3 text-sm text-slate-500">
              <li>
                <a href="#">Find a Mentor</a>
              </li>
              <li>
                <Link to="/courses">Join Courses</Link>
              </li>
              <li>
                <a href="#showcase">Study Resources</a>
              </li>
              <li>
                <a href="#highlights">University Hubs</a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-900">Company</h4>
            <ul className="space-y-3 text-sm text-slate-500">
              <li>
                <a href="#">About Us</a>
              </li>
              <li>
                <a href="#">Careers</a>
              </li>
              <li>
                <a href="#">Success Stories</a>
              </li>
              <li>
                <a href="#">Privacy Policy</a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-900">
              Newsletter
            </h4>
            <p className="mb-4 text-sm text-slate-500">
              Get the latest study tips and marketplace updates.
            </p>
            <form className="space-y-2">
              <input
                type="email"
                placeholder="Email address"
                className="w-full rounded-lg border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary-400"
              />
              <button
                type="button"
                className="w-full rounded-lg bg-primary-900 py-3 text-sm font-bold text-white transition hover:bg-primary-800"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <p className="mx-auto mt-12 w-full max-w-7xl border-t border-slate-100 pt-8 text-center text-sm text-slate-400">
          (c) 2026 EduSphere Inc. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default HomePage;
