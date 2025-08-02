// You can fetch more user data if needed (e.g. from DB)
export const getProfile = async (req, res) => {
  try {
    const user = req.user; // comes from protectRoute middleware

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    res.status(200).json({ user });
  } catch (err) {
    console.error('Error in getProfile:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
