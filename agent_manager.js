import 'dotenv/config';
import { Agent, run, tool } from '@openai/agents';
import { z } from 'zod';
import fs from 'node:fs/promises'

/*
    Multi agent Design pattern (Agent as Manager)
    Manager (agent as tools): A central agents that owns the conversation and invokes specialized agents that are exposed as tools.
    We are trying Agent as Manager which calls another agent for a task in this code snippet
    We made a sales agent that can handle sales but not refunds , but we do have a agent for refunds too that can handle the refunds
    So , we gave the refunds agent as a tool to the sales agent so that sales agent can invoke the refund agent if required.
    Refund agent asks for customer id and the reason for refund and then appends the string in to the file.
*/

const fetchAvailablePlans = tool({
    name: 'fetch_available_plans',
    description: 'fetches the available plans for the internet',
    parameters: z.object({}),
    execute: async function () {
        return [
            { plan_id: '1', price_inr: 399, speed: '30MB/S' },
            { plan_id: '2', price_inr: 599, speed: '70MB/S' },
            { plan_id: '3', price_inr: 899, speed: '110MB/S' }
        ]
    }
});

const processRefunds = tool({
    name: 'process_refund',
    description: 'This tools processes refunds for a customer',
    parameters: z.object({
        customerId: z.string().describe('Id of the customer'),
        reasonForRefund: z.string().describe('Reason for refund')
    }),
    execute: async function ({ customerId, reasonForRefund }) {
        await fs.appendFile(
            './refunds.txt',
            `Refund for customer having ${customerId} and the reason of refund ${reasonForRefund}`,
            'utf-8'
        );
        return { refundIssued: true };
    }
});

const refundAgent = new Agent({
    name: 'Refund agent',
    instructions: 'You are expert in issuing refunds to the customer',
    tools: [processRefunds]
})

const salesAgent = new Agent({
    name: 'Sales agent',
    instructions: `
            You are an expert sales agent for an internet broadband company. 
            Talk to the user and help them with what they need.
    `,
    tools: [fetchAvailablePlans, refundAgent.asTool({
        name: 'refund_expert',
        toolDescription: 'Handles refund questions and requests'
    })]
})

async function runAgent(query = '') {
    const result = await run(salesAgent, query);
    console.log(result.finalOutput);
}

runAgent('Hey there, i had a 599 plan. I need a refund right now due to low internet speed and my customer id is 123');