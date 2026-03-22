import 'dotenv/config'
import { Agent, InputGuardrailTripwireTriggered, run } from '@openai/agents'
import { z } from 'zod'

/**
 * Guardrails allows you to perform checks and validations on user input or agent output
 * When we make an agent we have to make sure the input that the user gives is specific for that agent and not for any other task
 * so we add a guardrail infront of the agent that checks for the user input whether that is relevant for that agent or not 
 * if it is not valid , the gaurdrail will throw the tripwireTriggered error and crash the program
 * if it is valid , the agent will give the response 
 * 
 * in our code , we have made a guardrail that checks whether the query is related to maths question or not , it calls 
 * a agent and then that agent checks whether that query is related to maths or not and then returs true or false which 
 * the guard rails catches and then accordingly triggers the tripWire
 */

const mathGuardRailSchema = z.object({
    isValidMathsQuestion: z.boolean().describe('if the question is of maths'),
    reasonToReject: z.string().optional().describe('The reason to reject the question')
});

const mathInputAgent = new Agent({
    name: 'Math query checker',
    instructions: `
        You are an input guard rail that checks if the user query is a maths question or not
        Rules:
        - The question has to be strictly a maths equation only
        - Reject any other kind of request even if related to maths `,
    outputType: mathGuardRailSchema
});

const mathGuardRail = {
    name: 'Maths homework Guardrail',
    execute: async ({ input }) => {
        console.log(`we need to validate input: ${input}`)
        const result = await run(mathInputAgent, input);
        console.log(result.finalOutput);
        return {
            outputInfo: result.finalOutput.reasonToReject,
            tripwireTriggered: !result.finalOutput.isValidMathsQuestion
        };
    }
};

const mathsAgent = new Agent({
    name: 'Maths agent',
    instructions: 'You are an expert maths agent',
    inputGuardrails: [mathGuardRail]
})

async function main(q = '') {
    try {
        const result = await run(mathsAgent, q);
        console.log(result.finalOutput);
    } catch (e) {
        if (e instanceof InputGuardrailTripwireTriggered) {
            console.log(`Invalid input: Rejected because ${e.message}`);
        }
    }
}

main('10*50 = ?');