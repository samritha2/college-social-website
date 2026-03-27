const express = require("express")
const db = require("../config/db")
const verifyToken = require("../middleware/authMiddleware")

const router = express.Router()

router.post("/like", verifyToken, (req, res) => {
  const { post_id } = req.body

  db.query(
    "SELECT * FROM likes WHERE post_id=? AND user_id=?",
    [post_id, req.user.id],
    (err, existing) => {

      if (existing.length > 0) {
        return res.status(400).json({ message: "Already liked" })
      }

      db.query(
        "INSERT INTO likes (post_id, user_id) VALUES (?, ?)",
        [post_id, req.user.id],
        () => res.json({ message: "Liked ❤️" })
      )
    }
  )
})

// UNLIKE
router.delete("/unlike/:post_id", verifyToken, (req, res) => {
  db.query(
    "DELETE FROM likes WHERE post_id=? AND user_id=?",
    [req.params.post_id, req.user.id],
    () => res.json({ message: "Unliked" })
  )
})

// COUNT
router.get("/count/:post_id", (req, res) => {
  db.query(
    "SELECT COUNT(*) as total FROM likes WHERE post_id=?",
    [req.params.post_id],
    (err, result) => res.json(result[0])
  )
})

module.exports = router