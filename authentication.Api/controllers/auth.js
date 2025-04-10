const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');

const router = express.Router();

// Register User
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  const existingUser = await User.findOne({ email });
  if (existingUser) return res.status(400).json({ error: 'Email already registered' });

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ name, email, password: hashedPassword });
  await user.save();

  res.status(201).json({ message: 'User registered successfully' });
});

// Login User
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ error: 'User not found' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(403).json({ error: 'Invalid password' });

  const userPayload = { name: user.name, email: user.email };
  const accessToken = jwt.sign(userPayload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  const refreshToken = jwt.sign(userPayload, process.env.REFRESH_TOKEN_SECRET);

  await RefreshToken.create({
    token: refreshToken,
    email: user.email,
    expiresAt: expiresAt
  });

  res.json({ accessToken, refreshToken });
});

// Refresh Access Token
router.post('/token', async (req, res) => {
  const refreshToken = req.body.token;
  if (!refreshToken) return res.sendStatus(401);

  const tokenRecord = await RefreshToken.findOne({ token: refreshToken });
  if (!tokenRecord) return res.sendStatus(403);

  const currentDate = new Date();
  if (currentDate > tokenRecord.expiresAt) {
    await RefreshToken.deleteOne({ token: refreshToken });
    return res.sendStatus(403).json({ message: 'access token is expired' });
  }

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);

    const newAccessToken = jwt.sign({ name: user.name, email: user.email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15s' });
    res.json({ accessToken: newAccessToken });
  });
});


// Logout
router.delete('/logout', async (req, res) => {
  const token = req.body.token;
  await RefreshToken.deleteOne({ token });
  res.sendStatus(204);
});

module.exports = router;
