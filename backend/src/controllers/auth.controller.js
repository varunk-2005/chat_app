import bcrypt from 'bcryptjs';
import express from 'express';
import User from '../models/user.model.js'; 
import {generateToken} from '../lib/utils.js';
import cloudinary from '../lib/cloudinary.js';

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const newUser = new User({
      email,
      fullname: fullName, // ✅ use `fullname` as expected by the Mongoose schema
      password: hashedPassword,
    });

    console.log("About to save new user");
    const savedUser = await newUser.save();
    console.log("User saved successfully:", savedUser);

    console.log("Generating token...");
    generateToken(newUser._id, res);
    console.log("Token generated successfully");

    return res.status(201).json({
      message: "User created successfully",
      user: {
        id: savedUser._id,
        email: savedUser.email,
      },
    });
  } catch (error) {
    console.error("Error during signup:");
    console.error("Error message:", error.message);
    console.error("Stack trace:", error.stack);

    if (error.name === 'ValidationError') {
      console.error("Validation errors:", error.errors);
    }

    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};


export const login = async(req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    const user = await User.findOne({ email });
    if(!user) {
      return res.status(404).json({ message: "Invalid email or password" });
    }
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    generateToken(user._id, res);
    return res.status(200).json({ 
      message: "Login successful",
      user: {
        _id: user._id,
        email: user.email,
        fullname: user.fullname,
        profilePic: user.profilePic,
        createdAt: user.createdAt
      }
    });
  }catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = (req, res) => {
  try {
    res.clearCookie('jwt');
    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Error during logout:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { fullName, email, profilePic } = req.body;
    const userID = req.user._id;
    
    const updateData = {};
    
    // Update fullname if provided
    if (fullName) {
      updateData.fullname = fullName;
    }
    
    // Update email if provided
    if (email) {
      // Check if email already exists for another user
      const existingUser = await User.findOne({ email, _id: { $ne: userID } });
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }
      updateData.email = email;
    }
    
    // Update profile picture if provided
    if (profilePic) {
      const uploadResponse = await cloudinary.uploader.upload(profilePic);
      updateData.profilePic = uploadResponse.secure_url;
    }
    
    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No valid fields provided for update" });
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      userID, 
      updateData, 
      { new: true, select: '-password' }
    );
    
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        ...updatedUser._doc,
        fullName: updatedUser.fullname // Map fullname to fullName for frontend
      }
    });
  } catch (error) {
    console.error("Error during profile update:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({
      user: {
        ...user._doc,
        fullName: user.fullname // Map fullname to fullName for frontend
      }
    });
  } catch (error) {
    console.error("Error during authentication check:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
