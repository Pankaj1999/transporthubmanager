-- 1. Move the staff check helper out of the API-exposed schema ------------------
create schema if not exists app_private;
grant usage on schema app_private to authenticated, service_role;

create or replace function app_private.is_staff(_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = _user_id and role in ('owner', 'employee')
  );
$$;

revoke all on function app_private.is_staff(uuid) from public;
grant execute on function app_private.is_staff(uuid) to authenticated, service_role;

-- Recreate every policy that referenced public.is_staff
drop policy if exists "trucks staff select" on public.trucks;
drop policy if exists "trucks staff insert" on public.trucks;
drop policy if exists "trucks staff update" on public.trucks;
drop policy if exists "trucks staff delete" on public.trucks;
create policy "trucks staff select" on public.trucks for select to authenticated using (app_private.is_staff(auth.uid()));
create policy "trucks staff insert" on public.trucks for insert to authenticated with check (app_private.is_staff(auth.uid()));
create policy "trucks staff update" on public.trucks for update to authenticated using (app_private.is_staff(auth.uid())) with check (app_private.is_staff(auth.uid()));
create policy "trucks staff delete" on public.trucks for delete to authenticated using (app_private.is_staff(auth.uid()));

drop policy if exists "visits staff select" on public.truck_visits;
drop policy if exists "visits staff insert" on public.truck_visits;
drop policy if exists "visits staff update" on public.truck_visits;
drop policy if exists "visits staff delete" on public.truck_visits;
create policy "visits staff select" on public.truck_visits for select to authenticated using (app_private.is_staff(auth.uid()));
create policy "visits staff insert" on public.truck_visits for insert to authenticated with check (app_private.is_staff(auth.uid()));
create policy "visits staff update" on public.truck_visits for update to authenticated using (app_private.is_staff(auth.uid())) with check (app_private.is_staff(auth.uid()));
create policy "visits staff delete" on public.truck_visits for delete to authenticated using (app_private.is_staff(auth.uid()));

drop policy if exists "requirements staff select" on public.requirements;
drop policy if exists "requirements staff insert" on public.requirements;
drop policy if exists "requirements staff update" on public.requirements;
drop policy if exists "requirements staff delete" on public.requirements;
create policy "requirements staff select" on public.requirements for select to authenticated using (app_private.is_staff(auth.uid()));
create policy "requirements staff insert" on public.requirements for insert to authenticated with check (app_private.is_staff(auth.uid()));
create policy "requirements staff update" on public.requirements for update to authenticated using (app_private.is_staff(auth.uid())) with check (app_private.is_staff(auth.uid()));
create policy "requirements staff delete" on public.requirements for delete to authenticated using (app_private.is_staff(auth.uid()));

drop policy if exists "ratings staff select" on public.ratings;
drop policy if exists "ratings staff insert" on public.ratings;
drop policy if exists "ratings staff update" on public.ratings;
drop policy if exists "ratings staff delete" on public.ratings;
create policy "ratings staff select" on public.ratings for select to authenticated using (app_private.is_staff(auth.uid()));
create policy "ratings staff insert" on public.ratings for insert to authenticated with check (app_private.is_staff(auth.uid()) and rated_by = auth.uid());
create policy "ratings staff update" on public.ratings for update to authenticated using (app_private.is_staff(auth.uid()) and rated_by = auth.uid()) with check (app_private.is_staff(auth.uid()) and rated_by = auth.uid());
create policy "ratings staff delete" on public.ratings for delete to authenticated using (app_private.is_staff(auth.uid()) and rated_by = auth.uid());

drop policy if exists "driver photos staff read" on storage.objects;
drop policy if exists "driver photos staff insert" on storage.objects;
create policy "driver photos staff read" on storage.objects for select to authenticated
  using (bucket_id = 'driver-photos' and app_private.is_staff(auth.uid()));
create policy "driver photos staff insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'driver-photos' and app_private.is_staff(auth.uid()) and owner = auth.uid());

-- 2. RPCs no longer need SECURITY DEFINER: staff already hold RLS write access --
create or replace function public.match_requirement(p_requirement_id uuid, p_visit_id uuid)
returns void language plpgsql security invoker set search_path = public as $$
declare v_status text; r_status text;
begin
  if not app_private.is_staff(auth.uid()) then raise exception 'Not authorised'; end if;
  select status into v_status from truck_visits where id = p_visit_id for update;
  select status into r_status from requirements where id = p_requirement_id for update;
  if v_status is null or r_status is null then raise exception 'Not found'; end if;
  if v_status <> 'available' then raise exception 'Truck is not available'; end if;
  if r_status <> 'pending' then raise exception 'Requirement is not pending'; end if;

  update truck_visits set status = 'in_transit', requirement_id = p_requirement_id where id = p_visit_id;
  update requirements set status = 'assigned', assigned_visit_id = p_visit_id where id = p_requirement_id;
end; $$;

create or replace function public.mark_delivered(p_requirement_id uuid)
returns void language plpgsql security invoker set search_path = public as $$
declare v_id uuid;
begin
  if not app_private.is_staff(auth.uid()) then raise exception 'Not authorised'; end if;
  select assigned_visit_id into v_id from requirements where id = p_requirement_id for update;
  update requirements set status = 'delivered' where id = p_requirement_id;
  if v_id is not null then
    update truck_visits set status = 'delivered', departure_date = coalesce(departure_date, current_date) where id = v_id;
  end if;
end; $$;

create or replace function public.delete_requirement(p_requirement_id uuid)
returns void language plpgsql security invoker set search_path = public as $$
begin
  if not app_private.is_staff(auth.uid()) then raise exception 'Not authorised'; end if;

  update public.truck_visits
     set requirement_id = null,
         status = case when status = 'delivered' then 'delivered' else 'available' end,
         departure_date = case when status = 'delivered' then departure_date else null end
   where requirement_id = p_requirement_id;

  delete from public.requirements where id = p_requirement_id;
end; $$;

create or replace function public.delete_visit(p_visit_id uuid)
returns void language plpgsql security invoker set search_path = public as $$
begin
  if not app_private.is_staff(auth.uid()) then raise exception 'Not authorised'; end if;

  update public.requirements
     set status = 'pending', assigned_visit_id = null
   where assigned_visit_id = p_visit_id;

  delete from public.truck_visits where id = p_visit_id;
end; $$;

create or replace function public.delete_truck(p_truck_id uuid)
returns void language plpgsql security invoker set search_path = public as $$
begin
  if not app_private.is_staff(auth.uid()) then raise exception 'Not authorised'; end if;

  update public.requirements r
     set status = 'pending', assigned_visit_id = null
   where r.assigned_visit_id in (
     select v.id from public.truck_visits v where v.truck_id = p_truck_id
   )
     and r.status <> 'delivered';

  delete from public.trucks where id = p_truck_id;
end; $$;

drop function if exists public.is_staff(uuid);

-- 3. Block self role escalation on profiles -----------------------------------
drop policy if exists "own profile update" on public.profiles;
create policy "own profile update" on public.profiles for update to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);

create or replace function public.prevent_self_role_change()
returns trigger language plpgsql security invoker set search_path = public as $$
begin
  -- Any request carrying a user JWT may never change the role column.
  if new.role is distinct from old.role and auth.uid() is not null then
    raise exception 'Role changes are not permitted';
  end if;
  return new;
end; $$;

drop trigger if exists profiles_prevent_self_role_change on public.profiles;
create trigger profiles_prevent_self_role_change
before update on public.profiles
for each row execute function public.prevent_self_role_change();

-- 4. Ratings: freeze authorship and target, validate value --------------------
create or replace function public.ratings_guard_update()
returns trigger language plpgsql security invoker set search_path = public as $$
begin
  if new.truck_id is distinct from old.truck_id
     or new.visit_id is distinct from old.visit_id
     or new.rated_by is distinct from old.rated_by then
    raise exception 'Rating authorship and target cannot be changed';
  end if;
  if new.rating_value < 1 or new.rating_value > 5 then
    raise exception 'Rating must be between 1 and 5';
  end if;
  new.rated_at := now();
  return new;
end; $$;

drop trigger if exists ratings_guard_update on public.ratings;
create trigger ratings_guard_update
before update on public.ratings
for each row execute function public.ratings_guard_update();

revoke all on function public.prevent_self_role_change() from public, anon, authenticated;
revoke all on function public.ratings_guard_update() from public, anon, authenticated;