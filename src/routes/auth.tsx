import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Truck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in · Maa Durga Transport" },
      {
        name: "description",
        content: "Sign in to Maa Durga Transport to manage trucks, requirements and deliveries.",
      },
      { property: "og:title", content: "Sign in · Maa Durga Transport" },
      {
        property: "og:description",
        content: "Sign in to Maa Durga Transport to manage trucks, requirements and deliveries.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === "SIGNED_IN" || event === "INITIAL_SESSION")) {
        navigate({ to: "/dashboard", replace: true });
      }
    });
    return () => data.subscription.unsubscribe();
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setCheckEmail(true);
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        if (!data.session) {
          setCheckEmail(true);
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
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
          {checkEmail ? (
            <div className="space-y-3 text-center">
              <h1 className="text-lg font-semibold">Check your email</h1>
              <p className="text-sm text-muted-foreground">
                 {mode === "forgot"
                   ? `We sent a password reset link to ${email}. Open it to choose a new password.`
                   : `We sent a confirmation link to ${email}. Open it to activate your account, then sign in.`}
              </p>
              <Button
                variant="ghost"
                onClick={() => {
                  setCheckEmail(false);
                  setMode("signin");
                }}
              >
                Back to sign in
              </Button>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-semibold">
                 {mode === "signin"
                   ? "Sign in"
                   : mode === "signup"
                     ? "Create your account"
                     : "Reset your password"}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                 {mode === "forgot"
                   ? "Enter your email and we'll send you a secure reset link."
                   : "Operations access for the owner and employees."}
              </p>
              <form onSubmit={submit} className="mt-6 space-y-4">
                 {mode === "signup" ? (
                 {mode !== "forgot" ? <div className="space-y-2">
                    <Label htmlFor="fullName">Full name</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                ) : null}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete={mode === "signin" ? "current-password" : "new-password"}
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                 </div> : null}
                <Button type="submit" className="w-full" disabled={loading}>
                   {loading
                     ? "Please wait…"
                     : mode === "signin"
                       ? "Sign in"
                       : mode === "signup"
                         ? "Create account"
                         : "Send reset link"}
                </Button>
              </form>
               <div className="mt-4 flex flex-col items-center gap-2">
                 {mode === "signin" ? (
                   <Button type="button" variant="link" size="sm" onClick={() => setMode("forgot")}>
                     Forgot password?
                   </Button>
                 ) : null}
                 <Button
                   type="button"
                   variant="link"
                   size="sm"
                   onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                 >
                   {mode === "signin"
                     ? "No account yet? Create one"
                     : "Back to sign in"}
                 </Button>
               </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
