import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ResponsiveModal } from "@/components/ResponsiveModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { inviteEmployee, listTeam } from "@/lib/team.functions";
import { useMyProfile } from "@/lib/data";


export const Route = createFileRoute("/_authenticated/team")({
  head: () => ({
    meta: [
      { title: "Team · Maa Durga Transport" },
      {
        name: "description",
        content: "Owner-only team management: review staff accounts and invite new employees.",
      },
      { property: "og:title", content: "Team · Maa Durga Transport" },
      {
        property: "og:description",
        content: "Owner-only team management: review staff accounts and invite new employees.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TeamPage,
});

function TeamPage() {
  const fetchTeam = useServerFn(listTeam);
  const invite = useServerFn(inviteEmployee);
  const qc = useQueryClient();
  const profile = useMyProfile();
  const isOwner = profile.data?.role === "owner";
  const [open, setOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  const team = useQuery({
    queryKey: ["team"],
    queryFn: () => fetchTeam(),
    retry: false,
    enabled: isOwner,
  });


  const inviteMutation = useMutation({
    mutationFn: async () =>
      invite({
        data: {
          full_name: fullName,
          email,
          redirectTo: `${window.location.origin}/reset-password`,
        },
      }),
    onSuccess: (result) => {
      toast.success(`Invitation sent to ${result.email}`);
      setOpen(false);
      setFullName("");
      setEmail("");
      void qc.invalidateQueries({ queryKey: ["team"] });
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Could not send the invitation"),
  });

  return (
    <AppShell
      title="Team"
      action={
        isOwner ? (
          <Button onClick={() => setOpen(true)} className="gap-2">
            <UserPlus className="size-4" />
            Invite employee
          </Button>
        ) : undefined
      }
    >
      {profile.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : !isOwner ? (
        <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
          Only the owner can view and manage team members.
        </div>
      ) : team.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading team…</p>
      ) : team.isError ? (
        <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
          {team.error instanceof Error && /owner/i.test(team.error.message)
            ? "Only the owner can view and manage team members."
            : "Could not load the team list."}
        </div>
      ) : (

        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
              </tr>
            </thead>
            <tbody>
              {(team.data ?? []).map((member) => (
                <tr key={member.id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">
                    {member.full_name ?? "—"}
                    {member.pending ? (
                      <span className="ml-2 rounded-full bg-status-wait/15 px-2 py-0.5 text-xs font-medium text-status-wait">
                        Invite pending
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{member.email ?? "—"}</td>
                  <td className="px-4 py-3 capitalize">{member.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ResponsiveModal
        open={open}
        onOpenChange={setOpen}
        title="Invite employee"
        description="They receive an email to set their own password and get employee access."
      >
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            inviteMutation.mutate();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="invite-name">Full name</Label>
            <Input
              id="invite-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invite-email">Email</Label>
            <Input
              id="invite-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={inviteMutation.isPending}>
            {inviteMutation.isPending ? "Sending…" : "Send invitation"}
          </Button>
        </form>
      </ResponsiveModal>
    </AppShell>
  );
}
