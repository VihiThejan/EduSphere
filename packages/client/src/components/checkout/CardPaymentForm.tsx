import React from 'react';

const CardPaymentForm: React.FC = () => {
  return (
    <div className="mt-8 space-y-4">
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Cardholder Name</label>
        <input
          type="text"
          placeholder="John Doe"
          className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-sm text-slate-800 outline-none transition focus:border-primary-900"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Card Number</label>
        <input
          type="text"
          placeholder="0000 0000 0000 0000"
          className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-sm text-slate-800 outline-none transition focus:border-primary-900"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Expiry Date</label>
          <input
            type="text"
            placeholder="MM / YY"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-sm text-slate-800 outline-none transition focus:border-primary-900"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">CVV / CVC</label>
          <input
            type="text"
            placeholder="123"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-sm text-slate-800 outline-none transition focus:border-primary-900"
          />
        </div>
      </div>
    </div>
  );
};

export default CardPaymentForm;
