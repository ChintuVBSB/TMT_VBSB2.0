// controllers/notificationController.js

import Notification from "../models/Notification.js";

export const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming you have user ID from authentication middleware
//  console.log("Logged-in User ID (req.user._id):", userId);
    const notifications = await Notification.find({
      recipient: userId,
      isRead: false, // Only fetch unread notifications
    })
      .populate('task', 'title due_date') // Populate task details if needed
      .sort({ sentAt: -1 }); // Latest first

    return res.json({ success: true, notifications });
  } catch (err) {
    console.error("❌ Error fetching notifications:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const markNotificationAsRead = async (req, res) => {
    try {
        const { notificationId } = req.body;
        const userId = req.user.id; // Ensure only current user can delete their notifications

        // Find notification by ID and recipient and delete it
        const notification = await Notification.findOneAndDelete(
            { _id: notificationId, recipient: userId }
        );

        if (!notification) {
            return res.status(404).json({ success: false, message: "Notification not found or not authorized" });
        }

        return res.json({ success: true, message: "Notification deleted successfully", notification });
    } catch (err) {
        console.error("❌ Error deleting notification:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};
