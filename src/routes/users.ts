import { randomUUID } from 'node:crypto';
import {compareSync, hashSync} from 'bcrypt';
import { knex } from '../database/database';
import { FastifyInstance } from 'fastify';
import {z} from 'zod';
import { checkUserIdExists } from '../middlewares/check-user-id';

export async function usersRoutes(app:FastifyInstance){

	app.post('/', async(request, reply)=> {
		const createUserSchema = z.object({
			name: z.string(),
			email: z.string().email(),
			password: z.string()
		});
		const {name, email, password} = createUserSchema.parse(request.body);
		const passwordHash = hashSync(password, 10);

		await knex('users').insert({
			id: randomUUID(),
			name,
			email,
			password: passwordHash,
		});
		return reply.status(201).send();
	});

	app.post('/login', async(request,reply)=> {
		const loginUserSchema = z.object({
			email: z.string(),
			password: z.string()
		});
		const {email, password} = loginUserSchema.parse(request.body);
		const user = await knex('users').where('email', email).first();
		if(!user){
			throw new Error('Email or password invalid');
		}
		const passwordCompare = compareSync(password, user.password);
		if(!passwordCompare){
			throw new Error('Email or password invalid');
		}
		const userId = user.id;
		reply.cookie('userId', userId, {
			path: '/',
			maxAge: 1000 * 60 * 60 * 24 * 30 //30dias
		});
		console.log(request.cookies);
		return reply.status(204).send();
	});
	app.get('/',{preHandler: [checkUserIdExists]}, async(request)=> {
		const {userId} = request.cookies;
		const user = await knex('users').where('id', userId).first().select('id', 'name', 'email');
		return {user};
	});
}
