const express = require("express")
const db = require("../config/db")
const verifyToken = require("../middleware/authMiddleware")

const router = express.Router()

// REPORT
router.post("/", verifyToken, (req, res) => {
  const { post_id, reason } = req.body

  if (!reason) return res.status(400).json({ message: "Reason required" })

  db.query(
    "INSERT INTO reports (user_id, post_id, reason, created_at) VALUES (?, ?, ?, NOW())",
    [req.user.id, post_id, reason],
    () => res.json({ message: "Reported 🚨" })
  )
})

// GET MY REPORTS
router.get("/me", verifyToken, (req, res) => {
  db.query(
    "SELECT * FROM reports WHERE user_id=?",
    [req.user.id],
    (err, result) => res.json(result)
  )
})

module.exports = router