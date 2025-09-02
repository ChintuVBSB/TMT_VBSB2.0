// models/Notification.js (Example - Mongoose Schema)
import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema({
  recipient: { // Kisko reminder bhejna hai (staffId)
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming your staff/user model is named 'User'
    required: true,
  },
  task: { // Kis task ke liye reminder hai
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task', // Assuming your task model is named 'Task'
    required: true,
  },
  message: { // Reminder ka message
    type: String,
    required: true,
  },
  sentAt: { // Reminder kab create hua
    type: Date,
    default: Date.now,
  },
  isRead: { // User ne padh liya hai ya nahi
    type: Boolean,
    default: false,
  },
  // Aur fields add kar sakte ho jaise: priority, dueDate, etc.
});

export default mongoose.model('Notification', notificationSchema);