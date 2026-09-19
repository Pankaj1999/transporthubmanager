import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, KeyRound, Truck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Choose a new password · Maa Durga Transport" },
      { name: "description", content: "Choose a new password for your Maa Durga Transport account." },
      { property: "og:title", content: "Choose a new password · Maa Durga Transport" },
      { property: "og:description", content: "Choose a new password for your Maa Durga Transport account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [ready, setReady] = useState(false);
  const [complete, setComplete] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const recoveryLink = new URLSearchParams(window.location.hash.slice(1)).get("type") === "recovery";
    void supabase.auth.getSession().then(({ data }) => setReady(recoveryLink || Boolean(data.session)));
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setComplete(true);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Truck className="size-4" />
          </span>
          <span className="font-display text-lg font-semibold">Maa Durga Transport</span>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          {complete ? (
            <div className="space-y-4 text-center">
              <CheckCircle2 className="mx-auto size-9 text-status-done" />
              <h1 className="text-xl font-semibold">Password updated</h1>
              <p className="text-sm text-muted-foreground">You can now sign in with your new password.</p>
              <Button asChild className="w-full"><Link to="/auth">Back to sign in</Link></Button>
            </div>
          ) : ready ? (
            <>
              <KeyRound className="mb-4 size-7 text-primary" />
              <h1 className="text-xl font-semibold">Choose a new password</h1>
              <form className="mt-6 space-y-4" onSubmit={submit}>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New password</Label>
                  <Input id="newPassword" type="password" autoComplete="new-password" minLength={6} required value={password} onChange={(event) => setPassword(event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm new password</Label>
                  <Input id="confirmPassword" type="password" autoComplete="new-password" minLength={6} required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>{loading ? "Updating…" : "Update password"}</Button>
              </form>
            </>
          ) : (
            <div className="space-y-4 text-center">
              <h1 className="text-xl font-semibold">Reset link needed</h1>
              <p className="text-sm text-muted-foreground">Open the reset link from your email, or request a new one.</p>
              <Button asChild variant="outline" className="w-full"><Link to="/auth">Request a new link</Link></Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}