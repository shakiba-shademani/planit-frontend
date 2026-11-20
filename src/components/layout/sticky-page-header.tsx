import type { ReactNode } from 'react';

type StickyPageHeaderProps = {
  children: ReactNode;
  className?: string;
};

export function StickyPageHeader({ children, className = '' }: StickyPageHeaderProps) {
  return (
    <div
      className={`sticky top-0 z-10 -mx-4 mb-4 border-b border-line bg-background px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] ${className}`}
    >
      {children}
    </div>
  );
}
