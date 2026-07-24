"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface LightboxProps {
  images: string[];
  initialIndex?: number;
  alt?: string;
  open: boolean;
  onClose: () => void;
}

export function Lightbox({ images, initialIndex = 0, alt = "", open, onClose }: LightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => { setCurrentIndex(initialIndex); setZoomed(false); }, [initialIndex, open]);
  useEffect(() => { if (open) setZoomed(false); }, [open]);

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setZoomed(false);
  }, [images.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setZoomed(false);
  }, [images.length]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose, goNext, goPrev]);

  if (!open || images.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/90" onClick={onClose} />

      {/* Close */}
      <button onClick={onClose} className="absolute top-4 right-4 z-10 h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
        <X className="h-5 w-5" />
      </button>

      {/* Zoom */}
      <button onClick={() => setZoomed(!zoomed)} className="absolute top-4 right-16 z-10 h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
        {zoomed ? <ZoomOut className="h-5 w-5" /> : <ZoomIn className="h-5 w-5" />}
      </button>

      {/* Prev */}
      {images.length > 1 && (
        <button onClick={goPrev} className="absolute left-4 z-10 h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}

      {/* Image */}
      <div className={cn("relative z-10 max-w-[90vw] max-h-[85vh] transition-transform duration-300", zoomed ? "scale-150 cursor-zoom-out" : "cursor-zoom-in")} onClick={() => setZoomed(!zoomed)}>
        <Image
          src={images[currentIndex]}
          alt={`${alt} ${currentIndex + 1}`}
          width={1200}
          height={1200}
          className="object-contain max-h-[85vh] w-auto"
          priority
        />
      </div>

      {/* Next */}
      {images.length > 1 && (
        <button onClick={goNext} className="absolute right-4 z-10 h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
          <ChevronRight className="h-5 w-5" />
        </button>
      )}

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => { setCurrentIndex(i); setZoomed(false); }}
              className={cn("h-12 w-12 rounded-lg overflow-hidden border-2 transition-colors", currentIndex === i ? "border-gold" : "border-transparent opacity-60 hover:opacity-100")}
            >
              <Image src={img} alt="" width={48} height={48} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
