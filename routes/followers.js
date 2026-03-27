const express = require("express")
const db = require("../config/db")
const verifyToken = require("../middleware/authMiddleware")
const activityLogger = require("../middleware/activityLogger")

const router = express.Router()

// FOLLOW CLUB
router.post("/follow", verifyToken, activityLogger("follow_club"), (req, res) => {
  const { club_id } = req.body

  if (!club_id) {
    return res.status(400).json({ message: "Club ID required" })
  }

  db.query("SELECT * FROM clubs WHERE id=?", [club_id], (err, club) => {
    if (club.length === 0) {
      return res.status(404).json({ message: "Club not found" })
    }

    if (club[0].created_by === req.user.id) {
      return res.status(400).json({ message: "Owner cannot follow own club" })
    }

    db.query(
      "SELECT * FROM followers WHERE club_id=? AND user_id=?",
      [club_id, req.user.id],
      (err, existing) => {
        if (existing.length > 0) {
          return res.status(400).json({ message: "Already following ❌" })
        }

        db.query(
          "INSERT INTO followers (club_id, user_id, created_at) VALUES (?, ?, NOW())",
          [club_id, req.user.id],
          (err) => {

            db.query(
              "INSERT INTO activity_logs (user_id, action) VALUES (?, ?)",
              [req.user.id, "followed club " + club_id]
            )

            db.query(
              "INSERT INTO notifications (user_id, message) VALUES (?, ?)",
              [club[0].created_by, "New follower joined your club 🎉"]
            )

            res.json({ message: "Followed successfully ✅" })
          }
        )
      }
    )
  })
})

// UNFOLLOW
router.delete("/unfollow/:club_id", verifyToken, (req, res) => {
  const { club_id } = req.params

  db.query(
    "SELECT * FROM followers WHERE club_id=? AND user_id=?",
    [club_id, req.user.id],
    (err, existing) => {

      if (existing.length === 0) {
        return res.status(400).json({ message: "Not following ❌" })
      }

      db.query(
        "DELETE FROM followers WHERE club_id=? AND user_id=?",
        [club_id, req.user.id],
        () => {

          db.query(
            "INSERT INTO activity_logs (user_id, action) VALUES (?, ?)",
            [req.user.id, "unfollowed club " + club_id]
          )

          res.json({ message: "Unfollowed ❌" })
        }
      )
    }
  )
})

// GET FOLLOWERS (WITH SEARCH + PAGINATION)
router.get("/:club_id", verifyToken, (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 5
  const search = req.query.search || ""
  const offset = (page - 1) * limit

  db.query(
    `SELECT users.id, users.name
     FROM followers
     JOIN users ON users.id = followers.user_id
     WHERE followers.club_id=? AND users.name LIKE ?
     ORDER BY users.name ASC
     LIMIT ? OFFSET ?`,
    [req.params.club_id, `%${search}%`, limit, offset],
    (err, result) => res.json(result)
  )
})

// FOLLOW STATS + GROWTH
router.get("/stats/:club_id", (req, res) => {
  db.query(
    `SELECT COUNT(*) AS total,
     DATE(created_at) as date
     FROM followers
     WHERE club_id=?
     GROUP BY DATE(created_at)`,
    [req.params.club_id],
    (err, result) => res.json(result)
  )
})

// CHECK FOLLOW
router.get("/check/:club_id", verifyToken, (req, res) => {
  db.query(
    "SELECT * FROM followers WHERE club_id=? AND user_id=?",
    [req.params.club_id, req.user.id],
    (err, result) => {
      res.json({
        following: result.length > 0,
        user_id: req.user.id,
        club_id: req.params.club_id
      })
    }
  )
})

// SUGGEST CLUBS (SMART)
router.get("/suggest/clubs", verifyToken, (req, res) => {
  db.query(
    `SELECT * FROM clubs 
     WHERE id NOT IN (SELECT club_id FROM followers WHERE user_id=?)
     ORDER BY RAND()
     LIMIT 10`,
    [req.user.id],
    (err, result) => res.json(result)
  )
})

// REMOVE FOLLOWER (OWNER ONLY)
router.delete("/remove/:club_id/:user_id", verifyToken, (req, res) => {

  db.query("SELECT * FROM clubs WHERE id=?", [req.params.club_id], (err, club) => {

    if (!club.length || club[0].created_by !== req.user.id) {
      return res.status(403).json({ message: "Only owner allowed ❌" })
    }

    db.query(
      "DELETE FROM followers WHERE club_id=? AND user_id=?",
      [req.params.club_id, req.params.user_id],
      () => res.json({ message: "Follower removed 🚫" })
    )
  })
})

// TOP CLUBS BY FOLLOWERS
router.get("/top/clubs", (req, res) => {
  db.query(
    `SELECT club_id, COUNT(*) as total
     FROM followers
     GROUP BY club_id
     ORDER BY total DESC
     LIMIT 5`,
    (err, result) => res.json(result)
  )
})

// FOLLOW HISTORY
router.get("/history/me", verifyToken, (req, res) => {
  db.query(
    `SELECT clubs.name, followers.created_at
     FROM followers
     JOIN clubs ON clubs.id = followers.club_id
     WHERE followers.user_id=?
     ORDER BY followers.created_at DESC`,
    [req.user.id],
    (err, result) => res.json(result)
  )
})

module.exports = router