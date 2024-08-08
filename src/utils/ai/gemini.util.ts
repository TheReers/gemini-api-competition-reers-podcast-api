import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai'
import ReersError from '../../shared/reers_error'
import isError from '../is_error.util'
import { GoogleTextToAudio } from './google-tts.util'
import { ReersPromise } from '../../types'
import envs from '../../envs'

export class GeminiAI {
    private model: GenerativeModel
    private podcastTitle = 'Reers Podcast show'
    private apiKey = envs.secrets.geminiAIKey

    constructor () {
        this.configure()
    }

    private validateApiKey() {
        if (!this.apiKey) {
            return {
                error: 'API key is required',
                message: 'Could not generate podcast.'
            }
        }

        return { data: true }
    }

    private validateMessage(message: string) {
        if (!message) {
            return {
                error: 'message is required',
                message: 'Could not generate podcast.'
            }
        }

        if (typeof message !== 'string') {
            return {
                error: 'message should be a string',
                message: 'Could not generate podcast.'
            }
        }

        return { data: true }
    }

    private validateApiKeyAndMessage(message: string) {
        const apiKeyValidation = this.validateApiKey()
        if (apiKeyValidation.error) {
            return {
                error: apiKeyValidation.error,
                message: apiKeyValidation.message
            }
        }

        const messageValidation = this.validateMessage(message)
        if (messageValidation.error) {
            return {
                error: messageValidation.error,
                message: messageValidation.message
            }
        }

        return { data: true }
    }

    private getHostNames() {
        const hostNames = [
            'Sarah',     'Laura',
            'Charlie',   'George',
            'Callum',    'Liam',
            'Charlotte', 'Alice',
            'Matilda',   'Will',
            'Jessica',   'Eric',
            'Chris',     'Brian',
            'Daniel',    'Lily',
            'Bill'
          ]
        return hostNames.join(', ')
    }

    private removeJsonFormatting(text: string) {
        // remove the json formatting if it exists
        if (text.startsWith('```json')) {
            text = text.substring(7, text.length - 3)
        }

        return text
    }

    private configure () {
        const validation = this.validateApiKey()
        if (validation.error) {
            const error = new ReersError({
                message: validation.error,
            })

            return { error }
        }

        const genAI = new GoogleGenerativeAI(this.apiKey)
        this.model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' })
        return { data: this.model }
    }

    async generatePodcastText(message: string) {
        const start = Date.now()
        const validation = this.validateApiKeyAndMessage(message)
        if (validation.error || !this.model) {
            const error = new ReersError({
                message: validation.error || 'Model not configured',
            })

            return { error }
        }

        try {
            const prompt = `You are a podcast generator.
                Your job is to generate a podcast for the following prompt,
                no extra formats like bold just characters that is a pure string.
                The podcast should talk in-depth about the topic and should be at least 10 min read.

                The podcast is anchored by any two of ${this.getHostNames()}
                The name of the podcast is ${this.podcastTitle}.

                If the podcast title is gender based, use the best name for the anchor.
                Also, for the podcast title, it can change to a better name that fits the title if the title seems
                a bit opinionated.

                Generate the response as a conversation in the format below and make sure it's at least 10 minutes read.
                USE THIS FORMAT BELOW:
                [
                    {
                        "author": "Ezra",
                        "text": "Introductory talk from host..."
                    },
                    {
                        "author": "Kai",
                        "text": "Introductory talk from guest"
                    },
                    {
                        "author": "Ezra",
                        "text": "First author continuing the conversation"
                    },
                    {
                        "author": "Kai",
                        "text": "Second author continuing the conversation"
                    },
                    ...
                ]

            The prompt is: ${message}
            `
            // return an audio buffer
            const result = await this.model.generateContent(prompt)
            const response = result.response
            const text = response.text()

            const end = Date.now()
            console.log(`Time taken to generate podcast text: ${(end - start)}ms for message: ${message}`)

            return { data: this.removeJsonFormatting(text) }
        } catch (e) {
            const error = new ReersError({
                message: 'Failed to generate podcast text',
                error: e as Error,
            })
            return { error }
        }
    }

    private async textToAudio(
        text: string,
        opts: {
            voice_name: string;
            voice_id?: string;
        }
    ) {
        const googleTTS = new GoogleTextToAudio()
        return googleTTS.convert(text, opts.voice_name, opts.voice_id)
    }

    async convertTextToAudio (text: string): ReersPromise<
        { audioChunks: Buffer[]; jsonArray: { author: string; text: string }[] }
    > {
        // convert the string to json
        const authorIds: { [key: string]: string | undefined } = {}
        try {
            const jsonArray = JSON.parse(text) as { author: string; text: string }[]
            if (!jsonArray || !Array.isArray(jsonArray)) {
                return { error: new ReersError({ message: 'Failed to convert text to audio' }) }
            }

            const audioChunks = []
            for (const item of jsonArray) {
                const chunk = await this.textToAudio(item.text, {
                    voice_name: item.author,
                    voice_id: authorIds[item.author]
                })
                if (isError(chunk)) {
                    return { error: chunk.error }
                }

                audioChunks.push(chunk.data.buffer)
                authorIds[item.author] = chunk.data.voice
            }

            return { data: { audioChunks, jsonArray } }
        } catch (error) {
            return { error: new ReersError({ message: 'Failed to convert text to audio' }) }
        }
    }
}
