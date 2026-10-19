-- Pinha · Fase 1 · Convites e gestão de membros
-- No Supabase o pgcrypto vive no schema extensions.
create extension if not exists pgcrypto with schema extensions;

create table public.invites (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.spaces on delete cascade,
  email text,
  token_hash text not null unique,
  criado_por uuid references public.profiles,
  criado_em timestamptz default now(),
  expira_em timestamptz not null,
  usado_em timestamptz,
  usado_por uuid,
  revogado_em timestamptz
);
create index invites_space_idx on public.invites (space_id);

alter table public.invites enable row level security;
revoke all on public.invites from anon;
revoke insert, update, delete, truncate on public.invites from authenticated;

create policy invites_select on public.invites for select to authenticated
  using (public.is_owner(space_id));

-- Cria convite; devolve o token cru (única vez em que ele existe).
create function public.create_invite(p_space uuid, p_email text default null)
returns text
language plpgsql security definer set search_path = public as $$
declare
  v_token text;
begin
  if auth.uid() is null then
    raise exception 'nao_autenticado' using errcode = '28000';
  end if;
  if not public.is_owner(p_space) then
    raise exception 'sem_permissao';
  end if;
  v_token := translate(
    replace(replace(encode(extensions.gen_random_bytes(32), 'base64'), E'\n', ''), '=', ''),
    '+/', '-_');
  insert into public.invites (space_id, email, token_hash, criado_por, expira_em)
  values (p_space, nullif(btrim(p_email), ''),
          encode(extensions.digest(v_token, 'sha256'), 'hex'),
          auth.uid(), now() + interval '7 days');
  return v_token;
end $$;

create function public.revoke_invite(p_invite uuid) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_space uuid;
begin
  select space_id into v_space from public.invites where id = p_invite;
  if v_space is null or not public.is_owner(v_space) then
    raise exception 'sem_permissao';
  end if;
  update public.invites set revogado_em = now()
  where id = p_invite and revogado_em is null;
end $$;

create function public.accept_invite(p_token text) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_inv public.invites%rowtype;
  v_cor smallint;
begin
  if v_uid is null then
    raise exception 'nao_autenticado' using errcode = '28000';
  end if;

  select * into v_inv from public.invites
  where token_hash = encode(extensions.digest(btrim(coalesce(p_token, ''), E' \t\r\n'), 'sha256'), 'hex')
  for update;

  if not found or v_inv.revogado_em is not null then
    raise exception 'convite_invalido';
  end if;

  -- Serializa entradas no mesmo espaço (escolha da cor sem corrida).
  perform 1 from public.spaces where id = v_inv.space_id for update;

  if exists (select 1 from public.space_members
             where space_id = v_inv.space_id and user_id = v_uid) then
    if v_inv.usado_em is null then
      update public.invites set usado_em = now(), usado_por = v_uid where id = v_inv.id;
    end if;
    return v_inv.space_id;
  end if;

  if v_inv.usado_em is not null then
    raise exception 'convite_usado';
  end if;
  if v_inv.expira_em <= now() then
    raise exception 'convite_expirado';
  end if;

  select c into v_cor
  from generate_series(1, 8) as c
  where c not in (select cor_pessoa from public.space_members where space_id = v_inv.space_id)
  order by c limit 1;
  if v_cor is null then
    raise exception 'espaco_cheio';
  end if;

  insert into public.space_members (space_id, user_id, papel, cor_pessoa)
  values (v_inv.space_id, v_uid, 'membro', v_cor);
  update public.invites set usado_em = now(), usado_por = v_uid where id = v_inv.id;
  return v_inv.space_id;
end $$;

create function public.remove_member(p_space uuid, p_user uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_owner(p_space) then
    raise exception 'sem_permissao';
  end if;
  if p_user = auth.uid() then
    raise exception 'dono_nao_pode_sair';
  end if;
  delete from public.space_members where space_id = p_space and user_id = p_user;
end $$;

revoke execute on function public.create_invite(uuid, text), public.revoke_invite(uuid),
  public.accept_invite(text), public.remove_member(uuid, uuid) from public, anon;
grant execute on function public.create_invite(uuid, text), public.revoke_invite(uuid),
  public.accept_invite(text), public.remove_member(uuid, uuid) to authenticated;
