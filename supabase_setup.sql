-- =============================================
-- MOCHILA SOCIOEMOCIONAL - CBTIS 179
-- Setup completo de base de datos
-- Ejecutar en: Supabase SQL Editor
-- =============================================

-- 1. TABLAS
create table if not exists alumnos (
  id uuid default gen_random_uuid() primary key,
  no_control text unique not null,
  nombre text not null,
  pin text not null,
  grupo text default '2A'
);

create table if not exists checkins (
  id uuid default gen_random_uuid() primary key,
  no_control text not null,
  nombre text not null,
  emocion jsonb,
  fecha date not null,
  fecha_hora timestamptz default now(),
  unique(no_control, fecha)
);

create table if not exists evidencias (
  id uuid default gen_random_uuid() primary key,
  no_control text not null,
  nombre text not null,
  actividad_id text not null,
  ambito_id text not null,
  evidencia jsonb,
  created_at timestamptz default now()
);

create table if not exists estado_alumno (
  no_control text primary key,
  xp integer default 0,
  badges jsonb default '[]',
  completadas jsonb default '[]',
  racha integer default 0,
  ultima_actividad date,
  updated_at timestamptz default now()
);

-- 2. RLS
alter table alumnos enable row level security;
alter table checkins enable row level security;
alter table evidencias enable row level security;
alter table estado_alumno enable row level security;

create policy "anon_select_alumnos" on alumnos for select to anon using (true);
create policy "anon_select_checkins" on checkins for select to anon using (true);
create policy "anon_insert_checkins" on checkins for insert to anon with check (true);
create policy "anon_update_checkins" on checkins for update to anon using (true);
create policy "anon_select_evidencias" on evidencias for select to anon using (true);
create policy "anon_insert_evidencias" on evidencias for insert to anon with check (true);
create policy "anon_all_estado" on estado_alumno for all to anon using (true) with check (true);

-- 3. ALUMNOS (51 registros)
insert into alumnos (no_control, nombre, pin) values
('25313051790007', 'ALARCON HURTADO VALERIA', '0007'),
('25313051790019', 'ALDANA NARANJO DULCE JAQUELINE', '0019'),
('25313051790022', 'ALFARO ROMERO DIANA', '0022'),
('25313051790025', 'AVILA RIVERA OSCAR SANTIAGO', '0025'),
('25313051790030', 'BARRAGAN GASCA RICARDO IVAN', '0030'),
('25313051790031', 'CANUL OLEGARIO VALERIA FRANCISCA', '0031'),
('25313051790484', 'CASTILLO GALINDO MARITZA EDITH', '0484'),
('25313051790032', 'CHAVEZ TENORIO WENDY ANEL', '0032'),
('25313051790035', 'CORTEZ HERNANDEZ ITZEL', '0035'),
('25313051790042', 'CRUZ TELLEZ LISSETE MARGARITA', '0042'),
('25313051790052', 'DIAZ LOPEZ SALVADOR', '0052'),
('25313051790058', 'ESPAÑA MADRID JOHANA IRENE', '0058'),
('25313051790159', 'GARCIA AGUIRRE TANIA ABIGAIL', '0159'),
('25313051790122', 'GODINEZ NERY KARINA', '0122'),
('25313051790123', 'GONZALEZ TERRAZAS JOSE MIGUEL', '0123'),
('25313051790124', 'GRESS FLOR ANDY IVAN', '0124'),
('25313051790125', 'GUEVARA OLMEDO MARIA DE LA LUZ', '0125'),
('25313051790126', 'GUTIERREZ FRANCISCO DULCE JENNIFER', '0126'),
('25313051790127', 'HERNANDEZ DIAZ YOSELIN GUADALUPE', '0127'),
('25313051790128', 'HERNANDEZ ELIAS RENATA', '0128'),
('25313051790130', 'ISLAS HERNANDEZ DIEGO', '0130'),
('25313051790131', 'JUAREZ AVILA VALERIA', '0131'),
('25313051790502', 'JUAREZ ORTIZ ZOE AYELEN', '0502'),
('25313051790132', 'LIRA FRANCO CAMILA ABIGAIL', '0132'),
('25313051790133', 'LIRA GOMEZ ORLANDO', '0133'),
('25313051790504', 'LOPEZ AGUILAR ALEXIA', '0504'),
('25313051790134', 'LOPEZ GONZALEZ MITZI NANCY', '0134'),
('25313051790135', 'MEDINA ALFARO BRENDA', '0135'),
('25313051790136', 'MONROY HUERTA BRISA FERNANDA', '0136'),
('25313051790345', 'MORALES CASTILLO ASENETH GUADALUPE', '0345'),
('25313051790137', 'NARANJO PEREZ KEVIN ALEJANDRO', '0137'),
('25313051790138', 'NARANJO TOLENTINO MONICA ITZEL', '0138'),
('25313051790139', 'OCADIZ GUTIERREZ DANIELA', '0139'),
('25313051790140', 'OROZCO SOSA YULI ANDREA', '0140'),
('25313051790141', 'ORTEGA HERNANDEZ ABRIL YAMILE', '0141'),
('25313051790142', 'ORTEGA LICONA CRISTOPHER SALOMON', '0142'),
('25313051790143', 'ORTUNO RODRIGUEZ NEFTALY BETZABETH', '0143'),
('25313051790144', 'ORTUÑO VARGAS ESMERALDA', '0144'),
('25313051790145', 'PALMA FLORES HABACUC', '0145'),
('25313051790146', 'PINEDA HERNANDEZ PAOLA MELINA', '0146'),
('25313051790147', 'RANGEL AMADOR LISBETH', '0147'),
('25313051790149', 'SALAZAR GONZALEZ SHARON ZOE', '0149'),
('25313051790029', 'SAN AGUSTIN SANTOS AZUL ARIADNA', '0029'),
('25313051790150', 'SANCHEZ ORTEGA DANNA PAOLA', '0150'),
('25313051790560', 'SANTOS MONTER MARLEN SARAHI', '0560'),
('25313051790152', 'TAPIA FERNANDEZ NAOMI', '0152'),
('25313051790153', 'TELLEZ MORENO VIANNEY ASTRYD', '0153'),
('25313051790154', 'TORRES ATICPAC ANGEL RAMON', '0154'),
('25313051790155', 'VARGAS ESCONDRIA MARIA GUADALUPE', '0155'),
('25313051790156', 'VARGAS ORDAZ CESAR YAEL', '0156'),
('25313051790158', 'VERTIZ GOMEZ JOANNA', '0158')
on conflict (no_control) do nothing;
