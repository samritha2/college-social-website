const jwt = require("jsonwebtoken")

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization

  // Check if header exists
  if (!authHeader) {
    return res.status(403).json({ message: "No token provided ❌" })
  }

  // Check format: Bearer token
  if (!authHeader.startsWith("Bearer ")) {
    return res.status(403).json({ message: "Invalid token format ❌" })
  }

  const token = authHeader.split(" ")[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Attach user info
    req.user = {
      id: decoded.id,
      role: decoded.role
    }

    next()

  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token ❌" })
  }
}

module.exports = verifyToken