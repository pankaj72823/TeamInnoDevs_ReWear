import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import User from '../Schema/User.js';

const secret = process.env.JWT_SECRETE;
const router = express.Router();


// POST route to register a new user
router.post('/register', async (req, res) => {
  const { name, email, password, username} = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'user with this email already exists.' });
    }

    user = new User({
      name,
      email,
      password,
      username,
    });
    
    await user.save();

    const payload = { id: user.id, name: user.name };
    const token = jwt.sign(payload, secret, { expiresIn: '1d' });

    res.status(201).json({ token: token });;
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// POST route to login and generate JWT token
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const payload = { id: user.id, name: user.name };
    const token = jwt.sign(payload, secret, { expiresIn: '1d' });

    res.json({ token: token });
  } catch (error) {
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Route to get user's profile and activity
router.get('/profile', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const userId = req.user._id; // Get the authenticated user's ID

  try {
      const user = await User.findById(userId).select('-password -_id -createdAt -updatedAt -__v');

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json(user);

  } catch (error) {
    console.log(error)
    res.status(500).json( error );
  }
});

export default router;
