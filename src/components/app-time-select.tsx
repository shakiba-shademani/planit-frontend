'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { ChevronDown, Clock } from 'lucide-react';

type AppTimeSelectProps = {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  name?: string;
  id?: string;
  disabled?: boolean;
  placeholder?: string;
};

type MenuPosition = {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
  openUp: boolean;
};

const HOURS = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, index) => String(index).padStart(2, '0'));

function parseTime(value: string) {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return { hour: '09', minute: '00' };
  return { hour: match[1], minute: match[2] };
}

function formatTime(hour: string, minute: string) {
  return `${hour}:${minute}`;
}

export function AppTimeSelect({
  value,
  onChange,
  onBlur,
  name,
  id,
  disabled = false,
  placeholder = 'No time',
}: AppTimeSelectProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState<MenuPosition | null>(null);
  const [mounted, setMounted] = useState(false);
  const parsed = parseTime(value);
  const [hour, setHour] = useState(parsed.hour);
  const [minute, setMinute] = useState(parsed.minute);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const next = parseTime(value || '09:00');
    setHour(next.hour);
    setMinute(next.minute);

    const timer = window.setTimeout(() => {
      document
        .getElementById(`${listId}-hour-${next.hour}`)
        ?.scrollIntoView({ block: 'center' });
      document
        .getElementById(`${listId}-minute-${next.minute}`)
        ?.scrollIntoView({ block: 'center' });
    }, 30);

    return () => window.clearTimeout(timer);
  }, [open, value, listId]);

  useEffect(() => {
    if (!open) return;

    function updatePosition() {
      const button = buttonRef.current;
      if (!button) return;

      const rect = button.getBoundingClientRect();
      const gap = 6;
      const spaceBelow = window.innerHeight - rect.bottom - gap;
      const spaceAbove = rect.top - gap;
      const openUp = spaceBelow < 220 && spaceAbove > spaceBelow;
      const maxHeight = Math.min(280, openUp ? spaceAbove : spaceBelow);

      setMenu({
        top: openUp ? rect.top - gap : rect.bottom + gap,
        left: rect.left,
        width: Math.max(rect.width, 220),
        maxHeight: Math.max(maxHeight, 160),
        openUp,
      });
    }

    updatePosition();

    function onPointerDown(event: MouseEvent | TouchEvent) {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (rootRef.current?.contains(target)) return;
      const portal = document.getElementById(listId);
      if (portal?.contains(target)) return;
      setOpen(false);
      onBlur?.();
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
        onBlur?.();
        buttonRef.current?.focus();
      }
    }

    function onScroll(event: Event) {
      const portal = document.getElementById(listId);
      if (portal && event.target instanceof Node && portal.contains(event.target)) {
        return;
      }
      updatePosition();
    }

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', onScroll, true);
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', onScroll, true);
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, listId, onBlur]);

  function applyTime(nextHour: string, nextMinute: string) {
    onChange(formatTime(nextHour, nextMinute));
  }

  function clearTime() {
    onChange('');
    setOpen(false);
    onBlur?.();
    buttonRef.current?.focus();
  }

  function done() {
    applyTime(hour, minute);
    setOpen(false);
    onBlur?.();
    buttonRef.current?.focus();
  }

  return (
    <div ref={rootRef} className='relative w-full min-w-0'>
      {name ? <input type='hidden' name={name} value={value} readOnly /> : null}

      <button
        ref={buttonRef}
        id={id}
        type='button'
        disabled={disabled}
        aria-haspopup='dialog'
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => {
          if (disabled) return;
          setOpen((current) => !current);
        }}
        className='flex h-11 w-full min-w-0 items-center justify-between gap-2 rounded-xl border border-line bg-background px-3 text-left text-base outline-none ring-primary focus:ring-2 disabled:opacity-50'
      >
        <span className='flex min-w-0 items-center gap-2'>
          <Clock size={16} className='shrink-0 text-muted' />
          <span className={`truncate ${value ? 'text-foreground' : 'text-muted'}`}>
            {value || placeholder}
          </span>
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-muted transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {mounted && open && menu
        ? createPortal(
            <div
              id={listId}
              role='dialog'
              aria-label='Choose time'
              className='fixed z-[80] overflow-hidden rounded-xl border border-line bg-card shadow-2xl shadow-slate-950/25'
              style={{
                left: Math.min(menu.left, window.innerWidth - menu.width - 8),
                width: Math.min(menu.width, window.innerWidth - 16),
                maxHeight: menu.maxHeight,
                top: menu.openUp ? undefined : menu.top,
                bottom: menu.openUp ? window.innerHeight - menu.top : undefined,
              }}
            >
              <div className='flex items-center justify-between border-b border-line px-3 py-2'>
                <button
                  type='button'
                  onClick={clearTime}
                  className='rounded-lg px-2 py-1 text-xs font-medium text-muted hover:bg-background'
                >
                  Clear
                </button>
                <p className='text-sm font-semibold tabular-nums text-foreground'>
                  {formatTime(hour, minute)}
                </p>
                <button
                  type='button'
                  onClick={done}
                  className='rounded-lg px-2 py-1 text-xs font-semibold text-primary hover:bg-primary/10'
                >
                  Done
                </button>
              </div>

              <div
                className='flex min-h-0'
                style={{ height: Math.max(menu.maxHeight - 48, 140) }}
                onWheel={(event) => event.stopPropagation()}
              >
                <div className='flex min-h-0 min-w-0 flex-1 flex-col border-r border-line'>
                  <p className='shrink-0 px-2 py-1 text-center text-[11px] font-medium uppercase tracking-wide text-muted'>
                    Hour
                  </p>
                  <div className='min-h-0 flex-1 overflow-y-auto overscroll-contain px-1 pb-1 [-webkit-overflow-scrolling:touch]'>
                    {HOURS.map((item) => {
                      const active = item === hour;
                      return (
                        <button
                          key={item}
                          id={`${listId}-hour-${item}`}
                          type='button'
                          onClick={() => {
                            setHour(item);
                            applyTime(item, minute);
                          }}
                          className={`flex w-full items-center justify-center rounded-lg px-2 py-2.5 text-sm tabular-nums ${
                            active
                              ? 'bg-primary/10 font-semibold text-primary'
                              : 'text-foreground hover:bg-background'
                          }`}
                        >
                          {item}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className='flex min-h-0 min-w-0 flex-1 flex-col'>
                  <p className='shrink-0 px-2 py-1 text-center text-[11px] font-medium uppercase tracking-wide text-muted'>
                    Min
                  </p>
                  <div className='min-h-0 flex-1 overflow-y-auto overscroll-contain px-1 pb-1 [-webkit-overflow-scrolling:touch]'>
                    {MINUTES.map((item) => {
                      const active = item === minute;
                      return (
                        <button
                          key={item}
                          id={`${listId}-minute-${item}`}
                          type='button'
                          onClick={() => {
                            setMinute(item);
                            applyTime(hour, item);
                          }}
                          className={`flex w-full items-center justify-center rounded-lg px-2 py-2.5 text-sm tabular-nums ${
                            active
                              ? 'bg-primary/10 font-semibold text-primary'
                              : 'text-foreground hover:bg-background'
                          }`}
                        >
                          {item}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
