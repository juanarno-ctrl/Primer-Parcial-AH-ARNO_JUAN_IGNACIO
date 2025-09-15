import mongoose from 'mongoose';

const typeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, lowercase: true, trim: true }
}, { timestamps: true });

export default mongoose.model('type', typeSchema);
