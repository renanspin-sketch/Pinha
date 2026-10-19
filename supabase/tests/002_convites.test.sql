begin;
\ir helpers.psql
select plan(26);

select tests.create_user('renan');
select tests.create_user('ellen');
select tests.create_user('outro');
select tests.create_user('estranho');

select tests.authenticate_as('renan');
select create_space('Família Pinheiro') as sid \gset
select create_invite(:'sid') as tok \gset
select ok(length(:'tok') >= 43 and :'tok' ~ '^[A-Za-z0-9_-]+$', 'token base64url de 32 bytes');
select is((select count(*) from invites)::int, 1, 'dono vê o convite');
select is((select expira_em > now() + interval '6 days 23 hours' and expira_em <= now() + interval '7 days' from invites),
  true, 'convite vale 7 dias');

select tests.clear_auth();
select is((select token_hash from invites), encode(extensions.digest(:'tok', 'sha256'), 'hex'), 'guarda só o hash SHA-256');
select isnt((select token_hash from invites), :'tok', 'token cru não é guardado');

-- ellen aceita (com espaços e quebra de linha em volta)
select tests.authenticate_as('ellen');
select is(accept_invite(E'  ' || :'tok' || E'\n'), :'sid'::uuid, 'aceita com espaços em volta');
select is((select papel from space_members where user_id = auth.uid()), 'membro', 'entra como membro');
select is((select cor_pessoa from space_members where user_id = auth.uid()), 2::smallint, 'menor cor livre (2)');
select is(accept_invite(:'tok'), :'sid'::uuid, 'já membro reusando o mesmo convite: sem erro');
select tests.authenticate_as('outro');
select throws_ok(format('select accept_invite(%L)', :'tok'), 'P0001', 'convite_usado', 'convite de uso único para outro usuário');
select tests.authenticate_as('ellen');
select throws_ok($$ select create_invite((select id from spaces limit 1)) $$, 'P0001', 'sem_permissao', 'membro não convida');
select throws_ok($$ select accept_invite('nao-existe') $$, 'P0001', 'convite_invalido', 'token inexistente');

-- membro não revoga nem remove
select tests.authenticate_as('renan');
select create_invite(:'sid', 'x@y.com') as tokr \gset
select tests.clear_auth();
select id as inv_id from invites where token_hash = encode(extensions.digest(:'tokr', 'sha256'), 'hex') \gset
select tests.authenticate_as('ellen');
select throws_ok(format('select revoke_invite(%L)', :'inv_id'), 'P0001', 'sem_permissao', 'membro não revoga');
select throws_ok(format('select remove_member(%L, %L)', :'sid', tests.uid('renan')), 'P0001', 'sem_permissao', 'membro não remove');

-- revogado
select tests.authenticate_as('renan');
select lives_ok(format('select revoke_invite(%L)', :'inv_id'), 'dono revoga');
select tests.authenticate_as('outro');
select throws_ok(format('select accept_invite(%L)', :'tokr'), 'P0001', 'convite_invalido', 'revogado é inválido');

-- vencido
select tests.authenticate_as('renan');
select create_invite(:'sid') as tok2 \gset
select tests.clear_auth();
update invites set expira_em = now() - interval '1 second'
  where token_hash = encode(extensions.digest(:'tok2', 'sha256'), 'hex');
select tests.authenticate_as('outro');
select throws_ok(format('select accept_invite(%L)', :'tok2'), 'P0001', 'convite_expirado', 'vencido');

-- já membro aceitando de novo
select tests.authenticate_as('renan');
select create_invite(:'sid') as tok3 \gset
select tests.authenticate_as('ellen');
select is(accept_invite(:'tok3'), :'sid'::uuid, 'já membro: sem erro');
select is((select count(*) from space_members where user_id = auth.uid())::int, 1, 'sem duplicar');

-- estranho
select tests.authenticate_as('estranho');
select is_empty($$ select * from invites $$, 'estranho não lê convites');
select throws_ok($$ insert into invites(space_id, token_hash, expira_em)
  values (gen_random_uuid(), 'x', now()) $$, '42501', null, 'insert direto bloqueado');

-- remoção
select tests.authenticate_as('renan');
select throws_ok(format('select remove_member(%L, auth.uid())', :'sid'), 'P0001', 'dono_nao_pode_sair', 'dono não sai');
select lives_ok(format('select remove_member(%L, %L)', :'sid', tests.uid('estranho')), 'remover não-membro é no-op');
select lives_ok(format('select remove_member(%L, %L)', :'sid', tests.uid('ellen')), 'dono remove ellen');
select tests.authenticate_as('ellen');
select is_empty($$ select * from spaces $$, 'removida não vê mais o espaço');

-- anon
select tests.clear_auth();
set role anon;
select throws_ok($$ select accept_invite('x') $$, '42501', null, 'anon não executa accept_invite');
select tests.clear_auth();

select * from finish();
rollback;
