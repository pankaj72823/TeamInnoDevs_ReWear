import dotenv from "dotenv";
dotenv.config();
import express from "express";
import jwt from "jsonwebtoken";
import passport from "passport";
import User from "../Schema/User.js";
import upload from "../config/multer.js";
import Item from '../Schema/Item.js'
import Swap from '../Schema/Swap.js'

const secret = process.env.JWT_SECRET;
const router = express.Router();

router.get('/dashboard',  passport.authenticate("jwt", { session: false }), async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    const userItems = await Item.find({ owner: req.user.id });
    const activeSwaps = await Swap.find({
      $or: [
        { requester: req.user.id },
        { itemOwner: req.user.id }
      ],
      status: { $in: ['pending', 'accepted', 'admin_review'] }
    }).populate('requestedItem offeredItem uploadedItem requester itemOwner');
    
    const completedSwaps = await Swap.find({
      $or: [
        { requester: req.user.id },
        { itemOwner: req.user.id }
      ],
      status: 'completed'
    }).populate('requestedItem offeredItem uploadedItem requester itemOwner');
    
    res.json({
      user,
      items: userItems,
      activeSwaps,
      completedSwaps,
      stats: {
        totalItems: userItems.length,
        activeItems: userItems.filter(item => item.status === 'active').length,
        totalSwaps: user.totalSwaps,
        points: user.points,
        rating: user.rating
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Update User Profile
router.put('/profile', passport.authenticate("jwt", { session: false }), upload.single('profilePicture'), async (req, res) => {
  try {
    const updates = { ...req.body };
    if (req.file) {
      updates.profilePicture = req.file.path;
    }
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true }
    ).select('-password');
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
