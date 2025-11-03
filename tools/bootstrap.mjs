// tools/bootstrap.mjs
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

function sh(cmd, opts = {}) {
  return execSync(cmd, { stdio: "pipe", encoding: "utf-8", ...opts }).trim();
}

const COMPOSE_FILE = "01-interface-talent/directus/docker-compose.yml";
const DIRECTUS_URL = process.env.DIRECTUS_URL || "http://localhost:8055";
const STATIC_TOKEN = process.env.STATIC_TOKEN || "dev-admin-token";
const IFACE_ENV = path.resolve("01-interface-talent/interface/.env.local");
const SEED_DIR = path.resolve("01-interface-talent/directus/seed");
const SCHEMA_LOCAL = path.join(SEED_DIR, "schema.sql");
const SEED_LOCAL = path.join(SEED_DIR, "seed.sql");

function composeUp() {
  console.log(">> Subindo docker compose (Directus + Postgres)...");
  // usa -f para evitar depender do cwd
  sh(`docker compose -f ${COMPOSE_FILE} up -d --build`);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function waitHealth() {
  const max = 240;
  for (let i = 0; i < max; i++) {
    try {
      const res = await fetch(`${DIRECTUS_URL}/server/health`);
      if (res.ok) return;
    } catch {}
    await sleep(1000);
  }
  throw new Error("Timeout: Directus não ficou healthy");
}

async function ensureSchemaAndSeed() {
  console.log(">> Aplicando schema.sql + seed.sql via psql...");

  if (!fs.existsSync(SCHEMA_LOCAL)) {
    throw new Error(`schema.sql não encontrado em ${SCHEMA_LOCAL}`);
  }
  if (!fs.existsSync(SEED_LOCAL)) {
    throw new Error(`seed.sql não encontrado em ${SEED_LOCAL}`);
  }

  // 1) copie para dentro do container (em /tmp)
  sh(`docker cp "${SCHEMA_LOCAL}" leapy_pg:/tmp/schema.sql`);
  sh(`docker cp "${SEED_LOCAL}"   leapy_pg:/tmp/seed.sql`);

  // 2) execute dentro do Postgres
  sh(
    `docker exec leapy_pg psql -U postgres -d leapy -v ON_ERROR_STOP=1 -f /tmp/schema.sql`
  );
  sh(
    `docker exec leapy_pg psql -U postgres -d leapy -v ON_ERROR_STOP=1 -f /tmp/seed.sql`
  );
}

async function adminLoginJWT() {
  console.log(">> Login admin no Directus (criando JWT)...");
  const body = { email: "admin@example.com", password: "admin" };
  const res = await fetch(`${DIRECTUS_URL}/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Falha no login admin");
  const json = await res.json();
  return json.data?.access_token;
}

async function createOrReusePAT(jwt) {
  console.log(">> Criando (ou reutilizando) Personal Access Token...");
  // Tenta listar tokens pessoais
  const list = await fetch(`${DIRECTUS_URL}/users/me/tokens`, {
    headers: { authorization: `Bearer ${jwt}` },
  });
  if (list.ok) {
    const js = await list.json();
    if (Array.isArray(js.data) && js.data.length) {
      return js.data[0].token || js.data[0].access_token || null;
    }
    // cria um novo
    const create = await fetch(`${DIRECTUS_URL}/users/me/tokens`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({ name: "bootstrap", expires_at: null }),
    });
    if (create.ok) {
      const cj = await create.json();
      // Algumas versões retornam o token em data.token, outras apenas id
      return cj.data?.token || null;
    }
  }
  return null; // deixa fallback cuidar
}

function setStaticTokenViaSQL() {
  console.log(">> Fallback: definindo token estático via SQL...");

  sh(
    `docker exec leapy_pg psql -U postgres -d leapy -c "update public.directus_users set token='${STATIC_TOKEN}' where email='admin@example.com';"`
  );
}

async function waitTokenWorks(token) {
  for (let i = 0; i < 20; i++) {
    const res = await fetch(`${DIRECTUS_URL}/users/me`, {
      headers: { authorization: `Bearer ${token}` },
    });
    if (res.ok) return;
    await sleep(1000);
  }
  throw new Error("Token ainda não válido depois de retries");
}

async function ensureCollections(token) {
  console.log(">> Registrando collections (se necessário)...");
  const headers = {
    authorization: `Bearer ${token}`,
    "content-type": "application/json",
  };
  const res = await fetch(`${DIRECTUS_URL}/collections`, { headers });
  if (!res.ok) throw new Error("Não consegui listar collections");
  const js = await res.json();
  const have = new Set((js.data || []).map((c) => c.collection));
  const wanted = ["talents", "target_roles", "internship_leaders"];

  for (const col of wanted) {
    if (!have.has(col)) {
      await fetch(`${DIRECTUS_URL}/collections`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          collection: col,
          meta: { hidden: false },
          schema: { name: col }, // registra coleção a partir da tabela existente
        }),
      });
    }
  }
}

function writeInterfaceEnv(token) {
  console.log(">> Gravando interface/.env.local ...");
  const dir = path.dirname(IFACE_ENV);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const content =
    [
      `DIRECTUS_URL=${DIRECTUS_URL}`,
      `DIRECTUS_TOKEN=${token}`,
      `DEFAULT_PAGE_SIZE=10`,
    ].join("\n") + "\n";
  fs.writeFileSync(IFACE_ENV, content);
  console.log("   OK:", IFACE_ENV);
}

async function sanity(token) {
  console.log(">> Sanity checks...");
  const cnt = sh(
    `docker exec leapy_pg psql -U postgres -d leapy -A -c "select count(*) from public.talents where date_deleted is null;"`
  );
  console.log("   talentos vivos:", cnt.trim());
  const r = await fetch(`${DIRECTUS_URL}/items/talents?limit=1&fields=id`, {
    headers: { authorization: `Bearer ${token}` },
  });
  if (!r.ok) throw new Error("Token não conseguiu acessar /items/talents");
}

(async () => {
  console.log(">> docker compose up -d --build (directus)...");
  composeUp();
  // Você já sobe containers antes, então aqui pode ser no-op. Se quiser garantir:
   sh(`docker compose -f ${COMPOSE_FILE} up -d --build --remove-orphans`);
   sh(`docker compose -f 01-interface-talent/directus/docker-compose.yml up -d --build`);

  console.log(">> Aguardando health do Postgres e Directus...");
  await waitHealth();
  console.log("\n ok");

  await ensureSchemaAndSeed();

  // 1) tenta PAT
  let jwt = null,
    token = null;
  try {
    jwt = await adminLoginJWT();
  } catch {}
  if (jwt) token = await createOrReusePAT(jwt);

  // 2) se falhar PAT, usa token estático via SQL
  if (!token) {
    setStaticTokenViaSQL();
    token = STATIC_TOKEN;
  }

  // 3) espera token “pegar”
  await waitTokenWorks(token);

  // 4) garante collections registradas
  await ensureCollections(token);

  // 5) escreve .env.local
  writeInterfaceEnv(token);

  // 6) sanity check
  await sanity(token);

  // Se chegou aqui, tudo ok
})().catch(async (e) => {
  console.error("❌ Erro no bootstrap:", e.message);
  // Ainda assim grava .env.local com o token que temos, para você conseguir rodar o front
  writeInterfaceEnv(STATIC_TOKEN);
  process.exit(1);
});
