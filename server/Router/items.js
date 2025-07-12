import dotenv from "dotenv";
dotenv.config();
import express from "express";
import passport from "passport";
import upload from "../config/multer.js";
import Item from '../Schema/Item.js'
import Swap from '../Schema/Swap.js'

const router = express.Router();

router.get('', async (req, res) => {
  try {
    const {
      category,
      size,
      condition,
      brand,
      minPrice,
      maxPrice,
      search,
      sort = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 20
    } = req.query;
    
    const query = { status: 'active', isAvailable: true };
    
    // Apply filters
    if (category) query.category = category;
    if (size) query.size = size;
    if (condition) query.condition = condition;
    if (brand) query.brand = new RegExp(brand, 'i');
    if (minPrice || maxPrice) {
      query.alternativePrice = {};
      if (minPrice) query.alternativePrice.$gte = Number(minPrice);
      if (maxPrice) query.alternativePrice.$lte = Number(maxPrice);
    }
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
         { tags: { $regex: search, $options: 'i' } }
      ];
    }
    
    const sortObj = {};
    sortObj[sort] = order === 'desc' ? -1 : 1;
    
    const items = await Item.find(query)
      .populate('owner', 'firstName lastName rating totalSwaps')
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(Number(limit));
    
    const total = await Item.countDocuments(query);
    
    res.json({
      items,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Featured Items
router.get('/featured', async (req, res) => {
  try {
    const items = await Item.find({
      status: 'active',
      featured: true,
      isAvailable: true
    })
    .populate('owner', 'firstName lastName rating')
    .sort({ createdAt: -1 })
    .limit(10);
    
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Item by ID
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('owner', 'firstName lastName profilePicture rating totalSwaps joinedAt');
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    // Increment view count
    item.views += 1;
    await item.save();
    
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create New Item
router.post('', passport.authenticate("jwt", { session: false }), upload.array('images', 5), async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      type,
      size,
      condition,
      brand,
      material,
      tags,
      alternativePrice,
      location
    } = req.body;
    
    const images = req.files.map((file, index) => ({
      url: file.path,
      publicId: file.filename,
      isPrimary: index === 0
    }));
    
    const item = new Item({
      title,
      description,
      category,
      type,
      size,
      condition,
      brand,
      material,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      alternativePrice: alternativePrice ? Number(alternativePrice) : null,
      location,
      images,
      owner: req.user.id
    });
    
    await item.save();
    
    res.status(201).json({
      message: 'Item submitted for approval',
      item
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Item
router.put('/:id', passport.authenticate("jwt", { session: false }), upload.array('images', 5), async (req, res) => {
  try {
    const item = await Item.findOne({ _id: req.params.id, owner: req.user.id });
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    // Only allow updates if item is in draft or rejected status
    if (!['draft', 'rejected'].includes(item.status)) {
      return res.status(400).json({ error: 'Cannot update item in current status' });
    }
    
    const updates = { ...req.body };
    
    if (req.files && req.files.length > 0) {
      updates.images = req.files.map((file, index) => ({
        url: file.path,
        publicId: file.filename,
        isPrimary: index === 0
      }));
    }
    
    if (updates.tags && typeof updates.tags === 'string') {
      updates.tags = updates.tags.split(',').map(tag => tag.trim());
    }
    
    updates.status = 'pending'; // Reset to pending after update
    
    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );
    
    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete Item
router.delete('/:id', passport.authenticate("jwt", { session: false }), async (req, res) => {
  try {
    const item = await Item.findOne({ _id: req.params.id, owner: req.user.id });
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    // Check if item has active swaps
    const activeSwaps = await Swap.find({
      $or: [
        { requestedItem: req.params.id },
        { offeredItem: req.params.id },
        { uploadedItem: req.params.id }
      ],
      status: { $in: ['pending', 'accepted', 'admin_review'] }
    });
    
    if (activeSwaps.length > 0) {
      return res.status(400).json({ error: 'Cannot delete item with active swaps' });
    }
    
    await Item.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


export default router