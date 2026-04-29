import React from 'react';
import { Building2, CreditCard } from 'lucide-react';
import { CheckoutPaymentMethod } from './types';

interface PaymentMethodSelectorProps {
  value: CheckoutPaymentMethod;
  onChange: (value: CheckoutPaymentMethod) => void;
}

const methods: Array<{
  value: CheckoutPaymentMethod;
  title: string;
  description: string;
  badge?: string;
  icon: React.ReactNode;
}> = [
  {
    value: 'card',
    title: 'Credit or Debit Card',
    description: 'Visa, Mastercard, AMEX',
    icon: <CreditCard size={18} className="text-slate-400" />,
  },
  {
    value: 'installment',
    title: '3 Installments',
    description: '0% interest, pay in 3 monthly installments',
    badge: 'BNPL',
    icon: <span className="rounded bg-primary-900/10 px-2 py-1 text-[10px] font-bold text-primary-900">BNPL</span>,
  },
  {
    value: 'bank-transfer',
    title: 'Bank Transfer',
    description: 'Manual verification required (1-2 business days)',
    icon: <Building2 size={18} className="text-slate-400" />,
  },
];

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({ value, onChange }) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-slate-900">
        <CreditCard size={18} className="text-primary-900" />
        Payment Method
      </h3>

      <div className="space-y-4">
        {methods.map((method) => {
          const isActive = method.value === value;

          return (
            <label
              key={method.value}
              className={
                isActive
                  ? 'flex cursor-pointer items-center rounded-2xl border-2 border-primary-900 bg-primary-900/5 p-4'
                  : 'flex cursor-pointer items-center rounded-2xl border border-slate-200 p-4 transition hover:border-primary-900/40'
              }
            >
              <input
                type="radio"
                name="payment-method"
                checked={isActive}
                onChange={() => onChange(method.value)}
                className="h-4 w-4 border-slate-300 text-primary-900 focus:ring-primary-900"
              />
              <div className="ml-4 flex-1">
                <span className="block text-sm font-bold text-slate-900">{method.title}</span>
                <span className="text-xs text-slate-500">{method.description}</span>
              </div>
              <div className="ml-4 flex items-center gap-2">{method.icon}</div>
            </label>
          );
        })}
      </div>
    </section>
  );
};

export default PaymentMethodSelector;
