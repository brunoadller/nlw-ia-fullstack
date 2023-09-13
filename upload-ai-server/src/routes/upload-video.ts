import { FastifyInstance } from "fastify";
import { fastifyMultipart} from '@fastify/multipart';

import path from "node:path"
import { randomUUID } from "node:crypto";//gera um uuid aleatorio
import fs from 'node:fs'
import { pipeline } from 'node:stream';
import { promisify } from 'node:util';
import {prisma} from '../lib/prisma';

const pump = promisify(pipeline)

export async function uploadVideoRoute(app: FastifyInstance){
  app.register(fastifyMultipart, {
    limits:{
      fileSize: 1_848_576  *25 //tamanho do arquivo de 1 mega, aumentando para 25mega
    }
  })
  //request dados que estao vindo da requeisição e reply para retornar um resultado
  app.post('/videos', async (request, reply) => {
    const data = await request.file()

    if(!data){
      return reply.status(400).send({error: 'Missing file input.'})
    }

    //pegando a extensão do arquivo
    const extension = path.extname(data.filename)

    //só vai aceitar arquivos mp3
    if(extension != '.mp3'){
      return reply.status(400).send({error: 'Invalid input type, please upload a MP3'})
    }

    //retorna o nome do arquivo sem a extensão
    const fileBaseName = path.basename(data.filename, extension)
    
    //pegando o nome e juntando com um uuid aleatorio e a extensão do arquivo
    const fileUploadName = `${fileBaseName}-${randomUUID()}${extension}`

    //leva o arquivo para o local de armazenamento
    const uploadDestination = path.resolve(__dirname, '../../tmp', fileUploadName)

    await pump(data.file, fs.createWriteStream(uploadDestination))

    //armazenando o video no BD
    const video = await prisma.video.create({
      data: {
        name: data.filename,
        path: uploadDestination

      }
    })

    return {
      video,
    }
  })
}