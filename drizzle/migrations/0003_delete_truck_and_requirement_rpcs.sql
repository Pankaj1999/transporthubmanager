-- Safe deletion helpers: keep visits/requirements consistent, no orphan references.

create or replace function public.delete_requirement(p_requirement_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  -- Free any visit that was tied to this requirement.
  update public.truck_visits
     set requirement_id = null,
         status = case when status = 'delivered' then 'delivered' else 'available' end,
         departure_date = case when status = 'delivered' then departure_date else null end
   where requirement_id = p_requirement_id;

  delete from public.requirements where id = p_requirement_id;
end;
$$;

create or replace function public.delete_truck(p_truck_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  -- Requirements attached to this truck's visits go back to the pending pool.
  update public.requirements r
     set status = 'pending',
         assigned_visit_id = null
   where r.assigned_visit_id in (
     select v.id from public.truck_visits v where v.truck_id = p_truck_id
   )
     and r.status <> 'delivered';

  -- Visits and ratings cascade from the truck row.
  delete from public.trucks where id = p_truck_id;
end;
$$;

grant execute on function public.delete_requirement(uuid) to authenticated;
grant execute on function public.delete_truck(uuid) to authenticated;