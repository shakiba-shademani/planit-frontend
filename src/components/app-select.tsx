'use client';

import { useEffect, useId, useRef, useState } from 'react';

import { Check, ChevronDown } from 'lucide-react';
import { createPortal } from 'react-dom';

import { useIsClient } from '@/hooks/use-is-client';

export type AppSelectOption = {
  value: string;
  label: string;
};

type AppSelectProps = {
  value: string;
  options: AppSelectOption[];
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

export function AppSelect({
  value,
  options,
  onChange,
  onBlur,
  name,
  id,
  disabled = false,
  placeholder = 'Select',
}: AppSelectProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const mounted = useIsClient();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState<MenuPosition | null>(null);

  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    if (!open) return;

    function updatePosition() {
      const button = buttonRef.current;
      if (!button) return;

      const rect = button.getBoundingClientRect();
      const gap = 6;
      const spaceBelow = window.innerHeight - rect.bottom - gap;
      const spaceAbove = rect.top - gap;
      const openUp = spaceBelow < 180 && spaceAbove > spaceBelow;
      const maxHeight = Math.min(240, openUp ? spaceAbove : spaceBelow);

      setMenu({
        top: openUp ? rect.top - gap : rect.bottom + gap,
        left: rect.left,
        width: rect.width,
        maxHeight: Math.max(maxHeight, 120),
        openUp,
      });
    }

    const frame = window.requestAnimationFrame(updatePosition);

    function onPointerDown(event: PointerEvent) {
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
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', onScroll, true);
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, listId, onBlur]);

  function selectOption(next: string) {
    onChange(next);
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
        aria-haspopup='listbox'
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => {
          if (disabled) return;
          setOpen((current) => !current);
        }}
        className='flex h-11 w-full min-w-0 items-center justify-between gap-2 rounded-xl border border-line bg-background px-3 text-left text-base outline-none ring-primary focus:ring-2 disabled:opacity-50'
      >
        <span className={`truncate ${selected ? 'text-foreground' : 'text-muted'}`}>
          {selected?.label ?? placeholder}
        </span>

        <ChevronDown
          size={16}
          className={`shrink-0 text-muted transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {mounted && open && menu
        ? createPortal(
            <ul
              id={listId}
              role='listbox'
              aria-labelledby={id}
              className='fixed z-[80] overflow-y-auto rounded-xl border border-line bg-card p-1 shadow-2xl shadow-slate-950/25'
              style={{
                left: menu.left,
                width: menu.width,
                maxHeight: menu.maxHeight,
                top: menu.openUp ? undefined : menu.top,
                bottom: menu.openUp ? window.innerHeight - menu.top : undefined,
              }}
            >
              {options.map((option) => {
                const active = option.value === value;

                return (
                  <li key={option.value} role='presentation'>
                    <button
                      type='button'
                      role='option'
                      aria-selected={active}
                      onClick={() => selectOption(option.value)}
                      className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm ${
                        active
                          ? 'bg-primary/10 font-medium text-primary'
                          : 'text-foreground hover:bg-background'
                      }`}
                    >
                      <span className='truncate'>{option.label}</span>

                      {active ? <Check size={16} className='shrink-0' /> : null}
                    </button>
                  </li>
                );
              })}
            </ul>,
            document.body
          )
        : null}
    </div>
  );
}
