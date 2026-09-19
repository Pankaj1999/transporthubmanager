import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Phone, Star, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { DriverAvatar } from "@/components/DriverAvatar";
import { RateVisitModal, type RateTarget } from "@/components/RateVisitModal";
import { ConfirmDelete } from "@/components/ConfirmDelete";
import { Button } from "@/components/ui/button";
import { formatDate, formatMoney, STATUS_LABEL, TRUCK_STATUSES } from "@/lib/status";
import {
  useAddVisit,
  useDeleteTruck,
  useTruck,
  useTruckVisits,
  useUpdateVisitStatus,
  type Rating,
} from "@/lib/data";

export const Route = createFileRoute("/_authenticated/trucks/$truckId")({
  head: () => ({
    meta: [
      { title: "Truck profile · TransportHub" },
      {
        name: "description",
        content: "Permanent truck details plus the full visit history, ratings and feedback.",
      },
      { property: "og:title", content: "Truck profile · TransportHub" },
      {
        property: "og:description",
        content: "Permanent truck details plus the full visit history, ratings and feedback.",
      },
    ],
  }),
  component: TruckProfile,
});

function firstRating(rating: Rating | Rating[] | null): Rating | null {
  if (!rating) return null;
  return Array.isArray(rating) ? (rating[0] ?? null) : rating;
}

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={
            n <= value ? "size-3.5 fill-status-wait text-status-wait" : "size-3.5 text-border"
          }
        />
      ))}
    </span>
  );
}

function TruckProfile() {
  const { truckId } = Route.useParams();
  const navigate = useNavigate();
  const { data: truck } = useTruck(truckId);
  const { data: visits = [], isLoading } = useTruckVisits(truckId);
  const addVisit = useAddVisit();
  const deleteTruck = useDeleteTruck();
  const [rateTarget, setRateTarget] = useState<RateTarget | null>(null);

  const rated = visits.map((v) => firstRating(v.rating)).filter((r): r is Rating => !!r);
  const average = rated.length
    ? (rated.reduce((sum, r) => sum + r.rating_value, 0) / rated.length).toFixed(1)
    : null;
  const hasOpenVisit = visits.some((v) => v.status !== "delivered");

  return (
    <AppShell
      title={truck?.truck_number ?? "Truck"}
      action={
        <div className="flex items-center gap-2">
          {!hasOpenVisit ? (
            <Button
              onClick={() =>
                addVisit.mutate(truckId, {
                  onSuccess: () => toast.success("New visit opened — truck is available"),
                  onError: (error) => toast.error(error.message),
                })
              }
              disabled={addVisit.isPending}
            >
              <Plus className="size-4" />
              Log new arrival
            </Button>
          ) : null}
          <ConfirmDelete
            title={`Delete ${truck?.truck_number ?? "this truck"}?`}
            description="This removes the truck along with its visit history and ratings. Any requirement still attached to it goes back to pending. This can't be undone."
            pending={deleteTruck.isPending}
            onConfirm={() =>
              deleteTruck.mutate(truckId, {
                onSuccess: () => {
                  toast.success("Truck deleted");
                  void navigate({ to: "/trucks" });
                },
                onError: (error) => toast.error(error.message),
              })
            }
            trigger={
              <Button variant="outline">
                <Trash2 className="size-4" />
                Delete truck
              </Button>
            }
          />
        </div>
      }
    >
      <Link
        to="/trucks"
        className="mb-5 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to trucks
      </Link>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="flex items-center gap-3">
            <DriverAvatar
              path={truck?.driver_photo_url ?? null}
              name={truck?.driver_name ?? "Driver"}
              className="size-14"
            />
            <div className="min-w-0">
              <p className="truncate font-medium">{truck?.driver_name}</p>
              <p className="text-xs text-muted-foreground">Driver</p>
            </div>
          </div>

          <dl className="mt-6 space-y-4 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">Truck number</dt>
              <dd className="font-medium">{truck?.truck_number}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Owner</dt>
              <dd className="font-medium">{truck?.owner_name}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Phones</dt>
              <dd className="space-y-1 font-medium">
                <span className="flex items-center gap-1.5">
                  <Phone className="size-3.5 text-muted-foreground" />
                  {truck?.owner_phone ?? "—"} <span className="text-muted-foreground">owner</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone className="size-3.5 text-muted-foreground" />
                  {truck?.driver_phone ?? "—"} <span className="text-muted-foreground">driver</span>
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Track record</dt>
              <dd className="mt-1 flex items-center gap-2 font-medium">
                {average ? (
                  <>
                    <Stars value={Math.round(Number(average))} />
                    {average} · {rated.length} rated {rated.length === 1 ? "trip" : "trips"}
                  </>
                ) : (
                  <span className="text-muted-foreground">No ratings yet</span>
                )}
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-2xl border border-border bg-card shadow-soft">
          <header className="border-b border-border px-5 py-4">
            <h2 className="text-base font-semibold">Visit history</h2>
          </header>
          <ul className="divide-y divide-border">
            {isLoading ? (
              <li className="px-5 py-8 text-sm text-muted-foreground">Loading…</li>
            ) : visits.length === 0 ? (
              <li className="px-5 py-8 text-sm text-muted-foreground">No visits recorded.</li>
            ) : (
              visits.map((visit, index) => {
                const rating = firstRating(visit.rating);
                return (
                  <li key={visit.id} className="px-5 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm font-medium">
                        {formatDate(visit.arrival_date)} –{" "}
                        {visit.departure_date ? formatDate(visit.departure_date) : "present"}
                      </p>
                      {index === 0 ? (
                        <label className="flex items-center gap-2 text-xs text-muted-foreground">
                          Status
                          <select
                            aria-label="Visit status"
                            className="rounded-lg border border-border bg-background px-2 py-1 text-xs text-foreground"
                            value={visit.status}
                            disabled={updateStatus.isPending}
                            onChange={(e) =>
                              updateStatus.mutate(
                                { visitId: visit.id, status: e.target.value },
                                {
                                  onSuccess: () => toast.success("Status updated"),
                                  onError: (error) => toast.error(error.message),
                                },
                              )
                            }
                          >
                            {TRUCK_STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {STATUS_LABEL[s]}
                              </option>
                            ))}
                          </select>
                        </label>
                      ) : null}
                      <StatusBadge status={visit.status} />
                    </div>
                    {visit.requirement ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {visit.requirement.destination} · {visit.requirement.client_name} ·{" "}
                        {formatMoney(visit.requirement.price_amount)}
                      </p>
                    ) : null}
                    {rating ? (
                      <div className="mt-3 rounded-lg bg-secondary p-3">
                        <Stars value={rating.rating_value} />
                        {rating.feedback_text ? (
                          <p className="mt-1.5 text-sm text-muted-foreground">
                            {rating.feedback_text}
                          </p>
                        ) : null}
                      </div>
                    ) : visit.status === "delivered" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() =>
                          setRateTarget({
                            truckId,
                            visitId: visit.id,
                            truckNumber: truck?.truck_number ?? "",
                          })
                        }
                      >
                        <Star className="size-3.5" />
                        Rate this trip
                      </Button>
                    ) : null}
                  </li>
                );
              })
            )}
          </ul>
        </section>
      </div>

      <RateVisitModal target={rateTarget} onClose={() => setRateTarget(null)} />
    </AppShell>
  );
}
