import baseTemplate from './templates/base.template'
import envs from '../envs'
import ReersError from '../shared/reers_error'
import logger from '../shared/logger'
import http from '../utils/http.util'

interface MailData {
    personalizations: {
        to:  { email: string; name?: string }[]
    }[]
    subject: string
    content: { type: string; value: string }[]
    from: { email: string; name?: string }
    reply_to?: { email: string; name?: string }
}

export interface ISendMail {
    recipients: { email: string; name?: string }[]
    from?: { email: string; name?: string }
    reply_to?: { email: string; name?: string }
    sendDate?: string
    subject: string
    content: string
    reply?: boolean
}

/**
 * Send email
 * @param recipients - Array of recipients
 * @param from - Sender email and name
 * @param reply_to - Reply to email and name
 * @param sendDate - Date to send email
 * @param subject - Email subject
 * @param content - Email content
 * @param reply - If true, email will include reply to
 * @returns Promise<{ data: string }>
 */
export const sendMail = async ({ recipients, from, reply_to, sendDate, subject, content, reply }: ISendMail) => {
    if (envs.isTest) {
        return { data: 'Email sent' }
    }

    if (!from) {
        from = { email: envs.mail.fromEmail, name: envs.mail.fromName }
    }

    if (!reply_to) {
        reply_to = { email: envs.mail.replyToEmail, name: envs.mail.replyToName }
    }

    const year = sendDate ? new Date(sendDate).getFullYear() : new Date().getFullYear()
    const data: MailData = {
        personalizations: [{ to: recipients }],
        subject,
        content: [{ type: 'text/html', value: baseTemplate(content, year, subject) }],
        from
    }

    if (reply) {
        data.reply_to = reply_to
    }

    const sendEmailResp = await http.post<MailData, string>(envs.mail.domain, data, {
        'Authorization': `Bearer ${envs.mail.apiKey}`,
        'Content-Type': 'application/json'
    })

    if (sendEmailResp.error) {
        const error = new ReersError({
            message: 'Error sending email',
            type: 'EMAIL_SENDING_ERROR',
            error: sendEmailResp.error,
            metadata: { recipients, subject }
        })
        logger.error(error)
        return { error }
    }

    return { data: sendEmailResp.data }
}
