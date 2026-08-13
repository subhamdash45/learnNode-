const jwt = require("jsonwebtoken");
const { User } = require("../mongooseModels/user");

const authMiddleware = async (req, res, next) => {
  const {token} = req.cookies;
  console.log(token, "token in auth middleware");
  if (!token) {
    return res.status(401).json({ message: "Unauthorized", success: false, data: null });
  }
  const decoded = await jwt.verify(token, process.env.JWT_SECRET);
  if (!decoded || !decoded.id) {
    return res.status(401).json({ message: "Unauthorized", success: false, data: null });
  }
  const user = await User.findById(decoded.id).select("-password").lean();
  if (!user) {
    return res.status(401).json({ message: "Unauthorized", success: false, data: null });
  }
  req.user = user;
  console.log(req.user, "req.user in auth middleware");
  next();
}

module.exports = {authMiddleware};