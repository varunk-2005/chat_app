import bcrypt from 'bcryptjs';
import User from '../models/user.model.js'; 
import { generateToken } from '../lib/utils.js';
import cloudinary from '../lib/cloudinary.js';

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    if (!fullName || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    if (password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters long" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = new User({ email, fullname: fullName, password: hashedPassword });
    const savedUser = await newUser.save();
    const token = generateToken(savedUser._id);

    return res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        _id: savedUser._id,
        email: savedUser.email,
        fullName: savedUser.fullname,
        profilePic: savedUser.profilePic,
      },
    });
  } catch (error) {
    console.error("Signup error:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "Invalid email or password" });

    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid)
      return res.status(400).json({ message: "Invalid email or password" });

    const token = generateToken(user._id);

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        email: user.email,
        fullName: user.fullname,
        profilePic: user.profilePic,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = (req, res) => {
  return res.status(200).json({ message: "Logout successful" });
};

export const updateProfile = async (req, res) => {
  try {
    const { fullName, email, profilePic } = req.body;
    const userID = req.user._id;
    const updateData = {};

    if (fullName) updateData.fullname = fullName;

    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userID } });
      if (existingUser)
        return res.status(400).json({ message: "Email already in use" });
      updateData.email = email;
    }

    if (profilePic) {
      const uploadResponse = await cloudinary.uploader.upload(profilePic);
      updateData.profilePic = uploadResponse.secure_url;
    }

    if (Object.keys(updateData).length === 0)
      return res.status(400).json({ message: "No valid fields provided for update" });

    const updatedUser = await User.findByIdAndUpdate(userID, updateData, { new: true }).select('-password');

    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });

    return res.status(200).json({
      message: "Profile updated successfully",
      user: {
        _id: updatedUser._id,
        email: updatedUser.email,
        fullName: updatedUser.fullname,
        profilePic: updatedUser.profilePic,
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user)
      return res.status(404).json({ message: "User not found" });

    return res.status(200).json({
      user: {
        _id: user._id,
        email: user.email,
        fullName: user.fullname,
        profilePic: user.profilePic,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("CheckAuth error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
