import express from 'express';
import passport from 'passport';
import Swap from '../Schema/Swap.js';
import Item from '../Schema/Item.js';
import Notification from '../Schema/Notification.js';
import User from '../Schema/User.js';

const router = express.Router();

// Create a swap request
router.post('', passport.authenticate("jwt", { session: false }), async (req, res) => {
  try {
    const {
      requestedItemId,
      swapType,
      offeredItemId,
      purchaseAmount,
      message
    } = req.body;

    const requestedItem = await Item.findById(requestedItemId);
    if (!requestedItem || requestedItem.status !== 'active' || !requestedItem.isAvailable) {
      return res.status(400).json({ error: 'Item not available for swap' });
    }

    if (requestedItem.owner.toString() === req.user.id) {
      return res.status(400).json({ error: 'Cannot swap with your own item' });
    }

    const swapRequest = new Swap({
      requestedItem: requestedItemId,
      requester: req.user.id,
      itemOwner: requestedItem.owner,
      swapType,
      offeredItem: offeredItemId || null,
      purchaseAmount: purchaseAmount || null,
      message
    });

    await swapRequest.save();

    const notification = new Notification({
      recipient: requestedItem.owner,
      type: 'swap_request',
      title: 'New Swap Request',
      message: `Someone wants to swap with your item: ${requestedItem.title}`,
      relatedItem: requestedItemId,
      relatedSwap: swapRequest._id,
      actionRequired: true
    });

    await notification.save();

    const populatedSwap = await Swap.findById(swapRequest._id)
      .populate('requestedItem offeredItem requester itemOwner');

    res.status(201).json({
      message: 'Swap request sent successfully',
      swapRequest: populatedSwap
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's swap requests (sent/received/all)
router.get('', passport.authenticate("jwt", { session: false }), async (req, res) => {
  try {
    const { status, type = 'all' } = req.query;
    let query = {};

    if (type === 'sent') {
      query.requester = req.user.id;
    } else if (type === 'received') {
      query.itemOwner = req.user.id;
    } else {
      query.$or = [
        { requester: req.user.id },
        { itemOwner: req.user.id }
      ];
    }

    if (status) query.status = status;

    const swaps = await Swap.find(query)
      .populate('requestedItem offeredItem requester itemOwner')
      .sort({ createdAt: -1 });

    res.json(swaps);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific swap request by ID
router.get('/:id', passport.authenticate("jwt", { session: false }), async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id)
      .populate('requestedItem offeredItem requester itemOwner');

    if (!swap) {
      return res.status(404).json({ error: 'Swap request not found' });
    }

    if (swap.requester.toString() !== req.user.id && swap.itemOwner.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(swap);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Respond to a swap request (accept/decline)
router.patch('/:id/respond', passport.authenticate("jwt", { session: false }), async (req, res) => {
  try {
    const { action } = req.body; // 'accept' or 'decline'

    if (!['accept', 'decline'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action' });
    }

    const swap = await Swap.findById(req.params.id);

    if (!swap) {
      return res.status(404).json({ error: 'Swap request not found' });
    }

    if (swap.itemOwner.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only item owner can respond' });
    }

    if (swap.status !== 'pending') {
      return res.status(400).json({ error: 'Swap request already responded to' });
    }

    swap.status = action === 'accept' ? 'accepted' : 'declined';
    await swap.save();

    const notification = new Notification({
      recipient: swap.requester,
      type: action === 'accept' ? 'swap_accepted' : 'swap_declined',
      title: `Swap Request ${action === 'accept' ? 'Accepted' : 'Declined'}`,
      message: `Your swap request has been ${action === 'accept' ? 'accepted' : 'declined'}`,
      relatedSwap: swap._id,
      actionRequired: false
    });

    await notification.save();

    const updatedSwap = await Swap.findById(swap._id)
      .populate('requestedItem offeredItem requester itemOwner');

    res.json({
      message: `Swap request ${action}ed successfully`,
      swap: updatedSwap
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
