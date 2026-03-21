import 'dotenv/config'
import { Agent, run, tool } from '@openai/agents';
import { z } from "zod";
import axios from 'axios';

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
    tools: [getWeatherTool]
});

async function main(query = '') {
    const result = await run(agent, query);
    console.log(result.finalOutput);
}
main("What's the weather of Goa,Hyderabad and Patna currently?");