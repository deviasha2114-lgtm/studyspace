const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    communityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Community',
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 4000,
      trim: true,
    },
    type: {
      type: String,
      enum: ['text', 'image', 'file', 'system'],
      default: 'text',
    },
    attachments: [
      {
        url: String,
        name: String,
        size: Number,
        mimeType: String,
      },
    ],
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      default: null,
    },
    editedAt: Date,
    deletedAt: Date,
  },
  { timestamps: true }
);

// Compound index for cursor-based pagination (communityId + createdAt)
messageSchema.index({ communityId: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
