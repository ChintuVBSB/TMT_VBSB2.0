// models/Comment.js
import mongoose from 'mongoose';

export const CommentSchema = new mongoose.Schema({
  // Link to the task this comment belongs to
  Task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task', // This 'Task' must match the name you used in your Task model
    required: true,
    index: true // Indexing this field makes fetching comments for a task much faster
  },
  // Link to the user who wrote the comment
  User: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // This 'User' must match the name you used in your User model
    required: true
  },
  // The actual text content of the comment
  content: {
    type: String,
    required: true,
    trim: true
  }
}, {
  // Automatically add createdAt and updatedAt timestamps
  timestamps: true 
});

export default mongoose.model('Comment', CommentSchema);