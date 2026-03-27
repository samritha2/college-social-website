const express = require("express")
const db = require("../config/db")
const verifyToken = require("../middleware/authMiddleware")

const router = express.Router()

// CREATE POST
router.post("/create", verifyToken, (req, res) => {
  const { content } = req.body

  if (!content || content.length < 2) {
    return res.status(400).json({ message: "Invalid content" })
  }

  db.query(
    "INSERT INTO posts (user_id, content, created_at) VALUES (?, ?, NOW())",
    [req.user.id, content],
    () => res.json({ message: "Post created ✅" })
  )
})

// GET POSTS (FILTER + PAGINATION + SORT)
router.get("/", (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 5
  const sort = req.query.sort || "latest"
  const offset = (page - 1) * limit

  let order = "posts.created_at DESC"
  if (sort === "popular") order = "likes DESC"

  db.query(
    `SELECT posts.*, COUNT(likes.id) as likes
     FROM posts
     LEFT JOIN likes ON posts.id = likes.post_id
     GROUP BY posts.id
     ORDER BY ${order}
     LIMIT ? OFFSET ?`,
    [limit, offset],
    (err, result) => res.json(result)
  )
})

// DELETE (SOFT DELETE)
router.delete("/delete/:id", verifyToken, (req, res) => {

  db.query("SELECT * FROM posts WHERE id=?", [req.params.id], (err, post) => {

    if (!post.length || post[0].user_id !== req.user.id) {
      return res.status(403).json({ message: "Not allowed" })
    }

    db.query(
      "UPDATE posts SET deleted=1 WHERE id=?",
      [req.params.id],
      () => res.json({ message: "Deleted 🗑️" })
    )
  })
})

// TRENDING
router.get("/trending", (req, res) => {
  db.query(
    `SELECT posts.*, COUNT(likes.id) as likes
     FROM posts
     LEFT JOIN likes ON posts.id = likes.post_id
     GROUP BY posts.id
     ORDER BY likes DESC
     LIMIT 10`,
    (err, result) => res.json(result)
  )
})

// USER POSTS
router.get("/user/:id", (req, res) => {
  db.query(
    "SELECT * FROM posts WHERE user_id=?",
    [req.params.id],
    (err, result) => res.json(result)
  )
})

// SEARCH
router.get("/search", (req, res) => {
  const q = req.query.q || ""
  db.query(
    "SELECT * FROM posts WHERE content LIKE ?",
    [`%${q}%`],
    (err, result) => res.json(result)
  )
})

module.exports = router