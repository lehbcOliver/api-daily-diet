import { Knex } from 'knex';


export async function up(knex: Knex): Promise<void> {
	await knex.schema.createTable('meal', (table)=> {
		table.uuid('id').primary();
		table.text('name').notNullable();
		table.text('description').notNullable();
		table.date('date').notNullable();
		table.time('hours').notNullable();
		table.boolean('is_diet').notNullable();
		table.text('user_id').notNullable();
		table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
	});
}


export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTable('meal');
}

