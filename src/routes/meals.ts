import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { checkUserIdExists } from '../middlewares/check-user-id';
import { knex } from '../database/database';
import { randomUUID } from 'node:crypto';

export async function mealsRoutes(app: FastifyInstance){

	app.post('/',{preHandler: [checkUserIdExists]}, async(request, reply)=> {
		const createMealsSchema = z.object({
			name: z.string(),
			description: z.string(),
			date: z.string(),
			hours: z.string(),
			is_diet: z.boolean(),
		});
		const {name, description, date, hours, is_diet} = createMealsSchema.parse(request.body);
		const {userId} = request.cookies;
		
		await knex('meal').insert({
			id: randomUUID(),
			name,
			description,
			date,
			hours,
			is_diet,
			user_id: userId
		});
		return reply.status(201).send();
	});

	app.get('/', {preHandler: [checkUserIdExists]}, async(request)=> {
		const {userId} = request.cookies;
		const meals = await knex('meal').where('user_id', userId).select();
		return {meals};
	});

	app.get('/:id', {preHandler: [checkUserIdExists]}, async(request)=> {
		const {userId} = request.cookies;
		const getMealSchema = z.object({
			id: z.string().uuid(),
		});
		const {id} = getMealSchema.parse(request.params);
		const meal = await knex('meal').where({user_id:userId, id}).first();
		return {meal};
	});

	app.put('/:id', {preHandler: [checkUserIdExists]}, async(request, reply)=> {
		const {userId} = request.cookies;
		const getMealSchema = z.object({
			id: z.string().uuid(),
		});
		const {id} = getMealSchema.parse(request.params);
		const createMealsSchema = z.object({
			name: z.string(),
			description: z.string(),
			date: z.string(),
			hours: z.string(),
			is_diet: z.boolean(),
		});
		const {name, description, date, hours, is_diet} = createMealsSchema.parse(request.body);

		await knex('meal').update({
			name,
			description,
			date,
			hours,
			is_diet
		}).where({user_id:userId, id});
		return reply.status(204).send();
	});

	app.delete('/:id', {preHandler: [checkUserIdExists]}, async(request, reply)=>{
		const {userId} = request.cookies;
		const getMealSchema = z.object({
			id: z.string().uuid(),
		});
		const {id} = getMealSchema.parse(request.params);
		await knex('meal').delete().where({user_id:userId, id});
		return reply.status(204).send();
	});

	app.get('/metric', {preHandler: [checkUserIdExists]}, async(request, reply)=> {
		const {userId} = request.cookies;

		const response =  {
			mealsAmount: 0,
			meals_within_the_diet: 0,
			off_diet_meals: 0,
			bestSequenceofMeals: 0
		};
		
		
		const meals = await knex('meal').where('user_id', userId).select().orderBy('date', 'asc');
		let within_the_diet = 0;
		let off_diet = 0;
		let total = 0;
		let besSequence = 0;

		meals.forEach((meal)=> {
			if(meal.is_diet){
				within_the_diet++;
			}
			if(!meal.is_diet){
				off_diet++;
			}
			if(meal.is_diet){
				besSequence++;
			}
			else if(!meal.is_diet){
				besSequence = Math.max(besSequence, total);
				total = 0;
			}
			besSequence = Math.max(besSequence, total);
		});

	
		response.mealsAmount = meals.length;
		response.meals_within_the_diet = within_the_diet;
		response.off_diet_meals = off_diet;
		response.bestSequenceofMeals = besSequence;

		return reply.status(200).send({response});
	});
}