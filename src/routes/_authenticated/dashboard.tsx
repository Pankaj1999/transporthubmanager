import { createFileRoute, Link } from "@tanstack/react-router";
import { Truck as TruckIcon, ClipboardList, Route as RouteIcon } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { DriverAvatar } from "@/components/DriverAvatar";
import { formatDate, formatMoney } from "@/lib/status";
import { useRequirements, useVisits } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard · Maa Durga Transport" },
      {
        name: "description",
        content: "Live view of trucks at the hub, pending requirements and shipments in transit.",
      },
      { property: "og:title", content: "Dashboard · Maa Durga Transport" },
      {
        property: "og:description",
        content: "Live view of trucks at the hub, pending requirements and shipments in transit.",
      },
    ],
  }),
  component: Dashboard,
});

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof TruckIcon;
  label: string;
  value: number;
  tone: "wait" | "progress" | "done";
}) {
  const bg = {
    wait: "bg-status-wait-surface text-status-wait-foreground",
    progress: "bg-status-progress-surface text-status-progress-foreground",
    done: "bg-status-done-surface text-status-done-foreground",
  }[tone];
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <span className={`inline-flex size-9 items-center justify-center rounded-lg ${bg}`}>
        <Icon className="size-4" />
      </span>
      <p className="mt-4 text-3xl font-semibold">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function Dashboard() {
  const { data: visits = [], isLoading: loadingVisits } = useVisits();
  const { data: requirements = [], isLoading: loadingReqs } = useRequirements();

  const atHub = visits.filter((v) => v.status !== "delivered");
  const available = atHub.filter((v) => v.status === "available").length;
  const pending = requirements.filter((r) => r.status === "pending").length;
  const inTransit = requirements.filter(
    (r) => r.status === "in_transit" || r.status === "assigned",
  ).length;

  return (
    <AppShell title="Dashboard">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={TruckIcon} label="Trucks available at hub" value={available} tone="wait" />
        <StatCard icon={ClipboardList} label="Pending requirements" value={pending} tone="wait" />
        <StatCard icon={RouteIcon} label="Shipments in transit" value={inTransit} tone="progress" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card shadow-soft">
          <header className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="text-base font-semibold">Truck yard</h2>
            <Link to="/trucks" className="text-sm text-primary hover:underline">
              All trucks
            </Link>
          </header>
          <ul className="divide-y divide-border">
            {loadingVisits ? (
              <li className="px-5 py-8 text-sm text-muted-foreground">Loading…</li>
            ) : atHub.length === 0 ? (
              <li className="px-5 py-8 text-sm text-muted-foreground">No trucks at the hub yet.</li>
            ) : (
              atHub.map((visit) => (
                <li key={visit.id} className="flex items-center gap-3 px-5 py-3">
                  <DriverAvatar
                    path={visit.truck?.driver_photo_url ?? null}
                    name={visit.truck?.driver_name ?? "Driver"}
                  />
                  <div className="min-w-0 flex-1">
                    <Link
                      to="/trucks/$truckId"
                      params={{ truckId: visit.truck_id }}
                      className="block truncate text-sm font-medium hover:underline"
                    >
                      {visit.truck?.truck_number}
                    </Link>
                    <p className="truncate text-xs text-muted-foreground">
                      {visit.truck?.driver_name} · arrived {formatDate(visit.arrival_date)}
                    </p>
                  </div>
                  <StatusBadge status={visit.status} />
                </li>
              ))
            )}
          </ul>
        </section>

        <section className="rounded-2xl border border-border bg-card shadow-soft">
          <header className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="text-base font-semibold">Requirements</h2>
            <Link to="/requirements" className="text-sm text-primary hover:underline">
              All requirements
            </Link>
          </header>
          <ul className="divide-y divide-border">
            {loadingReqs ? (
              <li className="px-5 py-8 text-sm text-muted-foreground">Loading…</li>
            ) : requirements.length === 0 ? (
              <li className="px-5 py-8 text-sm text-muted-foreground">No requirements yet.</li>
            ) : (
              requirements.slice(0, 12).map((req) => (
                <li key={req.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{req.destination}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {req.client_name} · {formatMoney(req.price_amount)}
                    </p>
                  </div>
                  <StatusBadge status={req.status} />
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </AppShell>
  );
}
