import { URL } from 'url'
import { Queue, Worker, Job } from 'bullmq'
import envs from '../envs'
import logger from '../shared/logger'
import ReersError from '../shared/reers_error'
import { ReersPromise } from '../types'

export type ProcessorResponse = ReersPromise<Record<string, never>>

class DeejaQueue<JobData> {
    private name: string
    queue: Queue<JobData>
    private workerProcessor: (job: Job<JobData>) => ProcessorResponse

    constructor (
        name: string,
        workerProcessor: (job: Job<JobData>) => ProcessorResponse
    ) {
        this.name = name
        this.workerProcessor = workerProcessor
    }

    createQueue () {
        const queue = new Queue<JobData>(this.name, {
            connection: this.getQueueConnection(envs.redisUrl)
        })

        this.queue = queue
    }

    private getQueueConnection(url: string) {
        const queueURL = new URL(url)
        return {
            host: queueURL.hostname,
            port: parseInt(queueURL.port),
            password: queueURL.password
        }
    }

    creatQueueWorker () {
        const worker = new Worker(this.name, this.workerProcessor, {
            connection: this.getQueueConnection(envs.redisUrl)
        })

        worker.on('completed', async (job) => {
            logger.info(`Job completed for ${this.name}`, {
                ...job?.data,
                timestamp: new Date(job.timestamp),
                completedAt: new Date()
            })
        })

        worker.on('failed', async (job) => {
            logger.error(
                new ReersError({
                    metadata: { ...job?.data, reason: job?.failedReason },
                    message: 'Job failed'
                })
            )
        })
    }
}

export default function createQueue <JobData>(
    name: string, workerProcessor: (job: Job<JobData>
) => ProcessorResponse) {
    const deejaQueue = new DeejaQueue<JobData>(name, workerProcessor)

    deejaQueue.createQueue()
    deejaQueue.creatQueueWorker()

    return deejaQueue.queue
}
