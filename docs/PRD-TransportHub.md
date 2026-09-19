# Product Requirements Document (PRD)

**Project Name:** Maa Durga Transport — Truck Yard & Requirement Management System
**Version:** 2.0 (Final — reflects the shipped v1.0 product)
**Status:** Live, in use by the client
**Date:** September 19, 2026
**Owner:** [Your Name]

---

## 1. Overview / Problem Statement

A transport agency owner operates a hub where empty trucks arrive after completing a delivery elsewhere. These trucks wait at the hub until the owner receives a new delivery requirement from a client and matches it to an available truck. Before this system, this process was handled informally (phone calls, notebooks, memory), which caused three recurring problems: no reliable shared record of truck availability, no historical record of a truck's past performance when it returned weeks or months later, and no way for the owner and staff to access the same information from different devices or locations at once.

Maa Durga Transport is a web application that centralizes truck yard status, client requirement intake, matching, truck rating history, and — as of this version — secure, owner-controlled staff access.

## 2. Goals & Success Criteria

- Give the owner and staff a single, always-current view of which trucks are at the hub and their status.
- Let staff log a new client requirement and match it to an available truck in a few clicks.
- Preserve a truck's rating and visit history so it's visible the next time that truck returns.
- Be usable from a phone or laptop, by multiple users at once.
- Present a clean, professional UI on both mobile and desktop.
- Restrict access to only people the owner has explicitly approved — this is an in-house tool, not a public product.
- Serve as a complete, demonstrable end-to-end project.

## 3. Users & Roles

| Role | Description | System Access |
|---|---|---|
| Owner | Runs the agency | Full operational access, plus exclusive access to the Team page: inviting new employees and promoting an employee to owner |
| Employee | Staff managing day-to-day operations | Full operational access (trucks, requirements, matching, ratings) — everything except the Team page |
| Truck Owner | Owns/operates a truck that visits the hub | No login — contacted offline by phone/WhatsApp |
| Client | Requests a delivery | No login — requirements are entered manually by staff after a phone call |

This is the one meaningful permission difference in the app: Owner vs. Employee is otherwise identical everywhere except the Team page, which only the Owner can see or use.

## 4. Scope

### In Scope (shipped in v1.0)
- Truck profile management, with search (by number, owner, or driver) and status filtering
- Truck visit logging, including deleting an individual mistaken visit entry (with safe status fallback) without deleting the truck itself
- Truck status tracking: Available → Assigned → In Transit → Delivered, plus manual correction
- Client requirement intake, editing, and deletion (with safe handling of assigned/in-progress jobs)
- Matching a requirement to an available truck in one action
- Rating (1–5) and feedback per truck, with an average shown on its profile
- Recording price/amount for record-keeping only (no invoicing)
- A recorded running total on the requirements list
- Multi-user login for Owner and Employees, usable from phone or laptop
- "Forgot password?" self-service reset flow
- **Owner-controlled account creation:** public self-signup is disabled at both the UI and the API level; the Owner invites new employees by email from a dedicated Team page, and can promote an employee to Owner from the same page
- Responsive design throughout, with distinct mobile and desktop layouts
- A dashboard with at-a-glance stats

### Out of Scope (v1)
- Online payments, invoicing, or any payment gateway
- Self-service portal for clients
- Login/portal for truck owners
- SMS/WhatsApp/email notifications
- Support for multiple hubs/locations
- Route optimization or GPS/live tracking
- Demoting an owner back to employee (only promotion exists in v1)

## 5. Core User Flows

See `USER-FLOWS-TransportHub.md` for the full set, including truck arrival, requirement intake, matching/delivery/rating, employee invitation, and password reset.

## 6. Data Model (High-Level Entities)

**Truck** *(permanent, one row per physical truck)*
`truck_id, truck_number, owner_name, owner_phone, driver_name, driver_phone, driver_photo, truck_type/capacity (optional), created_at`

**TruckVisit** *(one row per hub visit)*
`visit_id, truck_id (FK), arrival_date, departure_date, status, linked_requirement_id (FK, nullable)`
Individual visits can be deleted (with confirmation); if the deleted visit was linked to a requirement, that requirement returns to pending rather than being left orphaned.

**Requirement** *(one row per client order)*
`requirement_id, client_name, client_phone, destination, goods_description, quantity/weight (optional), price_amount, status, created_at, assigned_visit_id (FK)`

**Rating**
`rating_id, truck_id (FK), visit_id (FK), rating_value (1–5), feedback_text, rated_by, rated_at`

**User / Profile**
`user_id, name, email, role (owner/employee), created_at`
Accounts are never self-registered in the running product — they exist only because the Owner invited them, or because they were the one account promoted to Owner directly in the database when the security hardening shipped (a one-time, unavoidable bootstrap step for the very first Owner).

## 7. Functional Requirements by Module

**Truck Yard Management** — add/edit truck profile, log arrival, search/filter, view/edit history, delete a truck, delete an individual visit.

**Requirement Management** — create/edit/cancel a requirement, filter/search, recorded total.

**Matching & Assignment** — assign truck to requirement in one action, mark delivered, safe deletion of assigned requirements.

**Rating & Feedback** — add rating + feedback post-delivery, average shown on profile.

**Team & Access (Owner-only)**
- View a list of all accounts: name, email, role, and invite-pending status
- Invite a new employee by name and email — triggers a secure server-side check that the caller is the Owner, then uses the Supabase Admin API (service-role key, server-side only) to send the invite
- Promote an existing employee to Owner, through the same server-verified pattern, with a confirmation prompt describing exactly what access is being granted

**Dashboard** — live counts of trucks/requirements by status.

## 8. Non-Functional Requirements

- Fully responsive — distinct, purpose-built layouts for mobile and desktop, not just a resized single layout
- Cloud-hosted so the Owner and Employees can access it from different locations simultaneously
- Authenticated access only, with no path to an account except an Owner's invitation
- Any privileged action (inviting a user, promoting a user) runs through a server-side function that verifies the caller's role before using elevated database privileges — the privileged key never reaches the browser
- UI follows a single consistent color language for status, applied identically across trucks and requirements

## 9. Assumptions

- Single hub for v1.
- Truck owners and clients remain external parties with no login.
- The very first Owner account cannot be created through the app itself — it has to be set directly in the database once, as a one-time bootstrap step. Every Owner after that can be created in-app via "Promote to owner."
- Employees and the Owner are functionally equal for every operational task; the only reserved capability is Team management.
- "Price/amount" is a plain recorded number — no tax, discount, or invoice logic.

## 10. Future Enhancements (v2+)

- Multi-hub support
- Truck owner portal (view/accept assigned jobs)
- Client self-service portal
- WhatsApp/SMS notifications
- Lightweight payment/invoice tracking
- Analytics dashboard (truck utilization, revenue-recorded trends)
- Demoting an owner back to employee, and more granular permissions beyond the current Owner/Employee split

## 11. Glossary

- **Hub** — the agency's physical yard where trucks wait between jobs
- **Truck Visit** — one occurrence of a truck being at the hub, from arrival to departure
- **Requirement** — a client's delivery order
- **Owner** — the role with exclusive access to inviting and promoting team members
