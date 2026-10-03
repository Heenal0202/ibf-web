import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  role: { type: String, default: 'Core Member' },
  year: { type: String, default: '2nd Year' },
  track: { type: String, default: 'Smart Contracts & EVM' },
  handle: { type: String, default: '', trim: true },
  addedAt: { type: Date, default: Date.now }
});

export default mongoose.models.Member || mongoose.model('Member', memberSchema);
