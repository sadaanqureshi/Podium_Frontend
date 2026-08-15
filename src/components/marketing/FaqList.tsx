'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { MARKETING_FAQ } from './content';

export function FaqList() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {MARKETING_FAQ.map((item, index) => {
        const isOpen = open === index;
        return (
          <div key={item.q} className="rounded-2xl border border-border-subtle bg-card-bg overflow-hidden">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : index)}
              className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
              aria-expanded={isOpen}
            >
              <span className="text-sm font-bold text-text-main">{item.q}</span>
              <ChevronDown
                size={18}
                className={`shrink-0 text-text-muted ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {isOpen && (
              <p className="px-5 pb-4 text-sm text-text-muted font-medium leading-relaxed">
                {item.a}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
