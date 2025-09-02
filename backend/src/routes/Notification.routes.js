// routes/notificationRoutes.js
import express from "express"
 
import { sendTaskReminder } from '../controllers/task.controller.js'
import {getMyNotifications, markNotificationAsRead }from '../controllers/notificationController.js'
import { verifyToken } from '../middlewares/authMiddleware.js'

const router = express.Router();

// Route to manually trigger a reminder (your bell button will hit this)
// This will now SAVE the notification to DB and optionally send via Socket.IO
router.post('/send', verifyToken, sendTaskReminder); // Protect this route if only authenticated users can send reminders

// Route to get all unread notifications for the logged-in user
router.get('/my', verifyToken, getMyNotifications);

// Route to mark a specific notification as read
router.post('/read', verifyToken, markNotificationAsRead);

export default router;