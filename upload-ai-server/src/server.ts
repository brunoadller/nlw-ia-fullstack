//framework para ajudar no back
import {fastify} from 'fastify'
import { fastifyCors } from '@fastify/cors'
import { getAllPromptsRoute } from './routes/get-all-prompts'
import { uploadVideoRoute } from './routes/upload-video'
import { createTranscriptionRoute } from './routes/create-transcription'
import { generateAICompletionRoute } from './routes/generate-ai-completion'

const app = fastify()

app.register(fastifyCors, {
  origin: '*',
})
//Rotas feitas na pasta routes e um arquivo para cada rota
//chamando as funçoes da rotas para enviar pro browser
app.register(getAllPromptsRoute)
app.register(uploadVideoRoute)
app.register(createTranscriptionRoute)
app.register(generateAICompletionRoute)

//Define o local da porta em que estará o servidor
app.listen({
  port: 3333,
}).then(() => {
  console.log("HTTP Server Running")
})