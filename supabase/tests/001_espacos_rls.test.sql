begin;
\ir helpers.psql
select plan(30);

select tests.create_user('renan');
select tests.create_user('ellen');
select tests.create_user('estranho');

select is((select nome from public.profiles where id = tests.uid('renan')), 'renan', 'trigger cria profile com nome do metadata');
select is_empty($$ select tablename from pg_tables where schemaname = 'public' and not rowsecurity $$, 'RLS ligada em todas as tabelas public');
select is_empty($$ select t.tablename from pg_tables t where t.schemaname = 'public'
  and not exists (select 1 from pg_policies p where p.schemaname = 'public' and p.tablename = t.tablename) $$,
  'toda tabela public tem ao menos uma policy');

-- renan cria espaço
select tests.authenticate_as('renan');
select lives_ok($$ select create_space('Família Pinheiro') $$, 'cria espaço');
select is((select papel from space_members where user_id = auth.uid()), 'dono', 'criador é dono');
select is((select cor_pessoa from space_members where user_id = auth.uid()), 1::smallint, 'cor_pessoa 1');
select ok(is_owner((select id from spaces limit 1)), 'is_owner verdadeiro para dono');
select lives_ok($$ select update_space((select id from spaces limit 1), 'Casa Pinheiro') $$, 'dono renomeia');
select is((select nome from spaces limit 1), 'Casa Pinheiro', 'nome atualizado');

-- ellen cria o espaço dela
select tests.authenticate_as('ellen');
select lives_ok($$ select create_space('Casa da Ellen') $$, 'ellen cria o próprio espaço');

select tests.clear_auth();
create temp table t_ids as
  select m.user_id, m.space_id from public.space_members m;
grant select on t_ids to authenticated;

-- isolamento: cada dono vê só o que é seu
select tests.authenticate_as('renan');
select is((select count(*) from spaces)::int, 1, 'renan vê exatamente 1 espaço');
select is((select id from spaces), (select space_id from t_ids where user_id = tests.uid('renan')), 'renan vê só o espaço dele');
select is((select count(*) from space_members)::int, 1, 'renan vê só os próprios membros');
select is((select count(*) from profiles)::int, 1, 'renan só vê o próprio profile (sem espaço em comum)');

select tests.authenticate_as('ellen');
select is((select count(*) from spaces)::int, 1, 'ellen vê exatamente 1 espaço');
select is((select id from spaces), (select space_id from t_ids where user_id = tests.uid('ellen')), 'ellen vê só o espaço dela');
select is((select count(*) from space_members)::int, 1, 'ellen vê só os próprios membros');
select is((select count(*) from profiles)::int, 1, 'ellen só vê o próprio profile');

-- ataques de ellen ao espaço do renan
select throws_ok($$ insert into space_members(space_id, user_id, papel, cor_pessoa)
  values ((select space_id from t_ids where user_id = tests.uid('renan')), tests.uid('ellen'), 'dono', 2) $$,
  '42501', null, 'ellen não se insere no espaço do renan');
select throws_ok($$ update spaces set nome = 'invadido' $$, '42501', null, 'update direto em spaces bloqueado');
select throws_ok($$ delete from space_members $$, '42501', null, 'delete direto em space_members bloqueado');
select throws_ok($$ select update_space((select space_id from t_ids where user_id = tests.uid('renan')), 'X') $$,
  'P0001', 'sem_permissao', 'ellen não renomeia espaço do renan');
select lives_ok($$ do $b$ declare n int; begin
  update profiles set nome = 'hack' where id = tests.uid('renan');
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'afetou % linhas', n; end if;
end $b$ $$, 'update do profile de outro afeta 0 linhas');

select tests.clear_auth();
select is((select nome from public.profiles where id = tests.uid('renan')), 'renan', 'nome do renan intacto');

-- estranho
select tests.authenticate_as('estranho');
select is_empty($$ select * from spaces $$, 'estranho não vê espaço');
select is_empty($$ select * from space_members $$, 'estranho não vê membros');
select throws_ok($$ insert into spaces(nome) values ('x') $$, '42501', null, 'insert direto bloqueado');
select throws_ok($$ select create_space('   ') $$, '23514', null, 'nome vazio recusado');
select ok(not is_member((select space_id from t_ids where user_id = tests.uid('renan'))), 'is_member falso para estranho');

-- anon
select tests.clear_auth();
set role anon;
select throws_ok($$ select create_space('x') $$, '42501', null, 'anon não executa create_space');
select tests.clear_auth();

select * from finish();
rollback;
