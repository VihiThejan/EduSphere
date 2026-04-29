import React from 'react';
import { BadgeCheck, RotateCw, ShieldCheck } from 'lucide-react';

const TrustBadges: React.FC = () => {
  return (
    <section className="flex flex-wrap items-center justify-center gap-6 rounded-2xl border border-dashed border-slate-300 p-4">
      <div className="flex items-center gap-1.5 text-slate-500">
        <BadgeCheck size={18} />
        <span className="text-[10px] font-bold uppercase tracking-[0.18em]">SSL Secure</span>
      </div>

      <div className="flex items-center gap-1.5 text-slate-500">
        <ShieldCheck size={18} />
        <span className="text-[10px] font-bold uppercase tracking-[0.18em]">PCI Compliant</span>
      </div>

      <div className="flex items-center gap-1.5 text-slate-500">
        <RotateCw size={18} />
        <span className="text-[10px] font-bold uppercase tracking-[0.18em]">Easy Returns</span>
      </div>
    </section>
  );
};

export default TrustBadges;
