import React from 'react';
import { Lock } from 'lucide-react';
import { CheckoutSummary } from './types';

interface OrderSummaryCardProps {
  summary: CheckoutSummary;
}

const OrderSummaryCard: React.FC<OrderSummaryCardProps> = ({ summary }) => {
  const subtotal = summary.items.reduce((total, item) => total + item.price, 0);
  const total = subtotal + summary.serviceFee;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-bold text-slate-900">Order Summary</h3>

      <div className="mb-6 space-y-4">
        {summary.items.map((item) => (
          <article key={item.id} className="flex gap-4">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-200">
              <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-slate-900">{item.title}</p>
              <p className="text-xs text-slate-500">{item.subtitle}</p>
              <p className="mt-1 text-sm font-bold text-primary-900">LKR {item.price.toLocaleString()}.00</p>
            </div>
          </article>
        ))}
      </div>

      <div className="space-y-3 border-t border-slate-100 pt-4">
        <div className="flex justify-between text-sm text-slate-500">
          <span>Subtotal</span>
          <span className="font-semibold text-slate-900">LKR {subtotal.toLocaleString()}.00</span>
        </div>
        <div className="flex justify-between text-sm text-slate-500">
          <span>Service Fee</span>
          <span className="font-semibold text-slate-900">LKR {summary.serviceFee.toLocaleString()}.00</span>
        </div>
        <div className="mt-3 flex justify-between border-t border-slate-100 pt-3 text-lg font-bold">
          <span>Total</span>
          <span className="text-primary-900">LKR {total.toLocaleString()}.00</span>
        </div>
      </div>

      <button
        type="button"
        className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-primary-900 px-4 py-4 font-bold text-white transition hover:bg-primary-800"
      >
        <span>Complete Purchase</span>
        <Lock size={18} />
      </button>

      <p className="mt-4 text-center text-[10px] leading-relaxed text-slate-400">
        By clicking 'Complete Purchase', you agree to our Terms of Service and Privacy Policy. All
        transactions are securely encrypted.
      </p>
    </section>
  );
};

export default OrderSummaryCard;
