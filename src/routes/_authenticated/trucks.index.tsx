import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { DriverAvatar } from "@/components/DriverAvatar";
import { AddTruckModal } from "@/components/AddTruckModal";
import { ConfirmDelete } from "@/components/ConfirmDelete";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDate, TRUCK_STATUSES, STATUS_LABEL } from "@/lib/status";
import { useDeleteTruck, useTrucks, useVisits } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/trucks/")({
  head: () => ({
    meta: [
      { title: "Trucks · TransportHub" },
      {
        name: "description",
        content: "Every truck registered with the hub, its driver and its current visit status.",
      },
      { property: "og:title", content: "Trucks · TransportHub" },
      {
        property: "og:description",
        content: "Every truck registered with the hub, its driver and its current visit status.",
      },
    ],
  }),
  component: TrucksPage,
});

function TrucksPage() {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const { data: trucks = [], isLoading } = useTrucks();
  const { data: visits = [] } = useVisits();
  const deleteTruck = useDeleteTruck();

  const latestVisit = new Map<string, (typeof visits)[number]>();
  for (const visit of visits) {
    if (!latestVisit.has(visit.truck_id)) latestVisit.set(visit.truck_id, visit);
  }

  const rows = trucks
    .map((truck) => ({ truck, visit: latestVisit.get(truck.id) ?? null }))
    .filter(({ visit }) => filter === "all" || visit?.status === filter);

  return (
    <AppShell
      title="Trucks"
      action={
        <Button onClick={() => setOpen(true)}>
          <Plus className="size-4" />
          Add truck
        </Button>
      }
    >
      <div className="mb-5 flex flex-wrap gap-2">
        {["all", ...TRUCK_STATUSES].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={cn(
              "rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground",
              filter === value && "border-primary bg-primary text-primary-foreground",
            )}
          >
            {value === "all" ? "All" : STATUS_LABEL[value as keyof typeof STATUS_LABEL]}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        <ul className="divide-y divide-border">
          {isLoading ? (
            <li className="px-5 py-10 text-sm text-muted-foreground">Loading…</li>
          ) : rows.length === 0 ? (
            <li className="px-5 py-10 text-sm text-muted-foreground">No trucks to show.</li>
          ) : (
            rows.map(({ truck, visit }) => (
              <li key={truck.id} className="flex items-center gap-2 pr-3 transition-colors hover:bg-secondary">
                <Link
                  to="/trucks/$truckId"
                  params={{ truckId: truck.id }}
                  className="flex min-w-0 flex-1 items-center gap-4 px-5 py-4"
                >
                  <DriverAvatar path={truck.driver_photo_url} name={truck.driver_name} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{truck.truck_number}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {truck.driver_name} · owner {truck.owner_name}
                    </p>
                  </div>
                  <div className="hidden text-right text-xs text-muted-foreground sm:block">
                    {visit ? `Arrived ${formatDate(visit.arrival_date)}` : "No visit"}
                  </div>
                  {visit ? <StatusBadge status={visit.status} /> : null}
                </Link>
                <ConfirmDelete
                  title={`Delete ${truck.truck_number}?`}
                  description="This removes the truck along with its visit history and ratings. Any requirement still attached to it goes back to pending. This can't be undone."
                  pending={deleteTruck.isPending}
                  onConfirm={() =>
                    deleteTruck.mutate(truck.id, {
                      onSuccess: () => toast.success(`${truck.truck_number} deleted`),
                      onError: (error) => toast.error(error.message),
                    })
                  }
                />
              </li>
            ))
          )}
        </ul>
      </div>

      <AddTruckModal open={open} onOpenChange={setOpen} />
    </AppShell>
  );
}
