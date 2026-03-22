import 'dotenv/config'
import { Agent, run, tool } from '@openai/agents';
import { z } from "zod";
import axios from 'axios';

/*
    By Default agent outputs unstructured output for human interaction, but if we want to save the output in DB or somewhere 
    We need to have some structure for it , zod helps us in validating and giving output in a structured format
    we can make a schema , the format in which we want the output and we can pass this schema to the outputType of the Agent
*/

const GetWeatherResultSchema = z.object({
    city: z.string().describe('Name of the city'),
    degree_c: z.number().describe('Temperature of the city in celsius'),
    condition: z.string().optional().describe('Weather condition of the city')
});

const getWeatherTool = tool({
    name: 'get_weather',
    description: 'returns the current weather information of the given city',
    parameters: z.object({
        city: z.string().describe('Name of the city'),
    }),
    execute: async function ({ city }) {
        const url = `https://wttr.in/${city.toLowerCase()}?format=%C+%t`;
        const response = await axios.get(url, { responseType: 'text' });
        return `The weather of the ${city} is ${response.data}`;
    }
});

const agent = new Agent({
    name: 'Weather agent',
    instructions: 'You are a weather agent that tells user the weather report',
    tools: [getWeatherTool],
    outputType: GetWeatherResultSchema
});

async function main(query = '') {
    const result = await run(agent, query);
    console.log(result.finalOutput);
}
main("What's the weather of Goa,Hyderabad and Patna currently?");