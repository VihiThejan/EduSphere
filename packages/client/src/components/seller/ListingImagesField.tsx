import React from 'react';

export interface ListingImageInput {
  id: string;
  url: string;
}

interface ListingImagesFieldProps {
  images: ListingImageInput[];
  onChange: (images: ListingImageInput[]) => void;
}

const createImageItem = (url = ''): ListingImageInput => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  url,
});

const isPreviewableUrl = (value: string): boolean => {
  if (!value.trim()) {
    return false;
  }

  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

const ListingImagesField: React.FC<ListingImagesFieldProps> = ({ images, onChange }) => {
  const [failedPreviewIds, setFailedPreviewIds] = React.useState<Record<string, true>>({});

  const updateUrl = (id: string, value: string) => {
    if (failedPreviewIds[id]) {
      const next = { ...failedPreviewIds };
      delete next[id];
      setFailedPreviewIds(next);
    }

    onChange(images.map((image) => (image.id === id ? { ...image, url: value } : image)));
  };

  const addImage = () => {
    onChange([...images, createImageItem()]);
  };

  const removeImage = (id: string) => {
    const next = images.filter((image) => image.id !== id);
    onChange(next.length ? next : [createImageItem()]);
  };

  const moveImage = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= images.length) {
      return;
    }

    const next = [...images];
    const [selected] = next.splice(index, 1);
    next.splice(nextIndex, 0, selected);
    onChange(next);
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-bold text-slate-800">Listing Images</p>
        <button
          type="button"
          onClick={addImage}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100"
        >
          Add Image
        </button>
      </div>

      <div className="space-y-3">
        {images.map((image, index) => (
          <div key={image.id} className="rounded-lg border border-slate-200 bg-white p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Image {index + 1}</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => moveImage(index, -1)}
                  disabled={index === 0}
                  className="rounded border border-slate-300 px-2 py-1 text-xs font-bold text-slate-700 disabled:opacity-40"
                >
                  Up
                </button>
                <button
                  type="button"
                  onClick={() => moveImage(index, 1)}
                  disabled={index === images.length - 1}
                  className="rounded border border-slate-300 px-2 py-1 text-xs font-bold text-slate-700 disabled:opacity-40"
                >
                  Down
                </button>
                <button
                  type="button"
                  onClick={() => removeImage(image.id)}
                  className="rounded border border-rose-300 px-2 py-1 text-xs font-bold text-rose-700"
                >
                  Remove
                </button>
              </div>
            </div>

            <input
              value={image.url}
              onChange={(event) => updateUrl(image.id, event.target.value)}
              placeholder="https://..."
              type="url"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-primary-500 focus:border-primary-500 focus:ring-2"
            />

            {isPreviewableUrl(image.url) && !failedPreviewIds[image.id] ? (
              <div className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                <img
                  src={image.url}
                  alt={`Listing image ${index + 1} preview`}
                  className="h-40 w-full object-cover"
                  loading="lazy"
                  onError={() => setFailedPreviewIds((current) => ({ ...current, [image.id]: true }))}
                />
              </div>
            ) : isPreviewableUrl(image.url) ? (
              <p className="mt-2 text-xs text-rose-600">This URL could not be loaded as an image.</p>
            ) : (
              <p className="mt-2 text-xs text-slate-500">Paste a valid image URL to preview it here.</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListingImagesField;
