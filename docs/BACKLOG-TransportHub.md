# Backlog — Epics & User Stories (Final)

Derived from `PRD-TransportHub.md`. All stories below shipped in the live v1.0 product. Priority and sprint columns are kept for historical reference; a **Status** column reflects the final state.

**Priority key:** P0 = needed for a usable MVP · P1 = important · P2 = nice-to-have

---

## Epic 1: Truck Yard Management

| ID | Story | Priority | Status |
|---|---|---|---|
| TH-1 | Add a new truck's profile (number, owner/driver, photo) | P0 | Shipped |
| TH-2 | Log a new visit for an existing truck | P0 | Shipped |
| TH-3 | View trucks at the hub, filterable by status | P0 | Shipped |
| TH-4 | Open a truck's profile and see its full visit/rating history | P1 | Shipped |
| TH-5 | Manually correct a truck's status | P2 | Shipped |

## Epic 2: Requirement Management

| ID | Story | Priority | Status |
|---|---|---|---|
| TH-6 | Log a new client requirement | P0 | Shipped |
| TH-7 | Edit or cancel a requirement before it's matched | P1 | Shipped |
| TH-8 | View all requirements, filterable by status | P0 | Shipped |

## Epic 3: Matching & Assignment

| ID | Story | Priority | Status |
|---|---|---|---|
| TH-9 | Assign an Available truck to a Pending requirement in one action | P0 | Shipped |
| TH-10 | Mark a requirement and its truck visit Delivered together | P0 | Shipped |

## Epic 4: Rating & Feedback

| ID | Story | Priority | Status |
|---|---|---|---|
| TH-11 | Rate a truck (1–5) with feedback once Delivered | P1 | Shipped |
| TH-12 | See a truck's average rating on its profile | P1 | Shipped |

## Epic 5: User Management & Auth

| ID | Story | Priority | Status |
|---|---|---|---|
| TH-13 | Log in securely | P0 | Shipped |
| TH-14 | Owner adds/manages employee accounts | P1 | Shipped — completed as the Team page's Invite feature (see Epic 7); the original self-signup workaround used during early testing was fully replaced |

## Epic 6: Dashboard & Reporting

| ID | Story | Priority | Status |
|---|---|---|---|
| TH-15 | Dashboard summary counts | P1 | Shipped |
| TH-16 | Recorded total of requirement amounts | P2 | Shipped |

## Epic 7: Access & Security (added post-launch)

| ID | Story | Priority | Status |
|---|---|---|---|
| TH-17 | As staff, I want to search the truck list by number, owner, or driver, combined with the status filter, so I can find a truck quickly as the list grows. | P1 | Shipped |
| TH-18 | As staff, I want to delete a single mistaken visit entry without deleting the truck, with its status safely falling back to the next most recent visit. | P1 | Shipped |
| TH-19 | As a user, I want a "Forgot password?" flow so I can regain access without asking someone else to reset it for me. | P1 | Shipped |
| TH-20 | As the Owner, I want public self-signup disabled everywhere (UI and API) and to invite employees myself by email, so unauthorized people can never gain access. | P0 | Shipped |
| TH-21 | As the Owner, I want to promote an existing employee to Owner from inside the app, so ownership changes never require direct database access. | P1 | Shipped |

---

## Delivery history

- **Sprint 1–3 (original plan):** TH-1 through TH-16 — the full MVP loop: register trucks, take requirements, match, deliver, rate, dashboard.
- **Post-launch hardening (same week as launch):** TH-17 through TH-21 — search, safe visit deletion, password recovery, and the full security lockdown replacing open self-signup with an Owner-invite model.

All 21 stories are live in production as of this document's date.
