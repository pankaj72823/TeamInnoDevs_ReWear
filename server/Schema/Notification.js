import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['swap_request', 'swap_accepted', 'swap_declined', 'swap_completed', 'item_approved', 'item_rejected', 'account_approved', 'system'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  relatedItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item'
  },
  relatedSwap: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SwapRequest'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  actionRequired: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });


const Notification = mongoose.model("Swap", notificationSchema);
export default Notification;