import mongoose from 'mongoose'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const __dirname = dirname(fileURLToPath(import.meta.url))

await mongoose.connect(process.env.MONGODB_URI)
console.log('Connected to MongoDB')

// Read JSON files
const library = JSON.parse(readFileSync(join(__dirname, '../data/library.json'), 'utf8'))
const cafeteria = JSON.parse(readFileSync(join(__dirname, '../data/cafeteria.json'), 'utf8'))
const events = JSON.parse(readFileSync(join(__dirname, '../data/events.json'), 'utf8'))
const courses = JSON.parse(readFileSync(join(__dirname, '../data/courses.json'), 'utf8'))
const branches = JSON.parse(readFileSync(join(__dirname, '../data/branches.json'), 'utf8'))

// Map and insert each collection — clear existing data first

// Books
const { default: Book } = await import('../lib/models/Book.js')
await Book.deleteMany({})
const bookDocs = library.map(b => ({
  bookId: b['Book ID'],
  title: b['Title'],
  author: b['Author'],
  category: b['Category'],
  isbn: b['ISBN'],
  totalCopies: Number(b['Total Copies']),
  availableCopies: Number(b['Available Copies']),
  shelf: b['Location/Shelf'],
  edition: b['Edition'],
  yearPublished: Number(b['Year Published']),
  status: b['Status']
}))
await Book.insertMany(bookDocs)
console.log(`Inserted ${bookDocs.length} books`)

// Menu Items
const { default: MenuItem } = await import('../lib/models/MenuItem.js')
await MenuItem.deleteMany({})
const menuDocs = cafeteria.map(m => ({
  menuId: m['Menu ID'],
  day: m['Day'],
  mealType: m['Meal Type'],
  itemName: m['Item Name'],
  description: m['Description'],
  cuisineType: m['Cuisine Type'],
  isVeg: m['Is Veg'] === true || m['Is Veg'] === 'TRUE' || m['Is Veg'] === 'true',
  price: Number(m['Price (₹)']),
  calories: Number(m['Calories (kcal)']),
  allergens: m['Allergens'],
  availableFrom: m['Available From'],
  availableUntil: m['Available Until'],
  specialDiet: m['Special Diet']
}))
await MenuItem.insertMany(menuDocs)
console.log(`Inserted ${menuDocs.length} menu items`)

// Events
const { default: Event } = await import('../lib/models/Event.js')
await Event.deleteMany({})
const eventDocs = events.map(e => ({
  eventId: e['Event ID'],
  eventName: e['Event Name'],
  organizingClub: e['Organizing Club'],
  category: e['Category'],
  date: e['Date'],
  startTime: e['Start Time'],
  venue: e['Venue'],
  description: e['Description']
}))
await Event.insertMany(eventDocs)
console.log(`Inserted ${eventDocs.length} events`)

// Courses
const { default: Course } = await import('../lib/models/Course.js')
await Course.deleteMany({})
const courseDocs = courses.map(c => ({
  branch: c['Branch'],
  semester: Number(c['Semester']),
  courseCode: c['Course Code'],
  courseName: c['Course Name'],
  faculty: c['Faculty'],
  credits: Number(c['Credits'])
}))
await Course.insertMany(courseDocs)
console.log(`Inserted ${courseDocs.length} courses`)

// Branches
const { default: Branch } = await import('../lib/models/Branch.js')
await Branch.deleteMany({})
let branchDocs
if (typeof branches[0] === 'string') {
  branchDocs = branches.map(name => ({ name }))
} else {
  branchDocs = branches.map(b => ({ name: Object.values(b)[0] }))
}
await Branch.insertMany(branchDocs)
console.log(`Inserted ${branchDocs.length} branches`)

await mongoose.disconnect()
console.log('Done! All data seeded to MongoDB Atlas.')
