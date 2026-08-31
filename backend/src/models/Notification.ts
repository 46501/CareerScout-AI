import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['MATCH', 'DEADLINE', 'SYSTEM', 'APPLICATION'],
    default: 'SYSTEM'
  },
  read: { type: Boolean, default: false },
  link: { type: String }, // Optional link to opportunity or page
}, { timestamps: true });

export default mongoose.model('Notification', notificationSchema);
