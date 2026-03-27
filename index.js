require("dotenv").config()

const express = require("express")
const cors = require("cors")

const app = express()

// =======================
// 🔥 MIDDLEWARE
// =======================
app.use(cors())
app.use(express.json())

// 🔥 Request Logger (logs every request)
const requestLogger = require("./middleware/requestLogger")
app.use(requestLogger)

// =======================
// 🔥 DATABASE CONNECTION
// =======================
require("./config/db") // ensures DB connects

// =======================
// 🔥 ROUTES
// =======================
app.use("/api/auth", require("./routes/auth"))
app.use("/api/users", require("./routes/users"))
app.use("/api/clubs", require("./routes/clubs"))
app.use("/api/posts", require("./routes/posts"))
app.use("/api/comments", require("./routes/comments"))
app.use("/api/likes", require("./routes/likes"))
app.use("/api/followers", require("./routes/followers"))
app.use("/api/notifications", require("./routes/notifications"))
app.use("/api/saved", require("./routes/saved"))
app.use("/api/profile", require("./routes/profile"))
app.use("/api/reports", require("./routes/reports"))
app.use("/api/admin", require("./routes/admin"))

// Optional AI route (only if file exists)
try {
  app.use("/api/ai", require("./routes/ai"))
} catch (err) {
  console.log("AI route not found, skipping...")
}

// =======================
// 🔐 PROTECTED TEST ROUTE
// =======================
const verifyToken = require("./middleware/authMiddleware")

app.get("/api/protected", verifyToken, (req, res) => {
  res.json({
    success: true,
    message: "You accessed a protected route 🎉",
    user: req.user
  })
})

// =======================
// 🏠 DEFAULT ROUTE
// =======================
app.get("/", (req, res) => {
  res.send("College Social Media Backend Running 🚀")
})

// =======================
// ❌ ERROR HANDLER (ALWAYS LAST)
// =======================
const errorHandler = require("./middleware/errorHandler")
app.use(errorHandler)

// =======================
// 🚀 START SERVER
// =======================
const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`)
})