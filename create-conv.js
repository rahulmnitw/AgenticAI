import { OpenAI } from 'openai';
import 'dotenv/config'

/**
 * We are creating a conversation here in openai, using this conversation id the agent can see the history of the input and the response
 * We can save the input of the user in a db and can give the db access to the agent so that it can fetch the history of that user . 
 * This is just an alternate way of doing that
 * This code snippet show how to create a conversation , we will use this conversation id in server-conv.js to communicate the history to the agent.
 */


const client = new OpenAI();

client.conversations.create({}).then((e) => {
    console.log(`Conversation id: ${e.id}`);
})