const express = require("express")
const db = require("../config/db")
const verifyToken = require("../middleware/authMiddleware")

const router = express.Router()

router.post("/add", verifyToken, (req, res) => {
  const { post_id, comment } = req.body
  const user_id = req.user.id

  db.query(
    "INSERT INTO comments (post_id, user_id, comment, created_at) VALUES (?, ?, ?, NOW())",
    [post_id, user_id, comment],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Something went wrong" })

      res.json({ message: "Comment added", commentId: result.insertId })
    }
  )
})

router.get("/:postId", (req, res) => {
  db.query(
    `SELECT comments.*, users.name 
     FROM comments 
     JOIN users ON comments.user_id = users.id 
     WHERE comments.post_id = ? 
     ORDER BY comments.created_at DESC`,
    [req.params.postId],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Something went wrong" })
      res.json(result)
    }
  )
})

router.delete("/:id", verifyToken, (req, res) => {
  db.query(
    "DELETE FROM comments WHERE id = ? AND user_id = ?",
    [req.params.id, req.user.id],
    (err) => {
      if (err) return res.status(500).json({ message: "Something went wrong" })
      res.json({ message: "Comment deleted" })
    }
  )
})

module.exports = router
