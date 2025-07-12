import dotenv from "dotenv";
dotenv.config();
import express from "express";
import jwt from "jsonwebtoken";
import passport from "passport";
import User from "../Schema/User.js";
import upload from "../config/multer.js";
const secret = process.env.JWT_SECRET;
const router = express.Router();

// POST route to register a new user
router.post('/register', upload.single('profilePicture'), async (req, res) => {
  const {
    email,
    password,
    firstName,
    lastName,
    phone,
    address_location,
    address_city,
    address_state,
    bio,
  } = req.body;

  try {
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    const newUser = new User({
      email,
      password,
      firstName,
      lastName,
      phone,
      bio,
      address: {
        location: address_location,
        city: address_city,
        state: address_state,
      },
      profilePicture: req.file?.path || null,
    });

    await newUser.save();

    const payload = { id: newUser.id, role: newUser.role };
    const token = jwt.sign(payload, secret, { expiresIn: '1d' });

    res.status(201).json({ token });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// POST route to login and generate JWT token
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    user.lastLogin = new Date();
    await user.save();

    const payload = { id: user.id, role: user.role };
    const token = jwt.sign(payload, secret, { expiresIn: "1d" });

    res.json({ token: token , 
       user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        totalSwaps: user.totalSwaps,
      }});
  } catch (error) {
    res.status(500).json({ error: "Failed to login" });
  }
});

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ token });
  }
);
// Route to get user's profile and activity
router.get(
  "/profile",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const userId = req.user._id; // Get the authenticated user's ID

    try {
      const user = await User.findById(userId).select(
        "-password -_id -createdAt -updatedAt -__v"
      );

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(user);
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  }
);

router.get('/init-admin', async (req, res) => {
  try {
    const existingAdmin = await User.findOne({ role: 'admin' });

    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    const adminUser = new User({
      firstName: 'Super',
      lastName: 'Admin',
      email: 'admin@rewear.com',
      password: 'admin123',
      role: 'admin',
      status: 'active',
    });

    await adminUser.save();

    const token = jwt.sign({ id: adminUser._id, role: 'admin' }, secret, { expiresIn: '1d' });

    res.status(201).json({
      message: 'Admin initialized successfully',
      admin: {
        id: adminUser._id,
        email: adminUser.email,
      },
      token,
    });
  } catch (error) {
    console.error('Init Admin Error:', error);
    res.status(500).json({ error: 'Failed to initialize admin' });
  }
});
export default router;
