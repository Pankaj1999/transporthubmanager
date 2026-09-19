import { useState } from "react";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { ResponsiveModal } from "@/components/ResponsiveModal";
import { DriverAvatar } from "@/components/DriverAvatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDate, formatMoney } from "@/lib/status";
import { useMatch, useVisits, type Requirement } from "@/lib/data";

export function MatchPanel({
  requirement,
  onClose,
}: {
  requirement: Requirement | null;
  onClose: () => void;
}) {
  const { data: visits = [] } = useVisits();
  const match = useMatch();
  const [selected, setSelected] = useState<string | null>(null);

  const available = visits.filter((v) => v.status === "available");

  function confirm() {
    if (!requirement || !selected) return;
    match.mutate(
      { requirementId: requirement.id, visitId: selected },
      {
        onSuccess: () => {
          toast.success("Truck matched and shipment moved to in transit");
          setSelected(null);
          onClose();
        },
        onError: (error) => toast.error(error.message),
      },
    );
  }

  return (
    <ResponsiveModal
      open={!!requirement}
      onOpenChange={(open) => {
        if (!open) {
          setSelected(null);
          onClose();
        }
      }}
      side
      title="Match a truck"
      description={
        requirement
          ? `${requirement.client_name} → ${requirement.destination} · ${formatMoney(requirement.price_amount)}`
          : undefined
      }
    >
      <div className="space-y-3">
        {available.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No trucks are available at the hub right now.
          </p>
        ) : (
          available.map((visit) => {
            const isSelected = selected === visit.id;
            return (
              <button
                key={visit.id}
                type="button"
                onClick={() => setSelected(visit.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border border-border bg-card p-3 text-left transition-colors hover:border-primary/50",
                  isSelected && "border-primary ring-1 ring-primary",
                )}
              >
                <DriverAvatar
                  path={visit.truck?.driver_photo_url ?? null}
                  name={visit.truck?.driver_name ?? "Driver"}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {visit.truck?.truck_number}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {visit.truck?.driver_name} · at hub since {formatDate(visit.arrival_date)}
                  </span>
                </span>
                {isSelected ? <Check className="size-4 text-primary" /> : null}
              </button>
            );
          })
        )}
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <Button
          variant="ghost"
          onClick={() => {
            setSelected(null);
            onClose();
          }}
        >
          Cancel
        </Button>
        <Button disabled={!selected || match.isPending} onClick={confirm}>
          {match.isPending ? "Matching…" : "Confirm match"}
        </Button>
      </div>
    </ResponsiveModal>
  );
}
