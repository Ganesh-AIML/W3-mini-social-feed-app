const router = require('express').Router();
const auth = require('../middleware/auth');
const { upload } = require('../utils/cloudinary');
const {
  getFeed,
  createPost,
  toggleLike,
  addComment,
  deletePost,
} = require('../controllers/postController');

router.get('/', auth, getFeed);
router.post('/', auth, upload.single('image'), createPost);
router.put('/:id/like', auth, toggleLike);
router.post('/:id/comment', auth, addComment);
router.delete('/:id', auth, deletePost);

module.exports = router;