import { connectDB } from './mongodb'
import OTP from './models/OTP'

export async function saveOTP(email, otp) {
  await connectDB()
  await OTP.deleteMany({ email })  // clear any old OTPs for this email
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000)
  await OTP.create({ email, otp, expiresAt })
}

export async function verifyOTP(email, otp) {
  await connectDB()
  const record = await OTP.findOne({ email, otp })
  if (!record) return false
  if (record.expiresAt < new Date()) {
    await OTP.deleteOne({ _id: record._id })
    return false
  }
  await OTP.deleteOne({ _id: record._id })  // one-time use
  return true
}