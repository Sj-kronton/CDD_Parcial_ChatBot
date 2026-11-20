-- Extensiones
create extension if not exists vector schema public;
create extension if not exists pgcrypto;

create schema if not exists unab;

-- Estudiantes
create table unab.estudiantes (
  id_estudiante     text primary key,
  nombre            text not null,
  apellido          text not null,
  email             text,
  programa          text not null default 'Ingeniería de Sistemas',
  semestre_actual   int  not null check (semestre_actual between 1 and 12),
  estado_matricula  text not null default 'activa'
                    check (estado_matricula in ('activa','pendiente_pago','inactiva','graduado')),
  periodo_ingreso   text,
  creado_en         timestamptz default now()
);

-- Cursos (plan de estudios y competencias digitales)
create table unab.cursos (
  codigo         text primary key,
  nombre         text not null,
  creditos       int  not null check (creditos > 0),
  semestre_plan  int,
  tipo           text not null check (tipo in ('plan','competencia_digital')),
  pilar          text
);

-- Prerrequisitos
create table unab.prerrequisitos (
  codigo_curso      text references unab.cursos(codigo),
  codigo_requisito  text references unab.cursos(codigo),
  primary key (codigo_curso, codigo_requisito)
);

-- Inscripciones
create table unab.inscripciones (
  id             bigint generated always as identity primary key,
  id_estudiante  text not null references unab.estudiantes(id_estudiante),
  codigo_curso   text not null references unab.cursos(codigo),
  periodo        text not null,
  nota           numeric(3,2) check (nota between 0 and 5),
  estado         text not null check (estado in ('aprobado','reprobado','cursando')),
  unique (id_estudiante, codigo_curso, periodo)
);

-- Noticias (scraper)
create table unab.noticias (
  id                 bigint generated always as identity primary key,
  titulo             text not null,
  url                text not null unique,
  resumen            text,
  fuente             text,
  fecha_publicacion  date,
  fecha_scrapeo      timestamptz default now()
);

-- Registro de conversaciones
create table unab.conversaciones (
  id             bigint generated always as identity primary key,
  session_id     text,
  id_estudiante  text,
  pregunta       text,
  respuesta      text,
  tipo           text,
  creado_en      timestamptz default now()
);

create index on unab.inscripciones (id_estudiante);
create index on unab.inscripciones (codigo_curso);

-- Vista: estado académico (asume carga típica de 18 créditos por semestre)
create view unab.v_estado_estudiante as
select
  e.id_estudiante, e.nombre, e.apellido, e.programa,
  e.semestre_actual, e.estado_matricula,
  coalesce(sum(c.creditos) filter (where i.estado = 'aprobado' and c.tipo = 'plan'), 0)
    as creditos_aprobados,
  (select sum(creditos) from unab.cursos where tipo = 'plan') as creditos_plan,
  round(100.0 * coalesce(sum(c.creditos) filter (where i.estado = 'aprobado' and c.tipo = 'plan'), 0)
    / nullif((select sum(creditos) from unab.cursos where tipo = 'plan'), 0), 1) as avance_pct,
  round(sum(i.nota * c.creditos) filter (where i.estado in ('aprobado','reprobado') and c.tipo = 'plan')
    / nullif(sum(c.creditos) filter (where i.estado in ('aprobado','reprobado') and c.tipo = 'plan'), 0), 2)
    as promedio_acumulado,
  count(*) filter (where i.estado = 'cursando' and c.tipo = 'plan') as cursos_en_curso,
  ceil(((select sum(creditos) from unab.cursos where tipo = 'plan')
    - coalesce(sum(c.creditos) filter (where i.estado = 'aprobado' and c.tipo = 'plan'), 0)) / 18.0)
    as semestres_restantes
from unab.estudiantes e
left join unab.inscripciones i on i.id_estudiante = e.id_estudiante
left join unab.cursos c on c.codigo = i.codigo_curso
group by e.id_estudiante;

-- Vista: cursos del plan que faltan y si ya cumple prerrequisitos
create view unab.v_cursos_pendientes as
select
  e.id_estudiante, c.codigo, c.nombre, c.creditos, c.semestre_plan,
  not exists (
    select 1 from unab.prerrequisitos p
    where p.codigo_curso = c.codigo
      and not exists (
        select 1 from unab.inscripciones i2
        where i2.id_estudiante = e.id_estudiante
          and i2.codigo_curso = p.codigo_requisito
          and i2.estado = 'aprobado')
  ) as prerrequisitos_cumplidos
from unab.estudiantes e
cross join unab.cursos c
where c.tipo = 'plan'
  and not exists (
    select 1 from unab.inscripciones i
    where i.id_estudiante = e.id_estudiante
      and i.codigo_curso = c.codigo
      and i.estado in ('aprobado','cursando'));