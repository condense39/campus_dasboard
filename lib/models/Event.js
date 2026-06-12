import mongoose from 'mongoose'
const EventSchema = new mongoose.Schema({
  eventId: String,
  eventName: String,
  organizingClub: String,
  category: String,
  date: String,
  startTime: String,
  venue: String,
  description: String
}, { collection: 'events' })
export default mongoose.models.Event || mongoose.model('Event', EventSchema)
