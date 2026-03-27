const express = require("express")
const db = require("../config/db")

const router = express.Router()

// GET ALL USERS
router.get("/", (req, res) => {
  db.query("SELECT id, name FROM users", (err, result) => res.json(result))
})

// SEARCH USERS
router.get("/search", (req, res) => {
  const q = req.query.q || ""

  db.query(
    "SELECT id, name FROM users WHERE name LIKE ?",
    [`%${q}%`],
    (err, result) => res.json(result)
  )
})

// USER STATS
router.get("/stats/:id", (req, res) => {
  db.query(
    `SELECT 
      (SELECT COUNT(*) FROM posts WHERE user_id=?) as posts,
      (SELECT COUNT(*) FROM likes WHERE user_id=?) as likes`,
    [req.params.id, req.params.id],
    (err, result) => res.json(result[0])
  )
})

module.exports = router