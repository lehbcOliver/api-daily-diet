import { knex as configKnex, Knex  } from 'knex';
import 'dotenv/config';

export const config: Knex.Config ={
	client: 'sqlite3',
	connection: {
		filename: './src/database/database.db'
	},
	useNullAsDefault: true,
	migrations: {
		extension: 'ts',
		directory: './src/database/migrations'
	}
};

export const knex = configKnex(config);