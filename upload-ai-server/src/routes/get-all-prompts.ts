//como é typescript é necessário definir o tipo
import { FastifyInstance } from 'fastify';
import {prisma} from '../lib/prisma'

//função realizando o get do banco
export async function getAllPromptsRoute(app: FastifyInstance){
  app.get('/prompts', async () => {
    const prompts = await prisma.prompt.findMany()
  
    return prompts
  })
}