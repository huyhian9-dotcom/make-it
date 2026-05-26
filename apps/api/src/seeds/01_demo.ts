import type { Knex } from 'knex';
import bcrypt from 'bcryptjs';

function uid() { return crypto.randomUUID(); }
function now() { return new Date().toISOString(); }

export async function seed(knex: Knex): Promise<void> {
  // Wipe in reverse FK order
  await knex('routine_blocks').delete();
  await knex('task_assignees').delete();
  await knex('subtasks').delete();
  await knex('tasks').delete();
  await knex('group_invites').delete();
  await knex('group_members').delete();
  await knex('groups').delete();
  await knex('labels').delete();
  await knex('users').delete();

  const today = new Date().toISOString().slice(0, 10);

  // --- User ---
  const userId = uid();
  const passwordHash = await bcrypt.hash('makeit123', 10);
  const prefs = JSON.stringify({ theme: 'light', push: false, cloudSync: true });
  await knex('users').insert({
    id: userId,
    name: 'Usuário',
    email: 'usuario@makeit.dev',
    password_hash: passwordHash,
    bio: 'Estudante de Ciência da computação',
    avatar_url: null,
    preferences: prefs,
    created_at: now(),
    updated_at: now(),
  });

  // --- Labels ---
  const labelEsposaid = uid();
  const labelCasaId = uid();
  await knex('labels').insert([
    { id: labelEsposaid, user_id: userId, name: 'Esposa', color: '#A78BFA', created_at: now(), updated_at: now() },
    { id: labelCasaId, user_id: userId, name: 'Casa', color: '#A78BFA', created_at: now(), updated_at: now() },
  ]);

  // --- Tasks ---
  const t1 = uid(); // Levar filho (done, label Esposa)
  const t2 = uid(); // Verificar progresso
  const t3 = uid(); // Enviar relatório de vendas (deadline, done)
  const t4 = uid(); // Compras para noite do bolo (label Casa)
  const t5 = uid(); // Beber 3L de água (habit)
  const t6 = uid(); // Entrar em contato com diretor (deadline)
  const t7 = uid(); // Enviar relatório de filiais (deadline)

  await knex('tasks').insert([
    {
      id: t1, user_id: userId, group_id: null, label_id: labelEsposaid,
      title: 'Levar meu filho a escola', notes: null, kind: 'todo',
      due_date: today, starts_on: null, ends_on: null, recurrence: null, group_task_type: null,
      status: 'done', completed_at: now(), created_at: now(), updated_at: now(),
    },
    {
      id: t2, user_id: userId, group_id: null, label_id: null,
      title: 'Verificar o progresso das equipes', notes: null, kind: 'todo',
      due_date: today, starts_on: null, ends_on: null, recurrence: null, group_task_type: null,
      status: 'open', completed_at: null, created_at: now(), updated_at: now(),
    },
    {
      id: t3, user_id: userId, group_id: null, label_id: null,
      title: 'Enviar relatório de vendas', notes: null, kind: 'deadline',
      due_date: '2026-09-09', starts_on: null, ends_on: null, recurrence: null, group_task_type: null,
      status: 'done', completed_at: now(), created_at: now(), updated_at: now(),
    },
    {
      id: t4, user_id: userId, group_id: null, label_id: labelCasaId,
      title: 'Compras para a noite do bolo', notes: null, kind: 'todo',
      due_date: today, starts_on: null, ends_on: null, recurrence: null, group_task_type: null,
      status: 'open', completed_at: null, created_at: now(), updated_at: now(),
    },
    {
      id: t5, user_id: userId, group_id: null, label_id: null,
      title: 'Beber pelo menos 3L de água', notes: null, kind: 'habit',
      due_date: null, starts_on: null, ends_on: null,
      recurrence: JSON.stringify({ freq: 'daily' }), group_task_type: null,
      status: 'open', completed_at: null, created_at: now(), updated_at: now(),
    },
    {
      id: t6, user_id: userId, group_id: null, label_id: null,
      title: 'Entrar em contato com o diretor', notes: null, kind: 'deadline',
      due_date: '2026-09-20', starts_on: null, ends_on: null, recurrence: null, group_task_type: null,
      status: 'open', completed_at: null, created_at: now(), updated_at: now(),
    },
    {
      id: t7, user_id: userId, group_id: null, label_id: null,
      title: 'Enviar relatório de filiais', notes: null, kind: 'deadline',
      due_date: '2026-09-11', starts_on: null, ends_on: null, recurrence: null, group_task_type: null,
      status: 'open', completed_at: null, created_at: now(), updated_at: now(),
    },
  ]);

  // --- Subtasks for t4 ---
  const subtasks = [
    { title: '1kg de Farinha de trigo', done: true },
    { title: '2 caixas de ovos (capoeira)', done: false },
    { title: '3 caixas de leite integral', done: true },
    { title: '1 caixa de leite desnatado', done: true },
    { title: '1 refrigerante', done: false },
    { title: '2 potes de manteiga', done: false },
    { title: '5 pacotes de bolacha', done: false },
    { title: '1 pacote de cacau em pó', done: false },
    { title: '2 kg de açúcar', done: true },
  ];

  await knex('subtasks').insert(
    subtasks.map((s, i) => ({
      id: uid(),
      task_id: t4,
      title: s.title,
      done: s.done ? 1 : 0,
      position: i,
      created_at: now(),
      updated_at: now(),
    })),
  );

  // --- Groups ---
  const gCasa = uid();
  const gFamilia = uid();
  const gTrabalho = uid();
  const gEqDesenv = uid();

  await knex('groups').insert([
    { id: gCasa, name: 'Casa', icon: 'home', owner_id: userId, created_at: now(), updated_at: now() },
    { id: gFamilia, name: 'Família', icon: 'users', owner_id: userId, created_at: now(), updated_at: now() },
    { id: gTrabalho, name: 'Trabalho', icon: 'briefcase', owner_id: userId, created_at: now(), updated_at: now() },
    { id: gEqDesenv, name: 'Eq. desenv.', icon: 'code', owner_id: userId, created_at: now(), updated_at: now() },
  ]);

  // Owner memberships
  await knex('group_members').insert([
    { id: uid(), group_id: gCasa, user_id: userId, role: 'owner', created_at: now() },
    { id: uid(), group_id: gFamilia, user_id: userId, role: 'owner', created_at: now() },
    { id: uid(), group_id: gTrabalho, user_id: userId, role: 'owner', created_at: now() },
    { id: uid(), group_id: gEqDesenv, user_id: userId, role: 'owner', created_at: now() },
  ]);

  // --- Group tasks ---
  await knex('tasks').insert([
    {
      id: uid(), user_id: userId, group_id: gEqDesenv, label_id: null,
      title: 'Protótipo do Make IT!', notes: null, kind: 'todo',
      due_date: null, starts_on: null, ends_on: null, recurrence: null,
      group_task_type: 'livre', status: 'open', completed_at: null, created_at: now(), updated_at: now(),
    },
    {
      id: uid(), user_id: userId, group_id: gEqDesenv, label_id: null,
      title: 'Desenvolvimento do jogo da...', notes: null, kind: 'todo',
      due_date: null, starts_on: null, ends_on: null, recurrence: null,
      group_task_type: 'livre', status: 'open', completed_at: null, created_at: now(), updated_at: now(),
    },
    {
      id: uid(), user_id: userId, group_id: gTrabalho, label_id: null,
      title: 'Daily scrum', notes: null, kind: 'todo',
      due_date: null, starts_on: null, ends_on: null, recurrence: null,
      group_task_type: 'livre', status: 'open', completed_at: null, created_at: now(), updated_at: now(),
    },
    {
      id: uid(), user_id: userId, group_id: gCasa, label_id: null,
      title: 'Noite do BOLO!!!', notes: null, kind: 'todo',
      due_date: null, starts_on: null, ends_on: null, recurrence: null,
      group_task_type: 'livre', status: 'open', completed_at: null, created_at: now(), updated_at: now(),
    },
  ]);

  // --- Routine blocks ---
  await knex('routine_blocks').insert([
    {
      id: uid(), user_id: userId, label: 'Seu dia começa aqui', color: '#BFDBFE',
      start_time: '06:00', end_time: null, weekday_mask: 0, created_at: now(), updated_at: now(),
    },
    {
      id: uid(), user_id: userId, label: 'Saída ao trabalho / Deixar meu filho na escola', color: '#BBF7D0',
      start_time: '06:45', end_time: null, weekday_mask: 0, created_at: now(), updated_at: now(),
    },
    {
      id: uid(), user_id: userId, label: 'Trabalho', color: '#FEF08A',
      start_time: '07:10', end_time: '12:00', weekday_mask: 0, created_at: now(), updated_at: now(),
    },
    {
      id: uid(), user_id: userId, label: 'Almoço', color: '#FED7AA',
      start_time: '12:00', end_time: null, weekday_mask: 0, created_at: now(), updated_at: now(),
    },
  ]);
}
