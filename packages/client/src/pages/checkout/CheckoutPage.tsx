import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppFooter, AppHeader, AppNavItem } from '@/components/common';
import {
  BillingAddressData,
  BillingAddressForm,
  CardPaymentData,
  CardPaymentForm,
  CheckoutFieldErrors,
  CheckoutBreadcrumbs,
  CheckoutPaymentMethod,
  OrderSummaryCard,
  PaymentMethodSelector,
  TrustBadges,
} from '@/components/checkout';
import summaryJson from '@/data/mock/checkout-summary.json';
import { useAuthStore } from '@/store/authStore';

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [search, setSearch] = React.useState('');
  const [paymentMethod, setPaymentMethod] = React.useState<CheckoutPaymentMethod>('card');
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<CheckoutFieldErrors>({});
  const [billingAddress, setBillingAddress] = React.useState<BillingAddressData>({
    firstName: '',
    lastName: '',
    email: '',
    streetAddress: '',
  });
  const [cardData, setCardData] = React.useState<CardPaymentData>({
    cardholderName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });

  const navItems: AppNavItem[] = [
    { label: 'Courses', href: '/courses' },
    { label: 'Marketplace', href: '/marketplace' },
  ];

  const summary = summaryJson as {
    items: Array<{ id: string; title: string; subtitle: string; price: number; imageUrl: string }>;
    serviceFee: number;
  };

  const validateCheckout = (): CheckoutFieldErrors => {
    const errors: CheckoutFieldErrors = {};

    if (!billingAddress.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    if (!billingAddress.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }
    if (!billingAddress.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(billingAddress.email)) {
      errors.email = 'Enter a valid email address';
    }
    if (!billingAddress.streetAddress.trim()) {
      errors.streetAddress = 'Street address is required';
    }

    if (paymentMethod === 'card') {
      const digits = cardData.cardNumber.replace(/\D/g, '');
      const cvv = cardData.cvv.replace(/\D/g, '');

      if (!cardData.cardholderName.trim()) {
        errors.cardholderName = 'Cardholder name is required';
      }
      if (digits.length < 16) {
        errors.cardNumber = 'Card number must be 16 digits';
      }
      if (!/^(0[1-9]|1[0-2])\s*\/\s*\d{2}$/.test(cardData.expiryDate.trim())) {
        errors.expiryDate = 'Use MM / YY format';
      }
      if (cvv.length < 3) {
        errors.cvv = 'CVV must be at least 3 digits';
      }
    }

    return errors;
  };

  const handleCompletePurchase = async () => {
    setFormError(null);
    const errors = validateCheckout();
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setFormError('Please correct the highlighted fields before completing your purchase.');
      return;
    }

    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    navigate('/checkout/success', {
      state: {
        amount: summary.items.reduce((total, item) => total + item.price, 0) + summary.serviceFee,
        itemCount: summary.items.length,
      },
      replace: true,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <AppHeader
        navItems={navItems}
        search={search}
        searchPlaceholder="Search courses, resources..."
        onSearchChange={setSearch}
        isAuthenticated={isAuthenticated}
        userName={user?.profile.firstName || 'Student'}
        userMeta={isAuthenticated ? 'Secure Checkout' : undefined}
        avatarUrl={user?.profile.avatar}
        onLogout={isAuthenticated ? () => void logout() : undefined}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <CheckoutBreadcrumbs />
        <h1 className="mb-8 text-3xl font-bold">Secure Checkout</h1>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-7">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <PaymentMethodSelector value={paymentMethod} onChange={setPaymentMethod} />
              {paymentMethod === 'card' ? (
                <CardPaymentForm value={cardData} errors={fieldErrors} onChange={setCardData} />
              ) : null}
            </section>

            <BillingAddressForm
              value={billingAddress}
              errors={fieldErrors}
              onChange={setBillingAddress}
            />
          </div>

          <aside className="lg:col-span-5">
            <div className="sticky top-24 space-y-6">
              <OrderSummaryCard
                summary={summary}
                onCompletePurchase={() => void handleCompletePurchase()}
                isProcessing={isProcessing}
                errorMessage={formError}
              />
              <TrustBadges />
            </div>
          </aside>
        </div>
      </main>

      <AppFooter />
    </div>
  );
};

export default CheckoutPage;
