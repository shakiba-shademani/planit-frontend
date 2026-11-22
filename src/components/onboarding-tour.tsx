'use client';

import { useEffect, useState, type CSSProperties } from 'react';

import { usePathname, useRouter } from 'next/navigation';

import { ROUTES } from '@/constants/routes';
import { ONBOARDING_TOUR_DONE_KEY } from '@/constants/storage';

type TourStep = {
  id: string;
  title: string;
  body: string;
  target?: string;
  route?: string;
};

type TargetRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

const STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Plan It',
    body: 'A quick tour of the main places you will use every day. You can skip anytime.',
  },
  {
    id: 'home-tab',
    title: 'Home',
    body: 'Your daily overview — today at a glance, the week strip, and what still needs attention.',
    target: 'tour-nav-home',
    route: ROUTES.homePage,
  },
  {
    id: 'week-strip',
    title: 'Week strip',
    body: 'Tap a day to switch focus. Dots show which days already have tasks.',
    target: 'tour-week-strip',
    route: ROUTES.homePage,
  },
  {
    id: 'today-stats',
    title: 'Today summary',
    body: 'See remaining tasks, timed items, and high-priority work for the selected day.',
    target: 'tour-today-stats',
    route: ROUTES.homePage,
  },
  {
    id: 'goals-habits',
    title: 'Goals & habits',
    body: 'Jump into longer-term goals and daily habits without leaving Home.',
    target: 'tour-goals-habits',
    route: ROUTES.homePage,
  },
  {
    id: 'calendar-tab',
    title: 'Calendar',
    body: 'Plan across day, week, and month views. The week view also includes a weekly review.',
    target: 'tour-nav-calendar',
    route: ROUTES.calendar,
  },
  {
    id: 'plan-tab',
    title: 'Plan',
    body: 'Create and edit tasks here — priority, time, project, tags, recurrence, and reminders.',
    target: 'tour-nav-plan',
    route: ROUTES.add,
  },
  {
    id: 'profile-tab',
    title: 'Profile',
    body: 'Manage your account and turn on browser reminders so Plan It can notify you.',
    target: 'tour-nav-profile',
    route: ROUTES.profile,
  },
];

const PAD = 10;

function readTourDone() {
  try {
    return window.localStorage.getItem(ONBOARDING_TOUR_DONE_KEY) === '1';
  } catch {
    return true;
  }
}

function markTourDone() {
  try {
    window.localStorage.setItem(ONBOARDING_TOUR_DONE_KEY, '1');
  } catch {
    // Ignore storage failures; tour just will not persist.
  }
}

function measureTarget(targetId: string): TargetRect | null {
  const node = document.querySelector(`[data-tour="${targetId}"]`);
  if (!(node instanceof HTMLElement)) return null;

  node.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
  const rect = node.getBoundingClientRect();

  return {
    top: Math.max(rect.top - PAD, 8),
    left: Math.max(rect.left - PAD, 8),
    width: Math.min(rect.width + PAD * 2, window.innerWidth - 16),
    height: Math.min(rect.height + PAD * 2, window.innerHeight - 16),
  };
}

export function OnboardingTour() {
  const router = useRouter();
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);

  const step = STEPS[stepIndex];
  const isLast = stepIndex === STEPS.length - 1;

  useEffect(() => {
    if (!readTourDone()) {
      setActive(true);
    }
  }, []);

  useEffect(() => {
    if (!active || !step) return;

    if (step.route && pathname !== step.route) {
      router.push(step.route);
      return;
    }

    if (!step.target) {
      setTargetRect(null);
      return;
    }

    let cancelled = false;
    let attempts = 0;

    const sync = () => {
      if (cancelled) return;
      const next = measureTarget(step.target!);
      if (next) {
        setTargetRect(next);
        return;
      }

      attempts += 1;
      if (attempts < 20) {
        window.setTimeout(sync, 50);
      } else {
        setTargetRect(null);
      }
    };

    sync();

    const onResize = () => {
      if (step.target) {
        setTargetRect(measureTarget(step.target));
      }
    };

    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onResize, true);

    return () => {
      cancelled = true;
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onResize, true);
    };
  }, [active, step, pathname, router]);

  function finish() {
    markTourDone();
    setActive(false);
    if (pathname !== ROUTES.homePage) {
      router.push(ROUTES.homePage);
    }
  }

  function handleNext() {
    if (isLast) {
      finish();
      return;
    }
    setStepIndex((value) => value + 1);
  }

  if (!active || !step) return null;

  const tooltipStyle = getTooltipStyle(targetRect);
  const scrim = 'absolute bg-slate-950/75 backdrop-blur-[2px]';

  return (
    <div className='fixed inset-0 z-50' role='dialog' aria-modal='true' aria-labelledby='tour-title'>
      {targetRect ? (
        <>
          {/* Four scrim panels leave a clear hole over the highlighted UI */}
          <div className={scrim} style={{ top: 0, left: 0, right: 0, height: targetRect.top }} />
          <div
            className={scrim}
            style={{
              top: targetRect.top + targetRect.height,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />
          <div
            className={scrim}
            style={{
              top: targetRect.top,
              left: 0,
              width: targetRect.left,
              height: targetRect.height,
            }}
          />
          <div
            className={scrim}
            style={{
              top: targetRect.top,
              left: targetRect.left + targetRect.width,
              right: 0,
              height: targetRect.height,
            }}
          />

          {/* Block clicks on the highlighted area during the tour */}
          <div
            className='absolute rounded-2xl'
            style={{
              top: targetRect.top,
              left: targetRect.left,
              width: targetRect.width,
              height: targetRect.height,
            }}
          />

          <div
            className='pointer-events-none absolute rounded-2xl ring-2 ring-white transition-all duration-300'
            style={{
              top: targetRect.top,
              left: targetRect.left,
              width: targetRect.width,
              height: targetRect.height,
              boxShadow:
                '0 0 0 6px rgba(37, 99, 235, 0.28), 0 10px 30px rgba(15, 23, 42, 0.35)',
            }}
          />
        </>
      ) : (
        <div className='absolute inset-0 bg-slate-950/75 backdrop-blur-[2px]' />
      )}

      <div
        className='absolute z-10 w-[min(100%-2rem,22rem)] rounded-2xl border border-white/10 bg-card p-4 shadow-2xl shadow-slate-950/40'
        style={tooltipStyle}
      >
        <div className='mb-3 flex items-center gap-1.5'>
          {STEPS.map((item, index) => (
            <span
              key={item.id}
              className={`h-1.5 rounded-full transition-all ${
                index === stepIndex
                  ? 'w-5 bg-primary'
                  : index < stepIndex
                    ? 'w-1.5 bg-primary/50'
                    : 'w-1.5 bg-line'
              }`}
            />
          ))}
        </div>

        <p className='text-xs font-medium text-muted'>
          Step {stepIndex + 1} of {STEPS.length}
        </p>

        <h2 id='tour-title' className='mt-1 text-lg font-semibold text-foreground'>
          {step.title}
        </h2>

        <p className='mt-2 text-sm leading-relaxed text-muted'>{step.body}</p>

        <div className='mt-4 flex items-center justify-between gap-3'>
          <button
            type='button'
            onClick={finish}
            className='rounded-xl px-3 py-2 text-sm font-medium text-muted hover:bg-slate-100 dark:hover:bg-slate-800'
          >
            Skip
          </button>

          <button
            type='button'
            onClick={handleNext}
            className='rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-600/25'
          >
            {isLast ? 'Done' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}

function getTooltipStyle(targetRect: TargetRect | null): CSSProperties {
  if (!targetRect) {
    return {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    };
  }

  const spaceBelow = window.innerHeight - (targetRect.top + targetRect.height);
  const preferBelow = spaceBelow > 180;
  const left = Math.min(
    Math.max(targetRect.left, 16),
    window.innerWidth - 16 - Math.min(window.innerWidth - 32, 352)
  );

  if (preferBelow) {
    return {
      top: targetRect.top + targetRect.height + 14,
      left,
    };
  }

  return {
    top: Math.max(targetRect.top - 14, 16),
    left,
    transform: 'translateY(-100%)',
  };
}
