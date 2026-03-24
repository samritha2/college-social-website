const express = require("express")
const db = require("../config/db")
const verifyToken = require("../middleware/authMiddleware")

const router = express.Router()

router.post("/toggle", verifyToken, (req, res) => {
  const { post_id } = req.body
  const user_id = req.user.id

  db.query(
    "SELECT * FROM likes WHERE post_id = ? AND user_id = ?",
    [post_id, user_id],
    (err, result) => {
      if (result.length > 0) {
        db.query(
          "DELETE FROM likes WHERE post_id = ? AND user_id = ?",
          [post_id, user_id],
          (err) => {
            if (err) return res.status(500).json({ message: "Error" })

            return res.json({ message: "Post unliked" })
          }
        )
      } else {
        db.query(
          "INSERT INTO likes (post_id, user_id) VALUES (?, ?)",
          [post_id, user_id],
          (err) => {
            if (err) return res.status(500).json({ message: "Error" })

            return res.json({ message: "Post liked" })
          }
        )
      }
    }
  )
})

router.get("/:postId", (req, res) => {
  db.query(
    "SELECT COUNT(*) AS total_likes FROM likes WHERE post_id = ?",
    [req.params.postId],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Error" })
      res.json(result[0])
    }
  )
})

module.exports = router
