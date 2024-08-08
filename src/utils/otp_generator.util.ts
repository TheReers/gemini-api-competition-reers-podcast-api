export default function generateOtp (digit = 4) {
    let otp = ''
    for (let i = 0; i < digit; i++) {
        otp += Math.floor(Math.random() * 10)
    }
    return otp
}
