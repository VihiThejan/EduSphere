import React from 'react';
import { MapPin } from 'lucide-react';
import { BillingAddressData, CheckoutFieldErrors } from './types';

interface BillingAddressFormProps {
  value: BillingAddressData;
  errors?: CheckoutFieldErrors;
  onChange: (value: BillingAddressData) => void;
}

const BillingAddressForm: React.FC<BillingAddressFormProps> = ({ value, errors, onChange }) => {
  const inputClass =
    'rounded-lg border bg-slate-50 p-2.5 text-sm text-slate-800 outline-none transition focus:border-primary-900';

  const withError = (hasError?: string) =>
    hasError
      ? `${inputClass} border-red-300 focus:border-red-500`
      : `${inputClass} border-slate-200`;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-slate-900">
        <MapPin size={18} className="text-primary-900" />
        Billing Address
      </h3>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <input
            type="text"
            placeholder="First Name"
            value={value.firstName}
            onChange={(event) => onChange({ ...value, firstName: event.target.value })}
            className={withError(errors?.firstName)}
          />
          {errors?.firstName ? <p className="mt-1 text-xs text-red-600">{errors.firstName}</p> : null}
        </div>

        <div>
          <input
            type="text"
            placeholder="Last Name"
            value={value.lastName}
            onChange={(event) => onChange({ ...value, lastName: event.target.value })}
            className={withError(errors?.lastName)}
          />
          {errors?.lastName ? <p className="mt-1 text-xs text-red-600">{errors.lastName}</p> : null}
        </div>

        <div className="md:col-span-2">
          <input
            type="email"
            placeholder="Email Address"
            value={value.email}
            onChange={(event) => onChange({ ...value, email: event.target.value })}
            className={`${withError(errors?.email)} w-full`}
          />
          {errors?.email ? <p className="mt-1 text-xs text-red-600">{errors.email}</p> : null}
        </div>

        <div className="md:col-span-2">
          <input
            type="text"
            placeholder="Street Address"
            value={value.streetAddress}
            onChange={(event) => onChange({ ...value, streetAddress: event.target.value })}
            className={`${withError(errors?.streetAddress)} w-full`}
          />
          {errors?.streetAddress ? (
            <p className="mt-1 text-xs text-red-600">{errors.streetAddress}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export default BillingAddressForm;
