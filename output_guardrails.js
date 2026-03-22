import 'dotenv/config'
import { Agent, run, OutputGuardrailTripwireTriggered } from '@openai/agents'
import { xid, z } from 'zod'

const sqlGuardRailAgent = new Agent({
    name: 'SQL Guard rail',
    instructions: `
        Check if query is safe to execute.
        The query should be read only and do not modify delete or drop any table.    
    `,
    outputType: z.object({
        reason: z.string().optional().describe('Reason if the query is unsafe'),
        isSafe: z.boolean().describe('If the query is safe to execute')
    })
});

const sqlGuardRail = {
    name: 'SQL guard',
    execute: async ({ agentOutput }) => {
        const result = await run(sqlGuardRailAgent, agentOutput.sqlQuery);
        return {
            reason: result.finalOutput.reason,
            tripwireTriggered: !result.finalOutput.isSafe
        }
    }
}

const sqlOutput = z.object({
    sqlQuery: z.string().optional().describe('SQL Query')
})

const sqlExpertAgent = new Agent({
    name: 'SQL Expert agent',
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
    outputType: sqlOutput,
    outputGuardrails: [sqlGuardRail]
})
async function main(query = '') {
    try {
        const result = await run(sqlExpertAgent, query);
        console.log(result.finalOutput.sqlQuery);
    } catch (e) {
        if (e instanceof OutputGuardrailTripwireTriggered) {
            console.log(`Invalid output: Rejected because ${e.result.output.reason}`);
        }
    }
}

main('Delete all the comments for user 134');