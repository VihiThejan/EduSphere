import React from 'react';
import { MapPin } from 'lucide-react';

const BillingAddressForm: React.FC = () => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-slate-900">
        <MapPin size={18} className="text-primary-900" />
        Billing Address
      </h3>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <input
          type="text"
          placeholder="First Name"
          className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-sm text-slate-800 outline-none transition focus:border-primary-900"
        />
        <input
          type="text"
          placeholder="Last Name"
          className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-sm text-slate-800 outline-none transition focus:border-primary-900"
        />
        <input
          type="email"
          placeholder="Email Address"
          className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-sm text-slate-800 outline-none transition focus:border-primary-900 md:col-span-2"
        />
        <input
          type="text"
          placeholder="Street Address"
          className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-sm text-slate-800 outline-none transition focus:border-primary-900 md:col-span-2"
        />
      </div>
    </section>
  );
};

export default BillingAddressForm;
