import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  email:     { type: String, required: true, unique: true, lowercase: true },
  username:  { type: String, default: '' },
  provider:  { type: String, enum: ['google', 'email'], required: true },
  branch:    { type: String, default: '' },
  year:      { type: String, default: '' },
  semester:  { type: String, default: '' },
  clubs:     { type: [String], default: [] },
  favDishes: { type: [String], default: [] },
  isOnboarded: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now }
})

export default mongoose.models.User || mongoose.model('User', UserSchema)
