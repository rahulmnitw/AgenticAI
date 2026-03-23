import 'dotenv/config'
import { Agent, run, tool } from '@openai/agents'
import { z } from 'zod'

let sharedHistory = [];

const sqlExecuteTool = tool({
    name: 'SQL Execute tool',
    description: 'This tool executes the SQL query',
    parameters: z.object({
        sql: z.string().describe('The SQL to execute')
    }),
    execute: async function ({ sql }) {
        console.log(`[SQL] Execute: ${sql}`);
        return 'done';
    },
});

const sqlExpertAgent = new Agent({
    name: 'SQL Expert agent',
    tools: [sqlExecuteTool],
    instructions: `
        You are an expert SQL agent that is specialized in generating SQL queries
        as per user request.
        Postgres Schema:
        -- users table
        create table users{
            id SERIAL PRIMARY KEY,
            username VARCHAR(150) UNIQUE NOT NULL,
            email VARCHAR(150) UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT NOW()
        };
        -- comments table
        Create table comments {
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id),
            comment_text TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT NOW()
        };`,
});

async function main(q = '') {
    sharedHistory.push({ role: 'user', content: q });
    const result = await run(sqlExpertAgent, sharedHistory);
    sharedHistory = result.history;
    console.log(result.finalOutput);
};

main('Hi , My username is Rahul_Mishra');

main('Fetch me all the comments that i made');