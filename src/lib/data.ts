import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Truck = {
  id: string;
  truck_number: string;
  owner_name: string;
  owner_phone: string | null;
  driver_name: string;
  driver_phone: string | null;
  driver_photo_url: string | null;
  created_at: string;
};

export type Visit = {
  id: string;
  truck_id: string;
  arrival_date: string;
  departure_date: string | null;
  status: string;
  requirement_id: string | null;
  created_at: string;
};

export type Requirement = {
  id: string;
  client_name: string;
  client_phone: string | null;
  destination: string;
  goods_description: string | null;
  price_amount: number;
  status: string;
  assigned_visit_id: string | null;
  created_at: string;
};

export type Rating = {
  id: string;
  truck_id: string;
  visit_id: string;
  rating_value: number;
  feedback_text: string | null;
  rated_at: string;
};

export type VisitWithTruck = Visit & { truck: Truck | null };

function throwIf(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

async function currentUserId() {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

/** The signed-in user's own profile row (own-row RLS). */
export function useMyProfile() {
  return useQuery({
    queryKey: ["my-profile"],
    queryFn: async () => {
      const userId = await currentUserId();
      if (!userId) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, role")
        .eq("id", userId)
        .maybeSingle();
      throwIf(error);
      return data;
    },
  });
}

export function useTrucks() {
  return useQuery({
    queryKey: ["trucks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trucks")
        .select("*")
        .order("created_at", { ascending: false });
      throwIf(error);
      return (data ?? []) as Truck[];
    },
  });
}

export function useTruck(truckId: string) {
  return useQuery({
    queryKey: ["truck", truckId],
    queryFn: async () => {
      const { data, error } = await supabase.from("trucks").select("*").eq("id", truckId).single();
      throwIf(error);
      return data as Truck;
    },
  });
}

/** Latest visit per truck, joined with truck details. */
export function useVisits() {
  return useQuery({
    queryKey: ["visits"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("truck_visits")
        .select("*, truck:trucks(*)")
        .order("arrival_date", { ascending: false })
        .order("created_at", { ascending: false });
      throwIf(error);
      return (data ?? []) as unknown as VisitWithTruck[];
    },
  });
}

export function useTruckVisits(truckId: string) {
  return useQuery({
    queryKey: ["truck-visits", truckId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("truck_visits")
        .select(
          "*, requirement:requirements!truck_visits_requirement_id_fkey(*), rating:ratings(*)",
        )
        .eq("truck_id", truckId)
        .order("arrival_date", { ascending: false })
        .order("created_at", { ascending: false });
      throwIf(error);
      return (data ?? []) as unknown as (Visit & {
        requirement: Requirement | null;
        rating: Rating | Rating[] | null;
      })[];
    },
  });
}

export function useRequirements() {
  return useQuery({
    queryKey: ["requirements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("requirements")
        .select("*, visit:truck_visits!requirements_assigned_visit_fk(*, truck:trucks(*))")
        .order("created_at", { ascending: false });
      throwIf(error);
      return (data ?? []) as unknown as (Requirement & {
        visit: (Visit & { truck: Truck | null }) | null;
      })[];
    },
  });
}

export function useTruckRatings(truckId: string) {
  return useQuery({
    queryKey: ["ratings", truckId],
    queryFn: async () => {
      const { data, error } = await supabase.from("ratings").select("*").eq("truck_id", truckId);
      throwIf(error);
      return (data ?? []) as Rating[];
    },
  });
}

function useInvalidateAll() {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries();
  };
}

export function useAddTruck() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: async (input: {
      truck_number: string;
      owner_name: string;
      owner_phone: string;
      driver_name: string;
      driver_phone: string;
      photo: File | null;
    }) => {
      const userId = await currentUserId();
      let photoPath: string | null = null;
      if (input.photo) {
        const ext = input.photo.name.split(".").pop() ?? "jpg";
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("driver-photos")
          .upload(path, input.photo, { upsert: true });
        throwIf(upErr);
        photoPath = path;
      }
      const { data, error } = await supabase
        .from("trucks")
        .insert({
          truck_number: input.truck_number.trim(),
          owner_name: input.owner_name.trim(),
          owner_phone: input.owner_phone.trim() || null,
          driver_name: input.driver_name.trim(),
          driver_phone: input.driver_phone.trim() || null,
          driver_photo_url: photoPath,
          created_by: userId,
        })
        .select("id")
        .single();
      if (error && (error as { code?: string }).code === "23505") {
        throw new Error(`Truck ${input.truck_number.trim()} is already registered.`);
      }
      throwIf(error);
      // Every new truck starts a visit at the hub.
      const { error: visitErr } = await supabase.from("truck_visits").insert({
        truck_id: (data as { id: string }).id,
        status: "available",
        created_by: userId,
      });
      throwIf(visitErr);
      return data as { id: string };
    },
    onSuccess: invalidate,
  });
}

export function useAddVisit() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: async (truckId: string) => {
      const userId = await currentUserId();
      const { error } = await supabase
        .from("truck_visits")
        .insert({ truck_id: truckId, status: "available", created_by: userId });
      throwIf(error);
    },
    onSuccess: invalidate,
  });
}

export function useAddRequirement() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: async (input: {
      client_name: string;
      client_phone: string;
      destination: string;
      goods_description: string;
      price_amount: string;
    }) => {
      const userId = await currentUserId();
      const { error } = await supabase.from("requirements").insert({
        client_name: input.client_name.trim(),
        client_phone: input.client_phone.trim() || null,
        destination: input.destination.trim(),
        goods_description: input.goods_description.trim() || null,
        price_amount: Number(input.price_amount || 0),
        created_by: userId,
      });
      throwIf(error);
    },
    onSuccess: invalidate,
  });
}

export function useUpdateRequirement() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: async (input: {
      id: string;
      client_name: string;
      client_phone: string;
      destination: string;
      goods_description: string;
      price_amount: string;
    }) => {
      const { error } = await supabase
        .from("requirements")
        .update({
          client_name: input.client_name.trim(),
          client_phone: input.client_phone.trim() || null,
          destination: input.destination.trim(),
          goods_description: input.goods_description.trim() || null,
          price_amount: Number(input.price_amount || 0),
        })
        .eq("id", input.id);
      throwIf(error);
    },
    onSuccess: invalidate,
  });
}

/** Manual correction of a visit's status. */
export function useUpdateVisitStatus() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: async (input: { visitId: string; status: string }) => {
      const { error } = await supabase
        .from("truck_visits")
        .update({
          status: input.status,
          departure_date:
            input.status === "delivered" ? new Date().toISOString().slice(0, 10) : null,
        })
        .eq("id", input.visitId);
      throwIf(error);
    },
    onSuccess: invalidate,
  });
}

export function useMatch() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: async (input: { requirementId: string; visitId: string }) => {
      const { error } = await supabase.rpc("match_requirement", {
        p_requirement_id: input.requirementId,
        p_visit_id: input.visitId,
      });
      throwIf(error);
    },
    onSuccess: invalidate,
  });
}

export function useMarkDelivered() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: async (requirementId: string) => {
      const { error } = await supabase.rpc("mark_delivered", {
        p_requirement_id: requirementId,
      });
      throwIf(error);
    },
    onSuccess: invalidate,
  });
}

export function useRateVisit() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: async (input: {
      truckId: string;
      visitId: string;
      rating: number;
      feedback: string;
    }) => {
      const userId = await currentUserId();
      const { error } = await supabase.from("ratings").upsert(
        {
          truck_id: input.truckId,
          visit_id: input.visitId,
          rating_value: input.rating,
          feedback_text: input.feedback.trim() || null,
          rated_by: userId,
        },
        { onConflict: "visit_id" },
      );
      throwIf(error);
    },
    onSuccess: invalidate,
  });
}

export function useDeleteTruck() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: async (truckId: string) => {
      const { error } = await supabase.rpc("delete_truck", { p_truck_id: truckId });
      throwIf(error);
    },
    onSuccess: invalidate,
  });
}

export function useDeleteVisit() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: async (visitId: string) => {
      const { error } = await supabase.rpc("delete_visit", { p_visit_id: visitId });
      throwIf(error);
    },
    onSuccess: invalidate,
  });
}

export function useDeleteRequirement() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: async (requirementId: string) => {
      const { error } = await supabase.rpc("delete_requirement", {
        p_requirement_id: requirementId,
      });
      throwIf(error);
    },
    onSuccess: invalidate,
  });
}
