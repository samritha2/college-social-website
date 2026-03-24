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
    return res.status(400).json({ message: "Club name and description are required" })
  }

  club_name = club_name.trim().toLowerCase()

  const created_by = req.user.id

  db.query(
    "SELECT * FROM clubs WHERE LOWER(club_name) = ?",
    [club_name],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Something went wrong" })

      if (result.length > 0) {
        return res.status(400).json({ message: "Club already exists" })
      }

      db.query(
        "INSERT INTO clubs (club_name, description, logo, created_by, created_at) VALUES (?, ?, ?, ?, NOW())",
        [club_name, description, logo, created_by],
        (err, result) => {
          if (err) return res.status(500).json({ message: "Something went wrong" })

          res.json({
            message: "Club created successfully",
            clubId: result.insertId
          })
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

router.get("/:id", (req, res) => {
  db.query(
    "SELECT * FROM clubs WHERE id = ?",
    [req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Something went wrong" })
      if (result.length === 0) {
        return res.status(404).json({ message: "Club not found" })
      }
      res.json(result[0])
    }
  )
})

router.delete("/:id", verifyToken, (req, res) => {
  const clubId = req.params.id

  db.query(
    "SELECT * FROM clubs WHERE id = ?",
    [clubId],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Something went wrong" })

      if (result.length === 0) {
        return res.status(404).json({ message: "Club not found" })
      }

      if (result[0].created_by !== req.user.id) {
        return res.status(403).json({ message: "Only owner can delete this club" })
      }

      db.query(
        "DELETE FROM clubs WHERE id = ?",
        [clubId],
        (err) => {
          if (err) return res.status(500).json({ message: "Something went wrong" })
          res.json({ message: "Club deleted successfully" })
        }
      )
    }
  )
})

module.exports = router
