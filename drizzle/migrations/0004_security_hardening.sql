create or replace function public.is_staff(_user_id uuid)
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

revoke all on function public.is_staff(uuid) from public;
revoke all on function public.is_staff(uuid) from anon;
grant execute on function public.is_staff(uuid) to authenticated;
grant execute on function public.is_staff(uuid) to service_role;

drop policy if exists "profiles readable by authenticated" on public.profiles;
create policy "own profile select"
  on public.profiles for select to authenticated
  using (auth.uid() = id);

create or replace function public.prevent_self_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and auth.uid() = old.id then
    raise exception 'You cannot change your own role';
  end if;
  return new;
end;
$$;

revoke all on function public.prevent_self_role_change() from public;
revoke all on function public.prevent_self_role_change() from anon;
revoke all on function public.prevent_self_role_change() from authenticated;

drop trigger if exists profiles_prevent_self_role_change on public.profiles;
create trigger profiles_prevent_self_role_change
  before update on public.profiles
  for each row execute function public.prevent_self_role_change();

drop policy if exists "trucks all authenticated" on public.trucks;
create policy "trucks staff select" on public.trucks for select to authenticated using (public.is_staff(auth.uid()));
create policy "trucks staff insert" on public.trucks for insert to authenticated with check (public.is_staff(auth.uid()));
create policy "trucks staff update" on public.trucks for update to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create policy "trucks staff delete" on public.trucks for delete to authenticated using (public.is_staff(auth.uid()));

drop policy if exists "visits all authenticated" on public.truck_visits;
create policy "visits staff select" on public.truck_visits for select to authenticated using (public.is_staff(auth.uid()));
create policy "visits staff insert" on public.truck_visits for insert to authenticated with check (public.is_staff(auth.uid()));
create policy "visits staff update" on public.truck_visits for update to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create policy "visits staff delete" on public.truck_visits for delete to authenticated using (public.is_staff(auth.uid()));

drop policy if exists "requirements all authenticated" on public.requirements;
create policy "requirements staff select" on public.requirements for select to authenticated using (public.is_staff(auth.uid()));
create policy "requirements staff insert" on public.requirements for insert to authenticated with check (public.is_staff(auth.uid()));
create policy "requirements staff update" on public.requirements for update to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create policy "requirements staff delete" on public.requirements for delete to authenticated using (public.is_staff(auth.uid()));

drop policy if exists "ratings all authenticated" on public.ratings;
create policy "ratings staff select" on public.ratings for select to authenticated using (public.is_staff(auth.uid()));
create policy "ratings staff insert" on public.ratings for insert to authenticated with check (public.is_staff(auth.uid()) and rated_by = auth.uid());
create policy "ratings staff update" on public.ratings for update to authenticated using (public.is_staff(auth.uid()) and rated_by = auth.uid()) with check (rated_by = auth.uid());
create policy "ratings staff delete" on public.ratings for delete to authenticated using (public.is_staff(auth.uid()) and rated_by = auth.uid());

drop policy if exists "driver photos read" on storage.objects;
drop policy if exists "driver photos insert" on storage.objects;
drop policy if exists "driver photos update" on storage.objects;
drop policy if exists "driver photos delete" on storage.objects;

create policy "driver photos staff read" on storage.objects for select to authenticated
  using (bucket_id = 'driver-photos' and public.is_staff(auth.uid()));
create policy "driver photos staff insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'driver-photos' and public.is_staff(auth.uid()) and owner = auth.uid());
create policy "driver photos owner update" on storage.objects for update to authenticated
  using (bucket_id = 'driver-photos' and owner = auth.uid())
  with check (bucket_id = 'driver-photos' and owner = auth.uid());
create policy "driver photos owner delete" on storage.objects for delete to authenticated
  using (bucket_id = 'driver-photos' and owner = auth.uid());

revoke all on function public.handle_new_user() from public;
revoke all on function public.handle_new_user() from anon;
revoke all on function public.handle_new_user() from authenticated;

create or replace function public.match_requirement(p_requirement_id uuid, p_visit_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_status text; r_status text;
begin
  if not public.is_staff(auth.uid()) then raise exception 'Not authorised'; end if;
  select status into v_status from truck_visits where id = p_visit_id for update;
  select status into r_status from requirements where id = p_requirement_id for update;
  if v_status is null or r_status is null then raise exception 'Not found'; end if;
  if v_status <> 'available' then raise exception 'Truck is not available'; end if;
  if r_status <> 'pending' then raise exception 'Requirement is not pending'; end if;

  update truck_visits set status = 'in_transit', requirement_id = p_requirement_id where id = p_visit_id;
  update requirements set status = 'assigned', assigned_visit_id = p_visit_id where id = p_requirement_id;
end; $$;

create or replace function public.mark_delivered(p_requirement_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_id uuid;
begin
  if not public.is_staff(auth.uid()) then raise exception 'Not authorised'; end if;
  select assigned_visit_id into v_id from requirements where id = p_requirement_id for update;
  update requirements set status = 'delivered' where id = p_requirement_id;
  if v_id is not null then
    update truck_visits set status = 'delivered', departure_date = coalesce(departure_date, current_date) where id = v_id;
  end if;
end; $$;

create or replace function public.delete_requirement(p_requirement_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_staff(auth.uid()) then raise exception 'Not authorised'; end if;

  update public.truck_visits
     set requirement_id = null,
         status = case when status = 'delivered' then 'delivered' else 'available' end,
         departure_date = case when status = 'delivered' then departure_date else null end
   where requirement_id = p_requirement_id;

  delete from public.requirements where id = p_requirement_id;
end; $$;

create or replace function public.delete_truck(p_truck_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_staff(auth.uid()) then raise exception 'Not authorised'; end if;

  update public.requirements r
     set status = 'pending',
         assigned_visit_id = null
   where r.assigned_visit_id in (
     select v.id from public.truck_visits v where v.truck_id = p_truck_id
   )
     and r.status <> 'delivered';

  delete from public.trucks where id = p_truck_id;
end; $$;

revoke all on function public.match_requirement(uuid, uuid) from public;
revoke all on function public.match_requirement(uuid, uuid) from anon;
grant execute on function public.match_requirement(uuid, uuid) to authenticated;
grant execute on function public.match_requirement(uuid, uuid) to service_role;

revoke all on function public.mark_delivered(uuid) from public;
revoke all on function public.mark_delivered(uuid) from anon;
grant execute on function public.mark_delivered(uuid) to authenticated;
grant execute on function public.mark_delivered(uuid) to service_role;

revoke all on function public.delete_requirement(uuid) from public;
revoke all on function public.delete_requirement(uuid) from anon;
grant execute on function public.delete_requirement(uuid) to authenticated;
grant execute on function public.delete_requirement(uuid) to service_role;

revoke all on function public.delete_truck(uuid) from public;
revoke all on function public.delete_truck(uuid) from anon;
grant execute on function public.delete_truck(uuid) to authenticated;
grant execute on function public.delete_truck(uuid) to service_role;