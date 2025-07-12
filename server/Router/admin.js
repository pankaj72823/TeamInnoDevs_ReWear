import dotenv from "dotenv";
dotenv.config();
import express from "express";
import passport from "passport";
import User from '../Schema/User.js';
import Item from '../Schema/Item.js';
import Swap from '../Schema/Swap.js';
import AdminLog from '../Schema/AdminLogs.js';
import Notification from '../Schema/Notification.js';

const router = express.Router();

const adminAuth = [
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  }
];
// 🟢 Get Pending Users
router.get('/users/pending', adminAuth, async (req, res) => {
  try {
    const users = await User.find({ status: 'pending' }).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🟢 Approve or Suspend User
router.patch('/users/:id/review', adminAuth, async (req, res) => {
  try {
    const { action, reason } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (action === 'approve') {
      user.status = 'active';
    } else {
      user.status = 'suspended';
    }

    await user.save();

    await new AdminLog({
      admin: req.user.id,
      action: action === 'approve' ? 'approve_user' : 'suspend_user',
      targetType: 'user',
      targetId: user._id,
      reason
    }).save();

    await new Notification({
      recipient: user._id,
      type: 'account_approved',
      title: `Account ${action === 'approve' ? 'Approved' : 'Suspended'}`,
      message: action === 'approve'
        ? 'Welcome to ReWear! Your account has been approved.'
        : `Your account has been suspended. Reason: ${reason}`,
      actionRequired: false
    }).save();

    res.json({ message: `User ${action}d successfully`, user: await User.findById(user._id).select('-password') });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🟢 Get Pending Items
router.get('/items/pending', adminAuth, async (req, res) => {
  try {
    const items = await Item.find({ status: 'pending' }).populate('owner', 'firstName lastName email').sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🟢 Approve or Reject Item
router.patch('/items/:id/review', adminAuth, async (req, res) => {
  try {
    const { action, reason, featured } = req.body;
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    if (action === 'approve') {
      item.status = 'active';
      item.featured = !!featured;
    } else {
      item.status = 'rejected';
    }

    await item.save();

    await new AdminLog({
      admin: req.user.id,
      action: action === 'approve' ? 'approve_item' : 'reject_item',
      targetType: 'item',
      targetId: item._id,
      reason
    }).save();

    await new Notification({
      recipient: item.owner,
      type: action === 'approve' ? 'item_approved' : 'item_rejected',
      title: `Item ${action === 'approve' ? 'Approved' : 'Rejected'}`,
      message: action === 'approve'
        ? `Your item "${item.title}" has been approved.`
        : `Your item "${item.title}" was rejected. Reason: ${reason}`,
      relatedItem: item._id
    }).save();

    res.json({ message: `Item ${action}d successfully`, item });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🟢 Get Swaps for Review — Removed "admin_review" status
router.get('/swaps/review', adminAuth, async (req, res) => {
  try {
    const swaps = await Swap.find({ status: 'accepted' }) // change from 'admin_review'
      .populate('requestedItem offeredItem requester itemOwner')
      .sort({ createdAt: -1 });

    res.json(swaps);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🟢 Complete Swap
router.patch('/swaps/:id/complete', adminAuth, async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id);
    if (!swap) return res.status(404).json({ error: 'Swap not found' });

    swap.status = 'completed';
    await swap.save();

    await Item.findByIdAndUpdate(swap.requestedItem, {
      status: swap.swapType === 'purchase' ? 'sold' : 'swapped',
      isAvailable: false
    });

    if (swap.offeredItem) {
      await Item.findByIdAndUpdate(swap.offeredItem, {
        status: 'swapped',
        isAvailable: false
      });
    }

    await Promise.all([
      User.findByIdAndUpdate(swap.requester, { $inc: { totalSwaps: 1 } }),
      User.findByIdAndUpdate(swap.itemOwner, { $inc: { totalSwaps: 1 } })
    ]);

    await new AdminLog({
      admin: req.user.id,
      action: 'approve_swap',
      targetType: 'swap',
      targetId: swap._id
    }).save();

    await Promise.all([
      new Notification({
        recipient: swap.requester,
        type: 'swap_completed',
        title: 'Swap Completed',
        message: 'Your swap has been marked as complete.',
        relatedSwap: swap._id
      }).save(),
      new Notification({
        recipient: swap.itemOwner,
        type: 'swap_completed',
        title: 'Swap Completed',
        message: 'Your swap has been marked as complete.',
        relatedSwap: swap._id
      }).save()
    ]);

    res.json({ message: 'Swap marked as completed', swap });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🟢 Admin Dashboard
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    const [pendingUsers, pendingItems, acceptedSwaps, totalUsers, totalItems, completedSwaps] = await Promise.all([
      User.countDocuments({ status: 'pending' }),
      Item.countDocuments({ status: 'pending' }),
      Swap.countDocuments({ status: 'accepted' }),
      User.countDocuments({ status: 'active' }),
      Item.countDocuments({ status: 'active' }),
      Swap.countDocuments({ status: 'completed' })
    ]);

    const recentActivity = await AdminLog.find().populate('admin', 'firstName lastName').sort({ createdAt: -1 }).limit(10);

    res.json({
      pendingUsers,
      pendingItems,
      acceptedSwaps,
      totalUsers,
      totalItems,
      completedSwaps,
      recentActivity
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🟢 Remove Item
router.delete('/items/:id', adminAuth, async (req, res) => {
  try {
    const { reason } = req.body;
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    const activeSwaps = await Swap.find({
      $or: [{ requestedItem: item._id }, { offeredItem: item._id }],
      status: { $in: ['pending', 'accepted'] }
    });

    if (activeSwaps.length > 0) {
      return res.status(400).json({ error: 'Cannot remove item with active swaps' });
    }

    item.status = 'rejected';
    await item.save();

    await new AdminLog({
      admin: req.user.id,
      action: 'remove_item',
      targetType: 'item',
      targetId: item._id,
      reason
    }).save();

    await new Notification({
      recipient: item.owner,
      type: 'system',
      title: 'Item Removed',
      message: `Your item "${item.title}" was removed. Reason: ${reason}`,
      relatedItem: item._id
    }).save();

    res.json({ message: 'Item removed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🟢 Feature Item
router.patch('/items/:id/feature', adminAuth, async (req, res) => {
  try {
    const { featured } = req.body;

    const item = await Item.findByIdAndUpdate(req.params.id, {
      featured: Boolean(featured)
    }, { new: true });

    if (!item) return res.status(404).json({ error: 'Item not found' });

    await new AdminLog({
      admin: req.user.id,
      action: 'feature_item',
      targetType: 'item',
      targetId: item._id,
      reason: featured ? 'Featured by admin' : 'Unfeatured by admin'
    }).save();

    res.json({ message: `Item ${featured ? 'featured' : 'unfeatured'} successfully`, item });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
