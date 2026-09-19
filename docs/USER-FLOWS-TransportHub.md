# User Flows (Final)

Companion to `PRD-TransportHub.md` and `BACKLOG-TransportHub.md`. Renders natively in GitHub and Azure Repos markdown previews.

## 1. Truck Arrival

```mermaid
flowchart TD
    A[Truck arrives at hub<br/>Empty, back from a delivery] --> B{New or returning truck?<br/>Checked by truck number}
    B -->|New| C[Register new profile<br/>Truck #, owner, driver, photo]
    B -->|Returning| D[Load existing profile<br/>Pulls up rating history]
    C --> E[Log new truck visit<br/>Creates a fresh visit record]
    D --> E
    E --> F[Status: available<br/>Ready to be matched]
```

A visit logged by mistake can be deleted individually from the truck's profile (with confirmation) without deleting the truck — the truck's status then safely falls back to its next most recent visit, or to "no visits yet" if none remain.

## 2. Requirement Intake

```mermaid
flowchart TD
    A[Client calls with a requirement<br/>Destination, goods, price] --> B[Staff logs the requirement<br/>Client details + delivery info]
    B --> C[Status: pending<br/>Waiting to be matched to a truck]
```

## 3. Matching, Delivery & Rating

```mermaid
flowchart TD
    A[Available truck<br/>Waiting at the hub] --> C[Match truck to requirement<br/>Both records update together]
    B[Pending requirement<br/>Client's delivery order] --> C
    C --> D[Delivery happens<br/>Truck owner contacted offline]
    D --> E[Mark as delivered<br/>Job + truck status updated]
    E --> F[Rate the truck<br/>1-5 rating + feedback saved]
    F --> G[Truck ready again<br/>Back to available, or leaves hub]
```

## 4. Owner Invites an Employee

```mermaid
flowchart TD
    A[Owner opens the Team page] --> B[Enters new employee's name + email]
    B --> C{Server checks: is caller the Owner?}
    C -->|No| D[Request rejected — no account created]
    C -->|Yes| E[Supabase Admin API invites the employee<br/>service-role key stays server-side]
    E --> F[Employee opens the invite email]
    F --> G[Employee sets their own password]
    G --> H[Employee has normal operational access]
```

This is the only way a new account can be created — public self-signup is disabled at both the login screen and the API level.

## 5. Forgot Password

```mermaid
flowchart TD
    A[User clicks Forgot password?] --> B[Enters their email]
    B --> C[Reset link emailed via Supabase Auth]
    C --> D[User opens the link]
    D --> E[Sets a new password]
    E --> F[Signs in normally]
```

## 6. Promote an Employee to Owner

```mermaid
flowchart TD
    A[Owner opens the Team page] --> B[Selects Promote to owner on an employee row]
    B --> C[Confirmation: grants full owner access, including inviting/promoting others]
    C -->|Confirmed| D{Server checks: is caller the Owner?}
    D -->|No| E[Request rejected]
    D -->|Yes| F[Target account's role updated to owner]
    F --> G[Promoted account immediately sees the Team page and its actions]
```

Flow 3's last step loops conceptually back into Flow 1 — a truck can return to the hub weeks later and re-enter as a "returning truck," which is why rating and visit history persist on its permanent profile rather than resetting each time.
