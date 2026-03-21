import 'dotenv/config'
import { Agent, run } from '@openai/agents'

const helloAgent = new Agent({
    name: 'Hello Agent',
    instructions: 'You are an agent that will greet the person with their name',
});

const result = await run(helloAgent, 'Hello agent , i am rahul');

console.log(result.finalOutput);