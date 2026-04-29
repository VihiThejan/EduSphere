import React from 'react';
import { CardElement, CardElementProps } from '@stripe/react-stripe-js';
import { CardPaymentData, CheckoutFieldErrors } from './types';

interface CardPaymentFormProps {
  value: CardPaymentData;
  errors?: CheckoutFieldErrors;
  onChange: (value: CardPaymentData) => void;
  onCardStateChange?: (state: { complete: boolean; error?: string }) => void;
}

const cardElementOptions: CardElementProps['options'] = {
  style: {
    base: {
      fontSize: '14px',
      color: '#0f172a',
      '::placeholder': {
        color: '#94a3b8',
      },
    },
    invalid: {
      color: '#dc2626',
    },
  },
};

const CardPaymentForm: React.FC<CardPaymentFormProps> = ({ value, errors, onChange, onCardStateChange }) => {
  const inputClass =
    'w-full rounded-lg border bg-slate-50 p-2.5 text-sm text-slate-800 outline-none transition focus:border-primary-900';

  const withError = (hasError?: string) =>
    hasError
      ? `${inputClass} border-red-300 focus:border-red-500`
      : `${inputClass} border-slate-200`;

  return (
    <div className="mt-8 space-y-4">
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Cardholder Name</label>
        <input
          type="text"
          placeholder="John Doe"
          value={value.cardholderName}
          onChange={(event) => onChange({ ...value, cardholderName: event.target.value })}
          className={withError(errors?.cardholderName)}
        />
        {errors?.cardholderName ? (
          <p className="mt-1 text-xs text-red-600">{errors.cardholderName}</p>
        ) : null}
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Card Details</label>
        <div className={withError(errors?.cardNumber)}>
          <CardElement
            options={cardElementOptions}
            onChange={(event) => {
              onCardStateChange?.({
                complete: event.complete,
                error: event.error?.message,
              });
            }}
          />
        </div>
        {errors?.cardNumber ? <p className="mt-1 text-xs text-red-600">{errors.cardNumber}</p> : null}
      </div>
    </div>
  );
};

export default CardPaymentForm;
