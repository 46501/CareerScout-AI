import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: 'OPPORTUNITY_MATCH' | 'DEADLINE_WARNING' | 'RESUME_ANALYZED' | 'SCOUT_COMPLETED' | 'SYSTEM';
  read: boolean;
  actionUrl?: string;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { 
      type: String, 
      enum: ['OPPORTUNITY_MATCH', 'DEADLINE_WARNING', 'RESUME_ANALYZED', 'SCOUT_COMPLETED', 'SYSTEM'],
      required: true 
    },
    read: { type: Boolean, default: false },
    actionUrl: { type: String },
  },
  { timestamps: true }
);

NotificationSchema.index({ user: 1, read: 1 });
NotificationSchema.index({ createdAt: -1 });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
