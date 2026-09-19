export type EntityStatus = "available" | "pending" | "assigned" | "in_transit" | "delivered";

export const STATUS_LABEL: Record<EntityStatus, string> = {
  available: "Available",
  pending: "Pending",
  assigned: "Assigned",
  in_transit: "In transit",
  delivered: "Delivered",
};

/** One color system for trucks and requirements alike. */
export function statusTone(status: string): "wait" | "progress" | "done" {
  if (status === "delivered") return "done";
  if (status === "assigned" || status === "in_transit") return "progress";
  return "wait";
}

export const TRUCK_STATUSES: EntityStatus[] = ["available", "assigned", "in_transit", "delivered"];
export const REQUIREMENT_STATUSES: EntityStatus[] = [
  "pending",
  "assigned",
  "in_transit",
  "delivered",
];

export function formatMoney(value: number | string | null | undefined) {
  const n = Number(value ?? 0);
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
