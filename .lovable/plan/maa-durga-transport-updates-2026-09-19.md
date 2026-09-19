# Maa Durga Transport updates

## What will change
- Replace every visible TransportHub name and page title with Maa Durga Transport.
- Add truck search by number, owner, or driver; search and status filters will narrow the same list together.
- Add a confirmation-backed delete action to each visit in truck history.
- Add “Forgot password?” to sign-in and a public reset-password page for choosing a new password.

## Safe visit deletion
- Add a protected database action that verifies staff access before deleting a visit.
- If the visit is linked to a requirement, return that requirement to pending before deletion to avoid broken assignments.
- Ratings for the deleted visit will be removed by the existing relationship; the truck remains and its current status naturally falls back to its next newest visit, or shows no visit.

## Verification
- Confirm all branding and page titles are renamed.
- Test truck search together with status filtering.
- Create and delete both current and older visits, checking status fallback and linked-record safety.
- Request a reset email and verify the reset page accepts a recovery link and updates the password.
- Check desktop/mobile layouts and the final build/error logs.

## Technical details
- Keep the existing Lovable Cloud authentication and staff access rules.
- Add unique metadata for the new reset-password page, including social preview fields.
- Clean up all QA records created during testing.
