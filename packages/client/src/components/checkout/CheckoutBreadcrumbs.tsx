import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const CheckoutBreadcrumbs: React.FC = () => {
  return (
    <nav className="mb-8 flex items-center gap-2 text-sm">
      <Link to="/" className="text-slate-500 transition hover:text-primary-900">
        Home
      </Link>
      <ChevronRight size={14} className="text-slate-400" />
      <Link to="/marketplace" className="text-slate-500 transition hover:text-primary-900">
        Cart
      </Link>
      <ChevronRight size={14} className="text-slate-400" />
      <span className="font-semibold text-primary-900">Checkout</span>
    </nav>
  );
};

export default CheckoutBreadcrumbs;
