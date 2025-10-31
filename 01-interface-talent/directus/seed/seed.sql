-- MÍNIMAS MUDANÇAS para o seed funcionar com as FKs

-- 0) garante gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- A) cria 20 usuários de LÍDERES em directus_users (idempotente)
WITH inserted_leaders AS (
  INSERT INTO directus_users (id, email, first_name, last_name, status, password)
  SELECT gen_random_uuid(),
         format('leader%02s@example.com', gs),
         'Leader', gs::text,
         'active',
         'x'
  FROM generate_series(1, 20) AS gs
  ON CONFLICT (email) DO NOTHING
  RETURNING id, email
)
-- B) usa exatamente esses usuários para popular internship_leaders (sem duplicar)
INSERT INTO public.internship_leaders (status, phone_number, user_id, position, department)
SELECT 
  'active',
  '+5511' || LPAD((ROW_NUMBER() OVER (ORDER BY email) + 9000000000)::TEXT, 11, '0'),
  id,
  CASE ((ROW_NUMBER() OVER (ORDER BY email)) % 4)
    WHEN 0 THEN 'Manager'
    WHEN 1 THEN 'Lead'
    WHEN 2 THEN 'Senior'
    ELSE 'Coordinator'
  END,
  CASE ((ROW_NUMBER() OVER (ORDER BY email)) % 5)
    WHEN 0 THEN 'Engineering'
    WHEN 1 THEN 'Design'
    WHEN 2 THEN 'Product'
    WHEN 3 THEN 'Marketing'
    ELSE 'Operations'
  END
FROM inserted_leaders L
WHERE NOT EXISTS (
  SELECT 1 FROM public.internship_leaders il WHERE il.user_id = L.id
);

-- (mantido) cria 10 roles
INSERT INTO public.target_roles (name, description)
SELECT 'Role ' || generate_series, 'Descrição para Role ' || generate_series
FROM generate_series(1, 10)
ON CONFLICT DO NOTHING;

-- C) cria 100 usuários de TALENTOS em directus_users (idempotente)
WITH new_talents AS (
  INSERT INTO directus_users (id, email, first_name, last_name, status, password)
  SELECT gen_random_uuid(),
         format('talent%03s@example.com', gs),
         'Talent', gs::text,
         'active',
         'x'
  FROM generate_series(1, 100) AS gs
  ON CONFLICT (email) DO NOTHING
  RETURNING id, email
),
ntu AS ( -- numera para correlacionar 1..100
  SELECT id AS user_id,
         ROW_NUMBER() OVER (ORDER BY email) AS rn
  FROM new_talents
),
gs AS (
  SELECT generate_series(1, 100) AS rn
)
-- (mantido) INSERE 100 talentos com pequenas trocas:
INSERT INTO public.talents (
  id, date_created, date_updated, user_id, phone_number, start_date, end_date,
  target_role_id, leader_id, department, current_status, orchestrator_state,
  pdi_plan_ready, current_cycle
)
SELECT 
  gen_random_uuid() AS id,
  NOW() - (random() * INTERVAL '90 days')  AS date_created,
  NOW() - (random() * INTERVAL '30 days')  AS date_updated,
  ntu.user_id,                                             -- <=== em vez de gen_random_uuid()
  '+5511' || LPAD((gs.rn + 9900000000)::TEXT, 11, '0')     -- (mantido)
    AS phone_number,
  CURRENT_DATE - (random() * INTERVAL '180 days') AS start_date,
  CURRENT_DATE + (random() * INTERVAL '180 days') AS end_date,
  (SELECT id FROM public.target_roles ORDER BY random() LIMIT 1)        -- <=== id real
    AS target_role_id,
  (SELECT id FROM public.internship_leaders ORDER BY random() LIMIT 1)  -- <=== id real
    AS leader_id,
  CASE (floor(random() * 5))
    WHEN 0 THEN 'Engineering'
    WHEN 1 THEN 'Design'
    WHEN 2 THEN 'Product'
    WHEN 3 THEN 'Marketing'
    ELSE 'Operations'
  END AS department,
  CASE (floor(random() * 4))
    WHEN 0 THEN 'ACTIVE'
    WHEN 1 THEN 'PENDING_FIRST_ACCESS'
    WHEN 2 THEN 'INACTIVE'
    ELSE 'ONBOARDING'
  END AS current_status,
  CASE (floor(random() * 4))
    WHEN 0 THEN 'ACTIVE'
    WHEN 1 THEN 'ONBOARDING'
    WHEN 2 THEN 'PENDING'
    ELSE NULL
  END AS orchestrator_state,
  (random() > 0.5) AS pdi_plan_ready,
  (1 + floor(random() * 3))::INTEGER AS current_cycle
FROM gs
JOIN ntu USING (rn)
ON CONFLICT DO NOTHING;
