const express = require("express")
const db = require("../config/db")
const verifyToken = require("../middleware/authMiddleware")

const router = express.Router()

// CREATE CLUB
router.post("/create", verifyToken, (req, res) => {
  const { name, description } = req.body

  if (!name) return res.status(400).json({ message: "Name required" })

  db.query(
    "INSERT INTO clubs (name, description, created_by, created_at) VALUES (?, ?, ?, NOW())",
    [name, description, req.user.id],
    () => res.json({ message: "Club created 🎉" })
  )
})

// GET ALL CLUBS
router.get("/", (req, res) => {
  const search = req.query.search || ""

  db.query(
    "SELECT * FROM clubs WHERE name LIKE ?",
    [`%${search}%`],
    (err, result) => res.json(result)
  )
})

// GET SINGLE CLUB
router.get("/:id", (req, res) => {
  db.query("SELECT * FROM clubs WHERE id=?", [req.params.id],
    (err, result) => res.json(result[0]))
})

// UPDATE CLUB (ONLY OWNER)
router.put("/update/:id", verifyToken, (req, res) => {
  const { name, description } = req.body

  db.query("SELECT * FROM clubs WHERE id=?", [req.params.id], (err, club) => {

    if (club[0].created_by !== req.user.id) {
      return res.status(403).json({ message: "Only owner allowed ❌" })
    }

    db.query(
      "UPDATE clubs SET name=?, description=? WHERE id=?",
      [name, description, req.params.id],
      () => res.json({ message: "Updated club ✏️" })
    )
  })
})

// DELETE CLUB
router.delete("/delete/:id", verifyToken, (req, res) => {
  db.query("SELECT * FROM clubs WHERE id=?", [req.params.id], (err, club) => {

    if (club[0].created_by !== req.user.id) {
      return res.status(403).json({ message: "Not allowed" })
    }

    db.query("DELETE FROM clubs WHERE id=?", [req.params.id],
      () => res.json({ message: "Deleted club 🗑️" }))
  })
})

// CLUB ANALYTICS
router.get("/analytics/:id", (req, res) => {
  db.query(
    `SELECT 
     (SELECT COUNT(*) FROM followers WHERE club_id=?) as followers,
     (SELECT COUNT(*) FROM posts WHERE club_id=?) as posts`,
    [req.params.id, req.params.id],
    (err, result) => res.json(result[0])
  )
})

module.exports = router