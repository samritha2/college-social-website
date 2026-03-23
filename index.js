require("dotenv").config()

const express = require("express")
const cors = require("cors")

const app = express()

app.use(cors())
app.use(express.json())

const db = require("./config/db")

// Routes
const authRoutes = require("./routes/auth")
const clubRoutes = require("./routes/clubs")
const postRoutes = require("./routes/posts")
const commentRoutes = require("./routes/comments")
const likeRoutes = require("./routes/likes")
const followerRoutes = require("./routes/followers")
const aiRoutes = require("./routes/ai")

app.use("/api/auth", authRoutes)
app.use("/api/clubs", clubRoutes)
app.use("/api/posts", postRoutes)
app.use("/api/comments", commentRoutes)
app.use("/api/likes", likeRoutes)
app.use("/api/followers", followerRoutes)
app.use("/api/ai", aiRoutes)

const verifyToken = require("./middleware/authMiddleware")

app.get("/api/protected", verifyToken, (req, res) => {
  res.json({
    message: "You accessed a protected route 🎉",
    user: req.user
  })
})

app.get("/", (req, res) => {
  res.send("College Social Media Backend Running 🚀")
})

app.listen(5000, () => {
  console.log("Server running on port 5000")
})
