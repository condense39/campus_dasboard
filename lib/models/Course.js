import mongoose from 'mongoose'
const CourseSchema = new mongoose.Schema({
  branch: String,
  semester: Number,
  courseCode: String,
  courseName: String,
  faculty: String,
  credits: Number
}, { collection: 'courses' })
export default mongoose.models.Course || mongoose.model('Course', CourseSchema)
