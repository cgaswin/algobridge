import * as React from 'react';

import { cn } from '@/lib/utils';

type DialogContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const DialogContext = React.createContext<DialogContextValue | null>(null);

function useDialogContext() {
  const context = React.useContext(DialogContext);
  if (!context) {
    throw new Error('Dialog components must be used within Dialog');
  }
  return context;
}

function Dialog({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) {
  const value = React.useMemo(() => ({ open, setOpen: onOpenChange }), [onOpenChange, open]);

  return <DialogContext.Provider value={value}>{children}</DialogContext.Provider>;
}

function DialogPortal({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function DialogOverlay({ className, ...props }: React.ComponentProps<'div'>) {
  const { open } = useDialogContext();
  if (!open) {
    return null;
  }

  return <div className={cn('fixed inset-0 z-50 bg-black/45 backdrop-blur-[1.5px]', className)} {...props} />;
}

function DialogContent({ className, children, ...props }: React.ComponentProps<'div'>) {
  const { open, setOpen } = useDialogContext();

  React.useEffect(() => {
    if (!open) {
      return;
    }

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('keydown', onEscape);
    };
  }, [open, setOpen]);

  if (!open) {
    return null;
  }

  return (
    <DialogPortal>
      <DialogOverlay onClick={() => setOpen(false)} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          className={cn(
            'relative w-full max-w-2xl rounded-2xl border bg-card p-0 text-card-foreground shadow-2xl',
            className,
          )}
          {...props}
        >
          {children}
        </div>
      </div>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex flex-col gap-1.5 p-6 pb-3', className)} {...props} />;
}

function DialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex items-center justify-end gap-2 p-6 pt-3', className)} {...props} />;
}

function DialogTitle({ className, ...props }: React.ComponentProps<'h2'>) {
  return <h2 className={cn('text-lg font-semibold tracking-tight', className)} {...props} />;
}

function DialogDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return <p className={cn('text-sm text-muted-foreground', className)} {...props} />;
}

function DialogClose({ className, asChild = false, ...props }: React.ComponentProps<'button'> & { asChild?: boolean }) {
  const { setOpen } = useDialogContext();

  if (asChild && React.isValidElement(props.children)) {
    const child = props.children as React.ReactElement<{ onClick?: () => void }>;
    return React.cloneElement(child, {
      onClick: () => {
        child.props.onClick?.();
        setOpen(false);
      },
    });
  }

  return (
    <button
      type="button"
      className={cn('rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground', className)}
      onClick={() => setOpen(false)}
      {...props}
    >
      {props.children ?? 'Close'}
    </button>
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
};
