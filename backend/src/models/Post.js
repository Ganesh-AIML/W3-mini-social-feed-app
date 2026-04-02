const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    text: { type: String, required: true, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

const postSchema = new mongoose.Schema(
  {
    author: {
      userId: { type: mongoose.Schema.Types.ObjectId, required: true },
      username: { type: String, required: true },
      avatar: { type: String, default: '' },
    },
    text: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },
    imageUrl: {
      type: String,
      default: '',
    },
    imagePublicId: {
      type: String,
      default: '',
    },
    likes: {
      type: [String], // array of usernames
      default: [],
    },
    comments: {
      type: [commentSchema],
      default: [],
    },
  },
  { timestamps: true }
);

// Ensure at least text or imageUrl is present
postSchema.pre('save', function (next) {
  if (!this.text && !this.imageUrl) {
    return next(new Error('Post must have text or an image'));
  }
  next();
});

// Virtual counts
postSchema.virtual('likesCount').get(function () {
  return this.likes.length;
});
postSchema.virtual('commentsCount').get(function () {
  return this.comments.length;
});

postSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Post', postSchema);