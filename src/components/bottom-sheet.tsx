'use client';

import { useEffect, type ReactNode } from 'react';

import { X } from 'lucide-react';

type BottomSheetProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
};

export function BottomSheet({ open, title, onClose, children }: BottomSheetProps) {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className='fixed inset-0 z-50'>
      <button
        type='button'
        aria-label='Close sheet'
        className='absolute inset-0 bg-slate-950/45 backdrop-blur-[2px] transition-opacity duration-300'
        onClick={onClose}
      />

      {/* Match AppShell column + main px-4 content width */}
      <div className='absolute bottom-0 left-1/2 z-10 w-full max-w-md -translate-x-1/2 px-4'>
        <div
          role='dialog'
          aria-modal='true'
          aria-label={title}
          className='flex max-h-[88dvh] animate-sheet-up flex-col rounded-t-[1.75rem] border border-line bg-card shadow-2xl'
        >
          <div className='border-b border-line px-4 pb-3 pt-3'>
            <div className='mx-auto mb-3 h-1.5 w-10 rounded-full bg-line' />

            <div className='flex items-center justify-between gap-3'>
              <h2 className='text-base font-semibold'>{title}</h2>

              <button
                type='button'
                onClick={onClose}
                aria-label='Close'
                className='rounded-full p-2 text-muted hover:bg-background'
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className='sheet-scroll overflow-y-auto px-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-4'>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
