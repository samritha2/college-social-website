const express = require("express")
const db = require("../config/db")
const verifyToken = require("../middleware/authMiddleware")

const router = express.Router()


// FOLLOW CLUB
router.post("/follow", verifyToken, (req, res) => {
  const { club_id } = req.body
  const user_id = req.user.id

  if (!club_id) {
    return res.status(400).json({ message: "Club ID required" })
  }

  db.query("SELECT * FROM clubs WHERE id = ?", [club_id], (err, club) => {
    if (err) return res.status(500).json({ message: "Error checking club" })

    if (club.length === 0) {
      return res.status(404).json({ message: "Club not found" })
    }

    const ownerId = club[0].created_by

    // Prevent owner from following their own club
    if (ownerId === user_id) {
      return res.status(400).json({ message: "Owner cannot follow their own club" })
    }

    db.query(
      "SELECT * FROM followers WHERE club_id = ? AND user_id = ?",
      [club_id, user_id],
      (err, existing) => {
        if (existing.length > 0) {
          return res.status(400).json({ message: "Already following" })
        }

        db.query(
          "INSERT INTO followers (club_id, user_id) VALUES (?, ?)",
          [club_id, user_id],
          (err) => {
            if (err) return res.status(500).json({ message: "Follow failed" })

            // 🔔 Notification to club owner
            db.query(
              "INSERT INTO notifications (user_id, message) VALUES (?, ?)",
              [ownerId, "Someone followed your club"]
            )

            res.json({ message: "Followed successfully" })
          }
        )
      }
    )
  })
})


// UNFOLLOW CLUB
router.delete("/unfollow/:clubId", verifyToken, (req, res) => {
  const clubId = req.params.clubId
  const userId = req.user.id

  db.query(
    "DELETE FROM followers WHERE club_id = ? AND user_id = ?",
    [clubId, userId],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Error" })

      if (result.affectedRows === 0) {
        return res.json({ message: "Not following this club" })
      }

      res.json({ message: "Unfollowed successfully" })
    }
  )
})


// REMOVE FOLLOWER (Only club owner)
router.delete("/remove/:clubId/:userId", verifyToken, (req, res) => {
  const { clubId, userId } = req.params

  db.query("SELECT * FROM clubs WHERE id = ?", [clubId], (err, club) => {
    if (club[0].created_by !== req.user.id) {
      return res.status(403).json({ message: "Only owner can remove followers" })
    }

    db.query(
      "DELETE FROM followers WHERE club_id = ? AND user_id = ?",
      [clubId, userId],
      () => res.json({ message: "Follower removed" })
    )
  })
})


// FOLLOW STATUS
router.get("/status/:clubId", verifyToken, (req, res) => {
  const clubId = req.params.clubId
  const userId = req.user.id

  db.query(
    "SELECT id FROM followers WHERE club_id = ? AND user_id = ?",
    [clubId, userId],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Error" })

      res.json({
        following: result.length > 0
      })
    }
  )
})


// GET FOLLOWERS + COUNT (combined)
router.get("/details/:clubId", (req, res) => {
  const clubId = req.params.clubId

  const query = `
    SELECT users.id, users.name
    FROM followers
    JOIN users ON followers.user_id = users.id
    WHERE followers.club_id = ?
  `

  db.query(query, [clubId], (err, users) => {
    if (err) return res.status(500).json({ message: "Error" })

    res.json({
      total_followers: users.length,
      followers: users
    })
  })
})


// GET CLUBS FOLLOWED BY USER
router.get("/my", verifyToken, (req, res) => {
  const userId = req.user.id

  const query = `
    SELECT c.id, c.club_name
    FROM followers f
    JOIN clubs c ON f.club_id = c.id
    WHERE f.user_id = ?
  `

  db.query(query, [userId], (err, result) => {
    if (err) return res.status(500).json({ message: "Error" })

    res.json(result)
  })
})


// MUTUAL FOLLOW CHECK (extra feature)
router.get("/mutual/:clubId", verifyToken, (req, res) => {
  const clubId = req.params.clubId
  const userId = req.user.id

  db.query(
    "SELECT created_by FROM clubs WHERE id = ?",
    [clubId],
    (err, club) => {
      if (club.length === 0) {
        return res.status(404).json({ message: "Club not found" })
      }

      const ownerId = club[0].created_by

      db.query(
        "SELECT * FROM followers WHERE club_id = ? AND user_id = ?",
        [clubId, userId],
        (err, follow) => {
          const isFollowing = follow.length > 0

          res.json({
            userFollowsClub: isFollowing,
            clubOwner: ownerId
          })
        }
      )
    }
  )
})

module.exports = router
