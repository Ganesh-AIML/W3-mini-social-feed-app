const Post = require('../models/Post');
const { deleteImage } = require('../utils/cloudinary');

// GET /api/posts?page=1&limit=10
const getFeed = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(20, parseInt(req.query.limit) || 10);
  const skip = (page - 1) * limit;

  const [posts, total] = await Promise.all([
    Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean({ virtuals: true }),
    Post.countDocuments(),
  ]);

  res.json({
    posts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    },
  });
};

// POST /api/posts
const createPost = async (req, res) => {
  const { text } = req.body;
  const imageUrl = req.file?.path || '';
  const imagePublicId = req.file?.filename || '';

  if (!text?.trim() && !imageUrl) {
    return res.status(400).json({ message: 'Post must have text or an image' });
  }

  const post = await Post.create({
    author: {
      userId: req.user.userId,
      username: req.user.username,
      avatar: req.user.avatar,
    },
    text: text?.trim() || '',
    imageUrl,
    imagePublicId,
  });

  res.status(201).json(post.toJSON());
};

// PUT /api/posts/:id/like  (toggle)
const toggleLike = async (req, res) => {
  const { username } = req.user;
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });

  const idx = post.likes.indexOf(username);
  if (idx === -1) {
    post.likes.push(username);
  } else {
    post.likes.splice(idx, 1);
  }

  await post.save();
  res.json({ likes: post.likes, likesCount: post.likes.length });
};

// POST /api/posts/:id/comment
const addComment = async (req, res) => {
  const { text } = req.body;
  if (!text?.trim()) {
    return res.status(400).json({ message: 'Comment cannot be empty' });
  }

  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });

  const comment = {
    username: req.user.username,
    userId: req.user.userId,
    text: text.trim(),
  };

  post.comments.push(comment);
  await post.save();

  // Return the newly added comment with its generated _id
  const newComment = post.comments[post.comments.length - 1];
  res.status(201).json({
    comment: newComment,
    commentsCount: post.comments.length,
  });
};

// DELETE /api/posts/:id
const deletePost = async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });

  if (String(post.author.userId) !== String(req.user.userId)) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  if (post.imagePublicId) await deleteImage(post.imagePublicId);
  await post.deleteOne();

  res.json({ message: 'Post deleted' });
};

module.exports = { getFeed, createPost, toggleLike, addComment, deletePost };