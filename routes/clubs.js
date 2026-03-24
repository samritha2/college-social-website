const express = require("express")
const db = require("../config/db")
const verifyToken = require("../middleware/authMiddleware")

const router = express.Router()

router.post("/create", verifyToken, (req, res) => {
  if (req.user.role !== "club_admin") {
    return res.status(403).json({ message: "Only club admins can create clubs" })
  }

  let { club_name, description, logo } = req.body

  if (!club_name || !description) {
    return res.status(400).json({ message: "Club name and description required" })
  }

  club_name = club_name.trim().toLowerCase()
  const created_by = req.user.id

  db.query(
    "SELECT * FROM clubs WHERE LOWER(club_name) = ?",
    [club_name],
    (err, result) => {
      if (result.length > 0) {
        return res.status(400).json({ message: "Club already exists" })
      }

      db.query(
        "INSERT INTO clubs (club_name, description, logo, created_by, created_at) VALUES (?, ?, ?, ?, NOW())",
        [club_name, description, logo, created_by],
        (err, result) => {
          if (err) return res.status(500).json({ message: "Something went wrong" })
          res.json({ message: "Club created successfully", clubId: result.insertId })
        }
      )
    }
  )
})

router.get("/all", (req, res) => {
  db.query(
    "SELECT c.*, u.name AS owner_name FROM clubs c JOIN users u ON c.created_by = u.id",
    (err, result) => {
      if (err) return res.status(500).json({ message: "Something went wrong" })
      res.json(result)
    }
  )
})

router.get("/search/:name", (req, res) => {
  const name = "%" + req.params.name + "%"

  db.query(
    "SELECT * FROM clubs WHERE club_name LIKE ?",
    [name],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Something went wrong" })
      res.json(result)
    }
  )
})

module.exports = router
