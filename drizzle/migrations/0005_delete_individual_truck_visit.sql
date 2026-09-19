create or replace function public.delete_visit(p_visit_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_staff(auth.uid()) then
    raise exception 'Not authorised';
  end if;

  update public.requirements
     set status = 'pending',
         assigned_visit_id = null
   where assigned_visit_id = p_visit_id;

  delete from public.truck_visits
   where id = p_visit_id;
end;
$$;

revoke all on function public.delete_visit(uuid) from public;
revoke all on function public.delete_visit(uuid) from anon;
grant execute on function public.delete_visit(uuid) to authenticated;
grant execute on function public.delete_visit(uuid) to service_role;