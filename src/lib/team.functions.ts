import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type TeamMember = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string;
  created_at: string;
  pending: boolean;
};

/** Throws unless the authenticated caller has the owner role. */
async function assertOwner(context: { userId: string }) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", context.userId)
    .maybeSingle();
  if (error) throw new Error("Could not verify your permissions");
  if (!data || data.role !== "owner") {
    throw new Error("Only the owner can manage team members");
  }
}

export const listTeam = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<TeamMember[]> => {
    await assertOwner(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");


    const [{ data: profiles, error }, { data: usersData }] = await Promise.all([
      supabaseAdmin.from("profiles").select("*").order("created_at", { ascending: true }),
      supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 }),
    ]);
    if (error) throw new Error(error.message);

    const confirmed = new Map(
      (usersData?.users ?? []).map((u) => [
        u.id,
        Boolean(u.email_confirmed_at ?? u.last_sign_in_at),
      ]),
    );

    return (profiles ?? []).map((p) => ({
      id: p.id,
      full_name: p.full_name,
      email: p.email,
      role: p.role,
      created_at: p.created_at,
      pending: confirmed.get(p.id) === false,
    }));
  });

export const inviteEmployee = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        full_name: z.string().trim().min(1, "Name is required").max(120),
        email: z.string().trim().toLowerCase().email("Enter a valid email address"),
        redirectTo: z.string().url().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await assertOwner(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(data.email, {
      data: { full_name: data.full_name },
      ...(data.redirectTo ? { redirectTo: data.redirectTo } : {}),
    });
    if (error) {
      throw new Error(
        /already/i.test(error.message)
          ? "That email already has an account."
          : error.message,
      );
    }
    return { ok: true as const, email: data.email };
  });
