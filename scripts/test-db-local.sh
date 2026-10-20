#!/usr/bin/env bash
# Testes de banco locais: cluster Postgres temporário + shim do Supabase + pgTAP.
# Uso: npm run test:db   (no CI, usar `supabase test db`)
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PGBIN="${PGBIN:-$(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | sort -V | tail -1)}"
PORT="${PGTEST_PORT:-54329}"
DB=pinha_test

if [ "$(id -u)" -eq 0 ]; then RUN=(sudo -u postgres env "PATH=$PGBIN:$PATH"); else RUN=(env "PATH=$PGBIN:$PATH"); fi

TMP="$(mktemp -d /tmp/pinha-pgtest.XXXXXX)"
chmod 755 "$TMP"
[ "$(id -u)" -eq 0 ] && chown postgres "$TMP"
DATA="$TMP/data"
SOCK="$TMP"

cleanup() {
  "${RUN[@]}" pg_ctl -D "$DATA" -m immediate stop >/dev/null 2>&1 || true
  rm -rf "$TMP"
}
trap cleanup EXIT

psql_() { "${RUN[@]}" psql -X -q -h "$SOCK" -p "$PORT" -U postgres -v ON_ERROR_STOP=1 "$@"; }

"${RUN[@]}" initdb -D "$DATA" -U postgres -A trust >/dev/null || { echo "initdb falhou"; exit 1; }
"${RUN[@]}" pg_ctl -D "$DATA" -w -l "$TMP/log" \
  -o "-p $PORT -k $SOCK -c listen_addresses=''" start >/dev/null || { cat "$TMP/log"; exit 1; }
psql_ -d postgres -c "create database $DB" || exit 1

# arquivos precisam ser legíveis pelo usuário postgres
STAGE="$TMP/src"; mkdir -p "$STAGE"
cp -r "$ROOT/supabase/migrations" "$ROOT/supabase/tests" "$STAGE/"
chmod -R a+rX "$STAGE"

echo "==> shim do Supabase"
psql_ -d "$DB" -f "$ROOT/scripts/db-shim.sql" || exit 1

echo "==> migrations"
shopt -s nullglob
MIGS=("$STAGE"/migrations/*.sql)
[ "${#MIGS[@]}" -gt 0 ] || { echo "nenhuma migration encontrada"; exit 1; }
for f in "${MIGS[@]}"; do
  echo "  $(basename "$f")"
  psql_ -d "$DB" -f "$f" || { echo "FALHA na migration $f"; exit 1; }
done

echo "==> testes pgTAP"
FAIL=0; FILES=0
for t in "$STAGE"/tests/*.test.sql; do
  FILES=$((FILES+1))
  out="$(cd "$STAGE/tests" && "${RUN[@]}" psql -X -A -t -h "$SOCK" -p "$PORT" -U postgres -d "$DB" -v ON_ERROR_STOP=1 -f "$t" 2>&1)"
  rc=$?
  echo "--- $(basename "$t")"
  echo "$out"
  if [ $rc -ne 0 ] || echo "$out" | grep -Eq '^not ok|^# Looks like|^# Failed|^# No plan|^# Planned'; then
    FAIL=$((FAIL+1))
  fi
done

echo
if [ "$FILES" -eq 0 ]; then echo "RESULTADO: nenhum teste encontrado"; exit 1; fi
if [ "$FAIL" -ne 0 ]; then echo "RESULTADO: FALHOU ($FAIL de $FILES arquivos)"; exit 1; fi
echo "RESULTADO: OK ($FILES arquivos)"
