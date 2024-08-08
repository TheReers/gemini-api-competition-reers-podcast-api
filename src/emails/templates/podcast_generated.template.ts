import envs from '../../envs'

export const podcastGenerationMailTemplate = ({
    name, slug, success, message
}: {
    name: string
    slug: string
    success: boolean,
    message: string
}) => success === true ? `
<div class="content">
    <p>Dear ${name},</p>
    <p>Great news! Your podcast titled <span style="font-weight: bold;">"${message}"</span> has been successfully generated and is now available.</p>
    <p>You can access your podcast with the link below:</p>
    <p class="button"><a href="${envs.clientBaseUrl}/dashboard/details?slug=${slug}" target="_blank">View Podcast</a></p>
    <p>Thank you for using the Reers AI Podcast.</p>
    <p>We hope you enjoy your podcast!</p>
</div>
` : `
<div class="content">
    <p>Dear ${name},</p>
    <p>We regret to inform you that there was an issue generating your podcast titled <span style="font-weight: bold;">"${message}"</span>.</p>
    <p>Our team is currently looking into the issue. In the meantime, you can try generating your podcast again:</p>
    <p class="button"><a href="${envs.clientBaseUrl}/dashboard/generate" target="_blank">Try Again</a></p>
    <p>We apologize for any inconvenience caused and appreciate your patience.</p>
</div>
`
