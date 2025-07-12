import mongoose from "mongoose";

const adminLogSchema = new mongoose.Schema({
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    enum: ['approve_user', 'reject_user', 'approve_item', 'reject_item', 'remove_item', 'approve_swap', 'reject_swap', 'suspend_user', 'feature_item'],
    required: true
  },
  targetType: {
    type: String,
    enum: ['user', 'item', 'swap'],
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  reason: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

adminLogSchema.index({ admin: 1 });
adminLogSchema.index({ createdAt: -1 });

const AdminLogs = mongoose.model("AdminLogs", adminLogSchema);
export default AdminLogs;