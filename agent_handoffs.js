import 'dotenv/config';
import { Agent, run, tool } from '@openai/agents';
import { z } from 'zod';
import fs from 'node:fs/promises'

/** 
 * Multi Agent design Pattern (Agent handoffs)
 * Handoffs : The Initial agent delegates the entire conversation to the specialist once it has identified the user's request
 * We have two agents sales agent and refund agent for help with sales and refunds 
 * we have a reception agent which will interact with the user and after understanding their query handoff them to the correct agent.
*/

const processRefunds = tool({
    name: 'process_refund',
    description: 'This tools processes refunds for a customer',
    parameters: z.object({
        customerId: z.string().describe('Id of the customer'),
        reasonForRefund: z.string().describe('Reason for refund')
    }),
    execute: async function ({ customerId, reasonForRefund }) {
        await fs.appendFile(
            './refunds_handoff.txt',
            `\nRefund for customer having ${customerId} and the reason of refund ${reasonForRefund}`,
            'utf-8'
        );
        return { refundIssued: true };
    }
});

//Refund agent
const refundAgent = new Agent({
    name: 'Refund agent',
    instructions: 'You are expert in issuing refunds to the customer or helping with queries for an existing customer',
    tools: [processRefunds]
});

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

//Sales agent
const salesAgent = new Agent({
    name: 'Sales agent',
    instructions: `
            You are an expert sales agent for an internet broadband company. 
            Talk to the user and help them with what they need.
    `,
    tools: [fetchAvailablePlans]
});

const receptionAgent = new Agent({
    name: 'Reception Agent',
    instructions: 'You are the customer facing agent expert in understanding what customer needs and then handoff them to the right agent',
    handoffDescription: `You have two agents available :
            - salesAgent:  Expert in handling queries like all plans and pricing available . Good for new customers
            - refundAgent: Expert in handling user queries for existing customers and issue refunds for help them.`,
    handoffs: [salesAgent, refundAgent]
});

async function main(query = '') {
    const response = await run(receptionAgent, query);
    console.log('Result: ', response.finalOutput);
    //console.log('History', response.history);
}

main('Hey there, i had a 599 plan. I need a refund right now due to low internet speed and my customer id is 123');

main('Hey there, i want to know about the available plans');