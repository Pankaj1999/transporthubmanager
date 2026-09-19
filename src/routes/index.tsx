import { useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Truck, ClipboardList, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Maa Durga Transport · Match trucks with delivery requirements" },
      {
        name: "description",
        content:
          "Maa Durga Transport is the operations desk for a transport agency: track trucks at the hub, log client requirements, match them in one action and rate every delivery.",
      },
      { property: "og:title", content: "Maa Durga Transport · Match trucks with delivery requirements" },
      {
        property: "og:description",
        content:
          "Track trucks at the hub, log client requirements, match them in one action and rate every delivery.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  { icon: Truck, title: "Truck yard", text: "Every truck at the hub with owner and driver details." },
  {
    icon: ClipboardList,
    title: "Requirements",
    text: "Client deliveries logged with destination, goods and price.",
  },
  {
    icon: Star,
    title: "Track record",
    text: "Ratings and feedback stay with the truck on every return visit.",
  },
];

function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Truck className="size-4" />
          </span>
          <span className="font-display font-semibold">Maa Durga Transport</span>
        </div>
        <Button asChild variant="ghost">
          <Link to="/auth">Sign in</Link>
        </Button>
      </header>

      <main className="mx-auto max-w-5xl px-6 pb-24 pt-10 md:pt-20">
        <p className="text-sm font-medium tracking-wide text-primary uppercase">
          Transport operations
        </p>
        <h1 className="mt-4 max-w-2xl text-4xl font-semibold md:text-5xl">
          Match arriving trucks with the deliveries waiting for them.
        </h1>
        <p className="mt-5 max-w-xl text-lg text-muted-foreground">
          One shared desk for the hub: who has arrived, what clients need moved, and how every truck
          performed last time.
        </p>
        <div className="mt-8">
          <Button asChild size="lg">
            <Link to="/auth">Open the hub</Link>
          </Button>
        </div>

        <div className="mt-20 grid gap-4 md:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <Icon className="size-5 text-primary" />
              <h2 className="mt-4 text-base font-semibold">{title}</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
