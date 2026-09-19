import { STATUS_LABEL, statusTone, type EntityStatus } from "@/lib/status";
import { cn } from "@/lib/utils";

const toneClass = {
  wait: "bg-status-wait-surface text-status-wait-foreground ring-status-wait/30",
  progress: "bg-status-progress-surface text-status-progress-foreground ring-status-progress/30",
  done: "bg-status-done-surface text-status-done-foreground ring-status-done/30",
} as const;

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const tone = statusTone(status);
  const label = STATUS_LABEL[status as EntityStatus] ?? status;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        toneClass[tone],
        className,
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          tone === "wait" && "bg-status-wait",
          tone === "progress" && "bg-status-progress",
          tone === "done" && "bg-status-done",
        )}
      />
      {label}
    </span>
  );
}
