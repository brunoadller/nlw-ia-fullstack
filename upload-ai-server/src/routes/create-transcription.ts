import { FastifyInstance } from "fastify";
import { createReadStream } from 'fs';
import {z} from 'zod'
import {prisma} from '../lib/prisma';
import { openai } from '../lib/openai';



export async function createTranscriptionRoute(app: FastifyInstance){
 app.post('/videos/:videoId/transcription', async (req) => {
  const paramsSchema = z.object({
    videoId: z.string().uuid(),
  })

  const { videoId } = paramsSchema.parse(req.params)

  //corpo da requisicao
  const bodySchema = z.object({
    prompt: z.string(),
  })
  const { prompt } = bodySchema.parse(req.body)

  //pegando o video do BD  e verificando se é compatível com o mesmo videoId
  const video = await prisma.video.findUniqueOrThrow({
    where:{
      id: videoId,
    }
  })
  const videoPath = video.path

  const audioReadStream = createReadStream(videoPath)

  //PEGANDO A API DA OPENAI
  const response = await openai.audio.transcriptions.create({
    file: audioReadStream,
    model: 'whisper-1',
    language: 'pt',
    response_format: 'json',
    temperature: 0,
    prompt

  })
  //salvando o texto no banco de dados
  const transcription = response.text

  await prisma.video.update({
    where: {
      id: videoId,
    },
    data:{
      transcription,
    }
  })

  return {transcription}
  })
}