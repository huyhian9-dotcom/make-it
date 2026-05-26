import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // users
  await knex.schema.createTable('users', (t) => {
    t.uuid('id').primary();
    t.string('name').notNullable();
    t.string('email').notNullable().unique();
    t.string('password_hash').notNullable();
    t.text('bio').nullable();
    t.string('avatar_url').nullable();
    t.json('preferences').defaultTo('{}');
    t.timestamps(true, true);
    t.timestamp('deleted_at').nullable();
  });

  // labels
  await knex.schema.createTable('labels', (t) => {
    t.uuid('id').primary();
    t.uuid('user_id').notNullable().references('id').inTable('users');
    t.string('name').notNullable();
    t.string('color').notNullable();
    t.timestamps(true, true);
    t.timestamp('deleted_at').nullable();
  });

  // groups
  await knex.schema.createTable('groups', (t) => {
    t.uuid('id').primary();
    t.string('name').notNullable();
    t.string('icon').notNullable().defaultTo('');
    t.uuid('owner_id').notNullable().references('id').inTable('users');
    t.timestamps(true, true);
    t.timestamp('deleted_at').nullable();
  });

  // group_members
  await knex.schema.createTable('group_members', (t) => {
    t.uuid('id').primary();
    t.uuid('group_id').notNullable().references('id').inTable('groups');
    t.uuid('user_id').notNullable().references('id').inTable('users');
    t.string('role').notNullable().defaultTo('member');
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.unique(['group_id', 'user_id']);
  });

  // group_invites
  await knex.schema.createTable('group_invites', (t) => {
    t.uuid('id').primary();
    t.uuid('group_id').notNullable().references('id').inTable('groups');
    t.string('email').nullable();
    t.string('token').notNullable().unique();
    t.string('status').notNullable().defaultTo('pending');
    t.timestamp('created_at').defaultTo(knex.fn.now());
  });

  // tasks
  await knex.schema.createTable('tasks', (t) => {
    t.uuid('id').primary();
    t.uuid('user_id').notNullable().references('id').inTable('users');
    t.uuid('group_id').nullable().references('id').inTable('groups');
    t.uuid('label_id').nullable().references('id').inTable('labels');
    t.string('title').notNullable();
    t.text('notes').nullable();
    t.string('kind').notNullable().defaultTo('todo');
    t.string('due_date').nullable();
    t.string('starts_on').nullable();
    t.string('ends_on').nullable();
    t.json('recurrence').nullable();
    t.string('group_task_type').nullable();
    t.string('status').notNullable().defaultTo('open');
    t.timestamp('completed_at').nullable();
    t.timestamps(true, true);
    t.timestamp('deleted_at').nullable();
  });

  // subtasks
  await knex.schema.createTable('subtasks', (t) => {
    t.uuid('id').primary();
    t.uuid('task_id').notNullable().references('id').inTable('tasks');
    t.string('title').notNullable();
    t.boolean('done').defaultTo(false);
    t.integer('position').defaultTo(0);
    t.timestamps(true, true);
  });

  // task_assignees
  await knex.schema.createTable('task_assignees', (t) => {
    t.uuid('id').primary();
    t.uuid('task_id').notNullable().references('id').inTable('tasks');
    t.uuid('user_id').notNullable().references('id').inTable('users');
    t.unique(['task_id', 'user_id']);
  });

  // routine_blocks
  await knex.schema.createTable('routine_blocks', (t) => {
    t.uuid('id').primary();
    t.uuid('user_id').notNullable().references('id').inTable('users');
    t.string('label').notNullable();
    t.string('color').notNullable();
    t.string('start_time').notNullable();
    t.string('end_time').nullable();
    t.integer('weekday_mask').defaultTo(0);
    t.timestamps(true, true);
    t.timestamp('deleted_at').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('routine_blocks');
  await knex.schema.dropTableIfExists('task_assignees');
  await knex.schema.dropTableIfExists('subtasks');
  await knex.schema.dropTableIfExists('tasks');
  await knex.schema.dropTableIfExists('group_invites');
  await knex.schema.dropTableIfExists('group_members');
  await knex.schema.dropTableIfExists('groups');
  await knex.schema.dropTableIfExists('labels');
  await knex.schema.dropTableIfExists('users');
}
