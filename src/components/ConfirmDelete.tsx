import { useState, type ReactNode } from "react";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export function ConfirmDelete({
  title,
  description,
  confirmLabel = "Delete",
  pending,
  destructive = true,
  onConfirm,
  trigger,
}: {
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  pending?: boolean;
  destructive?: boolean;
  onConfirm: () => void;
  trigger?: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <span
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setOpen(true);
        }}
      >
        {trigger ?? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label={title}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </Button>
        )}
      </span>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={pending}
              className={
                destructive
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : undefined
              }
              onClick={() => onConfirm()}
            >
              {confirmLabel}
            </AlertDialogAction>
          </AlertDialogFooter>

          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
