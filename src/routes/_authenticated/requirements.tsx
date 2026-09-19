import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Star, PackageCheck } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { AddRequirementModal } from "@/components/AddRequirementModal";
import { MatchPanel } from "@/components/MatchPanel";
import { RateVisitModal, type RateTarget } from "@/components/RateVisitModal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDate, formatMoney, REQUIREMENT_STATUSES, STATUS_LABEL } from "@/lib/status";
import { useMarkDelivered, useRequirements, type Requirement } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/requirements")({
  head: () => ({
    meta: [
      { title: "Requirements · TransportHub" },
      {
        name: "description",
        content:
          "Client delivery requirements with destination, goods, price and matching status.",
      },
      { property: "og:title", content: "Requirements · TransportHub" },
      {
        property: "og:description",
        content: "Client delivery requirements with destination, goods, price and matching status.",
      },
    ],
  }),
  component: RequirementsPage,
});

function RequirementsPage() {
  const [openForm, setOpenForm] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [matchTarget, setMatchTarget] = useState<Requirement | null>(null);
  const [rateTarget, setRateTarget] = useState<RateTarget | null>(null);
  const { data: requirements = [], isLoading, error } = useRequirements();
  const markDelivered = useMarkDelivered();

  const rows = requirements.filter((r) => filter === "all" || r.status === filter);

  return (
    <AppShell
      title="Requirements"
      action={
        <Button onClick={() => setOpenForm(true)}>
          <Plus className="size-4" />
          New requirement
        </Button>
      }
    >
      <div className="mb-5 flex flex-wrap gap-2">
        {["all", ...REQUIREMENT_STATUSES].map((value) => (
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
          {error ? (
            <li className="px-5 py-10 text-sm text-destructive">
              Couldn't load requirements: {error.message}
            </li>
          ) : isLoading ? (
            <li className="px-5 py-10 text-sm text-muted-foreground">Loading…</li>
          ) : rows.length === 0 ? (
            <li className="px-5 py-10 text-sm text-muted-foreground">No requirements to show.</li>
          ) : (
            rows.map((req) => (
              <li key={req.id} className="px-5 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{req.destination}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {req.client_name}
                      {req.client_phone ? ` · ${req.client_phone}` : ""} ·{" "}
                      {formatMoney(req.price_amount)} · created {formatDate(req.created_at)}
                    </p>
                    {req.goods_description ? (
                      <p className="mt-1 text-xs text-muted-foreground">{req.goods_description}</p>
                    ) : null}
                    {req.visit?.truck ? (
                      <p className="mt-1 text-xs">
                        <Link
                          to="/trucks/$truckId"
                          params={{ truckId: req.visit.truck.id }}
                          className="text-primary hover:underline"
                        >
                          {req.visit.truck.truck_number}
                        </Link>{" "}
                        <span className="text-muted-foreground">
                          · {req.visit.truck.driver_name}
                        </span>
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={req.status} />
                    {req.status === "pending" ? (
                      <Button size="sm" onClick={() => setMatchTarget(req)}>
                        Match truck
                      </Button>
                    ) : null}
                    {req.status === "assigned" || req.status === "in_transit" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={markDelivered.isPending}
                        onClick={() =>
                          markDelivered.mutate(req.id, {
                            onSuccess: () => toast.success("Marked delivered"),
                            onError: (error) => toast.error(error.message),
                          })
                        }
                      >
                        <PackageCheck className="size-3.5" />
                        Mark delivered
                      </Button>
                    ) : null}
                    {req.status === "delivered" && req.visit?.truck ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setRateTarget({
                            truckId: req.visit!.truck!.id,
                            visitId: req.visit!.id,
                            truckNumber: req.visit!.truck!.truck_number,
                          })
                        }
                      >
                        <Star className="size-3.5" />
                        Rate truck
                      </Button>
                    ) : null}
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

      <AddRequirementModal open={openForm} onOpenChange={setOpenForm} />
      <MatchPanel requirement={matchTarget} onClose={() => setMatchTarget(null)} />
      <RateVisitModal target={rateTarget} onClose={() => setRateTarget(null)} />
    </AppShell>
  );
}
