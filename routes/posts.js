const express = require("express")
const db = require("../config/db")
const verifyToken = require("../middleware/authMiddleware")

const router = express.Router()

router.post("/create", verifyToken, (req, res) => {
  const { club_id, content, image } = req.body
  const userId = req.user.id

  if (!club_id || !content) {
    return res.status(400).json({ message: "Club and content required" })
  }

  db.query(
    "SELECT * FROM clubs WHERE id = ?",
    [club_id],
    (err, clubResult) => {
      if (err) return res.status(500).json({ message: "Something went wrong" })

      if (clubResult.length === 0) {
        return res.status(404).json({ message: "Club not found" })
      }

      if (clubResult[0].created_by !== userId) {
        return res.status(403).json({
          message: "Only club owner can create posts"
        })
      }

      db.query(
        "INSERT INTO posts (club_id, content, image, created_at) VALUES (?, ?, ?, NOW())",
        [club_id, content, image],
        (err, result) => {
          if (err) return res.status(500).json({ message: "Something went wrong" })

          res.json({
            message: "Post created successfully",
            postId: result.insertId
          })
        }
      )
    }
  )
})

router.delete("/delete/:id", verifyToken, (req, res) => {
  const postId = req.params.id
  const userId = req.user.id

  db.query(
    "SELECT * FROM posts WHERE id = ?",
    [postId],
    (err, postResult) => {
      if (err) return res.status(500).json({ message: "Something went wrong" })

      if (postResult.length === 0) {
        return res.status(404).json({ message: "Post not found" })
      }

      const clubId = postResult[0].club_id

      db.query(
        "SELECT * FROM clubs WHERE id = ?",
        [clubId],
        (err, clubResult) => {
          if (err) return res.status(500).json({ message: "Something went wrong" })

          if (clubResult[0].created_by !== userId) {
            return res.status(403).json({
              message: "Only owner can delete posts of this club"
            })
          }

          db.query(
            "DELETE FROM posts WHERE id = ?",
            [postId],
            (err) => {
              if (err) return res.status(500).json({ message: "Something went wrong" })

              res.json({
                message: "Post deleted successfully"
              })
            }
          )
        }
      )
    }
  )
})

router.get("/all", (req, res) => {
  const query = `
    SELECT 
      posts.*, 
      clubs.club_name,
      COUNT(likes.id) AS like_count
    FROM posts
    JOIN clubs ON posts.club_id = clubs.id
    LEFT JOIN likes ON posts.id = likes.post_id
    GROUP BY posts.id
    ORDER BY posts.created_at DESC
  `

  db.query(query, (err, result) => {
    if (err) return res.status(500).json({ message: "Something went wrong" })
    res.json(result)
  })
})

router.get("/club/:id", (req, res) => {
  const clubId = req.params.id

  const query = `
    SELECT 
      posts.*, 
      clubs.club_name,
      COUNT(likes.id) AS like_count
    FROM posts
    JOIN clubs ON posts.club_id = clubs.id
    LEFT JOIN likes ON posts.id = likes.post_id
    WHERE posts.club_id = ?
    GROUP BY posts.id
    ORDER BY posts.created_at DESC
  `

  db.query(query, [clubId], (err, result) => {
    if (err) return res.status(500).json({ message: "Something went wrong" })
    res.json(result)
  })
})

router.get("/feed", verifyToken, (req, res) => {
  const user_id = req.user.id

  const query = `
    SELECT 
      posts.*, 
      clubs.club_name,
      COUNT(likes.id) AS like_count
    FROM posts
    JOIN clubs ON posts.club_id = clubs.id
    JOIN followers ON posts.club_id = followers.club_id
    LEFT JOIN likes ON posts.id = likes.post_id
    WHERE followers.user_id = ?
    GROUP BY posts.id
    ORDER BY posts.created_at DESC
  `

  db.query(query, [user_id], (err, result) => {
    if (err) return res.status(500).json({ message: "Something went wrong" })
    res.json(result)
  })
})

module.exports = router
