import mongoose from "mongoose";

const swapRequestSchema = new mongoose.Schema({
  requestedItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  itemOwner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  swapType: {
    type: String,
    enum: ['purchase', 'swap'],
    required: true
  },
  offeredItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    default: null
  },
  purchaseAmount: {
    type: Number,
    default: null
  },
  message: {
    type: String,
    maxlength: 500
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'completed', 'cancelled'],
    default: 'pending'
  },
}, {
  timestamps: true
});

swapRequestSchema.index({ requester: 1 });
swapRequestSchema.index({ itemOwner: 1 });
swapRequestSchema.index({ status: 1 });
swapRequestSchema.index({ createdAt: -1 });

const Swap = mongoose.model("Swap", swapRequestSchema);
export default Swap;
