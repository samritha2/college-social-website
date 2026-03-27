const express = require("express")
const db = require("../config/db")
const verifyToken = require("../middleware/authMiddleware")

const router = express.Router()

// GET ALL
router.get("/", verifyToken, (req, res) => {
  db.query(
    "SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC",
    [req.user.id],
    (err, result) => res.json(result)
  )
})

// MARK ONE
router.put("/read/:id", verifyToken, (req, res) => {
  db.query(
    "UPDATE notifications SET is_read=1 WHERE id=?",
    [req.params.id],
    () => res.json({ message: "Marked read" })
  )
})

// MARK ALL
router.put("/read-all", verifyToken, (req, res) => {
  db.query(
    "UPDATE notifications SET is_read=1 WHERE user_id=?",
    [req.user.id],
    () => res.json({ message: "All read" })
  )
})

// DELETE ONE
router.delete("/:id", verifyToken, (req, res) => {
  db.query(
    "DELETE FROM notifications WHERE id=?",
    [req.params.id],
    () => res.json({ message: "Deleted" })
  )
})

module.exports = router