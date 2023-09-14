import { FastifyInstance } from "fastify";
import { createReadStream } from 'fs';
import {z} from 'zod'
import { streamToResponse, OpenAIStream } from 'ai';
import {prisma} from '../lib/prisma';
import { openai } from '../lib/openai';



export async function generateAICompletionRoute(app: FastifyInstance){
 app.post('/ai/complete', async (req, reply) => {
  const bodySchema = z.object({
    videoId: z.string().uuid(),
    prompt: z.string(),
    temperature: z.number().min(0).max(1).default(0.5)
  })

  
  const { videoId, prompt, temperature } = bodySchema.parse(req.body)

  //buscando os dados do video para enviar a transcrição para openai resumir
  const video = await prisma.video.findUniqueOrThrow({
    where:{
      id: videoId,
    }
  })
  if(!video.transcription){
    return reply.status(400).send({server: 'Video transcription was not generated yet.'})
  }
  //enviando a transcrição, ou seja, trocando a transcription do template pela video transcription
  const promptMessage = prompt.replace('{transcription}', video.transcription)
  
  //define qual gpt sera usado para criar o resumo a partir da trascrição
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo-16k',
    temperature,
    messages: [
      {role: 'user', content: promptMessage} //passa o texto junto como oque quer que seja o resumo
    ],
    stream: true,

  })
    //procedimento para fazer o retorno ser igual ah do chat gpt
   const stream = OpenAIStream(response)

   streamToResponse(stream, reply.raw, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
    },
   } )
 })
}