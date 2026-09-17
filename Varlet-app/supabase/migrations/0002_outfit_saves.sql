-- Lets consumers save outfit inspiration to their wishlist (parallel to wishlists/shop_follows).

create table outfit_saves (
  user_id uuid not null references profiles (id) on delete cascade,
  outfit_id uuid not null references outfits (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, outfit_id)
);

alter table outfit_saves enable row level security;

create policy "outfit_saves_own_all" on outfit_saves for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function sync_outfit_saved_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update outfits set saved_count = saved_count + 1 where id = new.outfit_id;
  elsif tg_op = 'DELETE' then
    update outfits set saved_count = greatest(saved_count - 1, 0) where id = old.outfit_id;
  end if;
  return null;
end;
$$;

create trigger outfit_saves_count
  after insert or delete on outfit_saves
  for each row execute function sync_outfit_saved_count();
