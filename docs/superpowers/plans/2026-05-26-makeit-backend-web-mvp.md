# Make It! — Backend + Web (MVP local) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar a API Node/Express + cliente Web React do Make It! rodando localmente (MVP), com seed que reproduz os mockups.

**Architecture:** Monorepo npm workspaces — `apps/api` (Express + Knex), `apps/web` (React + Vite), `packages/shared` (tipos/contratos). DB **SQLite** por padrão (zero infra; Docker está off), Postgres via perfil de env. Auth JWT. Tipos do domínio compartilhados via `packages/shared`.

**Tech Stack:** Node 24, TypeScript, Express 4, Knex 3 (better-sqlite3 / pg), Zod, bcryptjs, jsonwebtoken, Vitest + supertest; React 18, Vite, Tailwind, React Router, React Query, Zustand, axios.

Spec: `docs/superpowers/specs/2026-05-26-makeit-backend-web-design.md`. Mockups: `docs/mockups/`.

---

## File Structure

```
make-it/
├── package.json                      # workspaces, scripts raiz
├── tsconfig.base.json
├── .env.example                      # JWT_SECRET, DB_CLIENT, DATABASE_URL, PORT, VITE_API_URL
├── docker-compose.yml                # postgres (opcional)
├── packages/shared/
│   ├── package.json
│   └── src/
│       ├── index.ts
│       ├── enums.ts                  # TaskKind, GroupTaskType, GroupRole, InviteStatus
│       ├── domain.ts                 # User, Label, Group, Task, Subtask, RoutineBlock, ...
│       ├── dto.ts                    # Create/Update DTOs por recurso
│       └── api.ts                    # ApiSuccess<T>, ApiError, ApiResponse<T>
├── apps/api/
│   ├── package.json
│   ├── tsconfig.json
│   ├── knexfile.ts
│   ├── vitest.config.ts
│   └── src/
│       ├── config/{env.ts,db.ts}
│       ├── migrations/20260526_init.ts
│       ├── seeds/01_demo.ts
│       ├── utils/{response.ts,errors.ts,uuid.ts,password.ts,jwt.ts}
│       ├── middlewares/{auth.ts,validate.ts,error.ts}
│       ├── repositories/{users,labels,tasks,subtasks,groups,routineBlocks}.repo.ts
│       ├── services/{auth,users,labels,tasks,groups,routineBlocks}.service.ts
│       ├── controllers/*.controller.ts
│       ├── routes/{index.ts,*.routes.ts}
│       ├── app.ts                    # monta express (testável)
│       ├── server.ts                 # listen
│       └── __tests__/*.test.ts
└── apps/web/
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── tailwind.config.js, postcss.config.js
    ├── index.html
    └── src/
        ├── main.tsx, App.tsx, routes.tsx
        ├── styles/index.css
        ├── lib/{date.ts,format.ts}
        ├── api/{client.ts, auth.ts, tasks.ts, groups.ts, labels.ts, routineBlocks.ts, users.ts}
        ├── store/{auth.ts, ui.ts}
        ├── components/{BottomNav,TaskCard,NewTaskSheet,ScheduleSheet,RoutineTimeline,CalendarMonth,GroupCard,NewGroupSheet,GroupTaskSheet,LabelChip,Sheet,Avatar}.tsx
        └── pages/{Login,Register,Home,Calendar,Groups,GroupDetail,Profile}.tsx
```

**Boundaries:** repositories = só Knex; services = regra de negócio + escopo por usuário; controllers = HTTP↔service; envelope de resposta centralizado. Web: `api/*` = fetch + React Query hooks; `pages/*` = composição; `components/*` = UI reutilizável.

---

## Phase 0 — Monorepo scaffold

### Task 0.1: Root workspace + tooling
**Files:** Create `package.json`, `tsconfig.base.json`, `.env.example`, `docker-compose.yml`

- [ ] Root `package.json` com `"workspaces": ["packages/*","apps/*"]`, `"private": true`, scripts:
  `dev` (concurrently `-n api,web` os dois dev), `build`, `migrate`, `seed`, `test`, `lint`.
- [ ] `tsconfig.base.json`: target ES2022, module NodeNext, strict, `paths` p/ `@makeit/shared`.
- [ ] `.env.example`: `PORT=5001`, `JWT_SECRET=dev-secret-change-me`, `DB_CLIENT=sqlite3`, `DATABASE_FILE=./make-it.sqlite`, `DATABASE_URL=postgres://...`, `VITE_API_URL=http://localhost:5001/api/v1`.
- [ ] `docker-compose.yml`: serviço `db` postgres:16 (opcional; documentado).
- [ ] Commit: `chore: monorepo scaffold (npm workspaces + tooling)`

---

## Phase 1 — packages/shared (contratos)

### Task 1.1: Enums + domínio + DTO + envelope
**Files:** Create `packages/shared/{package.json,src/index.ts,src/enums.ts,src/domain.ts,src/dto.ts,src/api.ts}`

- [ ] `enums.ts`: `TaskKind = 'todo'|'habit'|'deadline'`; `GroupTaskType='livre'|'delegada'|'mutirao'|'acao_global'`; `GroupRole='owner'|'member'`; `InviteStatus='pending'|'accepted'|'revoked'`; `TaskStatus='open'|'done'`.
- [ ] `domain.ts`: interfaces `User` (sem password_hash), `Label`, `Group`, `GroupMember`, `Task` (com `subtasks?: Subtask[]`, `assignees?: string[]`), `Subtask`, `RoutineBlock`. Datas como `string` (ISO).
- [ ] `dto.ts`: `RegisterDTO`, `LoginDTO`, `CreateTaskDTO`, `UpdateTaskDTO`, `CreateGroupDTO`, `CreateInviteDTO`, `CreateRoutineBlockDTO`, `CreateLabelDTO`, `UpdatePreferencesDTO`.
- [ ] `api.ts`: `ApiSuccess<T>={success:true;data:T;message?:string;timestamp:string}`, `ApiError={success:false;error:{code:string;message:string;details?:unknown};timestamp:string}`, `ApiResponse<T>=ApiSuccess<T>|ApiError`.
- [ ] `index.ts` re-exporta tudo. `package.json` name `@makeit/shared`, `main`/`types` apontando src (consumido via TS paths).
- [ ] Commit: `feat(shared): domain types, DTOs, API envelope`

---

## Phase 2 — API foundation

### Task 2.1: Config, db, utils, middlewares, app
**Files:** Create `apps/api/{package.json,tsconfig.json,knexfile.ts,vitest.config.ts}` + `src/config/*`, `src/utils/*`, `src/middlewares/*`, `src/app.ts`, `src/server.ts`

- [ ] `package.json` deps: express, knex, better-sqlite3, pg, zod, bcryptjs, jsonwebtoken, cors; dev: typescript, tsx, vitest, supertest, @types/*. Scripts: `dev` (tsx watch server.ts), `build`, `migrate`/`seed` (knex), `test` (vitest).
- [ ] `config/env.ts`: lê e valida env com Zod (PORT, JWT_SECRET, DB_CLIENT, DATABASE_FILE, DATABASE_URL).
- [ ] `config/db.ts` + `knexfile.ts`: Knex configurado por `DB_CLIENT`; sqlite usa `DATABASE_FILE` + `useNullAsDefault`; pg usa `DATABASE_URL`. **Migrations portáveis** (uuid app-side, `table.timestamps(true,true)`, `table.json()` p/ jsonb).
- [ ] `utils/uuid.ts` (`crypto.randomUUID`), `utils/password.ts` (bcrypt hash/compare), `utils/jwt.ts` (sign/verify `{sub}` 7d), `utils/errors.ts` (`AppError` com `code`+`status`), `utils/response.ts` (`ok(res,data,msg?)`, envelope sucesso).
- [ ] `middlewares/error.ts`: converte `AppError`/`ZodError`/genérico no envelope de erro (codes: VALIDATION_ERROR 400, UNAUTHORIZED 401, FORBIDDEN 403, NOT_FOUND 404, CONFLICT 409, INTERNAL 500).
- [ ] `middlewares/validate.ts`: factory `validate(schema, 'body'|'query'|'params')` com Zod.
- [ ] `middlewares/auth.ts`: `requireAuth` lê Bearer, verifica JWT, injeta `req.user={id}`.
- [ ] `app.ts`: cria express, cors, json, monta `/api/v1` router, health `GET /api/v1/health`, error middleware por último. `server.ts`: `app.listen(env.PORT)`.
- [ ] **Test** `__tests__/health.test.ts` (supertest): `GET /api/v1/health` → 200 `{success:true}`.
- [ ] Commit: `feat(api): foundation (config, db, middlewares, app)`

### Task 2.2: Migrations + seed
**Files:** Create `apps/api/src/migrations/20260526_init.ts`, `src/seeds/01_demo.ts`

- [ ] Migration cria todas as tabelas do §4 do spec (users, labels, groups, group_members, group_invites, tasks, subtasks, task_assignees, routine_blocks) com FKs, uniques e `deleted_at` onde aplicável. Portável sqlite/pg.
- [ ] Seed (idempotente: limpa e recria) reproduzindo mockups:
  - user `Usuário` (email `usuario@makeit.dev`, senha `makeit123`, bio "Estudante de Ciência da computação").
  - labels: Esposa (#A78BFA), Casa (#A78BFA).
  - tasks de hoje: "Levar meu filho a escola" (done, label Esposa), "Verificar o progresso das equipes", "Enviar relatório de vendas" (done, deadline 09/09), "Compras para a noite do bolo" (label Casa) com subtasks (Farinha de trigo[done], ovos, leite integral[done], leite desnatado[done], refrigerante, manteiga, açúcar[done], bolacha, cacau em pó), "Beber pelo menos 3L de água" (habit), "Entrar em contato com o diretor" (deadline 20/09), "Enviar relatório de filiais" (deadline 11/09).
  - groups: Casa, Família, Trabalho, Eq. desenv. (+ membership do user).
  - group tasks: "Protótipo do Make IT!", "Desenvolvimento do jogo da..." (Eq. desenv.), "Daily scrum" (Trabalho), "Noite do BOLO!!!" (Casa).
  - routine_blocks: 06:00 "Seu dia começa aqui", 06:45 "Saída ao trabalho / Deixar filho na escola", 07:10–12:00 "Trabalho", 12:00 "Almoço".
- [ ] **Test** `__tests__/seed.test.ts`: roda migrate+seed em sqlite temp → conta linhas esperadas.
- [ ] Commit: `feat(api): schema migration + demo seed (mockups)`

---

## Phase 3 — API auth

### Task 3.1: Auth service/controller/routes + tests
**Files:** Create `repositories/users.repo.ts`, `services/auth.service.ts`, `controllers/auth.controller.ts`, `routes/auth.routes.ts`; modify `routes/index.ts`; Test `__tests__/auth.test.ts`

- [ ] `users.repo`: `findByEmail`, `findById`, `create`, `update`, `toDTO` (remove password_hash).
- [ ] `auth.service`: `register(RegisterDTO)` (email único→CONFLICT, hash, cria, retorna `{user,token}`), `login(LoginDTO)` (compara→UNAUTHORIZED, token), `me(id)`.
- [ ] Zod schemas p/ register/login em `validate`.
- [ ] Routes: `POST /auth/register`, `POST /auth/login`, `GET /auth/me` (requireAuth).
- [ ] **Tests** (supertest, sqlite temp migrate+rollback): register feliz→201+token+sem hash; email duplicado→409; login senha errada→401; `/auth/me` sem token→401; com token→200.
- [ ] Commit: `feat(api): auth (register/login/me) + tests`

---

## Phase 4 — API tasks, subtasks, labels

### Task 4.1: Labels CRUD
**Files:** `repositories/labels.repo.ts`, `services/labels.service.ts`, `controllers/labels.controller.ts`, `routes/labels.routes.ts`; Test `__tests__/labels.test.ts`
- [ ] CRUD escopado por `user_id`; soft-delete. Tests: criar, listar (só do user), update, delete.
- [ ] Commit: `feat(api): labels CRUD + tests`

### Task 4.2: Tasks + subtasks
**Files:** `repositories/{tasks,subtasks}.repo.ts`, `services/tasks.service.ts`, `controllers/tasks.controller.ts`, `routes/tasks.routes.ts`; Test `__tests__/tasks.test.ts`
- [ ] `tasks.service`: `list(userId, filters{from,to,kind,group_id,status,label_id})`, `get` (com subtasks+assignees, valida posse/membership), `create(CreateTaskDTO)` (cria task + subtasks aninhadas + assignees), `update`, `complete(id, done)` (seta status/completed_at), `softDelete`.
- [ ] Subtasks: `addSubtask`, `updateSubtask`, `deleteSubtask`.
- [ ] Filtro de data: `from`/`to` aplicado a `due_date` OU `starts_on..ends_on` (tarefa aparece no range).
- [ ] **Tests**: criar todo simples; criar com subtasks e listar com elas; `complete` alterna status; filtro `from/to` retorna só do range; filtro `kind=habit`; usuário não vê task de outro (NOT_FOUND/403).
- [ ] Commit: `feat(api): tasks + subtasks (CRUD, complete, filtros) + tests`

---

## Phase 5 — API groups, invites, routine-blocks

### Task 5.1: Groups + members + invites
**Files:** `repositories/groups.repo.ts`, `services/groups.service.ts`, `controllers/groups.controller.ts`, `routes/groups.routes.ts`; Test `__tests__/groups.test.ts`
- [ ] `create` (owner vira member role=owner), `list` (grupos onde é membro), `get`/`update`/`softDelete` (só owner edita/apaga), `listTasks(groupId)` (feed; valida membership), `createInvite(groupId,email?)` (gera token), `acceptInvite(token, userId)` (cria membership, marca accepted).
- [ ] **Tests**: criar grupo→owner é membro; listar só grupos do user; não-membro não vê tasks→403; convite gera token; aceitar convite adiciona membership.
- [ ] Commit: `feat(api): groups + members + invites + tests`

### Task 5.2: Routine blocks (Meu dia)
**Files:** `repositories/routineBlocks.repo.ts`, `services/routineBlocks.service.ts`, `controllers/routineBlocks.controller.ts`, `routes/routineBlocks.routes.ts`; Test `__tests__/routineBlocks.test.ts`
- [ ] CRUD escopado por user, ordenado por `start_time`. Tests: criar, listar ordenado, update, delete.
- [ ] Commit: `feat(api): routine blocks (Meu dia) + tests`

### Task 5.3: Users/preferences
**Files:** `services/users.service.ts`, `controllers/users.controller.ts`, `routes/users.routes.ts`; Test `__tests__/users.test.ts`
- [ ] `GET/PATCH /users/me`, `PATCH /users/me/preferences` (merge em `preferences` jsonb). Tests: patch bio; patch preferences faz merge.
- [ ] Commit: `feat(api): users profile + preferences + tests`

---

## Phase 6 — Web foundation

### Task 6.1: Vite + Tailwind + router + client + stores + layout
**Files:** `apps/web/{package.json,tsconfig.json,vite.config.ts,tailwind.config.js,postcss.config.js,index.html}`, `src/{main.tsx,App.tsx,routes.tsx}`, `src/styles/index.css`, `src/api/client.ts`, `src/store/{auth.ts,ui.ts}`, `src/components/{BottomNav.tsx,Sheet.tsx}`, `src/lib/{date.ts,format.ts}`
- [ ] Vite React-TS + Tailwind. Container app: `max-w-[440px] mx-auto min-h-screen` (espelha mobile), bottom-nav fixa.
- [ ] `api/client.ts`: axios baseURL `VITE_API_URL`, injeta `Authorization` do authStore, interceptor 401→logout+redirect.
- [ ] `store/auth.ts` (zustand + persist localStorage): `token`, `user`, `login`, `logout`. `store/ui.ts`: estado de sheets abertos.
- [ ] `routes.tsx` + React Query provider: rotas privadas (redirect p/ /login sem token) e públicas.
- [ ] `BottomNav`: 5 itens (Home/sol, Calendário, FAB +, Grupos, Perfil) com ícones (lucide-react).
- [ ] `Sheet`: bottom-sheet reutilizável (overlay + slide-up).
- [ ] **Test** `src/__tests__/smoke.test.tsx`: render App sem token → redireciona/mostra Login.
- [ ] Commit: `feat(web): foundation (vite, tailwind, router, client, stores, layout)`

---

## Phase 7 — Web auth

### Task 7.1: Login + Register
**Files:** `src/api/auth.ts`, `src/pages/{Login,Register}.tsx`; Test `src/__tests__/auth.test.tsx`
- [ ] Branding "Make it!" + gradiente, campos (nome só no register), botão "Make IT!", link alternar. On success grava no authStore e navega `/`.
- [ ] **Test**: submit register chama API (mock) e seta token.
- [ ] Commit: `feat(web): login + register`

---

## Phase 8 — Web Home (Tarefas de hoje + Meu dia)

### Task 8.1: TaskCard + LabelChip + hooks tasks
**Files:** `src/api/{tasks.ts,labels.ts}`, `src/components/{TaskCard,LabelChip}.tsx`; Test `src/__tests__/TaskCard.test.tsx`
- [ ] React Query hooks: `useTasks(filters)`, `useToggleTask`, `useCreateTask`. `TaskCard`: checkbox (toggle complete), título riscado quando done, `LabelChip` colorido, badge prazo "Até DD/MM" (cor por urgência), chevron expand → subtasks (checklist riscável).
- [ ] **Test**: clicar checkbox chama toggle; done risca título; card com subtasks expande.
- [ ] Commit: `feat(web): TaskCard + label chip + task hooks`

### Task 8.2: Home page (tabs) + RoutineTimeline
**Files:** `src/pages/Home.tsx`, `src/components/RoutineTimeline.tsx`, `src/api/routineBlocks.ts`
- [ ] Header "Bom dia, {nome}!" + data PT-BR. Tabs "Tarefas de hoje" (lista TaskCard do dia, contador "Você tem N tarefas hoje!") / "Meu dia" (`RoutineTimeline`: blocos coloridos com horário à esquerda).
- [ ] Commit: `feat(web): home (today tasks + my day timeline)`

### Task 8.3: NewTaskSheet + ScheduleSheet
**Files:** `src/components/{NewTaskSheet,ScheduleSheet}.tsx`
- [ ] `NewTaskSheet` (FAB abre): título, notas, toggles "Tarefa em grupo"/"Múltiplos dias", botão Avançar → `ScheduleSheet`. `ScheduleSheet`: calendário de seleção + toggle Hábito/Prazo + "Make IT!" → POST create, invalida queries.
- [ ] Commit: `feat(web): new task + schedule sheets`

---

## Phase 9 — Web Calendar

### Task 9.1: CalendarMonth + Calendar page
**Files:** `src/components/CalendarMonth.tsx`, `src/pages/Calendar.tsx`
- [ ] `CalendarMonth`: grid mensal, navegação mês/ano, dots nos dias com tarefa (cor por status/prazo), dia selecionado destacado. `Calendar` page: mês + lista "Tarefas planejadas" do dia (TaskCard) com contador.
- [ ] Commit: `feat(web): calendar (month grid + dots + day tasks)`

---

## Phase 10 — Web Groups

### Task 10.1: Groups + GroupDetail + sheets
**Files:** `src/api/groups.ts`, `src/components/{GroupCard,NewGroupSheet,GroupTaskSheet}.tsx`, `src/pages/{Groups,GroupDetail}.tsx`
- [ ] `Groups`: busca, chips horizontais "Seus grupos" (Novo + ícones), feed "Atividades em grupo" (TaskCard com chip do grupo). `NewGroupSheet`: nome, ícone (grid de ícones), colaboradores (input + gerar convite). `GroupTaskSheet`: colaboradores + 4 tipos (Livre/Delegada/Mutirão/Ação Global). `GroupDetail`: tasks do grupo.
- [ ] Commit: `feat(web): groups (list, feed, new group, group task, detail)`

---

## Phase 11 — Web Profile

### Task 11.1: Profile page
**Files:** `src/api/users.ts`, `src/components/Avatar.tsx`, `src/pages/Profile.tsx`
- [ ] Avatar + nome + bio, seção Configurações: Preferências (Push toggle, Tema=Claro, Sync Cloud toggle), Segurança (Alterar senha, Definir 2FA, Definir bloqueio — itens visuais, ações 2FA/bloqueio desabilitadas com tooltip "em breve"). Push/Sync persistem via PATCH preferences. Botão logout.
- [ ] Commit: `feat(web): profile + preferences`

---

## Phase 12 — Integração & smoke

### Task 12.1: Rodar tudo + verificação
- [ ] `npm install` na raiz; `npm run migrate && npm run seed`.
- [ ] `npm run test` (api + web) verde.
- [ ] `npm run build` (api tsc + web vite build) sem erro.
- [ ] `npm run dev` sobe api:5001 + web:5173; smoke manual via curl: health, login seed user, listar tasks.
- [ ] Atualizar `README.md` com setup + scripts + nota SQLite/Postgres.
- [ ] Commit: `docs: README setup + smoke checklist`

---

## Self-Review

**Spec coverage:** auth ✓(P3) tasks/subtasks/labels ✓(P4) groups/invites/routine ✓(P5) home/calendar/groups/profile web ✓(P6–11) seed=mockups ✓(2.2) envelope/erros ✓(2.1) testes ✓(por fase) dev local ✓(P12). Fora de escopo (2FA, push, device-sync, realtime, dark, anexo real, Flutter) — coerente com spec §2.

**Placeholders:** nenhum "TBD"; tasks têm arquivos, comportamento e casos de teste. Código linha-a-linha fica a cargo do executor seguindo `packages/shared` + spec (subagent-driven).

**Type consistency:** nomes de enum/DTO/campos vêm de `packages/shared` (fonte única) e batem com o schema da migration (P2.2) e filtros de service (P4.2).
