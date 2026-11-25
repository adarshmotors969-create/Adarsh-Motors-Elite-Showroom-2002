import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, X, ZoomIn, ZoomOut } from 'lucide-react';
import { DEFAULT_BIKE_FALLBACK_IMG } from '../data/showroomData';

interface LightboxModalProps {
  open: boolean;
  images: string[];
  startIndex: number;
  title: string;
  onClose: () => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  open,
  images,
  startIndex,
  title,
  onClose,
}) => {
  const [idx, setIdx] = useState(startIndex);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    setIdx(startIndex);
    setZoom(1);
  }, [startIndex, open]);

  if (!open || images.length === 0) return null;

  const src = images[idx % images.length] || DEFAULT_BIKE_FALLBACK_IMG;

  return (
    <div
      className="fixed inset-0 z-[60] bg-slate-950/90 backdrop-blur-md flex flex-col justify-between"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex items-center justify-between px-4 py-3 bg-slate-950/70 border-b border-white/10 text-white"
      >
        <div className="min-w-0">
          <div className="text-sm font-bold truncate">{title}</div>
          <div className="text-xs font-mono text-slate-400">
            Photo {idx + 1} of {images.length} · {zoom.toFixed(1)}x
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(1, Number((z - 0.5).toFixed(1))))}
            aria-label="Zoom Out"
            className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(3, Number((z + 0.5).toFixed(1))))}
            aria-label="Zoom In"
            className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setZoom(1)}
            aria-label="Reset Zoom"
            className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Lightbox"
            className="w-9 h-9 rounded-lg bg-red-600 hover:bg-red-700 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex-1 flex items-center justify-center overflow-hidden p-4"
      >
        <img
          src={src}
          alt={title}
          referrerPolicy="no-referrer"
          onError={(e) => {
            const el = e.currentTarget as HTMLImageElement;
            el.onerror = null;
            el.src = DEFAULT_BIKE_FALLBACK_IMG;
          }}
          style={{ transform: `scale(${zoom})` }}
          className="max-w-full max-h-full object-contain transition-transform duration-200 select-none"
        />

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => setIdx((p) => (p - 1 + images.length) % images.length)}
              aria-label="Previous Image"
              className="absolute left-3 sm:left-6 w-11 h-11 rounded-full bg-white/15 hover:bg-red-600 text-white flex items-center justify-center cursor-pointer transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setIdx((p) => (p + 1) % images.length)}
              aria-label="Next Image"
              className="absolute right-3 sm:right-6 w-11 h-11 rounded-full bg-white/15 hover:bg-red-600 text-white flex items-center justify-center cursor-pointer transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
