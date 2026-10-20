-- Pinha · Fase 1 · Espaços, membros e RLS

create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  nome text not null,
  apelido text,
  foto_url text,
  criado_em timestamptz default now()
);

create table public.spaces (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (length(trim(nome)) between 1 and 60),
  moeda text not null default 'BRL',
  fuso text not null default 'America/Sao_Paulo',
  criado_por uuid references public.profiles,
  criado_em timestamptz default now()
);

create table public.space_members (
  space_id uuid references public.spaces on delete cascade,
  user_id uuid references public.profiles on delete cascade,
  papel text not null check (papel in ('dono', 'membro')),
  cor_pessoa smallint not null check (cor_pessoa between 1 and 8),
  entrou_em timestamptz default now(),
  primary key (space_id, user_id)
);
create index space_members_user_idx on public.space_members (user_id);

alter table public.profiles enable row level security;
alter table public.spaces enable row level security;
alter table public.space_members enable row level security;

-- Escrita direta só onde há policy: spaces e space_members só pelas funções.
revoke insert, update, delete, truncate on public.spaces from anon, authenticated;
revoke insert, update, delete, truncate on public.space_members from anon, authenticated;
revoke insert, delete, truncate on public.profiles from anon, authenticated;
revoke all on public.profiles, public.spaces, public.space_members from anon;

-- Profile automático ao criar usuário
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, nome)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1))
  );
  return new;
end $$;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Funções de pertencimento
create function public.is_member(p_space uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.space_members
    where space_id = p_space and user_id = auth.uid()
  )
$$;

create function public.is_owner(p_space uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.space_members
    where space_id = p_space and user_id = auth.uid() and papel = 'dono'
  )
$$;

create function public.create_space(p_nome text, p_fuso text default 'America/Sao_Paulo')
returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_id uuid;
begin
  if v_uid is null then
    raise exception 'nao_autenticado' using errcode = '28000';
  end if;
  insert into public.spaces (nome, fuso, criado_por)
  values (p_nome, coalesce(p_fuso, 'America/Sao_Paulo'), v_uid)
  returning id into v_id;
  insert into public.space_members (space_id, user_id, papel, cor_pessoa)
  values (v_id, v_uid, 'dono', 1);
  return v_id;
end $$;

create function public.update_space(p_space uuid, p_nome text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_owner(p_space) then
    raise exception 'sem_permissao';
  end if;
  update public.spaces set nome = p_nome where id = p_space;
end $$;

revoke execute on function public.is_member(uuid), public.is_owner(uuid),
  public.create_space(text, text), public.update_space(uuid, text)
  from public, anon;
grant execute on function public.is_member(uuid), public.is_owner(uuid),
  public.create_space(text, text), public.update_space(uuid, text)
  to authenticated;

-- Policies
create policy profiles_select on public.profiles for select to authenticated
  using (
    id = auth.uid()
    or exists (
      select 1 from public.space_members m
      where m.user_id = profiles.id and public.is_member(m.space_id)
    )
  );
create policy profiles_update on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

create policy spaces_select on public.spaces for select to authenticated
  using (public.is_member(id));

create policy space_members_select on public.space_members for select to authenticated
  using (public.is_member(space_id));
