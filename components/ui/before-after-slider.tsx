"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, GripHorizontal } from "lucide-react";

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeAlt?: string;
  afterAlt?: string;
}

export function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeAlt = "Before",
  afterAlt = "After",
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const handleMove = (clientX: number, rect: DOMRect) => {
    if (!isDragging) return;
    const x = clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percent);
  };

  return (
    <div
      className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden cursor-col-resize select-none"
      onMouseDown={() => setIsDragging(true)}
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => setIsDragging(false)}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        handleMove(e.clientX, rect);
      }}
      onTouchStart={() => setIsDragging(true)}
      onTouchEnd={() => setIsDragging(false)}
      onTouchMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        handleMove(e.touches[0].clientX, rect);
      }}
    >
      {/* After Image (full) */}
      <div className="absolute inset-0">
        {afterImage && (
          <Image
            src={afterImage}
            alt={afterAlt}
            fill
            className="object-cover"
            sizes="100vw"
          />
        )}
      </div>

      {/* Before Image (clipped) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${sliderPosition}%` }}
      >
        {beforeImage && (
          <Image
            src={beforeImage}
            alt={beforeAlt}
            fill
            className="object-cover"
            sizes="100vw"
            style={{ width: "100%", maxWidth: "none", objectPosition: "left center" }}
          />
        )}
      </div>

      {/* Slider Line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white z-10"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white shadow-lg flex items-center justify-center">
          <GripHorizontal className="h-5 w-5 text-charcoal" />
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-4 left-4 bg-charcoal/70 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
        Before
      </div>
      <div className="absolute top-4 right-4 bg-gold/90 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
        After
      </div>
    </div>
  );
}
