begin;
\ir helpers.psql
select plan(27);

select tests.create_user('renan');
select tests.create_user('ellen');
select tests.create_user('outro');
select tests.create_user('visita');

select tests.authenticate_as('renan');
select create_space('Família Pinheiro') as sid \gset
select create_invite(:'sid') as tok \gset

-- preview_invite: válido para quem não é membro (com espaços em volta do token)
select tests.authenticate_as('ellen');
select results_eq(
  format('select space_nome, convidado_por, situacao from preview_invite(%L)', E'  ' || :'tok' || E'\n'),
  $$ values ('Família Pinheiro'::text, 'renan'::text, 'valido'::text) $$,
  'preview válido mostra espaço e quem convidou');
select is((select usado_em from invites), null, 'preview não consome o convite');

-- o dono abrindo o próprio link: ja_membro, e accept_invite não consome
select tests.authenticate_as('renan');
select results_eq(
  format('select space_nome, convidado_por, situacao from preview_invite(%L)', :'tok'),
  $$ values ('Família Pinheiro'::text, 'renan'::text, 'ja_membro'::text) $$,
  'preview do dono: ja_membro');
select is(accept_invite(:'tok'), :'sid'::uuid, 'dono abrindo o próprio link recebe o espaço');
select is((select usado_em from invites), null, 'dono abrindo o próprio link não consome');

-- ellen ainda consegue usar o link depois do dono
select tests.authenticate_as('ellen');
select is(accept_invite(:'tok'), :'sid'::uuid, 'ellen aceita depois do dono');
select is((select count(*) from space_members where space_id = :'sid')::int, 2, 'ellen entrou');

-- ellen (agora membro) reabre o mesmo link: ja_membro, sem mudar usado_por
select results_eq(
  format('select situacao from preview_invite(%L)', :'tok'),
  $$ values ('ja_membro'::text) $$,
  'membro reabrindo link usado: ja_membro');
select tests.clear_auth();
select is((select usado_por from invites), tests.uid('ellen'), 'usado_por continua ellen');

-- usado, para outra pessoa
select tests.authenticate_as('outro');
select results_eq(
  format('select space_nome, convidado_por, situacao from preview_invite(%L)', :'tok'),
  $$ values (null::text, null::text, 'usado'::text) $$,
  'preview usado: sem nome do espaço');

-- inexistente
select results_eq(
  $$ select space_nome, convidado_por, situacao from preview_invite('nao-existe') $$,
  $$ values (null::text, null::text, 'invalido'::text) $$,
  'preview inexistente: invalido');
select results_eq(
  $$ select situacao from preview_invite(null) $$,
  $$ values ('invalido'::text) $$,
  'preview com token nulo: invalido');

-- revogado
select tests.authenticate_as('renan');
select create_invite(:'sid') as tokr \gset
select tests.clear_auth();
select id as inv_r from invites where token_hash = encode(extensions.digest(:'tokr', 'sha256'), 'hex') \gset
select tests.authenticate_as('renan');
select revoke_invite(:'inv_r');
select tests.authenticate_as('outro');
select results_eq(
  format('select space_nome, convidado_por, situacao from preview_invite(%L)', :'tokr'),
  $$ values (null::text, null::text, 'invalido'::text) $$,
  'preview revogado: invalido');
select throws_ok(format('select accept_invite(%L)', :'tokr'), 'P0001', 'convite_invalido', 'revogado continua inválido para quem não é membro');
select tests.authenticate_as('ellen');
select results_eq(
  format('select situacao from preview_invite(%L)', :'tokr'),
  $$ values ('ja_membro'::text) $$,
  'membro com link revogado: ja_membro');
select is(accept_invite(:'tokr'), :'sid'::uuid, 'membro com link revogado recebe o espaço');

-- vencido
select tests.authenticate_as('renan');
select create_invite(:'sid') as tokv \gset
select tests.clear_auth();
update invites set expira_em = now() - interval '1 second'
  where token_hash = encode(extensions.digest(:'tokv', 'sha256'), 'hex');
select tests.authenticate_as('outro');
select results_eq(
  format('select space_nome, convidado_por, situacao from preview_invite(%L)', :'tokv'),
  $$ values (null::text, null::text, 'expirado'::text) $$,
  'preview vencido: expirado');
select tests.authenticate_as('ellen');
select is(accept_invite(:'tokv'), :'sid'::uuid, 'membro com link vencido recebe o espaço');
select tests.clear_auth();
select is((select usado_em from invites where token_hash = encode(extensions.digest(:'tokv', 'sha256'), 'hex')),
  null, 'membro com link vencido não consome');

-- já membro com convite novo não consome; outra pessoa usa depois
select tests.authenticate_as('renan');
select create_invite(:'sid') as tok3 \gset
select tests.authenticate_as('ellen');
select is(accept_invite(:'tok3'), :'sid'::uuid, 'já membro: devolve o espaço');
select tests.authenticate_as('visita');
select is(accept_invite(:'tok3'), :'sid'::uuid, 'outra pessoa usa o link que o membro abriu');
select tests.clear_auth();
select is((select usado_por from invites where token_hash = encode(extensions.digest(:'tok3', 'sha256'), 'hex')),
  tests.uid('visita'), 'consumido por quem de fato entrou');

-- permissões e definição
select tests.clear_auth();
set role anon;
select throws_ok($$ select * from preview_invite('x') $$, '42501', null, 'anon não executa preview_invite');
select tests.clear_auth();
select is((select prosecdef from pg_proc where oid = 'public.preview_invite(text)'::regprocedure), true,
  'preview_invite é security definer');
select ok((select proconfig::text like '%search_path=%' from pg_proc where oid = 'public.preview_invite(text)'::regprocedure),
  'preview_invite fixa search_path');

-- FKs criado_por: on delete set null
select is((select confdeltype from pg_constraint
           where conrelid = 'public.spaces'::regclass and contype = 'f'
             and conkey = array[(select attnum from pg_attribute where attrelid = 'public.spaces'::regclass and attname = 'criado_por')]),
  'n'::"char", 'spaces.criado_por on delete set null');
select is((select confdeltype from pg_constraint
           where conrelid = 'public.invites'::regclass and contype = 'f'
             and conkey = array[(select attnum from pg_attribute where attrelid = 'public.invites'::regclass and attname = 'criado_por')]),
  'n'::"char", 'invites.criado_por on delete set null');

select * from finish();
rollback;
