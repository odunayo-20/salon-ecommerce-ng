"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  service?: string;
  date: string;
  avatar?: string;
}

interface ReviewCarouselProps {
  reviews: Review[];
}

export function ReviewCarousel({ reviews }: ReviewCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % reviews.length);
  }, [reviews.length]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + reviews.length) % reviews.length);
  }, [reviews.length]);

  useEffect(() => {
    if (!isAutoPlaying) return;
    timerRef.current = setInterval(next, 5000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isAutoPlaying, next]);

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {reviews.map((review) => (
            <div key={review.id} className="w-full flex-shrink-0 px-4">
              <div className="bg-cream rounded-2xl p-8 md:p-12 text-center max-w-3xl mx-auto">
                <Quote className="h-8 w-8 text-gold/30 mx-auto mb-6" />
                <p className="font-serif text-lg md:text-xl text-charcoal leading-relaxed italic">
                  &ldquo;{review.comment}&rdquo;
                </p>
                <div className="flex items-center justify-center gap-1 mt-6">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-4 w-4",
                        i < review.rating ? "fill-gold text-gold" : "text-gray-200"
                      )}
                    />
                  ))}
                </div>
                <div className="mt-6">
                  <p className="font-heading font-semibold text-charcoal">
                    {review.name}
                  </p>
                  {review.service && (
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {review.service}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mt-8">
        <button
          onClick={prev}
          className="h-10 w-10 rounded-full border border-border flex items-center justify-center hover:border-gold hover:text-gold transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex gap-2">
          {reviews.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                i === current ? "w-8 bg-gold" : "w-2 bg-border"
              )}
            />
          ))}
        </div>
        <button
          onClick={next}
          className="h-10 w-10 rounded-full border border-border flex items-center justify-center hover:border-gold hover:text-gold transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
