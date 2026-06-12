import mongoose from 'mongoose'
const MenuItemSchema = new mongoose.Schema({
  menuId: String,
  day: String,
  mealType: String,
  itemName: String,
  description: String,
  cuisineType: String,
  isVeg: Boolean,
  price: Number,
  calories: Number,
  allergens: String,
  availableFrom: String,
  availableUntil: String,
  specialDiet: String
}, { collection: 'menuItems' })
export default mongoose.models.MenuItem || mongoose.model('MenuItem', MenuItemSchema)
