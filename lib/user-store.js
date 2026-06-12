import { connectDB } from './mongodb'
import User from './models/User'

export async function getUserByEmail(email) {
  await connectDB()
  return User.findOne({ email: email.toLowerCase() }).lean()
}

export async function createUser(userData) {
  await connectDB()
  const user = new User(userData)
  return user.save()
}

export async function updateUser(email, updates) {
  await connectDB()
  return User.findOneAndUpdate(
    { email: email.toLowerCase() },
    { $set: updates },
    { new: true }
  ).lean()
}