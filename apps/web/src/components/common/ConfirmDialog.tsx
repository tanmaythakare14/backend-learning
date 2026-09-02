import type { JSX } from 'react';
import { AlertDialog } from '@base-ui/react/alert-dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  destructive?: boolean;
  onConfirm: () => void;
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
          <div className="mt-6 flex justify-end gap-3">
            <AlertDialog.Close
              render={
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              }
            />
            <Button
              type="button"
              className={cn(
                destructive && 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
              )}
              onClick={() => {
                onConfirm();
                onOpenChange(false);
              }}
            >
              {confirmLabel}
            </Button>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
