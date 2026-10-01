import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { AlertDialog } from '@base-ui/react/alert-dialog';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/utils/apiError';
import { cn } from '@/lib/utils';

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  destructive?: boolean;
  onConfirm: () => void | Promise<void>;
}

/** Destructive/status-change confirmation dialog — shared across modules, not just student-management. */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  destructive,
  onConfirm,
}: ConfirmDialogProps): JSX.Element {
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) setError(null);
  }, [open]);

  const handleConfirm = async (): Promise<void> => {
    setError(null);
    setIsConfirming(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fixed inset-0 z-50 bg-foreground/40" />
        <AlertDialog.Popup className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-6 shadow-glow outline-none">
          <AlertDialog.Title className="text-lg font-semibold tracking-tight text-foreground">
            {title}
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-1.5 text-sm text-muted-foreground">
            {description}
          </AlertDialog.Description>
          {error && (
            <p className="mt-3 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-[13px] text-destructive">
              {error}
            </p>
          )}
          <div className="mt-6 flex justify-end gap-3">
            <AlertDialog.Close
              render={
                <Button type="button" variant="outline" disabled={isConfirming}>
                  Cancel
                </Button>
              }
            />
            <Button
              type="button"
              className={cn(
                'gap-2',
                destructive && 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
              )}
              disabled={isConfirming}
              onClick={handleConfirm}
            >
              {isConfirming && <Loader2 className="h-4 w-4 animate-spin" />}
              {confirmLabel}
            </Button>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
