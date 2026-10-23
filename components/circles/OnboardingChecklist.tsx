'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type OnboardingItemKey =
  | 'readRules'
  | 'setReminder'
  | 'enableAutoPay'
  | 'introduceYourself';

export interface OnboardingProgress {
  readRules: boolean;
  setReminder: boolean;
  enableAutoPay: boolean;
  introduceYourself: boolean;
  dismissed: boolean;
}

const STORAGE_PREFIX = 'circle-onboarding';

const EMPTY_PROGRESS: OnboardingProgress = {
  readRules: false,
  setReminder: false,
  enableAutoPay: false,
  introduceYourself: false,
  dismissed: false,
};

const ITEMS: { key: OnboardingItemKey; label: string; description: string }[] = [
  { key: 'readRules', label: 'Read the circle rules', description: 'Know what is expected before you contribute.' },
  { key: 'setReminder', label: 'Set a contribution reminder', description: 'Never miss a payout cycle.' },
  { key: 'enableAutoPay', label: 'Enable auto-pay', description: 'Automate your contributions each round.' },
  { key: 'introduceYourself', label: 'Introduce yourself', description: 'Say hello to your fellow members.' },
];

function storageKey(circleId: string, userId: string) {
  return `${STORAGE_PREFIX}:${circleId}:${userId}`;
}

function readProgress(circleId: string, userId: string): OnboardingProgress {
  if (typeof window === 'undefined') return EMPTY_PROGRESS;
  try {
    const raw = window.localStorage.getItem(storageKey(circleId, userId));
    if (!raw) return EMPTY_PROGRESS;
    const parsed = JSON.parse(raw) as Partial<OnboardingProgress>;
    return { ...EMPTY_PROGRESS, ...parsed };
  } catch {
    return EMPTY_PROGRESS;
  }
}

function writeProgress(circleId: string, userId: string, progress: OnboardingProgress) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(storageKey(circleId, userId), JSON.stringify(progress));
  } catch {
    // Ignore storage failures (private mode, quota, etc.).
  }
}

export interface OnboardingChecklistProps {
  circleId: string;
  userId: string;
  /** Optional externally-tracked completion signals (e.g. from circle state). */
  completed?: Partial<Pick<OnboardingProgress, OnboardingItemKey>>;
  className?: string;
}

export function OnboardingChecklist({ circleId, userId, completed, className }: OnboardingChecklistProps) {
  const [progress, setProgress] = useState<OnboardingProgress>(EMPTY_PROGRESS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setProgress(readProgress(circleId, userId));
    setHydrated(true);
  }, [circleId, userId]);

  // Auto-check items when the corresponding action is completed elsewhere.
  useEffect(() => {
    if (!completed) return;
    setProgress((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const item of ITEMS) {
        if (completed[item.key] && !prev[item.key]) {
          next[item.key] = true;
          changed = true;
        }
      }
      if (!changed) return prev;
      writeProgress(circleId, userId, next);
      return next;
    });
  }, [completed, circleId, userId]);

  const markComplete = useCallback(
    (key: OnboardingItemKey) => {
      setProgress((prev) => {
        if (prev[key]) return prev;
        const next = { ...prev, [key]: true };
        writeProgress(circleId, userId, next);
        return next;
      });
    },
    [circleId, userId],
  );

  const dismiss = useCallback(() => {
    setProgress((prev) => {
      const next = { ...prev, dismissed: true };
      writeProgress(circleId, userId, next);
      return next;
    });
  }, [circleId, userId]);

  const completedCount = useMemo(
    () => ITEMS.filter((item) => progress[item.key]).length,
    [progress],
  );
  const allComplete = completedCount === ITEMS.length;

  if (!hydrated || progress.dismissed) return null;

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle>Getting started</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            {completedCount} of {ITEMS.length} steps complete
          </p>
        </div>
        {allComplete && (
          <Button variant="ghost" size="icon" onClick={dismiss} aria-label="Dismiss onboarding checklist">
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        {ITEMS.map((item) => {
          const done = progress[item.key];
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => markComplete(item.key)}
              disabled={done}
              className={cn(
                'flex w-full items-start gap-3 rounded-md border p-3 text-left transition-colors',
                done ? 'border-primary/40 bg-primary/5' : 'hover:bg-muted',
              )}
            >
              <span
                className={cn(
                  'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border',
                  done ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/40',
                )}
              >
                {done && <Check className="h-3 w-3" />}
              </span>
              <span className="flex flex-col">
                <span className={cn('text-sm font-medium', done && 'line-through text-muted-foreground')}>
                  {item.label}
                </span>
                <span className="text-xs text-muted-foreground">{item.description}</span>
              </span>
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}

export default OnboardingChecklist;
