// tools/bootstrap.mjs
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "url";

function sh(cmd, opts = {}) {
  return execSync(cmd, { stdio: "pipe", encoding: "utf-8", ...opts }).trim();
}

// --- paths baseados na localização deste arquivo ---
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, ".."); // raiz do repo
const COMPOSE_FILE = path.join(
  ROOT,
  "01-interface-talent/directus/docker-compose.yml"
);
const SEED_DIR = path.join(ROOT, "01-interface-talent/directus/seed");
const SCHEMA_LOCAL = path.join(SEED_DIR, "schema.sql");
const SEED_LOCAL = path.join(SEED_DIR, "seed.sql");
const IFACE_ENV = path.join(ROOT, "01-interface-talent/interface/.env.local");

// --- config ---
const DIRECTUS_URL = process.env.DIRECTUS_URL || "http://localhost:8055";
const STATIC_TOKEN = process.env.STATIC_TOKEN || "dev-admin-token";
const SEED_ONLY = process.argv.includes("--seed-only");

function composeUp() {
  console.log(">> Subindo docker compose (Directus + Postgres)...");
  sh(`docker compose -f "${COMPOSE_FILE}" up -d --build --remove-orphans`);
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

  if (!fs.existsSync(SCHEMA_LOCAL))
    throw new Error(`schema.sql não encontrado em ${SCHEMA_LOCAL}`);
  if (!fs.existsSync(SEED_LOCAL))
    throw new Error(`seed.sql não encontrado em ${SEED_LOCAL}`);

  // copia para o container do Postgres (leapy_pg) e executa de /tmp
  sh(`docker cp "${SCHEMA_LOCAL}" leapy_pg:/tmp/schema.sql`);
  sh(`docker cp "${SEED_LOCAL}"   leapy_pg:/tmp/seed.sql`);

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
  return json?.data?.access_token;
}

async function createOrReusePAT(jwt) {
  console.log(">> Criando (ou reutilizando) Personal Access Token...");
  const headers = {
    authorization: `Bearer ${jwt}`,
    "content-type": "application/json",
  };

  // tenta listar
  const list = await fetch(`${DIRECTUS_URL}/users/me/tokens`, { headers });
  if (list.ok) {
    const js = await list.json();
    if (Array.isArray(js.data) && js.data.length) {
      return js.data[0].token || js.data[0].access_token || null;
    }
  }

  // cria novo
  const create = await fetch(`${DIRECTUS_URL}/users/me/tokens`, {
    method: "POST",
    headers,
    body: JSON.stringify({ name: "bootstrap", expires_at: null }),
  });
  if (create.ok) {
    const cj = await create.json();
    return cj?.data?.token || null;
  }
  return null;
}

function setStaticTokenViaSQL() {
  console.log(">> Fallback: definindo token estático via SQL...");
  // sem -it (evita "the input device is not a TTY")
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

async function ensureCollectionsViaSchemaApply(token) {
  console.log(">> Registrando collections via /schema/apply (idempotente)...");

  const headersJSON = {
    authorization: `Bearer ${token}`,
    "content-type": "application/json",
  };

  // 1) coleções já registradas
  const colRes = await fetch(`${DIRECTUS_URL}/collections?limit=-1`, {
    headers: { authorization: `Bearer ${token}` },
  });
  if (!colRes.ok) {
    const txt = await colRes.text().catch(() => "");
    throw new Error(`Falha ao listar collections: HTTP ${colRes.status} ${txt}`);
  }
  const colJson = await colRes.json();
  const existingCols = new Set((colJson.data || []).map((c) => c.collection));

  // util p/ checar se "id" já está registrado como field
  async function collectionHasIdField(col) {
    const r = await fetch(`${DIRECTUS_URL}/fields/${col}?limit=-1`, {
      headers: { authorization: `Bearer ${token}` },
    });
    if (!r.ok) return false;
    const js = await r.json();
    return (js.data || []).some((f) => f.field === "id");
  }

  // 2) quais precisamos
  const wanted = [
    { name: "talents", pk: { type: "uuid", auto: false, data_type: "uuid" } },
    { name: "target_roles", pk: { type: "integer", auto: true, data_type: "integer" } },
    { name: "internship_leaders", pk: { type: "integer", auto: true, data_type: "integer" } },
  ];

  const diff = { collections: [], fields: [], relations: [] };

  for (const w of wanted) {
    const col = w.name;

    // 2.a) se a coleção NÃO existe, adiciona diff de criação
    if (!existingCols.has(col)) {
      diff.collections.push({
        collection: col,
        diff: [
          {
            kind: "N",
            rhs: {
              collection: col,
              meta: {
                accountability: "all",
                hidden: false,
                singleton: false,
                collection: col,
              },
              schema: { name: col },
            },
          },
        ],
      });

      // também registra o campo id
      diff.fields.push({
        collection: col,
        field: "id",
        diff: [
          {
            kind: "N",
            rhs: {
              collection: col,
              field: "id",
              type: w.pk.type,
              meta: {
                collection: col,
                field: "id",
                interface: "input",
                hidden: true,
                readonly: true,
                width: "full",
              },
              schema: {
                name: "id",
                table: col,
                data_type: w.pk.data_type,
                is_primary_key: true,
                is_nullable: false,
                has_auto_increment: !!w.pk.auto,
              },
            },
          },
        ],
      });
    } else {
      // 2.b) coleção já existe: só garante o campo id se ainda não estiver registrado
      const hasId = await collectionHasIdField(col);
      if (!hasId) {
        diff.fields.push({
          collection: col,
          field: "id",
          diff: [
            {
              kind: "N",
              rhs: {
                collection: col,
                field: "id",
                type: w.pk.type,
                meta: {
                  collection: col,
                  field: "id",
                  interface: "input",
                  hidden: true,
                  readonly: true,
                  width: "full",
                },
                schema: {
                  name: "id",
                  table: col,
                  data_type: w.pk.data_type,
                  is_primary_key: true,
                  is_nullable: false,
                  has_auto_increment: !!w.pk.auto,
                },
              },
            },
          ],
        });
      }
    }
  }

  // 3) nada a aplicar? ótimo.
  const nothingToDo =
    (diff.collections.length === 0) &&
    (diff.fields.length === 0) &&
    (diff.relations.length === 0);

  if (nothingToDo) {
    console.log("   Coleções já registradas. Nada a fazer.");
    return;
  }

  // 4) aplica o diff
  const applyRes = await fetch(`${DIRECTUS_URL}/schema/apply`, {
    method: "POST",
    headers: headersJSON,
    body: JSON.stringify({
      hash: "seed-bootstrap",
      diff,
    }),
  });

  if (![200, 204].includes(applyRes.status)) {
    const text = await applyRes.text().catch(() => "");
    // se algum create bater em "already exists" por race condition, tratamos como sucesso
    if (applyRes.status === 400 && /already exists/i.test(text)) {
      console.warn("   Aviso: diffs redundantes (já existiam). Prosseguindo.");
      return;
    }
    throw new Error(`Falha ao aplicar schema: HTTP ${applyRes.status} ${text}`);
  }

  console.log("   Collections/fields garantidos com sucesso.");
}

// NEW: garante permissões mínimas (read) para a role do token nas coleções
async function ensureMyRoleReadPermissions(token) {
  console.log(">> Garantindo permissões de leitura da role do token...");

  // 1) descobre a role do usuário dono do token
  const meRes = await fetch(`${DIRECTUS_URL}/users/me`, {
    headers: { authorization: `Bearer ${token}` },
  });
  if (!meRes.ok) {
    const t = await meRes.text().catch(() => "");
    throw new Error(`Não consegui obter /users/me: HTTP ${meRes.status} ${t}`);
  }
  const me = (await meRes.json()).data;
  const roleId = me?.role;
  if (!roleId) throw new Error("Usuário do token não tem role definida.");

  // 2) para cada coleção, assegura uma permissão READ (fields: "*")
  const collections = ["talents", "target_roles", "internship_leaders"];

  for (const col of collections) {
    // já existe uma regra read?
    const qs = new URLSearchParams({
      "filter[role][_eq]": roleId,
      "filter[collection][_eq]": col,
      "filter[action][_eq]": "read",
      limit: "-1",
    }).toString();

    const listRes = await fetch(`${DIRECTUS_URL}/permissions?${qs}`, {
      headers: { authorization: `Bearer ${token}` },
    });

    let exists = false;
    if (listRes.ok) {
      const js = await listRes.json();
      exists = Array.isArray(js.data) && js.data.length > 0;
    }

    if (!exists) {
      // cria regra liberando leitura total (permissions=null e fields="*")
      const createRes = await fetch(`${DIRECTUS_URL}/permissions`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          role: roleId,
          collection: col,
          action: "read",
          permissions: null, // sem filtro => pode ler tudo da coleção
          fields: "*",
        }),
      });

      if (!createRes.ok) {
        const t = await createRes.text().catch(() => "");
        throw new Error(
          `Falha ao criar permissão READ para ${col}: HTTP ${createRes.status} ${t}`
        );
      }
    }
  }

  console.log("   Permissões READ asseguradas para talents/target_roles/internship_leaders.");
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
    `docker exec leapy_pg psql -U postgres -d leapy -tA -c "select count(*) from public.talents where date_deleted is null;"`
  );
  console.log("   talentos vivos:", cnt);
  const r = await fetch(`${DIRECTUS_URL}/items/talents?limit=1&fields=id`, {
    headers: { authorization: `Bearer ${token}` },
  });
  if (!r.ok) throw new Error("Token não conseguiu acessar /items/talents");
}

(async () => {
  console.log(">> docker compose up -d --build (directus)...");
  composeUp();

  console.log(">> Aguardando health do Postgres e Directus...");
  await waitHealth();
  console.log("\n ok");

  await ensureSchemaAndSeed();
  if (SEED_ONLY) {
    console.log("Seed aplicado. Encerrando por --seed-only.");
    process.exit(0);
  }

  // tenta PAT; se falhar, cai no token estático
  let token = null;
  try {
    const jwt = await adminLoginJWT();
    token = await createOrReusePAT(jwt);
  } catch {}
  if (!token) {
    setStaticTokenViaSQL();
    token = STATIC_TOKEN;
  }

  await waitTokenWorks(token);
  await ensureCollectionsViaSchemaApply(token);
  await ensureMyRoleReadPermissions(token);
  writeInterfaceEnv(token);
  await sanity(token);
})().catch((e) => {
  console.error("❌ Erro no bootstrap:", e.message);
  // grava mesmo assim .env.local com token estático p/ rodar a interface
  writeInterfaceEnv(STATIC_TOKEN);
  process.exit(1);
});
