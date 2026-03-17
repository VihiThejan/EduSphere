import React from 'react';
import { ShieldAlert } from 'lucide-react';

const MarketplaceSafetyTip: React.FC = () => {
  return (
    <section className="flex gap-4 rounded-2xl border border-yellow-200 bg-yellow-50 p-4">
      <ShieldAlert className="shrink-0 text-yellow-700" size={20} />
      <div>
        <h4 className="font-bold text-yellow-800">Safety Tip</h4>
        <p className="mt-1 text-sm text-yellow-700">
          Always meet in safe campus locations like the Main Library lobby or the Student Union during daylight hours. Never go alone to off-campus meetings.
        </p>
      </div>
    </section>
  );
};

export default MarketplaceSafetyTip;
