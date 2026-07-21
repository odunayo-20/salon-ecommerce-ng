"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  items: FAQItem[];
}

export function FAQAccordion({ items }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div
          key={index}
          className={cn(
            "border border-border rounded-xl overflow-hidden transition-all duration-300",
            openIndex === index && "border-gold/30 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.06)]"
          )}
        >
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="w-full flex items-center justify-between p-5 text-left"
          >
            <span className="font-medium text-charcoal pr-4">{item.question}</span>
            <ChevronDown
              className={cn(
                "h-5 w-5 text-muted-foreground shrink-0 transition-transform duration-300",
                openIndex === index && "rotate-180 text-gold"
              )}
            />
          </button>
          <div
            className={cn(
              "overflow-hidden transition-all duration-300",
              openIndex === index ? "max-h-96" : "max-h-0"
            )}
          >
            <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed border-t border-border/50 pt-4">
              {item.answer}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
