//eslint-disable-next-line
import {Knex} from 'knex';

declare module 'knex/types/tables'{
  export interface Tables{
    users: {
      id:string;
      name:string;
      email:string;
      password:string;
      created_at:string;
    },
    meal: {
      id:string;
      name:string;
      description:string;
      date:string;
      hours: string;
      is_diet:boolean;
      user_id: string;
      created_at:string;
    }
  }
}