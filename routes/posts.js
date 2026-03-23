const express = require("express")
const db = require("../config/db")
const verifyToken = require("../middleware/authMiddleware")

const router = express.Router()

// =====================================
// CREATE POST (Only Club Admin)
// =====================================
router.post("/create", verifyToken, (req, res) => {
  const { club_id, content, image } = req.body

  // Check if logged in user is club_admin
  if (req.user.role !== "club_admin") {
    return res.status(403).json({
      message: "Only club admins can post"
    })
  }

  // Allow post creation
  db.query(
    "INSERT INTO posts (club_id, content, image) VALUES (?, ?, ?)",
    [club_id, content, image],
    (err, result) => {
      if (err) return res.status(500).json(err)

      res.json({
        message: "Post created successfully 🎉",
        postId: result.insertId
      })
    }
  )
})

// =====================================
// DELETE POST (Only Club Admin)
// =====================================
router.delete("/delete/:id", verifyToken, (req, res) => {
  const postId = req.params.id

  if (req.user.role !== "club_admin") {
    return res.status(403).json({
      message: "Only club admins can delete posts"
    })
  }

  db.query(
    "DELETE FROM posts WHERE id = ?",
    [postId],
    (err, result) => {
      if (err) return res.status(500).json(err)

      res.json({
        message: "Post deleted successfully 🗑️"
      })
    }
  )
})


// =====================================
// GET ALL POSTS (with Like Count)
// =====================================
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
    if (err) return res.status(500).json(err)
    res.json(result)
  })
})
// =====================================
// GET POSTS BY CLUB
// =====================================
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
    if (err) return res.status(500).json(err)
    res.json(result)
  })
})



// =====================================
// GET PERSONALIZED FEED (Protected)
// =====================================
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
    if (err) return res.status(500).json(err)
    res.json(result)
  })
})

module.exports = router
