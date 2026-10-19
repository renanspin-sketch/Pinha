begin;
\ir helpers.psql
select plan(16);

select tests.create_user('renan');
select tests.create_user('ellen');
select tests.create_user('estranho');

-- profiles criados pelo trigger
select is((select nome from public.profiles where id = tests.uid('renan')), 'renan', 'trigger cria profile com nome do metadata');

-- RLS ligada em toda tabela public
select is_empty($$ select tablename from pg_tables where schemaname = 'public' and not rowsecurity $$, 'RLS ligada em todas as tabelas public');

-- renan cria espaço
select tests.authenticate_as('renan');
select lives_ok($$ select create_space('Família Pinheiro') $$, 'cria espaço');
select is((select papel from space_members where user_id = auth.uid()), 'dono', 'criador é dono');
select is((select cor_pessoa from space_members where user_id = auth.uid()), 1::smallint, 'cor_pessoa 1');
select is((select count(*) from spaces)::int, 1, 'dono vê o espaço');
select ok(is_owner((select id from spaces limit 1)), 'is_owner verdadeiro para dono');
select lives_ok($$ select update_space((select id from spaces limit 1), 'Casa Pinheiro') $$, 'dono renomeia');
select is((select nome from spaces limit 1), 'Casa Pinheiro', 'nome atualizado');

-- guarda o id do espaço para o estranho tentar
select tests.clear_auth();
create temp table t_ids as select id from public.spaces limit 1;
grant select on t_ids to authenticated;

-- estranho
select tests.authenticate_as('estranho');
select is_empty($$ select * from spaces $$, 'estranho não vê espaço');
select is_empty($$ select * from space_members $$, 'estranho não vê membros');
select is_empty($$ select * from profiles where id = tests.uid('renan') $$, 'estranho não vê profile de quem não divide espaço');
select throws_ok($$ insert into spaces(nome) values ('x') $$, '42501', null, 'insert direto bloqueado');
select throws_ok($$ select update_space((select id from t_ids), 'X') $$, 'sem_permissao', 'estranho não renomeia');
select throws_ok($$ select create_space('   ') $$, '23514', null, 'nome vazio recusado');
select ok(not is_member((select id from t_ids)), 'is_member falso para estranho');

select * from finish();
rollback;
