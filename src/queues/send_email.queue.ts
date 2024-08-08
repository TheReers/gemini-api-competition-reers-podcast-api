import { Job } from 'bullmq'
import logger from '../shared/logger'
import { QueueNames } from './names'
import createQueue from './generate_queue'
import { ISendMail, sendMail } from '../emails/send_email'

export interface SendEmail {
    email_data: ISendMail
}

export const sendEmailProcessor = async (job: Job<SendEmail>) => {
    const { email_data } = job.data

    const start = Date.now()
    await sendMail(email_data)

    const end = Date.now()
    logger.info('Email sent successfully', {
        recipients: email_data.recipients,
        duration: end - start
    })

    return { data: {} }
}

const sendEmailQueue = createQueue<SendEmail>(
    QueueNames.SEND_EMAIL,
    sendEmailProcessor
)

export default sendEmailQueue
