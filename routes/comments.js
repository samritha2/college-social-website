const express = require("express")
const db = require("../config/db")
const verifyToken = require("../middleware/authMiddleware")

const router = express.Router()

// ADD COMMENT
router.post("/add", verifyToken, (req, res) => {
  const { post_id, comment } = req.body

  if (!comment || comment.length < 1) {
    return res.status(400).json({ message: "Empty comment" })
  }

  db.query(
    "INSERT INTO comments (post_id, user_id, comment, created_at) VALUES (?, ?, ?, NOW())",
    [post_id, req.user.id, comment],
    () => res.json({ message: "Comment added 💬" })
  )
})

// GET COMMENTS
router.get("/:post_id", (req, res) => {
  db.query(
    `SELECT comments.*, users.name
     FROM comments
     JOIN users ON users.id = comments.user_id
     WHERE post_id=?`,
    [req.params.post_id],
    (err, result) => res.json(result)
  )
})

// DELETE COMMENT
router.delete("/delete/:id", verifyToken, (req, res) => {
  db.query(
    "DELETE FROM comments WHERE id=? AND user_id=?",
    [req.params.id, req.user.id],
    () => res.json({ message: "Deleted comment" })
  )
})

module.exports = router