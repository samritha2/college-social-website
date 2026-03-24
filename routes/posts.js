const express = require("express")
const db = require("../config/db")
const verifyToken = require("../middleware/authMiddleware")

const router = express.Router()

router.post("/create", verifyToken, (req, res) => {
  const { club_id, content, image } = req.body
  const userId = req.user.id

  db.query("SELECT * FROM clubs WHERE id = ?", [club_id], (err, club) => {
    if (club.length === 0) return res.status(404).json({ message: "Club not found" })

    if (club[0].created_by !== userId) {
      return res.status(403).json({ message: "Only owner can create posts" })
    }

    db.query(
      "INSERT INTO posts (club_id, content, image, created_at) VALUES (?, ?, ?, NOW())",
      [club_id, content, image],
      (err, result) => {
        if (err) return res.status(500).json({ message: "Something went wrong" })
        res.json({ message: "Post created", postId: result.insertId })
      }
    )
  })
})

router.put("/edit/:id", verifyToken, (req, res) => {
  const { content, image } = req.body
  const userId = req.user.id

  db.query("SELECT * FROM posts WHERE id = ?", [req.params.id], (err, post) => {
    const clubId = post[0].club_id

    db.query("SELECT * FROM clubs WHERE id = ?", [clubId], (err, club) => {
      if (club[0].created_by !== userId) {
        return res.status(403).json({ message: "Only owner can edit" })
      }

      db.query(
        "UPDATE posts SET content = ?, image = ? WHERE id = ?",
        [content, image, req.params.id],
        () => res.json({ message: "Post updated" })
      )
    })
  })
})

router.delete("/delete/:id", verifyToken, (req, res) => {
  const userId = req.user.id

  db.query("SELECT * FROM posts WHERE id = ?", [req.params.id], (err, post) => {
    const clubId = post[0].club_id

    db.query("SELECT * FROM clubs WHERE id = ?", [clubId], (err, club) => {
      if (club[0].created_by !== userId) {
        return res.status(403).json({ message: "Only owner can delete" })
      }

      db.query("DELETE FROM posts WHERE id = ?", [req.params.id], () => {
        res.json({ message: "Post deleted" })
      })
    })
  })
})

module.exports = router
