# Release Notes — v1.0 (Final)

**Project:** Maa Durga Transport (originally scoped and built as "TransportHub")
**Release date:** September 19, 2026
**Status:** Live, in use by the client, fully hardened for in-house use

## Overview

This is the final state of the first release: every story from `PRD-TransportHub.md` and `BACKLOG-TransportHub.md` (21 stories across 7 epics), covering the full operational loop plus the security hardening that makes it safe to run as a real in-house tool rather than a public app.

## What's included

### Truck yard management
- Register a truck profile (truck number, owner name/phone, driver name/phone, driver photo)
- Log an arrival as a new visit, reusing the existing profile for a returning truck
- **Search** the truck list by number, owner, or driver, combined with the status filter
- Full visit history on each truck's profile, including past ratings and feedback, newest first
- Manually correct a truck's status
- Delete a truck, with visit/rating history handled safely
- **Delete a single mistaken visit entry** without deleting the truck — status safely falls back to the next most recent visit, and any linked requirement returns to pending rather than being orphaned

### Requirement management
- Log a client requirement (client name/phone, destination, goods description, price)
- Edit a pending requirement's details
- Delete a requirement, with a warning and safe handling if it's already assigned
- Searchable/filterable list, newest first, with a recorded running total

### Matching & delivery
- Match an available truck to a pending requirement in one action
- Mark a job delivered, updating both records together

### Ratings
- Rate a truck 1–5 with written feedback once delivered
- Average rating shown on the truck's profile, recalculated automatically

### Accounts & access — hardened for in-house use
- Email/password login for the owner and employees
- **"Forgot password?"** self-service reset flow
- **Public self-signup fully disabled**, at both the login screen and the Supabase Auth API — no one can create an account by finding the URL
- **Owner-only Team page**: lists every account (name, email, role, invite-pending status) and lets the owner invite new employees by email through a secure, server-verified function
- **Promote to owner**: the owner can grant another account full owner access directly from the Team page, with a clear confirmation, so ownership changes never require touching the database again
- The one exception noted for the record: the very first owner account on any fresh deployment of this system must still be set directly in the database, since the invite system needs an existing owner to work — everything after that first account is fully self-service within the app

### Design
- Fully responsive: persistent sidebar and multi-column layouts on desktop; top nav and single-column stacks on mobile
- One consistent status color system throughout — amber for "awaiting action," blue for "in progress," green for "complete" — used identically for trucks and requirements

## Found and fixed across both hardening rounds

**Round 1 (core functionality):**
- Requirements silently failing to save (missing database insert permission, plus a broken query join)
- Truck status not returning to "available" on a new arrival
- Lists not sorting newest-first
- No way to delete a truck or a requirement
- Duplicate truck numbers showing a raw database error instead of a clear message
- No way to manually correct a truck's status
- No way to edit a pending requirement
- No visible running total on the requirements list

**Round 2 (access & security):**
- Public signup left the app open to anyone who found the URL — closed at both the UI and API level
- No way to remove a single mistaken visit log without deleting the whole truck — added, with safe status fallback
- No self-service password recovery — added
- No way to onboard a new employee without the (now-removed) public signup form — replaced with a secure, owner-only invite flow
- No way to change who holds owner access without direct database edits — replaced with an in-app "Promote to owner" action

## Out of scope for v1

- Payments, invoicing, or any payment gateway
- A client-facing portal or a truck-owner-facing portal
- SMS/WhatsApp/email notifications
- Support for multiple hubs
- Demoting an owner back to employee

## Known limitations

- The very first owner account on a fresh deployment must be set directly in the database — a one-time, unavoidable bootstrap step common to any invite-only system
- Two throwaway test logins created during QA (`qa.employee...@example.com`) remain in the auth system with no application data attached
- All test data from both rounds of QA — trucks, visits, requirements, ratings, and temporary role changes — was reverted or deleted before release

## Links

- Live app: https://id-preview--1ff97be8-a1d9-485f-a572-84946c1dae04.lovable.app
- Project editor: https://lovable.dev/projects/1ff97be8-a1d9-485f-a572-84946c1dae04

## What's next

Any further requests from the client should be logged as new backlog items on Azure Boards (targeting v1.1+) rather than actioned ad hoc, so the same planning discipline that shaped v1 continues for every release after it. Candidates already identified for v2: demoting an owner, a truck-owner-facing portal, and notifications — see `PRD-TransportHub.md`, section 10.
