# Make It! — Backend + Web (MVP local) — Design

> Data: 2026-05-26 · Ciclo: **1 de 2** (este = API + Web · próximo = app Flutter)
> Alvo: **MVP funcional local**. Mockups de referência em `docs/mockups/`.

---

## 1. Produto

**Make It!** é um app de **tarefas + rotina**, pessoal e colaborativo. O usuário organiza:

- **Tarefas** com checklist, notas, prazo, tags coloridas e multi-dia
- **Hábitos** recorrentes
- **Meu dia**: agenda da rotina em blocos de horário
- **Calendário**: visão mensal das tarefas planejadas
- **Grupos**: colaboração com tipos de tarefa (livre, delegada, mutirão, ação global)
- **Perfil**: dados e preferências (tema, push, sync, segurança)

Este ciclo entrega a **API Node/Express** e o **cliente Web React**. O app Flutter reusa a mesma API num ciclo posterior.

---

## 2. Objetivos e não-objetivos

### Objetivos (MVP)
- Cadastro/login com JWT
- CRUD de tarefas (todo / hábito / prazo), subtarefas (checklist), tags
- Home "Tarefas de hoje" e "Meu dia" (blocos de rotina)
- Calendário mensal com indicadores (dots) e tarefas do dia
- Grupos: criar, convidar, listar atividades; tarefas em grupo com os 4 tipos
- Perfil + preferências básicas
- Rodar tudo localmente com um comando, com seed que reproduz os mockups

### Não-objetivos (fora deste ciclo)
| Item | Por quê / quando |
|---|---|
| App mobile Flutter | Ciclo 2 |
| Sincronizar calendário do dispositivo | Browser não acessa; vira integração Google Calendar futura |
| 2FA, bloqueio de app | Pós-MVP (telas de Perfil só exibem os toggles) |
| Push notifications | Pós-MVP |
| Anexo de arquivo real | Campo fica como stub (sem upload de binário) |
| Realtime/websocket em grupos | MVP usa refetch (React Query) |
| Tema escuro | Só tema claro no MVP |
| Deploy/CI/infra prod | Goal é local; estrutura não impede deploy depois |

---

## 3. Arquitetura

Monorepo com **npm workspaces**:

```
make-it/
├── package.json                 # workspaces: apps/*, packages/*
├── docker-compose.yml           # postgres:16
├── .env.example
├── apps/
│   ├── api/                     # Node 20 + TS + Express + Knex
│   └── web/                     # React + Vite + TS + Tailwind
├── packages/
│   └── shared/                  # tipos TS do domínio + DTOs + envelope de API
└── docs/
    ├── mockups/                 # PNG/PDF de referência
    └── superpowers/specs/       # este doc
```

`packages/shared` é a fonte única dos tipos do domínio (`Task`, `Group`, enums, envelopes). API e Web importam dele — sem duplicar contrato.

### Stack

| Camada | Tech |
|---|---|
| API | Node 20, TypeScript, Express 4, Knex 3 (migrations + seeds), Zod (validação), bcrypt, jsonwebtoken |
| DB | PostgreSQL 16 (docker-compose) |
| Web | React 18, Vite, TypeScript, Tailwind, React Router, React Query (server state), Zustand (UI/auth state), axios |
| Testes | Vitest + supertest (API), Vitest + React Testing Library (web) |
| Tooling | npm workspaces, ESLint + Prettier, `concurrently` p/ dev |

---

## 4. Modelo de domínio

Decisão central: **uma tabela `tasks` com discriminador `kind`** (todo/hábito/prazo) — compartilham ~90% dos campos. "Meu dia" é entidade separada (`routine_blocks`), pois é agenda por horário, não item de to-do. Calendário é **view derivada** de `tasks`.

Convenções (CLAUDE.md): tabelas `snake_case` plural, FK `{tabela_singular}_id`, `created_at`/`updated_at DEFAULT NOW()`, soft-delete `deleted_at TIMESTAMP NULL`.

```
users
  id              uuid pk
  name            text
  email           text unique
  password_hash   text
  bio             text null            -- "Estudante de Ciência da computação"
  avatar_url      text null
  preferences     jsonb default '{}'   -- { theme, push, cloud_sync }
  created_at, updated_at, deleted_at

labels                                  -- tags coloridas pessoais ("Esposa", "Casa")
  id              uuid pk
  user_id         uuid fk -> users
  name            text
  color           text                  -- hex
  created_at, updated_at, deleted_at

groups
  id              uuid pk
  name            text                  -- "Casa", "Família", "Trabalho", "Eq. desenv."
  icon            text                  -- chave de ícone ou url
  owner_id        uuid fk -> users
  created_at, updated_at, deleted_at

group_members
  id              uuid pk
  group_id        uuid fk -> groups
  user_id         uuid fk -> users
  role            text                  -- 'owner' | 'member'
  created_at
  unique(group_id, user_id)

group_invites
  id              uuid pk
  group_id        uuid fk -> groups
  email           text null
  token           text unique
  status          text                  -- 'pending' | 'accepted' | 'revoked'
  created_at

tasks
  id              uuid pk
  user_id         uuid fk -> users      -- dono/criador
  group_id        uuid fk -> groups null
  label_id        uuid fk -> labels null
  title           text
  notes           text null
  kind            text                  -- 'todo' | 'habit' | 'deadline'
  due_date        date null             -- prazo (badge "Até DD/MM")
  starts_on       date null             -- multi-dia
  ends_on         date null
  recurrence      jsonb null            -- hábito: { freq, days_of_week, ... }
  group_task_type text null             -- 'livre' | 'delegada' | 'mutirao' | 'acao_global'
  status          text default 'open'   -- 'open' | 'done'
  completed_at    timestamptz null
  created_at, updated_at, deleted_at

subtasks                                -- checklist (ex. lista de compras)
  id              uuid pk
  task_id         uuid fk -> tasks
  title           text
  done            boolean default false
  position        int
  created_at, updated_at

task_assignees                          -- colaboradores / tarefa delegada
  id              uuid pk
  task_id         uuid fk -> tasks
  user_id         uuid fk -> users
  unique(task_id, user_id)

routine_blocks                          -- "Meu dia"
  id              uuid pk
  user_id         uuid fk -> users
  label           text                  -- "Trabalho", "Almoço"
  color           text
  start_time      time
  end_time        time null
  weekday_mask    int                   -- bitmask seg..dom; null/0 = todo dia
  created_at, updated_at, deleted_at
```

### Semântica dos tipos de tarefa em grupo (MVP)

| Tipo | Comportamento MVP |
|---|---|
| **Livre** | Qualquer membro pode concluir; sem assignee fixo |
| **Delegada** | 1+ assignees em `task_assignees`; só eles aparecem como responsáveis |
| **Mutirão** | Todos os membros como assignees; conclusão é simples (qualquer um marca como done) |
| **Ação Global** | Aparece para todos os membros como tarefa individual (cada um conclui a sua) |

A semântica avançada de conclusão (ex. "mutirão = done quando N membros concluem", progresso por pessoa em ação global) fica documentada como evolução; no MVP guardamos o tipo + assignees e a UI reflete o rótulo.

---

## 5. API REST

Base `/api/v1`. Envelopes (CLAUDE.md):
- Sucesso: `{ success: true, data, message?, timestamp }`
- Erro: `{ success: false, error: { code, message, details? }, timestamp }`

Auth via header `Authorization: Bearer <jwt>`. Erro handler central + validação Zod por rota.

| Método | Rota | Descrição |
|---|---|---|
| POST | `/auth/register` | nome, email, senha → cria user + retorna JWT |
| POST | `/auth/login` | email, senha → JWT |
| GET | `/auth/me` | usuário do token |
| GET | `/users/me` / PATCH `/users/me` | perfil + bio + avatar |
| PATCH | `/users/me/preferences` | tema, push, cloud_sync |
| GET | `/labels` · POST · PATCH `/:id` · DELETE `/:id` | tags coloridas |
| GET | `/tasks?from&to&kind&group_id&status&label_id` | lista filtrada (Home, Calendário, Grupos) |
| GET | `/tasks/:id` | detalhe + subtasks + assignees |
| POST | `/tasks` | cria (todo/habit/deadline, com subtasks e flags) |
| PATCH | `/tasks/:id` | edita |
| PATCH | `/tasks/:id/complete` | marca/desmarca done |
| DELETE | `/tasks/:id` | soft-delete |
| POST | `/tasks/:id/subtasks` · PATCH `/subtasks/:id` · DELETE `/subtasks/:id` | checklist |
| GET | `/groups` · POST · GET `/:id` · PATCH `/:id` · DELETE `/:id` | grupos |
| GET | `/groups/:id/tasks` | feed "Atividades em grupo" |
| POST | `/groups/:id/invites` · POST `/invites/:token/accept` | convidar / aceitar |
| GET | `/routine-blocks` · POST · PATCH `/:id` · DELETE `/:id` | "Meu dia" |

**Calendário**: o cliente chama `GET /tasks?from=YYYY-MM-01&to=YYYY-MM-31`, agrupa por dia (dots) e filtra o dia selecionado. Sem endpoint dedicado no MVP.

---

## 6. Auth

- Cadastro: valida email único, hash com bcrypt (cost 10), retorna JWT.
- Login: compara hash, retorna JWT.
- JWT: `{ sub: user_id }`, expiração 7d, segredo em `JWT_SECRET` (env). **Sem refresh token no MVP** (single access token); refresh fica como evolução.
- Middleware `requireAuth` injeta `req.user`. Recursos sempre escopados por `user_id`/membership de grupo.
- Senha nunca retornada; respostas usam DTO sem `password_hash`.

---

## 7. Web — estrutura e mapeamento de telas

Estratégia de layout: **espelhar o design mobile** num container responsivo — coluna de largura mobile (~420px) centralizada, com a bottom-nav fixa. É o único design existente; um layout desktop dedicado fica para depois.

```
apps/web/src/
├── main.tsx, App.tsx, routes.tsx
├── api/            # axios client + hooks React Query por recurso (useTasks, useGroups, ...)
├── store/          # zustand: authStore, uiStore
├── pages/
├── components/
├── hooks/
├── lib/            # date, format, helpers
└── styles/         # tailwind base
```

| Rota | Página | Mockup |
|---|---|---|
| `/register`, `/login` | Auth | Tela de cadastro / login |
| `/` | Home (tabs **Tarefas de hoje** / **Meu dia**) | Tela inicial - tarefas / rotina |
| `/calendar` | Calendário (mês + tarefas do dia) | Calendário |
| `/groups` | Grupos (lista + feed) | Grupos |
| `/groups/:id` | Detalhe do grupo | (derivado de Grupos) |
| `/profile` | Perfil + Configurações | Perfil |

**Componentes-chave**: `BottomNav`, `TaskCard` (checkbox, riscado, tag, badge de prazo, expand p/ subtasks), `NewTaskSheet` (Nova tarefa), `ScheduleSheet` (Agendar: Hábito/Prazo + calendário), `RoutineTimeline` (Meu dia), `CalendarMonth` (grid + dots), `GroupCard`, `NewGroupSheet`, `GroupTaskSheet` (4 tipos), `LabelChip`.

Fluxo "Nova tarefa": FAB central abre `NewTaskSheet` (título, notas, toggles Tarefa em grupo / Múltiplos dias) → `ScheduleSheet` (Hábito vs Prazo + datas) → POST `/tasks`.

---

## 8. Tratamento de erros

- API: middleware central converte exceções em envelope de erro com `code` (`VALIDATION_ERROR`, `UNAUTHORIZED`, `NOT_FOUND`, `FORBIDDEN`, `CONFLICT`, `INTERNAL`). Zod → `VALIDATION_ERROR` com `details`.
- Web: interceptor axios trata 401 (logout + redirect `/login`); React Query expõe estados de erro/loading; toasts para falhas de mutação.

---

## 9. Testes (rigor MVP)

| Alvo | Cobertura |
|---|---|
| API services | Unit: conclusão de tarefa, expansão de recorrência (hábito), regras de tipo de tarefa em grupo, escopo por usuário |
| API endpoints | Integração (supertest) contra Postgres de teste: auth, tasks CRUD + filtros, groups + invites |
| Web | Componentes/fluxos chave (TaskCard toggle, NewTaskSheet submit, render de Home a partir de mock de API) |
| E2E | Fora do MVP (Playwright disponível p/ depois) |

DB de teste: schema efêmero no mesmo Postgres do compose (migrate + truncate entre suites).

---

## 10. Dev local

```bash
docker compose up -d            # postgres
cp .env.example .env            # JWT_SECRET, DATABASE_URL, PORT, VITE_API_URL
npm install                     # workspaces
npm run migrate && npm run seed # schema + dados dos mockups
npm run dev                     # api (5001) + web (5173) via concurrently
```

- **Portas**: API `5001`, Web `5173` (alinhado ao CLAUDE.md §7).
- **Seed** reproduz os mockups: usuário "Usuário", tags Esposa/Casa, tarefas ("Levar meu filho a escola", "Compras para a noite do bolo" com checklist), grupos (Casa, Família, Trabalho, Eq. desenv.), blocos de rotina (06:00…, Trabalho 07:10–12:00, Almoço 12:00).

---

## 11. Evoluções (registradas, fora do MVP)

- App Flutter (ciclo 2) consumindo a mesma API
- Integração Google Calendar (substitui "sincronizar dispositivo")
- Realtime em grupos (websocket) + notificações push
- 2FA, bloqueio de app, refresh tokens
- Tema escuro
- Semântica avançada de conclusão (mutirão por quórum, progresso de ação global)
- Upload de anexos (S3 ou storage local)

---

## 12. Decisões em aberto (não-bloqueantes)

Nenhuma bloqueante. Defaults assumidos e vetáveis: Postgres (vs SQLite), npm workspaces (vs pnpm), Zustand (vs Context puro). Trocas não afetam o modelo de domínio nem o contrato de API.
