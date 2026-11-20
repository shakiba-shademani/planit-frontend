'use client';

import { useMemo, useState } from 'react';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { TaskFormSheet } from '@/app/(main)/_components/task-form-sheet';
import { WeeklyReview } from '@/app/(main)/calendar/_components/weekly-review';
import { StickyPageHeader } from '@/components/layout/sticky-page-header';
import { TaskItem } from '@/components/task-item';
import {
  useCreateTask,
  useDeleteTask,
  useGetTasksRange,
  useUpdateTask,
} from '@/hooks/apis/tasks';
import type { Task } from '@/hooks/apis/tasks/types';
import {
  eachDay,
  endOfMonth,
  endOfWeek,
  formatDayNumber,
  formatLongDate,
  formatMonthYear,
  formatShortWeekday,
  shiftISODate,
  startOfMonth,
  startOfWeek,
  todayISO,
  weekDays,
} from '@/utils/date';
import { splitTimedUntimed, taskCountByDate, tasksOnDate } from '@/utils/task-groups';

type CalendarView = 'day' | 'week' | 'month';

const VIEW_OPTIONS: Array<{ id: CalendarView; label: string }> = [
  { id: 'day', label: 'Day' },
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' },
];

export default function CalendarPage() {
  const today = todayISO();
  const [view, setView] = useState<CalendarView>('day');
  const [selectedDate, setSelectedDate] = useState(today);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetKey, setSheetKey] = useState(0);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const rangeFrom =
    view === 'month'
      ? startOfWeek(startOfMonth(selectedDate))
      : startOfWeek(selectedDate);
  const rangeTo =
    view === 'month' ? endOfWeek(endOfMonth(selectedDate)) : endOfWeek(selectedDate);

  const tasksQuery = useGetTasksRange(rangeFrom, rangeTo);
  const createMutation = useCreateTask(selectedDate);
  const toggleMutation = useUpdateTask(selectedDate);
  const deleteMutation = useDeleteTask(selectedDate);

  const tasks = tasksQuery.data ?? [];
  const counts = useMemo(() => taskCountByDate(tasks), [tasks]);
  const dayTasks = useMemo(() => tasksOnDate(tasks, selectedDate), [tasks, selectedDate]);
  const { timed, untimed } = useMemo(() => splitTimedUntimed(dayTasks), [dayTasks]);
  const week = weekDays(selectedDate);
  const monthGrid = useMemo(() => {
    const from = startOfWeek(startOfMonth(selectedDate));
    const to = endOfWeek(endOfMonth(selectedDate));
    return eachDay(from, to);
  }, [selectedDate]);

  const weekStart = startOfWeek(selectedDate);
  const weekEnd = endOfWeek(selectedDate);

  const periodLabel =
    view === 'month'
      ? formatMonthYear(selectedDate)
      : view === 'week'
        ? `${formatLongDate(weekStart)} – ${formatDayNumber(weekEnd)}`
        : formatLongDate(selectedDate);

  const busy =
    toggleMutation.isPending || deleteMutation.isPending || createMutation.isPending;

  function shiftPeriod(direction: -1 | 1) {
    if (view === 'month') {
      const date = selectedDate;
      const [year, month] = date.split('-').map(Number);
      const next = new Date(year, (month ?? 1) - 1 + direction, 1);
      const yearStr = String(next.getFullYear());
      const monthStr = String(next.getMonth() + 1).padStart(2, '0');
      setSelectedDate(`${yearStr}-${monthStr}-01`);
      return;
    }

    setSelectedDate(shiftISODate(selectedDate, direction * (view === 'week' ? 7 : 1)));
  }

  function openEditSheet(task: Task) {
    setEditingTask(task);
    setSheetKey((value) => value + 1);
    setSheetOpen(true);
  }

  function closeSheet() {
    setSheetOpen(false);
    setEditingTask(null);
  }

  function handleToggle(task: Task) {
    toggleMutation.mutate({ id: task.id, payload: { done: !task.done } });
  }

  function handleDelete(task: Task) {
    deleteMutation.mutate(task.id);
  }

  async function handleAddSubtask(parent: Task, title: string) {
    await createMutation.mutateAsync({
      title,
      date: parent.date,
      parentId: parent.id,
    });
  }

  function selectDay(day: string) {
    setSelectedDate(day);
    setView('day');
  }

  return (
    <>
      <StickyPageHeader>
        <header className='mb-3'>
          <h1 className='text-xl font-semibold'>Calendar</h1>

          <p className='mt-1 text-sm text-muted'>Day, week, and month planning.</p>
        </header>

        <div className='grid grid-cols-3 gap-1 rounded-2xl border border-line bg-card p-1'>
          {VIEW_OPTIONS.map((option) => {
            const active = view === option.id;

            return (
              <button
                key={option.id}
                type='button'
                onClick={() => setView(option.id)}
                className={`rounded-xl py-2 text-sm font-medium ${
                  active ? 'bg-primary text-white' : 'text-muted'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <div className='mt-3 flex items-center justify-between gap-2'>
          <button
            type='button'
            onClick={() => shiftPeriod(-1)}
            aria-label='Previous period'
            className='rounded-xl border border-line bg-card p-2 text-muted'
          >
            <ChevronLeft size={18} />
          </button>

          <div className='min-w-0 text-center'>
            <p className='truncate text-sm font-semibold'>{periodLabel}</p>

            {selectedDate !== today ? (
              <button
                type='button'
                onClick={() => setSelectedDate(today)}
                className='mt-1 text-xs font-medium text-primary'
              >
                Jump to today
              </button>
            ) : null}
          </div>

          <button
            type='button'
            onClick={() => shiftPeriod(1)}
            aria-label='Next period'
            className='rounded-xl border border-line bg-card p-2 text-muted'
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </StickyPageHeader>

      {tasksQuery.isLoading ? (
        <p className='mt-6 text-center text-sm text-muted'>Loading tasks...</p>
      ) : tasksQuery.isError ? (
        <p className='mt-6 text-center text-sm text-red-500'>
          {tasksQuery.error instanceof Error
            ? tasksQuery.error.message
            : 'Could not load tasks'}
        </p>
      ) : view === 'month' ? (
        <div className='mt-4'>
          <div className='mb-2 grid grid-cols-7 gap-1'>
            {week.map((day) => (
              <p key={day} className='text-center text-[10px] font-medium uppercase text-muted'>
                {formatShortWeekday(day)}
              </p>
            ))}
          </div>

          <div className='grid grid-cols-7 gap-1'>
            {monthGrid.map((day) => {
              const inMonth = day.slice(0, 7) === selectedDate.slice(0, 7);
              const selected = day === selectedDate;
              const isToday = day === today;
              const count = counts[day] ?? 0;

              return (
                <button
                  key={day}
                  type='button'
                  onClick={() => selectDay(day)}
                  className={`flex aspect-square flex-col items-center justify-center rounded-xl text-sm ${
                    selected
                      ? 'bg-primary text-white'
                      : inMonth
                        ? 'bg-card text-foreground'
                        : 'bg-transparent text-muted/50'
                  } ${isToday && !selected ? 'ring-1 ring-primary/40' : ''}`}
                >
                  <span className='font-medium'>{formatDayNumber(day)}</span>

                  <span
                    className={`mt-1 h-1.5 w-1.5 rounded-full ${
                      count > 0
                        ? selected
                          ? 'bg-white'
                          : 'bg-primary'
                        : 'bg-transparent'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>
      ) : view === 'week' ? (
        <div className='mt-4 space-y-6'>
          <WeeklyReview
            tasks={tasks}
            today={today}
            weekStart={weekStart}
            weekEnd={weekEnd}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onEdit={openEditSheet}
            onAddSubtask={handleAddSubtask}
            busy={busy}
          />

          <div className='space-y-3'>
            <h2 className='text-base font-semibold'>By day</h2>

            {week.map((day) => {
              const dayList = tasksOnDate(tasks, day);
              const isToday = day === today;

              return (
                <section key={day} className='rounded-2xl border border-line bg-card p-3'>
                  <button
                    type='button'
                    onClick={() => selectDay(day)}
                    className='mb-2 flex w-full items-center justify-between text-left'
                  >
                    <div>
                      <p className='text-sm font-semibold'>{formatLongDate(day)}</p>

                      {isToday ? <p className='text-xs text-primary'>Today</p> : null}
                    </div>

                    <p className='text-xs text-muted'>
                      {dayList.length === 0 ? 'Empty' : `${dayList.length}`}
                    </p>
                  </button>

                  {dayList.length === 0 ? (
                    <p className='text-sm text-muted'>No tasks</p>
                  ) : (
                    <ul className='space-y-2'>
                      {dayList.slice(0, 4).map((task) => (
                        <li key={task.id} className='flex items-center gap-2 text-sm'>
                          <span
                            className={`h-2 w-2 shrink-0 rounded-full ${
                              task.done ? 'bg-muted' : 'bg-primary'
                            }`}
                          />

                          <span className={task.done ? 'text-muted line-through' : ''}>
                            {task.startTime ? `${task.startTime} · ` : ''}
                            {task.title}
                          </span>
                        </li>
                      ))}

                      {dayList.length > 4 ? (
                        <li className='text-xs text-muted'>+{dayList.length - 4} more</li>
                      ) : null}
                    </ul>
                  )}
                </section>
              );
            })}
          </div>
        </div>
      ) : (
        <div className='mt-5 space-y-6'>
          {dayTasks.length === 0 ? (
            <div className='rounded-2xl border border-dashed border-line px-4 py-10 text-center'>
              <p className='font-medium'>No tasks on this day</p>

              <p className='mt-1 text-sm text-muted'>Add tasks from the Plan tab.</p>
            </div>
          ) : (
            <>
              {timed.length > 0 ? (
                <section>
                  <div className='mb-2 flex items-end justify-between'>
                    <h2 className='text-base font-semibold'>Timeline</h2>
                    <p className='text-xs text-muted'>{timed.length} timed</p>
                  </div>

                  <ul className='space-y-2'>
                    {timed.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onToggle={handleToggle}
                        onDelete={handleDelete}
                        onEdit={openEditSheet}
                        onAddSubtask={handleAddSubtask}
                        busy={busy}
                      />
                    ))}
                  </ul>
                </section>
              ) : null}

              {untimed.length > 0 ? (
                <section>
                  <div className='mb-2 flex items-end justify-between'>
                    <h2 className='text-base font-semibold'>Anytime</h2>
                    <p className='text-xs text-muted'>{untimed.length}</p>
                  </div>

                  <ul className='space-y-2'>
                    {untimed.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onToggle={handleToggle}
                        onDelete={handleDelete}
                        onEdit={openEditSheet}
                        onAddSubtask={handleAddSubtask}
                        busy={busy}
                      />
                    ))}
                  </ul>
                </section>
              ) : null}
            </>
          )}
        </div>
      )}

      <TaskFormSheet
        key={sheetKey}
        open={sheetOpen}
        date={editingTask?.date ?? selectedDate}
        task={editingTask}
        onClose={closeSheet}
      />
    </>
  );
}
