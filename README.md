# Hub Connect

Build a web app called TransportHub for a transport agency that matches trucks arriving at a hub with delivery requirements from clients.

DATA MODEL (Postgres via Supabase/Lovable Cloud):
- trucks: id, truck_number (unique), owner_name, owner_phone, driver_name, driver_phone, driver_photo_url, created_at
- truck_visits: id, truck_id (FK), arrival_date, departure_date, status (available, assigned, in_transit, delivered), requirement_id (FK, nullable)
- requirements: id, client_name, client_phone, destination, goods_description, price_amount, status (pending, assigned, in_transit, delivered), created_at, assigned_visit_id (FK, nullable)
- ratings: id, truck_id (FK), visit_id (FK), rating_value (1-5), feedback_text, rated_by, rated_at
- users: via Supabase Auth with a role field (owner or employee) — both roles have equal permissions in this version

AUTH: email/password login required. Multi-user — the owner and employees each log in from their own phone or laptop, and every write action should be attributed to the logged-in user.

CORE SCREENS:
1. Dashboard — three summary stat cards (trucks at hub, pending requirements, in-transit shipments), plus a two-column view showing the truck yard list and the requirements list side by side, each row with a colored status badge.
2. Trucks — full list of trucks, filterable by status, with a "+ Add truck" action opening a form (truck number, owner name, owner phone, driver name, driver phone, driver photo upload).
3. Truck profile — the truck's permanent details plus its full visit history (date range, status, rating, feedback), so a returning truck immediately shows its track record.
4. Requirements — full list, filterable by status, with a "+ New requirement" action (client name, client phone, destination, goods description, price).
5. Match action — from a pending requirement, pick an available truck and confirm; this updates the requirement to "assigned" and that truck's current visit to "in_transit" together, in one action.
6. Mark delivered — mark a requirement and its truck visit as delivered together.
7. Rate truck — once a visit is delivered, add a 1–5 rating and written feedback, saved permanently to that truck's profile and visible on all future visits.

DESIGN SYSTEM:
- Persistent left sidebar navigation on desktop (Dashboard, Trucks, Requirements); collapses to a simple top nav on mobile.
- One consistent status color system used everywhere, for both trucks and requirements: amber for "awaiting action" (available/pending), blue for "in progress" (assigned/in transit), green for "complete" (delivered).
- Forms open as centered modals on desktop and as full-screen pages on mobile.
- The match action opens as a right-side slide-over panel on desktop and a full screen on mobile.
- Clean, modern, minimal aesthetic — generous whitespace, one clear primary action per screen, no clutter.
- Fully responsive — comfortable to use on both a desktop browser and a phone.

OUT OF SCOPE for this version: no payments, no invoicing, no client-facing portal, no truck-owner portal, no notifications. Keep it entirely operational — trucks, requirements, matching, and ratings only.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://transporthubmanager.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/1ff97be8-a1d9-485f-a572-84946c1dae04).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
