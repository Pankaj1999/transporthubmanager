-- profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'employee' check (role in ('owner','employee')),
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "profiles readable by authenticated" on public.profiles for select to authenticated using (true);
create policy "own profile update" on public.profiles for update to authenticated using (auth.uid() = id);
create policy "own profile insert" on public.profiles for insert to authenticated with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.email))
  on conflict (id) do nothing;
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

-- trucks
create table public.trucks (
  id uuid primary key default gen_random_uuid(),
  truck_number text not null unique,
  owner_name text not null,
  owner_phone text,
  driver_name text not null,
  driver_phone text,
  driver_photo_url text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.trucks to authenticated;
grant all on public.trucks to service_role;
alter table public.trucks enable row level security;
create policy "trucks all authenticated" on public.trucks for all to authenticated using (true) with check (true);

-- requirements
create table public.requirements (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  client_phone text,
  destination text not null,
  goods_description text,
  price_amount numeric(12,2) not null default 0,
  status text not null default 'pending' check (status in ('pending','assigned','in_transit','delivered')),
  assigned_visit_id uuid,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.requirements to authenticated;
grant all on public.requirements to service_role;
alter table public.requirements enable row level security;
create policy "requirements all authenticated" on public.requirements for all to authenticated using (true) with check (true);

-- truck_visits
create table public.truck_visits (
  id uuid primary key default gen_random_uuid(),
  truck_id uuid not null references public.trucks(id) on delete cascade,
  arrival_date date not null default current_date,
  departure_date date,
  status text not null default 'available' check (status in ('available','assigned','in_transit','delivered')),
  requirement_id uuid references public.requirements(id) on delete set null,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.truck_visits to authenticated;
grant all on public.truck_visits to service_role;
alter table public.truck_visits enable row level security;
create policy "visits all authenticated" on public.truck_visits for all to authenticated using (true) with check (true);

alter table public.requirements
  add constraint requirements_assigned_visit_fk
  foreign key (assigned_visit_id) references public.truck_visits(id) on delete set null;

-- ratings
create table public.ratings (
  id uuid primary key default gen_random_uuid(),
  truck_id uuid not null references public.trucks(id) on delete cascade,
  visit_id uuid not null references public.truck_visits(id) on delete cascade,
  rating_value int not null check (rating_value between 1 and 5),
  feedback_text text,
  rated_by uuid references auth.users(id),
  rated_at timestamptz not null default now(),
  unique (visit_id)
);
grant select, insert, update, delete on public.ratings to authenticated;
grant all on public.ratings to service_role;
alter table public.ratings enable row level security;
create policy "ratings all authenticated" on public.ratings for all to authenticated using (true) with check (true);

-- atomic match
create or replace function public.match_requirement(p_requirement_id uuid, p_visit_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_status text; r_status text;
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  select status into v_status from truck_visits where id = p_visit_id for update;
  select status into r_status from requirements where id = p_requirement_id for update;
  if v_status is null or r_status is null then raise exception 'Not found'; end if;
  if v_status <> 'available' then raise exception 'Truck is not available'; end if;
  if r_status <> 'pending' then raise exception 'Requirement is not pending'; end if;

  update truck_visits set status = 'in_transit', requirement_id = p_requirement_id where id = p_visit_id;
  update requirements set status = 'assigned', assigned_visit_id = p_visit_id where id = p_requirement_id;
end; $$;
grant execute on function public.match_requirement(uuid, uuid) to authenticated;

-- atomic deliver
create or replace function public.mark_delivered(p_requirement_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  select assigned_visit_id into v_id from requirements where id = p_requirement_id for update;
  update requirements set status = 'delivered' where id = p_requirement_id;
  if v_id is not null then
    update truck_visits set status = 'delivered', departure_date = coalesce(departure_date, current_date) where id = v_id;
  end if;
end; $$;
grant execute on function public.mark_delivered(uuid) to authenticated;