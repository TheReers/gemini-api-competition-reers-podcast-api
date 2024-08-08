
export default function verifyAccountMailTemplate (name: string, otp: string) {
    return `<div class="content">
        <p>Dear ${name},</p>
        <p>Thank you for registering with Reers AI Podcast! To complete your registration, please verify your account by using the OTP below:</p>
        <p class="otp">${otp}</p>
        <p><strong>Note:</strong> This OTP is valid for 5 minutes.</p>
        <p>If you did not create an account with us, please disregard this email.</p>
    </div>
`
}
