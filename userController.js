// Assuming you have a User model, e.g.,
// import User from '../models/userModel.js';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  // The user object is attached to the request in the `protect` middleware
  const user = req.user;

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profileImageUrl: user.profileImageUrl || `https://ui-avatars.com/api/?name=${user.name.replace(' ', '+')}&background=random`,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

export { getUserProfile };