import dotenv from "dotenv";
dotenv.config();
import express from "express";
import passport from "passport";
import Notification from '../Schema/Notification.js';

const router = express.Router();

// Get Notifications (latest 50)
router.get('', passport.authenticate("jwt", { session: false }), async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .populate('relatedItem relatedSwap')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark Single Notification as Read
router.patch('/:id/read', passport.authenticate("jwt", { session: false }), async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark All Notifications as Read
router.patch('/read-all', passport.authenticate("jwt", { session: false }), async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, isRead: false },
      { isRead: true }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
