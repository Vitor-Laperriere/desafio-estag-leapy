BEGIN;

-- 0) Extensão p/ gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) Aguarda o Directus criar suas system tables (até 120s)
DO $$
DECLARE
  i int := 0;
BEGIN
  WHILE to_regclass('public.directus_users') IS NULL LOOP
    PERFORM pg_sleep(1);
    i := i + 1;
    IF i > 120 THEN
      RAISE EXCEPTION 'Timeout: public.directus_users não existe após 120s. Suba o Directus antes do seed.';
    END IF;
  END LOOP;
END $$;

-- 2) CATALOGO DE ROLES (alvos de PDI) — idempotente por nome, com TODAS as colunas preenchidas
WITH roles(name, description, required_skills, important_skills, success_criteria) AS (
  VALUES
    ('Aprendiz Administrativo', 'Suporte a rotinas de escritório e arquivo',
      '["organização","noções de Excel","redação básica"]',
      '["atenção a detalhes","comunicação"]',
      'Cumpre checklist diário com autonomia crescente'),
    ('Aprendiz de Logística', 'Apoio a recebimento, estoque e expedição',
      '["noções de inventário","endereçamento","coleta de dados"]',
      '["disciplina","trabalho em equipe"]',
      'Realiza contagens e registra divergências corretamente'),
    ('Aprendiz de Atendimento', 'Atendimento básico ao cliente/usuário',
      '["escuta ativa","registro de chamados"]',
      '["empatia","clareza verbal"]',
      'Mantém NPS interno satisfatório'),
    ('Aprendiz de TI (Suporte)', 'Suporte nível 1 (periféricos, contas, senhas)',
      '["noções de SO","instalação simples","documentação"]',
      '["curiosidade técnica","organização"]',
      'Fecha chamados L1 dentro do SLA'),
    ('Aprendiz Financeiro', 'Lançamentos, organização de documentos e conciliações simples',
      '["noções de planilhas","arquivamento"]',
      '["sigilo","atenção a detalhes"]',
      'Concilia caixas de baixa complexidade'),
    ('Aprendiz de RH', 'Apoio a cadastros, ponto e documentação',
      '["arquivamento","planilhas"]',
      '["confidencialidade","cordialidade"]',
      'Mantém dossiês completos e organizados'),
    ('Aprendiz de Marketing', 'Apoio em peças simples e publicações',
      '["noções de redes sociais","copy básica"]',
      '["criatividade","consistência"]',
      'Executa calendário de posts com qualidade'),
    ('Aprendiz de Operações', 'Rotinas operacionais da área fim',
      '["checklist de processo","registro de ocorrências"]',
      '["compromisso com processo","trabalho em equipe"]',
      'Aponta e sugere melhorias de fluxo'),
    ('Auxiliar de Almoxarifado', 'Entrada e saída de materiais',
      '["endereçamento","coleta por lista"]',
      '["organização","agilidade"]',
      'Zera divergências simples de estoque'),
    ('Auxiliar de Escritório', 'Suporte geral administrativo',
      '["documentação","e-mail","agenda"]',
      '["proatividade","clareza escrita"]',
      'Mantém fluxo de documentos sem atrasos'),
    ('Assistente de Vendas (Jr.)', 'Pré-venda e organização de leads',
      '["cadastro CRM","pesquisa básica"]',
      '["comunicação","resiliência"]',
      'Gera X oportunidades qualificadas/semana'),
    ('Assistente de Produção (Jr.)', 'Apoio em linha de produção',
      '["controle básico","checklist de qualidade"]',
      '["atenção","segurança"]',
      'Cumpre metas de qualidade e ritmo')
)
INSERT INTO public.target_roles (
  name, description,
  date_created, date_updated, date_deleted,
  important_skills, success_criteria,
  talent_id, required_skills, talent_current_skills, match
)
SELECT
  r.name,
  r.description,
  NOW() - (random() * INTERVAL '120 days') AS date_created,
  NOW() - (random() * INTERVAL '30 days')  AS date_updated,
  NULL::timestamptz                         AS date_deleted,
  r.important_skills::json,
  r.success_criteria,
  NULL::uuid                                AS talent_id,            -- catálogo!
  r.required_skills::json,
  NULL::json                                AS talent_current_skills,
  0::real                                   AS match
FROM roles r
WHERE NOT EXISTS (SELECT 1 FROM public.target_roles tr WHERE tr.name = r.name);

-- 3) LÍDERES
-- 3.1) cria 20 users (idempotente por e-mail)
WITH RECURSIVE seq AS (SELECT 1 AS n UNION ALL SELECT n+1 FROM seq WHERE n < 20),
names AS (
  SELECT
    n,
    (ARRAY['Ana','Bruno','Carla','Diego','Eduarda','Fábio','Gabriela','Heitor','Isabela','João','Kamila','Lucas','Mariana','Nicolas','Olívia','Paulo','Queila','Rafael','Sofia','Thiago'])[(n % 20)+1] AS first_name,
    (ARRAY['Silva','Souza','Oliveira','Santos','Pereira','Lima','Carvalho','Almeida','Costa','Gomes','Ribeiro','Martins','Rocha','Barbosa','Dias','Teixeira','Fernandes','Araujo','Castro','Moreira'])[(n % 20)+1] AS last_name
  FROM seq
),
to_insert AS (
  SELECT gen_random_uuid() AS id,
         format('leader%02s@seed.local', n) AS email,
         first_name, last_name
  FROM names
)
INSERT INTO public.directus_users (id, email, first_name, last_name, status, password)
SELECT id, email, first_name, last_name, 'active', 'x'
FROM to_insert ti
WHERE NOT EXISTS (SELECT 1 FROM public.directus_users u WHERE u.email = ti.email);

-- 3.2) cria registros em internship_leaders p/ esses users (idempotente por user_id)
WITH lu AS (
  SELECT id, email, ROW_NUMBER() OVER (ORDER BY email) AS rn
  FROM public.directus_users
  WHERE email LIKE 'leader%@seed.local'
)
INSERT INTO public.internship_leaders (status, phone_number, user_id, position, department)
SELECT
  'active',
  '+55119' || LPAD(rn::text, 8, '0'),
  id,
  (CASE (rn % 4) WHEN 1 THEN 'Lead' WHEN 2 THEN 'Senior' WHEN 3 THEN 'Coordinator' ELSE 'Manager' END),
  (CASE (rn % 5) WHEN 1 THEN 'Engineering' WHEN 2 THEN 'Design' WHEN 3 THEN 'Product' WHEN 4 THEN 'Marketing' ELSE 'Operations' END)
FROM lu
WHERE NOT EXISTS (SELECT 1 FROM public.internship_leaders il WHERE il.user_id = lu.id);

-- 4) TALENTOS (5.000)
-- 4.1) cria 5.000 users (idempotente por e-mail)
WITH RECURSIVE seq AS (SELECT 1 AS n UNION ALL SELECT n+1 FROM seq WHERE n < 5000),
firsts AS (
  SELECT
    n,
    (ARRAY['Arthur','Bianca','Caio','Daniela','Enzo','Fernanda','Gustavo','Helena','Igor','Júlia','Kauan','Larissa','Miguel','Nathalia','Otávio','Pietra','Ruan','Sabrina','Tales','Vitória'])[(n % 20)+1] AS first_name,
    (ARRAY['Alves','Batista','Cardoso','Duarte','Esteves','Faria','Garcia','Henrique','Ibrahim','Jardim','Klein','Leite','Macedo','Nunes','Ortega','Pacheco','Queiroz','Rezende','Sales','Vieira'])[(n % 20)+1] AS last_name
  FROM seq
),
to_insert AS (
  SELECT gen_random_uuid() AS id,
         format('talent%05s@seed.local', n) AS email,
         first_name, last_name
  FROM firsts
)
INSERT INTO public.directus_users (id, email, first_name, last_name, status, password)
SELECT id, email, first_name, last_name, 'active', 'x'
FROM to_insert ti
WHERE NOT EXISTS (SELECT 1 FROM public.directus_users u WHERE u.email = ti.email);

-- 4.2) INSERE/ATUALIZA talents (variação garantida por linha via aritmética modular)
WITH
  talent_users AS (
    SELECT u.id AS user_id,
           u.email,
           ROW_NUMBER() OVER (ORDER BY u.email) AS rn
    FROM public.directus_users u
    WHERE u.email LIKE 'talent%@seed.local'
    ORDER BY u.email
    LIMIT 5000
  ),
  courses AS (
    SELECT ARRAY[
      'Ensino Médio – 1º ano',
      'Ensino Médio – 2º ano',
      'Ensino Médio – 3º ano',
      'Curso Técnico em Administração',
      'Curso Técnico em Informática',
      'Curso Técnico em Logística',
      'Curso Técnico em Produção'
    ] AS arr
  ),
  schools AS (
    SELECT ARRAY[
      'EE Estadual João XXIII',
      'Colégio Municipal Vila Nova',
      'SENAI Unidade Brás',
      'SENAI Unidade Santo André',
      'SENAC Lapa',
      'IFSP (Técnico Integrado)',
      'EE Estadual Carlos Drummond'
    ] AS arr
  ),
  leaders_rows AS (
    SELECT il.id AS leader_id,
           il.department,
           ROW_NUMBER() OVER (ORDER BY il.id) AS rn
    FROM public.internship_leaders il
  ),
  leaders_tot AS (
    SELECT COUNT(*)::int AS n FROM public.internship_leaders
  ),
  roles_rows AS (
    SELECT tr.id AS role_id,
           ROW_NUMBER() OVER (ORDER BY tr.id) AS rn
    FROM public.target_roles tr
  ),
  roles_tot AS (
    SELECT COUNT(*)::int AS n FROM public.target_roles
  ),
  ins AS (
    INSERT INTO public.talents (
      id, date_created, date_updated, date_deleted,
      user_id, phone_number,
      start_date, end_date,
      graduation_course, graduation_institution,
      target_role_id, leader_id, department,
      current_status, last_status_change_at, verified_phone_number,
      orchestrator_state, reset_count, last_reset_at,
      pdi_plan_ready, current_cycle, current_cycle_id
    )
    SELECT
      gen_random_uuid() AS id,
      NOW() - ((tu.rn % 90) || ' days')::interval AS date_created,
      NOW() - ((tu.rn % 30) || ' days')::interval AS date_updated,
      NULL::timestamp,
      tu.user_id,
      '+55119' || LPAD(tu.rn::text, 8, '0') AS phone_number,
      (CURRENT_DATE - ((tu.rn * 3) % 181) * INTERVAL '1 day')::timestamp AS start_date,
      (
        (CURRENT_DATE - ((tu.rn * 3) % 181) * INTERVAL '1 day')
        + ((30 + ((tu.rn * 7) % 181)) * INTERVAL '1 day')
      )::timestamp AS end_date,
      (SELECT arr[ ((tu.rn * 13 + 5) % array_length(arr,1)) + 1 ] FROM courses) AS graduation_course,
      (SELECT arr[ ((tu.rn * 17 + 3) % array_length(arr,1)) + 1 ] FROM schools) AS graduation_institution,
      rr.role_id      AS target_role_id,
      lr.leader_id    AS leader_id,
      lr.department   AS department,
      CASE
        WHEN (tu.rn % 20) < 11 THEN 'ONBOARDING'
        WHEN (tu.rn % 20) < 17 THEN 'ACTIVE'
        WHEN (tu.rn % 20) < 19 THEN 'PENDING_FIRST_ACCESS'
        ELSE 'INACTIVE'
      END AS current_status,
      NOW() - ((tu.rn % 45) || ' days')::interval AS last_status_change_at,
      CASE WHEN (tu.rn % 3) = 0
           THEN '+55119' || LPAD(tu.rn::text, 8, '0')
           ELSE NULL
      END AS verified_phone_number,
      CASE
        WHEN (tu.rn % 10) < 5 THEN 'ONBOARDING'
        WHEN (tu.rn % 10) < 8 THEN 'ACTIVE'
        WHEN (tu.rn % 10) < 9 THEN 'PENDING'
        ELSE NULL
      END AS orchestrator_state,
      CASE WHEN (tu.rn % 5) = 0 THEN 1 + (tu.rn % 3) ELSE 0 END AS reset_count,
      CASE WHEN (tu.rn % 5) = 0 THEN NOW() - ((tu.rn % 60) || ' days')::interval ELSE NULL END AS last_reset_at,
      ((tu.rn % 4) = 0) AS pdi_plan_ready,
      (tu.rn % 3) + 1   AS current_cycle,  -- 1..3
      CASE WHEN (tu.rn % 10) = 0 THEN gen_random_uuid() ELSE NULL END AS current_cycle_id
    FROM talent_users tu
    JOIN leaders_tot lt ON TRUE
    JOIN leaders_rows lr
      ON lr.rn = ((tu.rn * 31 + 7) % lt.n) + 1
    JOIN roles_tot rt  ON TRUE
    JOIN roles_rows rr
      ON rr.rn = ((tu.rn * 19 + 11) % rt.n) + 1
    ON CONFLICT (user_id) DO UPDATE SET
      phone_number            = EXCLUDED.phone_number,
      date_updated            = NOW(),
      start_date              = EXCLUDED.start_date,
      end_date                = EXCLUDED.end_date,
      graduation_course       = EXCLUDED.graduation_course,
      graduation_institution  = EXCLUDED.graduation_institution,
      target_role_id          = EXCLUDED.target_role_id,
      leader_id               = EXCLUDED.leader_id,
      department              = EXCLUDED.department,
      current_status          = EXCLUDED.current_status,
      last_status_change_at   = EXCLUDED.last_status_change_at,
      verified_phone_number   = EXCLUDED.verified_phone_number,
      orchestrator_state      = EXCLUDED.orchestrator_state,
      reset_count             = EXCLUDED.reset_count,
      last_reset_at           = EXCLUDED.last_reset_at,
      pdi_plan_ready          = EXCLUDED.pdi_plan_ready,
      current_cycle           = EXCLUDED.current_cycle,
      current_cycle_id        = EXCLUDED.current_cycle_id
    RETURNING 1
)
SELECT COUNT(*) AS inserted_or_updated FROM ins;

-- 5) Alvos de PDI por TALENTO (personalizados) + cálculo de match
WITH
  t AS (
    SELECT id AS talent_id, department
    FROM public.talents
    WHERE date_deleted IS NULL
  ),
  base AS (
    SELECT
      t.talent_id,
      t.department,
      br.id                AS base_role_id,
      br.name,
      br.description,
      br.required_skills,   -- json
      br.important_skills,  -- json
      br.success_criteria
    FROM t
    JOIN LATERAL (
      SELECT id, name, description, required_skills, important_skills, success_criteria
      FROM public.target_roles
      WHERE talent_id IS NULL                      -- só catálogo
      ORDER BY random()
      LIMIT 1
    ) br ON TRUE
  ),
  skills AS (
    SELECT
      b.talent_id,
      json_agg(s.skill) AS current_skills
    FROM base b
    CROSS JOIN LATERAL (
      SELECT skill
      FROM unnest(
        CASE b.department
          WHEN 'Engineering' THEN ARRAY[
            'noções de SO','instalação simples','documentação',
            'curiosidade técnica','hardware básico','planilhas','organização'
          ]
          WHEN 'Design' THEN ARRAY[
            'criatividade','copy básica','consistência',
            'atenção a detalhes','comunicação','organização'
          ]
          WHEN 'Product' THEN ARRAY[
            'comunicação','organização','pesquisa básica',
            'documentação','planilhas','priorização'
          ]
          WHEN 'Marketing' THEN ARRAY[
            'redes sociais','copy básica','criatividade',
            'comunicação','consistência','organização'
          ]
          ELSE ARRAY[
            'endereçamento','coleta por lista','checklist de processo',
            'trabalho em equipe','organização','disciplina'
          ]
        END
      ) AS skill
      ORDER BY random()
      LIMIT 3 + (random() * 3)::int  -- 3..6
    ) s
    GROUP BY b.talent_id
  ),
  matches AS (
    SELECT
      b.talent_id,
      ROUND(
        COALESCE((
          SELECT COUNT(*)::numeric
          FROM jsonb_array_elements_text(s.current_skills::jsonb) cur
          WHERE cur.value IN (
            SELECT value FROM jsonb_array_elements_text(b.required_skills::jsonb)
          )
        ) / GREATEST(1, jsonb_array_length(b.required_skills::jsonb))::numeric, 0)
      , 2) AS match_score
    FROM base b
    JOIN skills s USING (talent_id)
  ),
  ins AS (
    INSERT INTO public.target_roles (
      name, description,
      date_created, date_updated, date_deleted,
      important_skills, success_criteria,
      talent_id, required_skills, talent_current_skills, match
    )
    SELECT
      b.name,
      b.description,
      NOW() - (random() * INTERVAL '60 days') AS date_created,
      NOW() - (random() * INTERVAL '15 days') AS date_updated,
      CASE WHEN random() < 0.03
        THEN NOW() - (random() * INTERVAL '20 days') ELSE NULL END AS date_deleted,
      b.important_skills,
      b.success_criteria,
      b.talent_id,
      b.required_skills,
      s.current_skills,
      m.match_score::real
    FROM base b
    JOIN skills  s ON s.talent_id = b.talent_id
    JOIN matches m ON m.talent_id = b.talent_id
    WHERE NOT EXISTS (
      SELECT 1 FROM public.target_roles tr WHERE tr.talent_id = b.talent_id
    )
    RETURNING id AS role_id, talent_id
  )
UPDATE public.talents t
SET target_role_id = i.role_id,
    pdi_plan_ready = COALESCE(t.pdi_plan_ready, (random() < 0.35))
FROM ins i
WHERE t.id = i.talent_id;

-- 6) (Opcional, mas recomendado) Garante 1:1 entre target_roles.talent_id e talents.id
--    OBS: se já existirem duplicidades antigas, este comando pode falhar.
CREATE UNIQUE INDEX IF NOT EXISTS uq_target_roles_talent
  ON public.target_roles (talent_id)
  WHERE talent_id IS NOT NULL;

COMMIT;
