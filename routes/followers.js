const express = require("express")
const db = require("../config/db")
const verifyToken = require("../middleware/authMiddleware")

const router = express.Router()

router.post("/toggle", verifyToken, (req, res) => {
  const { club_id } = req.body
  const user_id = req.user.id

  db.query(
    "SELECT * FROM followers WHERE club_id = ? AND user_id = ?",
    [club_id, user_id],
    (err, result) => {
      if (result.length > 0) {
        db.query(
          "DELETE FROM followers WHERE club_id = ? AND user_id = ?",
          [club_id, user_id],
          (err) => {
            if (err) return res.status(500).json({ message: "Error" })

            return res.json({ message: "Unfollowed club" })
          }
        )
      } else {
        db.query(
          "INSERT INTO followers (club_id, user_id) VALUES (?, ?)",
          [club_id, user_id],
          (err) => {
            if (err) return res.status(500).json({ message: "Error" })

            return res.json({ message: "Followed club" })
          }
        )
      }
    }
  )
})

router.get("/:clubId", (req, res) => {
  db.query(
    "SELECT COUNT(*) AS total_followers FROM followers WHERE club_id = ?",
    [req.params.clubId],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Error" })
      res.json(result[0])
    }
  )
})

module.exports = router
