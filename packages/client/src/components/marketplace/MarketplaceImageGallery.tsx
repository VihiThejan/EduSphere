import React from 'react';

interface MarketplaceImageGalleryProps {
  title: string;
  images: string[];
}

const MarketplaceImageGallery: React.FC<MarketplaceImageGalleryProps> = ({ title, images }) => {
  const [activeImage, setActiveImage] = React.useState(images[0]);

  React.useEffect(() => {
    setActiveImage(images[0]);
  }, [images]);

  return (
    <div className="space-y-4">
      <div className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-200">
        <img src={activeImage} alt={title} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/5 to-transparent transition group-hover:from-transparent" />
      </div>

      <div className="grid grid-cols-4 gap-4">
        {images.map((image, index) => {
          const isActive = activeImage === image;

          return (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActiveImage(image)}
              className={
                isActive
                  ? 'aspect-square overflow-hidden rounded-xl border-2 border-primary-900'
                  : 'aspect-square overflow-hidden rounded-xl border border-slate-200 opacity-75 transition hover:opacity-100'
              }
            >
              <img src={image} alt={`${title} preview ${index + 1}`} className="h-full w-full object-cover" />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MarketplaceImageGallery;
