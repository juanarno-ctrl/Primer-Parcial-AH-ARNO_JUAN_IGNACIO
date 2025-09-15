import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, minlength: 2 },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  password_hash: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model('user', userSchema);
