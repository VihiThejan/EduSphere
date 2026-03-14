import React from 'react';
import { ArrowRight, SlidersHorizontal } from 'lucide-react';
import { KuppiSession } from './types';

interface KuppiSessionsPanelProps {
  sessions: KuppiSession[];
}

const KuppiSessionsPanel: React.FC<KuppiSessionsPanelProps> = ({ sessions }) => {
  return (
    <section className="lg:col-span-1">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900">Kuppi Sessions</h3>
        <button type="button" className="text-primary-900" aria-label="Filter sessions">
          <SlidersHorizontal size={17} />
        </button>
      </div>

      <div className="rounded-xl border border-primary-900/10 bg-white p-4">
        <p className="text-sm text-slate-500">Live peer tutoring sessions you might like</p>

        <div className="mt-4 space-y-4">
          {sessions.map((session) => (
            <article
              key={session.title}
              className="flex items-center gap-4 rounded-lg p-2 transition hover:bg-primary-900/5"
            >
              <img
                src={session.avatarUrl}
                alt={session.title}
                className="h-12 w-12 rounded-full border border-primary-900/10 object-cover"
              />

              <div className="min-w-0 flex-1 overflow-hidden">
                <p className="truncate font-semibold text-slate-900">{session.title}</p>
                <p className="text-xs text-slate-400">{session.subtitle}</p>
              </div>

              <button type="button" className="rounded-lg bg-primary-900/10 p-2 text-primary-900">
                <ArrowRight size={15} />
              </button>
            </article>
          ))}
        </div>

        <button
          type="button"
          className="mt-4 w-full rounded-lg border border-dashed border-primary-900/30 py-2 text-sm font-medium text-primary-900 transition hover:bg-primary-900/5"
        >
          Browse Marketplace
        </button>
      </div>
    </section>
  );
};

export default KuppiSessionsPanel;
