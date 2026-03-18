import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Video, Plus, Users, Clock, Send, ThumbsUp, CheckCircle,
  ChevronLeft, Mic, MicOff, LogOut, Radio,
} from 'lucide-react';

import { useAuthStore } from '@/store/authStore';
import { tutorApi, LiveSession, LiveQuestion } from '@/services/api/tutor.api';
import { AppFooter, AppHeader, AppSidebar } from '@/components/common';
import { USER_ROLES } from '@edusphere/shared';
import type { AppNavItem } from '@/components/common';

// ── helpers ────────────────────────────────────────────────────────────────────
const statusBadge: Record<LiveSession['status'], string> = {
  scheduled: 'bg-amber-50 text-amber-700 border-amber-200',
  live:      'bg-emerald-50 text-emerald-700 border-emerald-200',
  ended:     'bg-slate-100 text-slate-500 border-slate-200',
};
const statusLabel: Record<LiveSession['status'], string> = {
  scheduled: 'Scheduled',
  live:      '● Live Now',
  ended:     'Ended',
};
const formatDate = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
    : '—';

function getHost(session: LiveSession) {
  if (typeof session.hostId === 'object' && session.hostId !== null) {
    const h = session.hostId as { profile: { firstName: string; lastName?: string; avatar?: string }; email: string };
    return {
      name: `${h.profile.firstName} ${h.profile.lastName ?? ''}`.trim() || h.email,
      avatar: h.profile.avatar ?? null,
    };
  }
  return { name: 'Tutor', avatar: null };
}

// ── Q&A Panel ─────────────────────────────────────────────────────────────────
interface QAPanelProps {
  sessionId: string;
  isHost: boolean;
  userId: string;
}
const QAPanel: React.FC<QAPanelProps> = ({ sessionId, isHost, userId }) => {
  const queryClient = useQueryClient();
  const [input, setInput] = useState('');
  const [answerInputs, setAnswerInputs] = useState<Record<string, string>>({});
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: questions = [] } = useQuery<LiveQuestion[]>({
    queryKey: ['live-questions', sessionId],
    queryFn: () => tutorApi.getQuestions(sessionId),
    refetchInterval: 5000,
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [questions.length]);

  const askMutation = useMutation({
    mutationFn: () => tutorApi.askQuestion(sessionId, input.trim()),
    onSuccess: () => {
      setInput('');
      void queryClient.invalidateQueries({ queryKey: ['live-questions', sessionId] });
    },
  });

  const answerMutation = useMutation({
    mutationFn: ({ qId, answer }: { qId: string; answer: string }) =>
      tutorApi.answerQuestion(sessionId, qId, answer),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['live-questions', sessionId] });
    },
  });

  const upvoteMutation = useMutation({
    mutationFn: (qId: string) => tutorApi.upvoteQuestion(sessionId, qId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['live-questions', sessionId] });
    },
  });

  return (
    <div className="flex h-full flex-col bg-white border-l border-slate-200">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3">
        <Mic size={15} className="text-primary-900" />
        <span className="font-semibold text-sm text-slate-800">Q & A</span>
        <span className="ml-auto rounded-full bg-primary-900/10 px-2 py-0.5 text-xs font-bold text-primary-900">
          {questions.length}
        </span>
      </div>

      {/* Questions list */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {questions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-center py-10">
            <MicOff size={28} className="text-slate-300" />
            <p className="text-xs text-slate-400">No questions yet.<br />Be the first to ask!</p>
          </div>
        ) : (
          questions.map((q) => {
            const myUpvote = q.upvotedBy.includes(userId);
            return (
              <div
                key={q._id}
                className={`rounded-xl p-3 text-sm border ${q.answered ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}
              >
                {/* Question */}
                <div className="flex items-start gap-2">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-900/10 text-xs font-bold text-primary-900">
                    {q.askerName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold text-slate-500">{q.askerName}</span>
                    <p className="mt-0.5 text-slate-800 break-words">{q.question}</p>
                  </div>
                </div>

                {/* Answer */}
                {q.answered && q.answer && (
                  <div className="mt-2 ml-8 rounded-lg bg-white border border-emerald-200 p-2">
                    <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700 mb-1">
                      <CheckCircle size={11} /> Answered
                    </div>
                    <p className="text-xs text-slate-700">{q.answer}</p>
                  </div>
                )}

                {/* Host answer input */}
                {isHost && !q.answered && (
                  <div className="mt-2 ml-8 flex gap-1">
                    <input
                      className="flex-1 rounded-lg border border-slate-200 px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-primary-900/30"
                      placeholder="Type your answer…"
                      value={answerInputs[q._id] ?? ''}
                      onChange={(e) => setAnswerInputs((prev) => ({ ...prev, [q._id]: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && answerInputs[q._id]?.trim()) {
                          answerMutation.mutate({ qId: q._id, answer: answerInputs[q._id] });
                          setAnswerInputs((prev) => ({ ...prev, [q._id]: '' }));
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        if (answerInputs[q._id]?.trim()) {
                          answerMutation.mutate({ qId: q._id, answer: answerInputs[q._id] });
                          setAnswerInputs((prev) => ({ ...prev, [q._id]: '' }));
                        }
                      }}
                      className="rounded-lg bg-emerald-600 px-2 py-1 text-white hover:bg-emerald-700 transition"
                    >
                      <Send size={11} />
                    </button>
                  </div>
                )}

                {/* Upvote */}
                <div className="mt-2 ml-8 flex items-center gap-1">
                  <button
                    onClick={() => upvoteMutation.mutate(q._id)}
                    className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs transition ${myUpvote ? 'bg-primary-900 text-white' : 'bg-slate-200 text-slate-500 hover:bg-slate-300'}`}
                  >
                    <ThumbsUp size={10} /> {q.upvotes}
                  </button>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Ask box – students only */}
      {!isHost && (
        <div className="border-t border-slate-200 px-3 py-3">
          <div className="flex gap-2">
            <input
              className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-900/30"
              placeholder="Ask a question…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && input.trim()) askMutation.mutate(); }}
              maxLength={500}
            />
            <button
              onClick={() => { if (input.trim()) askMutation.mutate(); }}
              disabled={!input.trim() || askMutation.isPending}
              className="flex items-center justify-center rounded-xl bg-primary-900 px-3 py-2 text-white hover:bg-primary-900/90 disabled:opacity-50 transition"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Room View (Jitsi Meet iframe + Q&A side panel) ────────────────────────────
interface RoomViewProps {
  roomUrl: string;
  token: string;
  title: string;
  sessionId: string;
  isHost: boolean;
  userId: string;
  onLeave: () => void;
  onEnd?: () => void;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    JitsiMeetExternalAPI: any;
  }
}

type JitsiAPI = {
  executeCommand: (cmd: string) => void;
  dispose: () => void;
  addListener: (event: string, handler: () => void) => void;
};

const RoomView: React.FC<RoomViewProps> = ({
  roomUrl, title, sessionId, isHost, userId, onLeave, onEnd
}) => {
  const jitsiContainerRef = React.useRef<HTMLDivElement>(null);
  const jitsiApiRef = React.useRef<JitsiAPI | null>(null);

  // Extract room name from URL: https://meet.jit.si/RoomName → "RoomName"
  const roomName = roomUrl.replace('https://meet.jit.si/', '');

  useEffect(() => {
    // Load Jitsi External API script then instantiate the meeting
    const scriptId = 'jitsi-external-api';
    const initJitsi = () => {
      if (!jitsiContainerRef.current || jitsiApiRef.current) return;
      jitsiApiRef.current = new window.JitsiMeetExternalAPI('meet.jit.si', {
        roomName,
        parentNode: jitsiContainerRef.current,
        width: '100%',
        height: '100%',
        configOverwrite: {
          prejoinPageEnabled: false,
          disableDeepLinking: true,
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          subject: title,
        },
        interfaceConfigOverwrite: {
          SHOW_JITSI_WATERMARK: false,
          SHOW_BRAND_WATERMARK: false,
          TOOLBAR_BUTTONS: [
            'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
            'fodeviceselection', 'hangup', 'chat', 'raisehand', 'tileview',
            'select-background', 'stats', 'shortcuts', 'videobackgroundblur',
          ],
        },
        userInfo: { displayName: userId },
      });

      // Auto leave when user hangs up inside Jitsi UI
      jitsiApiRef.current?.addListener('readyToClose', onLeave);
    };

    if (document.getElementById(scriptId)) {
      if (window.JitsiMeetExternalAPI) initJitsi();
    } else {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://meet.jit.si/external_api.js';
      script.async = true;
      script.onload = initJitsi;
      document.head.appendChild(script);
    }

    return () => {
      jitsiApiRef.current?.dispose();
      jitsiApiRef.current = null;
    };
  }, [roomName]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900">
      {/* Top bar */}
      <div className="flex shrink-0 items-center justify-between bg-slate-800 px-4 py-2 text-white">
        <div className="flex items-center gap-3">
          <Radio size={15} className="text-emerald-400 animate-pulse" />
          <span className="font-semibold text-sm truncate max-w-xs">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          {isHost && onEnd && (
            <button
              onClick={() => { jitsiApiRef.current?.executeCommand('hangup'); onEnd(); }}
              className="flex items-center gap-1.5 rounded-lg border border-red-400 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500 hover:text-white transition"
            >
              <LogOut size={13} /> End Session
            </button>
          )}
          <button
            onClick={() => { jitsiApiRef.current?.executeCommand('hangup'); onLeave(); }}
            className="flex items-center gap-1.5 rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-medium hover:bg-slate-600 transition"
          >
            <ChevronLeft size={13} /> Leave
          </button>
        </div>
      </div>

      {/* Main area: Jitsi + Q&A */}
      <div className="flex flex-1 min-h-0">
        {/* Jitsi container */}
        <div ref={jitsiContainerRef} className="flex-1 min-w-0 bg-slate-900" />

        {/* Q&A panel */}
        <div className="w-80 shrink-0 flex flex-col">
          <QAPanel sessionId={sessionId} isHost={isHost} userId={userId} />
        </div>
      </div>
    </div>
  );
};

// ── Create Session Modal ───────────────────────────────────────────────────────
interface CreateModalProps {
  onClose: () => void;
  onCreate: (data: { title: string; description: string; scheduledAt: string; maxParticipants: number }) => void;
  isPending: boolean;
  isError: boolean;
}
const CreateModal: React.FC<CreateModalProps> = ({ onClose, onCreate, isPending, isError }) => {
  const [form, setForm] = useState({ title: '', description: '', scheduledAt: '', maxParticipants: 100 });
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Schedule a Live Session</h2>
        <div className="flex flex-col gap-3">
          <input
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-900/30"
            placeholder="Session title *"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
          <textarea
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-900/30 resize-none"
            placeholder="What will you cover? (optional)"
            rows={3}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs font-medium text-slate-500 mb-1 block">Scheduled At</label>
              <input
                type="datetime-local"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-900/30"
                value={form.scheduledAt}
                onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Max Students</label>
              <input
                type="number" min={2} max={500}
                className="w-24 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-900/30"
                value={form.maxParticipants}
                onChange={(e) => setForm((f) => ({ ...f, maxParticipants: parseInt(e.target.value) || 30 }))}
              />
            </div>
          </div>
        </div>
        {isError && <p className="mt-2 text-xs text-red-500">Failed to create session. Please try again.</p>}
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 transition">Cancel</button>
          <button
            disabled={!form.title.trim() || isPending}
            onClick={() => onCreate(form)}
            className="rounded-lg bg-primary-900 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-900/90 disabled:opacity-50 transition"
          >
            {isPending ? 'Creating…' : 'Create Session'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Page ──────────────────────────────────────────────────────────────────
const LiveSessionPage: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const queryClient = useQueryClient();
  const isTutor = user?.roles.includes(USER_ROLES.TUTOR) || user?.roles.includes(USER_ROLES.ADMIN);

  const [activeRoom, setActiveRoom] = useState<{
    url: string; token: string; title: string; sessionId: string; isHost: boolean;
  } | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  // ── session queries (role-separated) ─────────────────────────────────────────
  // Students browse all tutor sessions — GET / is student-only on the server
  const { data: allSessions = [], isLoading: studentLoading } = useQuery<LiveSession[]>({
    queryKey: ['live-sessions'],
    queryFn: tutorApi.getAllLiveSessions,
    enabled: isAuthenticated && !isTutor,
    refetchInterval: 20_000,
  });

  // Tutors see only the sessions they created
  const { data: hostedSessions = [], isLoading: tutorLoading } = useQuery<LiveSession[]>({
    queryKey: ['hosted-sessions'],
    queryFn: tutorApi.getHostedSessions,
    enabled: isAuthenticated && !!isTutor,
    refetchInterval: 20_000,
  });

  const isLoading = isTutor ? tutorLoading : studentLoading;

  // ── mutations ────────────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: tutorApi.createLiveSession,
    onSuccess: () => {
      setShowCreate(false);
      void queryClient.invalidateQueries({ queryKey: ['live-sessions'] });
      void queryClient.invalidateQueries({ queryKey: ['hosted-sessions'] });
    },
  });

  const joinMutation = useMutation({
    mutationFn: ({ sessionId, asHost }: { sessionId: string; asHost: boolean }) =>
      tutorApi.joinLiveSession(sessionId, asHost),
    onSuccess: (data, { sessionId, asHost }) => {
      setActiveRoom({ url: data.roomUrl, token: data.token, title: data.title, sessionId, isHost: asHost });
      void queryClient.invalidateQueries({ queryKey: ['live-sessions'] });
    },
  });

  const endMutation = useMutation({
    mutationFn: (sessionId: string) => tutorApi.endLiveSession(sessionId),
    onSuccess: () => {
      setActiveRoom(null);
      void queryClient.invalidateQueries({ queryKey: ['live-sessions'] });
      void queryClient.invalidateQueries({ queryKey: ['hosted-sessions'] });
    },
  });

  // ── nav ───────────────────────────────────────────────────────────────────────
  const headerItems: AppNavItem[] = [
    { label: 'Courses', href: '/courses' },
    { label: 'Live Sessions', href: '/live', active: true },
    { label: 'My Learning', href: '/dashboard' },
  ];
  const sidebarPrimary: AppNavItem[] = [
    { label: 'Dashboard', href: '/dashboard', icon: Video },
    { label: 'Courses', href: '/courses', icon: Video },
    { label: 'Live Sessions', href: '/live', icon: Radio, active: true },
    ...(isTutor ? [{ label: 'Upload Course', href: '/tutor/upload', icon: Plus }] : []),
  ];

  // ── room view ────────────────────────────────────────────────────────────────
  if (activeRoom) {
    return (
      <RoomView
        roomUrl={activeRoom.url}
        token={activeRoom.token}
        title={activeRoom.title}
        sessionId={activeRoom.sessionId}
        isHost={activeRoom.isHost}
        userId={user!._id}
        onLeave={() => setActiveRoom(null)}
        onEnd={activeRoom.isHost ? () => endMutation.mutate(activeRoom.sessionId) : undefined}
      />
    );
  }

  // ── session list view (role-split) ──────────────────────────────────────────
  // Tutor sees own sessions; Student sees all tutor sessions
  const displaySessions    = isTutor ? hostedSessions : allSessions;
  const liveSessions       = displaySessions.filter((s) => s.status === 'live');
  const scheduledSessions  = displaySessions.filter((s) => s.status === 'scheduled');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <AppHeader
        navItems={headerItems}
        isAuthenticated={isAuthenticated}
        userName={user?.profile.firstName}
        avatarUrl={user?.profile.avatar}
        onLogout={isAuthenticated ? () => void logout() : undefined}
      />

      <div className="flex flex-1">
        <AppSidebar primaryItems={sidebarPrimary} secondaryItems={[]} streakDays={undefined} />

        <main className="flex-1 px-6 py-8 md:px-10">
          {/* Page header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                {isTutor ? 'My Live Sessions' : 'Browse Live Sessions'}
              </h1>
              <p className="mt-0.5 text-sm text-slate-500">
                {isTutor
                  ? 'Schedule and host live classes for your students.'
                  : 'Join a live class and ask your tutor questions in real time.'}
              </p>
            </div>
            {isTutor && (
              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 rounded-lg bg-primary-900 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-900/90 transition"
              >
                <Plus size={16} /> New Session
              </button>
            )}
          </div>

          {/* Loading skeleton */}
          {isLoading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 rounded-xl bg-slate-200 animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              {/* ── LIVE NOW ─────────────────────────────────────── */}
              {liveSessions.length > 0 && (
                <section className="mb-8">
                  <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-slate-700 uppercase tracking-wide">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
                    Live Now
                  </h2>
                  <div className="flex flex-col gap-3">
                    {liveSessions.map((session) => (
                      <SessionCard
                        key={session._id}
                        session={session}
                        isOwnSession={!!isTutor}
                        isTutor={!!isTutor}
                        onJoin={(asHost) => joinMutation.mutate({ sessionId: session._id, asHost })}
                        onEnd={() => endMutation.mutate(session._id)}
                        joining={joinMutation.isPending}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* ── SCHEDULED ────────────────────────────────────── */}
              {scheduledSessions.length > 0 && (
                <section className="mb-8">
                  <h2 className="mb-3 text-base font-bold text-slate-700 uppercase tracking-wide">
                    Scheduled
                  </h2>
                  <div className="flex flex-col gap-3">
                    {scheduledSessions.map((session) => (
                      <SessionCard
                        key={session._id}
                        session={session}
                        isOwnSession={!!isTutor}
                        isTutor={!!isTutor}
                        onJoin={(asHost) => joinMutation.mutate({ sessionId: session._id, asHost })}
                        onEnd={() => endMutation.mutate(session._id)}
                        joining={joinMutation.isPending}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Empty state */}
              {displaySessions.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-4 py-28 text-center">
                  <Video size={52} className="text-slate-300" />
                  {isTutor ? (
                    <>
                      <p className="text-lg font-semibold text-slate-500">No sessions yet</p>
                      <p className="text-sm text-slate-400">Create a session — students will see it and can join once you start it.</p>
                      <button
                        onClick={() => setShowCreate(true)}
                        className="flex items-center gap-2 rounded-lg bg-primary-900 px-5 py-2 text-sm font-semibold text-white hover:bg-primary-900/90 transition"
                      >
                        <Plus size={16} /> Schedule your first session
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="text-lg font-semibold text-slate-500">No live sessions right now</p>
                      <p className="text-sm text-slate-400">Your tutors haven't started any sessions yet. Check back soon!</p>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {showCreate && (
        <CreateModal
          onClose={() => setShowCreate(false)}
          onCreate={(data) => createMutation.mutate(data)}
          isPending={createMutation.isPending}
          isError={createMutation.isError}
        />
      )}

      <AppFooter />
    </div>
  );
};

// ── Session Card ──────────────────────────────────────────────────────────────
interface SessionCardProps {
  session: LiveSession;
  isOwnSession: boolean;
  isTutor: boolean;
  onJoin: (asHost: boolean) => void;
  onEnd: () => void;
  joining: boolean;
}
const SessionCard: React.FC<SessionCardProps> = ({
  session, isOwnSession, onJoin, onEnd, joining,
}) => {
  const host = getHost(session);
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-white px-5 py-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Tutor avatar */}
      <div className="shrink-0">
        {host.avatar ? (
          <img src={host.avatar} alt={host.name} className="h-12 w-12 rounded-full object-cover border-2 border-white shadow" />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-900 text-white font-bold text-lg">
            {host.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-800 truncate">{session.title}</p>
        <p className="text-xs text-slate-500 mt-0.5">
          Hosted by <span className="font-medium text-primary-900">{host.name}</span>
        </p>
        {session.description && (
          <p className="text-xs text-slate-400 mt-0.5 truncate">{session.description}</p>
        )}
        <div className="mt-1.5 flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1"><Clock size={11} />{formatDate(session.scheduledAt)}</span>
          <span className="flex items-center gap-1"><Users size={11} />Max {session.maxParticipants}</span>
        </div>
      </div>

      {/* Status badge */}
      <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusBadge[session.status]}`}>
        {statusLabel[session.status]}
      </span>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-2">
        {isOwnSession ? (
          <>
            <button
              onClick={() => onJoin(true)}
              disabled={joining}
              className="rounded-lg bg-primary-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-900/90 disabled:opacity-50 transition"
            >
              {session.status === 'live' ? 'Rejoin' : 'Start'}
            </button>
            <button
              onClick={onEnd}
              className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 transition"
            >
              End
            </button>
          </>
        ) : (
          <button
            onClick={() => onJoin(false)}
            disabled={joining || session.status === 'scheduled'}
            title={session.status === 'scheduled' ? 'Session has not started yet' : ''}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              session.status === 'live'
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            {session.status === 'live' ? 'Join Now' : 'Not Started'}
          </button>
        )}
      </div>
    </div>
  );
};


export default LiveSessionPage;
