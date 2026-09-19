import type { ReactNode } from "react";
import { X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string | undefined;
  children: ReactNode;
  /** Slide-over on desktop instead of a centered modal. */
  side?: boolean;
};

/**
 * Centered modal (or right slide-over) on desktop, full-screen page on mobile.
 */
export function ResponsiveModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  side = false,
}: Props) {
  const isMobile = useIsMobile();

  if (isMobile) {
    if (!open) return null;
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-background">
        <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div>
            <h2 className="text-base font-semibold">{title}</h2>
            {description ? (
              <p className="text-xs text-muted-foreground">{description}</p>
            ) : null}
          </div>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} aria-label="Close">
            <X className="size-4" />
          </Button>
        </header>
        <div className="flex-1 overflow-y-auto px-4 py-5">{children}</div>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={
          side
            ? "top-0 right-0 bottom-0 left-auto max-h-none w-full max-w-md translate-x-0 translate-y-0 gap-5 overflow-y-auto rounded-none border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-md"
            : "gap-5 sm:max-w-lg"
        }
      >
        <div className="space-y-1">
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </div>
        {children}
      </DialogContent>
    </Dialog>
  );
}
