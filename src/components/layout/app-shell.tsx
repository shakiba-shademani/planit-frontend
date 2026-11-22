'use client';

import type { ReactNode } from 'react';

import { CalendarDays, Home, PlusCircle, UserRound } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { AuthGuard } from '@/components/auth-guard';
import { OnboardingTour } from '@/components/onboarding-tour';
import { ROUTES } from '@/constants/routes';

const tabs = [
  { href: ROUTES.homePage, label: 'Home', icon: Home, tourId: 'tour-nav-home' },
  { href: ROUTES.calendar, label: 'Calendar', icon: CalendarDays, tourId: 'tour-nav-calendar' },
  { href: ROUTES.add, label: 'Plan', icon: PlusCircle, tourId: 'tour-nav-plan' },
  { href: ROUTES.profile, label: 'Profile', icon: UserRound, tourId: 'tour-nav-profile' },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <AuthGuard>
      <div className='mx-auto flex h-dvh w-full max-w-md flex-col overflow-hidden bg-background'>
        <main className='app-scroll min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 pb-[calc(5.75rem+env(safe-area-inset-bottom))]'>
          {children}
        </main>

        <nav className='fixed bottom-0 left-1/2 z-20 w-full max-w-md -translate-x-1/2 border-t border-line bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur'>
          <ul className='grid grid-cols-4'>
            {tabs.map((tab) => {
              const active = pathname === tab.href;
              const Icon = tab.icon;

              return (
                <li key={tab.href}>
                  <Link
                    href={tab.href}
                    data-tour={tab.tourId}
                    className={`flex flex-col items-center gap-1 py-3 text-xs font-medium ${
                      active ? 'text-primary' : 'text-muted'
                    }`}
                  >
                    <Icon size={22} strokeWidth={active ? 2.4 : 1.8} />

                    {tab.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <OnboardingTour />
      </div>
    </AuthGuard>
  );
}
