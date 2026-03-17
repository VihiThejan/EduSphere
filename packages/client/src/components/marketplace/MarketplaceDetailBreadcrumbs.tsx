import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface MarketplaceDetailBreadcrumbsProps {
  itemType: string;
  title: string;
}

const MarketplaceDetailBreadcrumbs: React.FC<MarketplaceDetailBreadcrumbsProps> = ({ itemType, title }) => {
  return (
    <nav className="mb-6 flex items-center gap-2 text-sm text-slate-500">
      <Link to="/marketplace" className="transition hover:text-primary-900">
        Marketplace
      </Link>
      <ChevronRight size={14} />
      <Link to="/marketplace" className="transition hover:text-primary-900">
        {itemType}
      </Link>
      <ChevronRight size={14} />
      <span className="font-medium text-slate-800">{title}</span>
    </nav>
  );
};

export default MarketplaceDetailBreadcrumbs;
