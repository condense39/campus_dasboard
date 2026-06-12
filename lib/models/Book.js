import mongoose from 'mongoose'
const BookSchema = new mongoose.Schema({
  bookId: String,
  title: String,
  author: String,
  category: String,
  isbn: String,
  totalCopies: Number,
  availableCopies: Number,
  shelf: String,
  edition: String,
  yearPublished: Number,
  status: String
}, { collection: 'books' })
export default mongoose.models.Book || mongoose.model('Book', BookSchema)
