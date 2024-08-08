import http from '../http.util'
import ReersError from '../../shared/reers_error'
import envs from '../../envs'
import isError from '../is_error.util'
import { DataOrError } from '../../types'
import { ReersPromise } from '../../types'

export interface GoogleTextToAudioRequest {
    input: { text: string }
    voice: { languageCode: string, name: string }
    audioConfig: { audioEncoding: string }
}

export interface GoogleVoice {
    languageCodes: string[]
    name: string
    ssmlGender: string
    naturalSampleRateHertz: number
}

// eslint-disable-next-line @typescript-eslint/ban-types
function validateAPIKeyAndText(apiKey: string, text: string): DataOrError<{}> {
    if (!apiKey) {
        return {
            error: new ReersError({
                message: 'API key is required',
                type: 'invalid_api_key',
                error: 'Could not generate podcast audio.'
            })
        }
    }

    if (!text) {
        return {
            error: new ReersError({
                message: 'message is required',
                type: 'invalid_message',
                error: 'Could not generate podcast audio.',
            })
        }
    }

    if (typeof text !== 'string') {
        return {
            error: new ReersError({
                message: 'message should be a string',
                type: 'invalid_message',
                error: 'Could not generate podcast audio.',
            })
        }
    }

    return { data: {} }
}

export class GoogleTextToAudio {
    voices: GoogleVoice[] = []
    private base_url = 'https://texttospeech.googleapis.com/v1'
    private apiKey: string = envs.secrets.googleApiKey

    private mapAuthorToGender(author: string): 'FEMALE' | 'MALE' {
        // female voices
        if (['sarah', 'laura', 'charlotte', 'alice', 'matilda', 'jessica', 'lily'].includes(author.toLowerCase())) {
            return 'FEMALE'
        }

        return 'MALE'
    }

    private async mapAuthorToGoogleVoice(author: string, language?: string, voiceId?: string): Promise<GoogleVoice> {
        if (!this.voices.length) {
            await this.setVoices()
        }
        // SINCE THE API WILL BE CALLED MULTIPLE TIMES FOR EACH CONVERSION,
        // WE NEED TO BE SURE THAT SAME VOICE IS USED FOR THE SAME AUTHOR
        // IN THAT PODCAST
        if (voiceId) {
            const voice = this.voices.find((voice) => voice.name === voiceId)
            if (voice) {
                return voice
            }
        }

        // OTHERWISE, WE CAN RANDOMLY SELECT A VOICE FOR THE AUTHOR WITH THAT GENDER
        // get gender of the author
        const authorGender = this.mapAuthorToGender(author.toLowerCase())
        const voices = this.voices.filter((voice) => voice.ssmlGender === authorGender && voice.languageCodes.includes('en-US'))
        return voices[Math.floor(Math.random() * voices.length)] 
    }

    async convert(text: string, author: string, voiceName?: string): ReersPromise<{ buffer: Buffer, voice: string }> {
        const start = Date.now()
        
        const isValidInput = validateAPIKeyAndText(this.apiKey, text)
        if (isError(isValidInput)) {
            return isValidInput
        }

        const voice = await this.mapAuthorToGoogleVoice(author, 'en-US', voiceName)
        const textToAudioRequest = await http.post<GoogleTextToAudioRequest, { audioContent: string }>(
            `${this.base_url}/text:synthesize?key=${this.apiKey}`,
            {
                input: { text },
                voice: {
                    languageCode: 'en-US',
                    name: voice.name,
                },
                audioConfig: { audioEncoding: 'MP3' },
            }
        )

        if (textToAudioRequest.error || !textToAudioRequest.data) {
            let errorResponse = textToAudioRequest.error
            if (textToAudioRequest.error instanceof Buffer) {
                errorResponse = JSON.parse(textToAudioRequest.error.toString())
            } else if (textToAudioRequest.error instanceof Error) {
                errorResponse = textToAudioRequest.error
            }

            return {
                error: new ReersError({
                    message: 'Could not generate podcast audio.',
                    type: 'google_tts_error',
                    error: errorResponse?.detail?.message || 'Something went wrong'
                })
            }
        }

        // response is a base64 encoded string, lets convert it to a buffer
        const bufferResponse = Buffer.from(textToAudioRequest.data.audioContent, 'base64')
        const end = Date.now()
        console.log(`Time taken to convert podcast text to audio: ${(end - start)}ms`)
        return { data: {
            buffer: bufferResponse,
            voice: voice.name
        } }
    }

  /**
   * This method gets the voice by the voice id
   * google's voice name here can also be an id since the name is just in an identifier format
   */
  async getVoiceIdById(id: string) {
    if (!this.voices.length) {
        await this.setVoices()
    }

    return this.voices.find((voice) => voice.name === id.toLowerCase())
  }

  async getVoiceByName(name = 'en-US-Wavenet-D') {
    if (!this.voices.length) {
        await this.setVoices()
    }

    if (!name) {
        return this.voices[0]
    }

    return this.voices.find((voice) => voice.name.toLowerCase() === name.toLowerCase())
  }

  async setVoices() {
    if (this.voices.length) return this.voices
    const getVoiceRequest = await http.get<{ languageCode?: string }, { voices: GoogleVoice[] }>(
        `${this.base_url}/voices?key=${this.apiKey}`
    )
    if (isError(getVoiceRequest) || !getVoiceRequest.data) {
        return []
    }

    this.voices = getVoiceRequest.data.voices
    return this.voices
  }
}
