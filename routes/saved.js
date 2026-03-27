const express = require("express")
const db = require("../config/db")
const verifyToken = require("../middleware/authMiddleware")

const router = express.Router()

// SAVE
router.post("/", verifyToken, (req, res) => {
  const { post_id } = req.body

  db.query(
    "INSERT INTO saved_posts (user_id, post_id) VALUES (?, ?)",
    [req.user.id, post_id],
    (err) => {
      if (err) return res.status(400).json({ message: "Already saved" })
      res.json({ message: "Saved ⭐" })
    }
  )
})

// GET SAVED
router.get("/", verifyToken, (req, res) => {
  db.query(
    `SELECT posts.* FROM saved_posts
     JOIN posts ON posts.id=saved_posts.post_id
     WHERE saved_posts.user_id=?`,
    [req.user.id],
    (err, result) => res.json(result)
  )
})

// REMOVE SAVED
router.delete("/:post_id", verifyToken, (req, res) => {
  db.query(
    "DELETE FROM saved_posts WHERE user_id=? AND post_id=?",
    [req.user.id, req.params.post_id],
    () => res.json({ message: "Removed" })
  )
})

module.exports = router