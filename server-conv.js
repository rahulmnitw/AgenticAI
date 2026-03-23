import 'dotenv/config'
import { Agent, run, tool } from '@openai/agents';
import { z } from 'zod';

/**
 * In this code snippet, we tried giving agent the conversation id so that it can see the history of conversations
 * And based on the history it will answer the further query 
 * the conversation id was created once by create_conv.js and that is used here .
 * The conversation is stored in open api server, we can store it in our db too but we just showcased here that conversations work through openapi too.
 */

const executeSQL = tool({
    name: 'execute_sql',
    description: 'This executes the SQL Query',
    parameters: z.object({
        sql: z.string().describe('the sql query'),
    }),
    execute: async function ({ sql }) {
        console.log(`[SQL]: Execute ${sql}`);
        return 'done';
    },
});

const sqlAgent = new Agent({
    name: 'SQL Expert Agent',
    tools: [executeSQL],
    instructions: `
          You are an expert SQL Agent that is specialized in generating SQL queries as per user request.
  
          Postgres Schema:
      -- users table
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
  
      -- comments table
      CREATE TABLE comments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        comment_text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
      `,
});

async function main(q = '') {
    const result = await run(sqlAgent, q, {
        conversationId: 'conv_69c18fa2cc9c8196a7656b8a1704aaf104616ecabe6abca9'
    });
    console.log(result.finalOutput);
}

main('fetch me the comments made my me');