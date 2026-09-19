create policy "driver photos read" on storage.objects for select to authenticated using (bucket_id = 'driver-photos');
create policy "driver photos insert" on storage.objects for insert to authenticated with check (bucket_id = 'driver-photos');
create policy "driver photos update" on storage.objects for update to authenticated using (bucket_id = 'driver-photos');
create policy "driver photos delete" on storage.objects for delete to authenticated using (bucket_id = 'driver-photos');