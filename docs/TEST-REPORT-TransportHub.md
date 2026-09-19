# Test Report — Maa Durga Transport (Final)

**Date:** September 19, 2026
**Scope:** All 40 cases in `TEST-CASES-TransportHub.md` (32 original + 8 post-launch hardening)
**Method:** Automated browser testing (Playwright) against the live preview, cross-checked directly against the database, run by the Lovable build agent
**Result:** 40 / 40 Pass across two rounds (4 gaps found and fixed in round 1 — see below)

## Summary by epic

| Epic | Cases | Result |
|---|---|---|
| Truck yard management | TC-01 – TC-10 | 10/10 Pass |
| Requirement management | TC-11 – TC-17 | 7/7 Pass |
| Matching & assignment | TC-18 – TC-20 | 3/3 Pass |
| Rating & feedback | TC-21 – TC-23 | 3/3 Pass |
| User management & auth | TC-24 – TC-26 | 3/3 Pass |
| Dashboard & reporting | TC-27 – TC-28 | 2/2 Pass |
| Responsive & layout | TC-29 – TC-32 | 4/4 Pass |

## Full results

| ID | Result | Note |
|---|---|---|
| TC-01 | Pass | Truck added with all fields, appears in list |
| TC-02 | Pass | Duplicate rejected with a clear "already registered" message, no second record |
| TC-03 | Pass | New truck number creates profile + visit as available |
| TC-04 | Pass | Returning truck's new arrival correctly shows available again |
| TC-05 | Pass | Each status filter shows only matching trucks |
| TC-06 | Pass | Most recent arrival sorts to the top |
| TC-07 | Pass | Full visit history shown, newest first, with rating and feedback |
| TC-08 | Pass | Manual status change applies immediately |
| TC-09 | Pass | Truck with no history: confirmation shown, removed cleanly |
| TC-10 | Pass | Truck with 2 visits + 2 ratings deleted cleanly, no orphaned rows |
| TC-11 | Pass | Requirement created as pending, shows in list and dashboard |
| TC-12 | Pass | Blank required field blocks submission, form stays open |
| TC-13 | Pass | Destination and price edits saved correctly |
| TC-14 | Pass | Pending requirement deleted after confirmation |
| TC-15 | Pass | Every status filter correct |
| TC-16 | Pass | Newest requirement sorts to the top |
| TC-17 | Pass | Deleting an assigned requirement warns first, then frees the truck back to available |
| TC-18 | Pass | Requirement becomes assigned, truck's visit becomes in transit |
| TC-19 | Pass | Clear "no trucks available" message, confirm button disabled |
| TC-20 | Pass | Requirement and visit both marked delivered together |
| TC-21 | Pass | Rating + feedback saved and shown on the truck profile |
| TC-22 | Pass | No rating option available before delivery |
| TC-23 | Pass | Average rating matches the actual mean (4 and 5 → 4.5) |
| TC-24 | Pass | Correct credentials reach the dashboard |
| TC-25 | Pass | Wrong password refused with a clear error |
| TC-26 | Pass | A newly signed-up teammate logs in with full access |
| TC-27 | Pass | Dashboard counts match the underlying lists exactly |
| TC-28 | Pass | Recorded total matches the manual sum, no tax/invoice logic applied |
| TC-29 | Pass | Phone width: single column, top nav, no horizontal scrolling |
| TC-30 | Pass | Desktop: sidebar plus two-column truck/requirement lists |
| TC-31 | Pass | Add-forms: full screen on phone, centered modal on desktop |
| TC-32 | Pass | Match action: full screen on phone, right-side slide-over on desktop |

## Round 2 — Post-launch hardening

| ID | Result | Note |
|---|---|---|
| TC-33 | Pass | Truck search and status filter narrow the list together; clear no-match state |
| TC-34 | Pass | Individual visit deleted with confirmation; status falls back to the next most recent visit; linked requirement returns to pending rather than being orphaned |
| TC-35 | Pass | Reset email sent; new password accepted; sign-in works afterward |
| TC-36 | Pass | "Create account" removed from the UI; direct API signup call refused (422, "signups not allowed") |
| TC-37 | Pass | Owner invited a test employee end to end; invite showed as pending, account worked after password was set |
| TC-38 | Pass | Non-owner refused both the Team list and the invite function server-side, not just hidden in the UI |
| TC-39 | Pass | Owner promoted a test employee to owner; role updated instantly, promoted account gained Team page access immediately |
| TC-40 | Pass | Non-owner's attempt to call the promote function directly was rejected server-side |

## Bugs found and fixed during this pass

1. **Duplicate truck number** raised a raw database error instead of a readable message → now shows "Truck [number] is already registered."
2. **No way to manually correct a truck's status** (TC-08 had no feature to test) → added a status control on the truck's current visit.
3. **No way to edit a pending requirement** (TC-13 had no feature to test) → added an edit action and modal.
4. **No visible running total on requirements** (TC-28 had nothing to check) → added a "Recorded total" line to the requirements list.

## Known limitations

- Public self-signup is now fully disabled — the only way into the app is an Owner-sent invite, or (for the very first Owner only) a one-time direct database update. This is documented in `PRD-TransportHub.md`.
- Two throwaway test logins (`qa.employee...@example.com`) remain in the auth system from earlier testing; they hold no application data and can be deleted from the Supabase dashboard whenever convenient.
- All test trucks, visits, requirements, ratings, and test team-role changes created during both rounds of testing were reverted or deleted — the database reflects only real accounts and is ready for production data.
- Demoting an owner back to employee is not built in this version — only promotion exists (see `PRD-TransportHub.md`, section 10).
