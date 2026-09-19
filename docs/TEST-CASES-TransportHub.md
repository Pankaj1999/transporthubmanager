# Test Cases — TransportHub

Derived from `BACKLOG-TransportHub.md`. Covers every user story (TH-1 to TH-16), plus regression cases for the bugs already found and fixed during QA (arrival status, sort order, delete, database permissions, ambiguous joins).

**Priority key:** P0 = blocks core usage if broken · P1 = important · P2 = minor/edge case

## Epic 1: Truck yard management

| ID | Related | Test case | Steps | Expected result | Priority |
|---|---|---|---|---|---|
| TC-01 | TH-1 | Add a new truck with valid data | Open "+ Add truck", fill all fields, save | Truck is created and appears in the trucks list | P0 |
| TC-02 | TH-1 | Add a truck with a duplicate truck number | Try to save a truck number that already exists | Validation error shown; no duplicate created | P1 |
| TC-03 | TH-2 | Log arrival for a brand-new truck | Log an arrival using a truck number not yet in the system | New truck profile + new visit created, status = available | P0 |
| TC-04 | TH-2 | Log arrival for a returning truck (regression) | Log a new arrival for a truck whose last visit was "delivered" | Truck's displayed status updates to available for the new visit | P0 |
| TC-05 | TH-3 | Filter truck list by status | Apply each status filter in turn | Only trucks matching that status are shown | P1 |
| TC-06 | TH-3 (regression) | Truck list sort order | Open the trucks list | Most recently arrived truck is at the top, oldest at the bottom | P1 |
| TC-07 | TH-4 | View truck profile history | Open a truck with 2+ past visits | All visits shown with date, status, rating, feedback, newest first | P0 |
| TC-08 | TH-5 | Manually correct a truck's status | Change a truck's status directly | New status saved and reflected immediately in the UI | P2 |
| TC-09 | New (delete) | Delete a truck | Delete a test truck with no visit history | Confirmation prompt shown; truck removed after confirming | P1 |
| TC-10 | New (delete) | Delete a truck with visit history | Attempt to delete a truck that has past visits/ratings | Handled safely per design (blocked with a message, or cascades cleanly with no orphaned records) | P1 |

## Epic 2: Requirement management

| ID | Related | Test case | Steps | Expected result | Priority |
|---|---|---|---|---|---|
| TC-11 | TH-6 | Create a requirement with valid data | Fill and submit "+ New requirement" | Requirement is created with status pending, appears in list and dashboard | P0 |
| TC-12 | TH-6 | Create a requirement with a missing required field | Leave client name or destination blank, submit | Validation error shown; not submitted | P1 |
| TC-13 | TH-7 | Edit a pending requirement | Change destination or price on a pending requirement | Changes are saved and reflected in the list | P1 |
| TC-14 | New (delete) | Delete a pending requirement | Delete a test requirement while still pending | Confirmation prompt shown; requirement removed after confirming | P1 |
| TC-15 | TH-8 | Filter requirements by status | Apply each status filter in turn | Only requirements matching that status are shown | P1 |
| TC-16 | TH-8 (regression) | Requirements list sort order | Open the requirements list | Most recently created requirement is at the top, oldest at the bottom | P1 |
| TC-17 | New (delete) | Delete a requirement already assigned or further along | Attempt to delete a requirement that is assigned/in transit/delivered | Handled safely per design (blocked, warned, or cleans up the visit link with no orphaned references) | P1 |

## Epic 3: Matching & assignment

| ID | Related | Test case | Steps | Expected result | Priority |
|---|---|---|---|---|---|
| TC-18 | TH-9 | Match an available truck to a pending requirement | Select a pending requirement, assign an available truck | Requirement becomes assigned; truck's current visit becomes in transit | P0 |
| TC-19 | TH-9 | Attempt to match with no trucks available | Try to match a requirement when no trucks show "available" | UI shows a clear empty state rather than an error or blank list | P2 |
| TC-20 | TH-10 | Mark a job as delivered | From an assigned/in-transit job, mark delivered | Both the requirement and the truck visit update to delivered together | P0 |

## Epic 4: Rating & feedback

| ID | Related | Test case | Steps | Expected result | Priority |
|---|---|---|---|---|---|
| TC-21 | TH-11 | Rate a truck after delivery | On a delivered visit, submit a rating (1-5) and feedback | Rating saved and visible on the truck's profile history | P0 |
| TC-22 | TH-11 | Attempt to rate a visit that isn't delivered yet | Try to rate an in-transit or available visit | Rating option is unavailable/disabled until delivered | P1 |
| TC-23 | TH-12 | Average rating calculation | View a truck profile with multiple ratings | Average rating displayed matches the actual mean of all ratings | P1 |

## Epic 5: User management & auth

| ID | Related | Test case | Steps | Expected result | Priority |
|---|---|---|---|---|---|
| TC-24 | TH-13 | Log in with valid credentials | Enter correct email/password | User reaches the dashboard | P0 |
| TC-25 | TH-13 | Log in with invalid credentials | Enter an incorrect password | Clear error shown; access denied | P0 |
| TC-26 | TH-14 | Owner adds an employee account | Owner creates a new employee login | New account can log in and use the app with full access | P1 |

## Epic 6: Dashboard & reporting

| ID | Related | Test case | Steps | Expected result | Priority |
|---|---|---|---|---|---|
| TC-27 | TH-15 | Dashboard stat accuracy | Compare dashboard counts to the actual trucks/requirements lists | Counts match exactly and update live after changes | P0 |
| TC-28 | TH-16 | Recorded total amount | Sum requirement prices manually and compare to any total shown | Totals match, with no invoice/tax logic applied | P2 |

## Responsive & layout

| ID | Related | Test case | Steps | Expected result | Priority |
|---|---|---|---|---|---|
| TC-29 | Design | Dashboard on mobile viewport | Load the dashboard at a phone width | Single-column layout, top nav, no horizontal scrolling | P1 |
| TC-30 | Design | Dashboard on desktop viewport | Load the dashboard at a desktop width | Sidebar nav, two-column truck/requirement lists | P1 |
| TC-31 | Design | Forms adapt by screen size | Open add truck/requirement form on mobile and desktop | Full-screen page on mobile, centered modal on desktop | P2 |
| TC-32 | Design | Match action adapts by screen size | Open the match action on mobile and desktop | Full screen on mobile, right-side slide-over panel on desktop | P2 |

## Epic 7: Access & security (post-launch hardening)

| ID | Related | Test case | Steps | Expected result | Priority |
|---|---|---|---|---|---|
| TC-33 | TH-17 | Truck search combined with status filter | Search by truck number, owner, or driver name while a status filter is also applied | Both narrow the same list together; a no-match state is shown when nothing fits | P1 |
| TC-34 | TH-18 | Delete an individual visit entry | Delete one visit (not the whole truck) from a truck with 2+ visits, including its current/open visit | Confirmation shown; visit removed; truck's status falls back to its next most recent visit, or to "no visits yet" if none remain; a requirement linked to that visit returns to pending rather than being orphaned | P1 |
| TC-35 | TH-19 | Forgot password end to end | Click "Forgot password?", request a reset, open the email link, set a new password | Reset email sent; new password accepted; user can sign in with it afterward | P1 |
| TC-36 | TH-20 | Public signup fully disabled | Attempt to create an account from the login screen UI, and separately by calling the signup API directly | No "Create account" option exists in the UI; the direct API call is refused (422/"signups not allowed") | P0 |
| TC-37 | TH-20 | Owner invites an employee | From the Team page, owner enters a name and email and sends an invite | Invitation is created and shows "Invite pending"; invited person can set a password and gets normal employee access | P0 |
| TC-38 | TH-20 | Non-owner is blocked from Team features | An employee account attempts to view the Team page or call the invite function directly | Team page is inaccessible/blocked for non-owners; the invite function rejects the call server-side, not just hidden in the UI | P0 |
| TC-39 | TH-21 | Owner promotes an employee to owner | Owner selects "Promote to owner" on an employee row and confirms | Confirmation describes the access being granted; role updates immediately; promoted account gains Team page access right away | P1 |
| TC-40 | TH-21 | Non-owner cannot promote | An employee account attempts to call the promote function directly | Request is rejected server-side | P0 |
