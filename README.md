# Make It!

App de **tarefas + rotina**, pessoal e colaborativo. Monorepo com:

- **`apps/api`** — API REST (Node 20+ · TypeScript · Express · Knex · JWT). DB **SQLite** por padrão (zero infra), Postgres opcional.
- **`apps/web`** — cliente Web (React · Vite · TypeScript · Tailwind · React Query · Zustand).
- **`packages/shared`** — tipos de domínio + DTOs + envelope de API, compartilhados pelos dois.

> App mobile (Flutter/Dart) é um ciclo futuro e reusa a mesma API.
> Specs e plano em `docs/superpowers/`. Mockups de referência em `docs/mockups/`.

---

## Rodar localmente

Pré-requisito: **Node 20+** (testado no 24). Não precisa de Docker — o default é SQLite.

```bash
npm install                       # instala todos os workspaces
npm run migrate                   # cria o schema (SQLite: apps/api/make-it.sqlite)
npm run seed                      # popula com dados de demonstração (reproduz os mockups)
npm run dev                       # sobe API (:5001) + Web (:5173) juntos
```

Abra **http://localhost:5173** e entre com o usuário do seed:

| Email | Senha |
|---|---|
| `usuario@makeit.dev` | `makeit123` |

### Portas
- API: `http://localhost:5001` (rotas em `/api/v1`)
- Web: `http://localhost:5173`

---

## Scripts (raiz)

| Comando | O que faz |
|---|---|
| `npm run dev` | API + Web em paralelo (`concurrently`) |
| `npm run build` | Build de produção dos dois (tsc + vite) |
| `npm run migrate` | Aplica migrations (apps/api) |
| `npm run seed` | Roda o seed de demo |
| `npm test` | Suites de teste de API + Web |

Por app: `npm -w apps/api run <script>` / `npm -w apps/web run <script>`.

---

## Configuração (opcional)

A API e a Web funcionam com **defaults** (não precisa de `.env`). Para sobrescrever, veja `.env.example` na raiz:

- `PORT`, `JWT_SECRET` — **troque o `JWT_SECRET` em qualquer uso não-local.**
- `DB_CLIENT=sqlite3 | pg`, `DATABASE_FILE`, `DATABASE_URL` (API lê `apps/api/.env`).
- `VITE_API_URL` (Web lê `apps/web/.env`; default `http://localhost:5001/api/v1`).

### Usar Postgres em vez de SQLite
```bash
docker compose up -d db           # sobe postgres:16
# em apps/api/.env: DB_CLIENT=pg  e  DATABASE_URL=postgres://makeit:makeit@localhost:5432/makeit
npm run migrate && npm run seed
```

---

## Testes

```bash
npm test                          # API (Vitest + supertest) + Web (Vitest + Testing Library)
```

---

## Stack & convenções

- API em camadas: `config / migrations / seeds / utils / middlewares / repositories / services / controllers / routes`.
- DB em `snake_case`; JSON da API em `camelCase` (repositories traduzem). Soft-delete via `deleted_at`.
- Envelope: sucesso `{ success:true, data, message?, timestamp }` · erro `{ success:false, error:{ code, message, details? }, timestamp }`.
- Auth: JWT Bearer; recursos sempre escopados ao usuário / membership de grupo.

## Status

MVP local funcional: auth, tarefas (todo/hábito/prazo) com subtarefas e tags, "Meu dia" (rotina), calendário, grupos (4 tipos de tarefa), perfil/preferências. Fora do MVP: 2FA/bloqueio, push, sync de calendário do dispositivo, realtime em grupos, tema escuro, app Flutter.
