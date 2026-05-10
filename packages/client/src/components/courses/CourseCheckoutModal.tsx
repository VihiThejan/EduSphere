import React, { useEffect, useState } from 'react';
import { X, Loader2, CheckCircle2, Lock } from 'lucide-react';
import { useStripe, useElements, PaymentElement, Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { analyticsApi, CourseCheckoutResult } from '@/services/api/analytics.api';
import { useAuthStore } from '@/store/authStore';
import { config } from '@/config';

const stripePromise = loadStripe(config.stripePublishableKey);

interface StripePaymentFormProps {
  priceAmount: number;
  priceCurrency: string;
  courseId: string;
  paymentIntentId: string;
  onSuccess: () => void;
  onError: (msg: string) => void;
}

const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  priceAmount,
  priceCurrency,
  courseId,
  paymentIntentId,
  onSuccess,
  onError,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentElementReady, setPaymentElementReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || !paymentElementReady || isProcessing) return;

    setIsProcessing(true);

    // Elements must stay mounted while confirmPayment runs — do NOT change
    // parent step before this call or Stripe loses the mounted PaymentElement.
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success?courseId=${courseId}`,
      },
      redirect: 'if_required',
    });

    if (error) {
      setIsProcessing(false);
      onError(error.message ?? 'Payment failed');
      return;
    }

    // Stripe confirmed payment — tell the backend to activate the enrollment.
    // This is needed in local dev where webhooks aren't forwarded automatically.
    try {
      await analyticsApi.verifyEnrollmentPayment(courseId, paymentIntentId);
    } catch {
      // Non-fatal: webhook may have already created the enrollment
    }

    onSuccess();
  };

  const canPay = !!(stripe && elements && paymentElementReady && !isProcessing);

  // The PaymentElement iframe MUST stay mounted for the entire confirmPayment
  // call — never conditionally unmount the form or the element.
  return (
    <form onSubmit={handlePay}>
      <div className="mb-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600">Course fee</span>
          <span className="text-base font-bold text-slate-900">
            {priceAmount.toLocaleString()} {priceCurrency}
          </span>
        </div>
      </div>

      {!paymentElementReady && (
        <div className="flex items-center justify-center py-6">
          <Loader2 size={22} className="animate-spin text-slate-400" />
        </div>
      )}

      {/* Always keep PaymentElement in the DOM — hiding it while processing
          via CSS so the iframe stays alive for confirmPayment */}
      <div style={{ display: isProcessing ? 'none' : 'block' }}>
        <PaymentElement
          options={{ layout: 'tabs' }}
          onReady={() => setPaymentElementReady(true)}
        />
      </div>

      {isProcessing ? (
        <div className="mt-4 flex flex-col items-center gap-2 py-4">
          <Loader2 size={28} className="animate-spin text-primary-900" />
          <p className="text-sm text-slate-400">Processing payment…</p>
        </div>
      ) : (
        <button
          type="submit"
          disabled={!canPay}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary-900 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-900/20 transition hover:bg-primary-800 disabled:opacity-50"
        >
          <Lock size={14} />
          {paymentElementReady ? `Pay ${priceAmount.toLocaleString()} ${priceCurrency}` : 'Loading…'}
        </button>
      )}
    </form>
  );
};

interface CourseCheckoutModalProps {
  courseId: string;
  courseTitle: string;
  priceAmount: number;
  priceCurrency: string;
  onClose: () => void;
  onEnrolled: () => void;
}

const CourseCheckoutModal: React.FC<CourseCheckoutModalProps> = ({
  courseId,
  courseTitle,
  priceAmount,
  priceCurrency,
  onClose,
  onEnrolled,
}) => {
  useAuthStore(); // keep store connected for future auth checks

  const [step, setStep] = useState<'loading' | 'payment' | 'success' | 'error'>('loading');
  const [checkoutData, setCheckoutData] = useState<CourseCheckoutResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Initiate checkout on mount
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const data = await analyticsApi.initiateCheckout(courseId);
        if (cancelled) return;

        if (data.isFree) {
          // Free course enrolled already
          setStep('success');
          setTimeout(() => onEnrolled(), 1500);
          return;
        }

        setCheckoutData(data);
        setStep('payment');
      } catch (err: any) {
        if (cancelled) return;
        const msg =
          err?.response?.data?.error?.message ?? err?.message ?? 'Failed to initiate checkout';
        setErrorMsg(msg);
        setStep('error');
      }
    };

    void init();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div>
            <h2 className="text-base font-bold text-slate-900">Enrol in Course</h2>
            <p className="mt-0.5 text-xs text-slate-500 line-clamp-1">{courseTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5">
          {/* Loading */}
          {step === 'loading' && (
            <div className="flex flex-col items-center gap-3 py-10">
              <Loader2 size={30} className="animate-spin text-primary-900" />
              <p className="text-sm text-slate-400">Preparing checkout…</p>
            </div>
          )}

          {/* Payment form */}
          {step === 'payment' && checkoutData && (
            <Elements
              stripe={stripePromise}
              options={{ clientSecret: checkoutData.clientSecret }}
            >
              <StripePaymentForm
                priceAmount={priceAmount}
                priceCurrency={priceCurrency}
                courseId={courseId}
                paymentIntentId={checkoutData.paymentIntentId}
                onSuccess={() => {
                  setStep('success');
                  setTimeout(() => onEnrolled(), 1500);
                }}
                onError={(msg) => {
                  setErrorMsg(msg);
                  setStep('error');
                }}
              />
            </Elements>
          )}

          {/* Success */}
          {step === 'success' && (
            <div className="flex flex-col items-center gap-3 py-10">
              <CheckCircle2 size={42} className="text-emerald-500" />
              <p className="text-base font-bold text-slate-900">You're enrolled!</p>
              <p className="text-sm text-slate-400">Redirecting to your course…</p>
            </div>
          )}

          {/* Error */}
          {step === 'error' && (
            <div className="py-6 text-center">
              <p className="mb-2 font-semibold text-red-700">Payment Failed</p>
              <p className="mb-4 text-sm text-slate-500">{errorMsg}</p>
              <button
                onClick={() => {
                  setErrorMsg('');
                  setStep('loading');
                  // Reinitiate
                }}
                className="rounded-xl border border-primary-900 px-4 py-2 text-sm font-semibold text-primary-900 hover:bg-primary-900/5"
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        {(step === 'payment') && (
          <div className="flex items-center justify-center gap-1.5 border-t border-slate-100 px-5 py-3 text-xs text-slate-400">
            <Lock size={11} /> Secured by Stripe
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseCheckoutModal;
