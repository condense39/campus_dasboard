import mongoose from 'mongoose'
const BranchSchema = new mongoose.Schema({
  name: String
}, { collection: 'branches' })
export default mongoose.models.Branch || mongoose.model('Branch', BranchSchema)
