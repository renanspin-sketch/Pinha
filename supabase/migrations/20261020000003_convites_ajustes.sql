-- Pinha · Fase 1 · Ajustes de convites
-- 1) preview_invite: mostra o convite antes de aceitar (sem consumir).
-- 2) accept_invite: quem já é membro recebe o espaço sem consumir o convite,
--    mesmo que o link esteja revogado, usado ou vencido.
-- 3) criado_por em spaces e invites não impede excluir a conta de quem criou.

create function public.preview_invite(p_token text)
returns table (space_nome text, convidado_por text, situacao text)
language plpgsql stable security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_inv public.invites%rowtype;
  v_situacao text;
begin
  if v_uid is null then
    raise exception 'nao_autenticado' using errcode = '28000';
  end if;

  select * into v_inv from public.invites
  where token_hash = encode(extensions.digest(btrim(coalesce(p_token, ''), E' \t\r\n'), 'sha256'), 'hex');

  if not found then
    v_situacao := 'invalido';
  elsif exists (select 1 from public.space_members
                where space_id = v_inv.space_id and user_id = v_uid) then
    v_situacao := 'ja_membro';
  elsif v_inv.revogado_em is not null then
    v_situacao := 'invalido';
  elsif v_inv.usado_em is not null then
    v_situacao := 'usado';
  elsif v_inv.expira_em <= now() then
    v_situacao := 'expirado';
  else
    v_situacao := 'valido';
  end if;

  if v_situacao in ('valido', 'ja_membro') then
    return query
      select s.nome, p.nome, v_situacao
      from public.spaces s
      left join public.profiles p on p.id = v_inv.criado_por
      where s.id = v_inv.space_id;
  else
    return query select null::text, null::text, v_situacao;
  end if;
end $$;

create or replace function public.accept_invite(p_token text) returns uuid
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

  if not found then
    raise exception 'convite_invalido';
  end if;

  -- Serializa entradas no mesmo espaço (escolha da cor sem corrida).
  perform 1 from public.spaces where id = v_inv.space_id for update;

  -- Já membro: vai para o espaço sem gastar o convite (vale para link revogado, usado ou vencido).
  if exists (select 1 from public.space_members
             where space_id = v_inv.space_id and user_id = v_uid) then
    return v_inv.space_id;
  end if;

  if v_inv.revogado_em is not null then
    raise exception 'convite_invalido';
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

revoke execute on function public.preview_invite(text) from public, anon;
grant execute on function public.preview_invite(text) to authenticated;
-- create or replace mantém os grants de accept_invite; reafirmados por clareza.
revoke execute on function public.accept_invite(text) from public, anon;
grant execute on function public.accept_invite(text) to authenticated;

alter table public.spaces drop constraint spaces_criado_por_fkey;
alter table public.spaces add constraint spaces_criado_por_fkey
  foreign key (criado_por) references public.profiles on delete set null;

alter table public.invites drop constraint invites_criado_por_fkey;
alter table public.invites add constraint invites_criado_por_fkey
  foreign key (criado_por) references public.profiles on delete set null;
