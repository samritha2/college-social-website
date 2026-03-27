const express = require("express")
const db = require("../config/db")
const verifyToken = require("../middleware/authMiddleware")

const router = express.Router()

// GET PROFILE
router.get("/me", verifyToken, (req, res) => {
  db.query(
    "SELECT id, name, email, role FROM users WHERE id=?",
    [req.user.id],
    (err, result) => res.json(result[0])
  )
})

// UPDATE PROFILE
router.put("/update", verifyToken, (req, res) => {
  const { name } = req.body

  db.query(
    "UPDATE users SET name=? WHERE id=?",
    [name, req.user.id],
    () => res.json({ message: "Updated" })
  )
})

// USER ACTIVITY
router.get("/activity", verifyToken, (req, res) => {
  db.query(
    "SELECT * FROM activity_logs WHERE user_id=?",
    [req.user.id],
    (err, result) => res.json(result)
  )
})

module.exports = router