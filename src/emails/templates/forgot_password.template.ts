
export default function forgotPasswordMailTemplate (name: string, otp: string) {
    return `
<div class="content">
    <p>Dear ${name},</p>
    <p>We received a request to reset your password for your Reers AI Podcast account. To reset your password, please use the OTP below:</p>
    <p class="otp">${otp}</p>
    <p><strong>Note:</strong> This OTP is valid for 5 minutes.</p>
    <p>If you did not request a password reset, please ignore this email. Your password will remain unchanged.</p>
</div>
`
}
