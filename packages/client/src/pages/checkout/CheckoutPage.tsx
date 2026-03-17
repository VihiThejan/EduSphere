import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
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
import { useAuthStore } from '@/store/authStore';
import { cartApi } from '@/services/api/cart.api';
import { ordersApi } from '@/services/api/orders.api';
import { paymentsApi } from '@/services/api/payments.api';
import { IOrderItem } from '@edusphere/shared';

interface ApiErrorPayload {
  error?: {
    message?: string;
  };
  message?: string;
}

interface CheckoutState {
  orderId?: string;
}

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const stripe = useStripe();
  const elements = useElements();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [search, setSearch] = React.useState('');
  const [paymentMethod, setPaymentMethod] = React.useState<CheckoutPaymentMethod>('card');
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<CheckoutFieldErrors>({});
  const [isCardComplete, setIsCardComplete] = React.useState(false);
  const [cardElementError, setCardElementError] = React.useState<string | null>(null);
  const [billingAddress, setBillingAddress] = React.useState<BillingAddressData>({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    street: '',
    city: '',
    postal: '',
    phone: '',
  });
  const [cardData, setCardData] = React.useState<CardPaymentData>({
    cardholderName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });
  const existingOrderId = (location.state as CheckoutState | null)?.orderId;

  const navItems: AppNavItem[] = [
    { label: 'Courses', href: '/courses' },
    { label: 'Marketplace', href: '/marketplace' },
  ];

  const { data: cartResponse, isLoading: isCartLoading } = useQuery({
    queryKey: ['checkout-cart'],
    queryFn: cartApi.getCart,
    enabled: isAuthenticated && !existingOrderId,
  });

  const { data: existingOrder, isLoading: isOrderLoading } = useQuery({
    queryKey: ['checkout-order', existingOrderId],
    queryFn: () => ordersApi.getOrder(existingOrderId as string),
    enabled: isAuthenticated && Boolean(existingOrderId),
  });

  const { data: existingPaymentStatus, isLoading: isPaymentStatusLoading } = useQuery({
    queryKey: ['checkout-order-payment-status', existingOrderId],
    queryFn: () => paymentsApi.getStatus(existingOrderId as string),
    enabled: isAuthenticated && Boolean(existingOrderId),
  });

  const createOrderMutation = useMutation({
    mutationFn: ordersApi.createOrder,
  });

  const createPaymentIntentMutation = useMutation({
    mutationFn: paymentsApi.createIntent,
  });

  const cart = cartResponse?.cart;
  const summary = React.useMemo(
    () => ({
      items: existingOrder
        ? existingOrder.items.map((item: IOrderItem) => ({
            id: item.itemId,
            title: item.title,
            subtitle: `Qty: ${item.quantity}`,
            price: item.price * item.quantity,
            imageUrl: item.image,
          }))
        : cart?.items.map((item) => ({
            id: item.itemId,
            title: item.title,
            subtitle: `Qty: ${item.quantity}`,
            price: item.price * item.quantity,
            imageUrl: item.image,
          })) ?? [],
      serviceFee: existingOrder
        ? existingOrder.serviceFee
        : Math.round((cart?.subtotal || 0) * 0.05),
    }),
    [cart, existingOrder]
  );

  React.useEffect(() => {
    if (existingOrder?.shippingAddress) {
      setBillingAddress((prev) => ({
        ...prev,
        firstName: existingOrder.shippingAddress.firstName || prev.firstName,
        lastName: existingOrder.shippingAddress.lastName || prev.lastName,
        email: existingOrder.shippingAddress.email || prev.email,
        street: existingOrder.shippingAddress.street || prev.street,
        city: existingOrder.shippingAddress.city || prev.city,
        postal: existingOrder.shippingAddress.postal || prev.postal,
        phone: existingOrder.shippingAddress.phone || prev.phone,
      }));
    }
  }, [existingOrder]);

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
    if (!billingAddress.street.trim()) {
      errors.street = 'Street address is required';
    }
    if (!billingAddress.city.trim()) {
      errors.city = 'City is required';
    }

    if (paymentMethod === 'card') {
      if (!cardData.cardholderName.trim()) {
        errors.cardholderName = 'Cardholder name is required';
      }
      if (!isCardComplete) {
        errors.cardNumber = cardElementError || 'Card details are incomplete';
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

    if (!existingOrderId && (!cart || cart.items.length === 0)) {
      setFormError('Your cart is empty. Add items from marketplace before checkout.');
      return;
    }

    if (existingOrderId && existingPaymentStatus?.paymentStatus === 'completed') {
      setFormError('This order has already been paid.');
      return;
    }

    if (paymentMethod === 'card' && (!stripe || !elements)) {
      setFormError('Stripe is not initialized. Please configure VITE_STRIPE_PUBLISHABLE_KEY.');
      return;
    }

    try {
      setIsProcessing(true);

      const order = existingOrderId
        ? {
            orderId: existingOrderId,
            orderNumber: existingOrder?.orderNumber || '',
            total: existingOrder?.total || 0,
            paymentStatus: existingOrder?.paymentStatus || 'pending',
          }
        : await createOrderMutation.mutateAsync({
            paymentMethod,
            shippingAddress: {
              firstName: billingAddress.firstName,
              lastName: billingAddress.lastName,
              email: billingAddress.email,
              street: billingAddress.street,
              city: billingAddress.city,
              postal: billingAddress.postal || undefined,
              phone: billingAddress.phone || undefined,
            },
          });

      let paymentIntentId: string | undefined;
      if (paymentMethod === 'card' || paymentMethod === 'installment') {
        const paymentIntent = await createPaymentIntentMutation.mutateAsync(order.orderId);
        paymentIntentId = paymentIntent.paymentIntentId;

        if (paymentMethod === 'card') {
          if (!stripe || !elements) {
            throw new Error('Stripe is not initialized. Check publishable key configuration.');
          }

          const cardElement = elements.getElement(CardElement);
          if (!cardElement) {
            throw new Error('Card element is not ready. Please try again.');
          }

          const confirmation = await stripe.confirmCardPayment(paymentIntent.clientSecret, {
            payment_method: {
              card: cardElement,
              billing_details: {
                name: cardData.cardholderName,
                email: billingAddress.email,
              },
            },
          });

          if (confirmation.error) {
            throw new Error(confirmation.error.message || 'Card payment confirmation failed');
          }

          if (
            confirmation.paymentIntent &&
            confirmation.paymentIntent.status !== 'succeeded' &&
            confirmation.paymentIntent.status !== 'processing'
          ) {
            throw new Error(`Payment status is ${confirmation.paymentIntent.status}`);
          }
        }
      }

      navigate('/checkout/success', {
        state: {
          amount: order.total,
          itemCount: existingOrder ? existingOrder.items.length : (cart?.itemCount || 0),
          orderId: order.orderId,
          orderNumber: order.orderNumber,
          paymentIntentId,
        },
        replace: true,
      });
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ApiErrorPayload>;
      const message =
        axiosError.response?.data?.error?.message ||
        axiosError.response?.data?.message ||
        axiosError.message ||
        'Checkout failed. Please try again.';
      setFormError(message);
    } finally {
      setIsProcessing(false);
    }
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

        {isCartLoading || isOrderLoading || isPaymentStatusLoading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">Loading your cart...</div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-7">
              {existingOrderId ? (
                <div className="rounded-2xl border border-primary-200 bg-primary-50 p-4 text-sm text-primary-900">
                  You are resuming payment for order <span className="font-semibold">{existingOrder?.orderNumber || existingOrderId}</span>.
                </div>
              ) : null}

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <PaymentMethodSelector value={paymentMethod} onChange={setPaymentMethod} />
                {paymentMethod === 'card' ? (
                  <CardPaymentForm
                    value={cardData}
                    errors={fieldErrors}
                    onChange={setCardData}
                    onCardStateChange={(state) => {
                      setIsCardComplete(state.complete);
                      setCardElementError(state.error || null);
                    }}
                  />
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
        )}
      </main>

      <AppFooter />
    </div>
  );
};

export default CheckoutPage;
