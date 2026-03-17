import React from 'react';
import { CardPaymentData, CheckoutFieldErrors } from './types';

interface CardPaymentFormProps {
  value: CardPaymentData;
  errors?: CheckoutFieldErrors;
  onChange: (value: CardPaymentData) => void;
}

const CardPaymentForm: React.FC<CardPaymentFormProps> = ({ value, errors, onChange }) => {
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
        <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Card Number</label>
        <input
          type="text"
          placeholder="0000 0000 0000 0000"
          value={value.cardNumber}
          onChange={(event) => onChange({ ...value, cardNumber: event.target.value })}
          className={withError(errors?.cardNumber)}
        />
        {errors?.cardNumber ? <p className="mt-1 text-xs text-red-600">{errors.cardNumber}</p> : null}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Expiry Date</label>
          <input
            type="text"
            placeholder="MM / YY"
            value={value.expiryDate}
            onChange={(event) => onChange({ ...value, expiryDate: event.target.value })}
            className={withError(errors?.expiryDate)}
          />
          {errors?.expiryDate ? <p className="mt-1 text-xs text-red-600">{errors.expiryDate}</p> : null}
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">CVV / CVC</label>
          <input
            type="text"
            placeholder="123"
            value={value.cvv}
            onChange={(event) => onChange({ ...value, cvv: event.target.value })}
            className={withError(errors?.cvv)}
          />
          {errors?.cvv ? <p className="mt-1 text-xs text-red-600">{errors.cvv}</p> : null}
        </div>
      </div>
    </div>
  );
};

export default CardPaymentForm;
