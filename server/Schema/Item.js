import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  category: {
    type: String,
    required: true,
    enum: ['tops', 'bottoms', 'dresses', 'formal']
  },
  type: {
    type: String,
    required: true,
    enum: ['shirt', 'blouse', 'jeans', 'pants', 'skirt', 'dress', 'jacket', 'coat', 'bag', 'other']
  },
  size: {
    type: String,
    required: true,
    enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', '38', '40', '42', '6', '7', '8', '9', '10', '11', '12', 'One Size']
  },
  condition: {
    type: String,
    required: true,
    enum: ['new', 'like-new', 'good', 'fair', 'poor']
  },
  brand: {
    type: String,
    trim: true
  },
  material: {
    type: String,
    trim: true
  },
  images: [{
    url: String,
    publicId: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  alternativePrice: {
    type: Number,
    min: 0,
    default: null
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'active', 'swapped', 'sold', 'rejected'],
    default: 'pending'
  },
  location: {
    location : String,
    city: String,
    state: String,
  },
  views: {
    type: Number,
    default: 0
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

itemSchema.index({ owner: 1 });
itemSchema.index({ status: 1 });
itemSchema.index({ category: 1 });
itemSchema.index({ condition: 1 });
itemSchema.index({ createdAt: -1 });
itemSchema.index({ featured: 1 });

const Item = mongoose.model("Item", itemSchema);
export default Item;
