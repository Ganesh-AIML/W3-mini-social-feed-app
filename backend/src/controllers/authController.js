const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (user) =>
  jwt.sign(
    { userId: user._id, username: user.username, avatar: user.avatar },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

// POST /api/auth/signup
const signup = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const user = await User.create({ username, email, password });
  const token = signToken(user);

  res.status(201).json({
    token,
    user: { userId: user._id, username: user.username, avatar: user.avatar },
  });
};

// POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = signToken(user);
  res.json({
    token,
    user: { userId: user._id, username: user.username, avatar: user.avatar },
  });
};

module.exports = { signup, login };