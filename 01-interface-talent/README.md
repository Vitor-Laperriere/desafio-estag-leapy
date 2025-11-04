# Desafio 01 — Interface de Talentos

Construa uma interface com lista de talentos, filtros e paginação usando os dados do Postgres/Directus deste projeto (bônus por usar Next.js).

## Como rodar localmente

### Pré-requisitos
1. Docker e Docker Compose
2. Node.js 18+ (para rodar o script de bootstrap e o Next.js)

### Modo rápido (recomendado)
1. Dentro da pasta do projeto

```bash
npm run bootstrap
```

2. Aguarde o Directus iniciar. O `schema.sql` e `seed.sql` serão aplicados automaticamente (ver compose).

3. Se tudo certo, você verá:

- Postgres + Directus “healthy”

- schema.sql + seed.sql aplicados

- Token configurado e permissões criadas

- Arquivo 01-interface-talent/interface/.env.local gerado

4. Subir o front


```bash
cd 01-interface-talent/interface
```

```bash
npm i
```

```bash
npm run dev
```
### Modo manual (caso falhe o modo rápido)
Use este caminho se o bootstrap falhar por algum motivo.
#### 2.1 Subir o Directus + Postgres
```bash
docker compose -f 01-interface-talent/directus/docker-compose.yml up -d --build --remove-orphans
```
Verifique o health check do Directus:
```bash
curl -s http://localhost:8055/server/health
```
Resultado esperado:
```json
{"status":"ok"}
```
#### 2.2 Aplicar `schema.sql` e `seed.sql`
Para ser cross-platform (funciona bem no Windows/WSL), usamos `docker cp` para enviar os arquivos ao container.
Copie os arquivos para dentro do container do Postgres:
```bash
docker cp 01-interface-talent/directus/seed/schema.sql leapy_pg:/tmp/schema.sql
docker cp 01-interface-talent/directus/seed/seed.sql   leapy_pg:/tmp/seed.sql
```
Execute os scripts no banco:
```bash
docker exec leapy_pg psql -U postgres -d leapy -v ON_ERROR_STOP=1 -f /tmp/schema.sql
docker exec leapy_pg psql -U postgres -d leapy -v ON_ERROR_STOP=1 -f /tmp/seed.sql
```
Confirme se ~5.000 talentos foram carregados:
```bash
docker exec leapy_pg psql -U postgres -d leapy -c "select count(*) from public.talents where date_deleted is null;"
```
#### 2.3 Criar token
Crie um token estático via SQL (simples e rápido):
```bash
docker exec leapy_pg psql -U postgres -d leapy -c \
  "update public.directus_users set token='dev-admin-token' where email='admin@example.com';"
```
Defina o token como variável de ambiente:
```bash
PAT=dev-admin-token
```
Teste o token:
```bash
curl -s -H "Authorization: Bearer $PAT" http://localhost:8055/users/me
```
O retorno deve conter os dados do usuário admin.
Descubra a role associada ao token:
```bash
ROLE_ID=$(curl -s -H "Authorization: Bearer $PAT" http://localhost:8055/users/me | jq -r '.data.role')
```
#### 2.4 Criar permissão read para as coleções
O script abaixo é idempotente e garante permissão de leitura para as três coleções principais:
```bash
for COL in talents target_roles internship_leaders; do
  HAS=$(curl -s -H "Authorization: Bearer $PAT" \
    "http://localhost:8055/permissions?filter[role][_eq]=$ROLE_ID&filter[collection][_eq]=$COL&filter[action][_eq]=read&limit=-1" \
    | jq '.data | length')
  if [ "$HAS" = "0" ]; then
    curl -s -X POST http://localhost:8055/permissions \
      -H "Authorization: Bearer $PAT" -H "content-type: application/json" \
      -d "{\"role\":\"$ROLE_ID\",\"collection\":\"$COL\",\"action\":\"read\",\"permissions\":null,\"fields\":\"*\"}" > /dev/null
  fi
done
```
Teste a leitura:
```bash
curl -s -H "Authorization: Bearer $PAT" "http://localhost:8055/items/talents?limit=1&fields=id"
```
Resultado esperado:
```json
{"data":[{"id":"..."}]}
```
#### 2.5 Criar `.env.local` do front e rodar
```bash
cat > 01-interface-talent/interface/.env.local <<EOF
DIRECTUS_URL=http://localhost:8055
DIRECTUS_TOKEN=$PAT
DEFAULT_PAGE_SIZE=10
EOF
```
```bash
cd 01-interface-talent/interface
npm i
npm run dev
```
Abra `http://localhost:3000`.
## Esquema e Dados
```bash
