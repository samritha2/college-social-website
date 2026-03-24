const express = require("express")
const db = require("../config/db")
const verifyToken = require("../middleware/authMiddleware")

const router = express.Router()

// FOLLOW A CLUB
router.post("/follow", verifyToken, (req, res) => {
  const { club_id } = req.body
  const user_id = req.user.id

  if (!club_id) {
    return res.status(400).json({ message: "Club ID is required" })
  }

  db.query("SELECT * FROM clubs WHERE id = ?", [club_id], (err, club) => {
    if (err) return res.status(500).json({ message: "Error checking club" })

    if (club.length === 0) {
      return res.status(404).json({ message: "Club not found" })
    }

    db.query(
      "SELECT * FROM followers WHERE club_id = ? AND user_id = ?",
      [club_id, user_id],
      (err, result) => {
        if (err) return res.status(500).json({ message: "Error checking follow" })

        if (result.length > 0) {
          return res.status(400).json({ message: "Already following this club" })
        }

        db.query(
          "INSERT INTO followers (club_id, user_id) VALUES (?, ?)",
          [club_id, user_id],
          (err) => {
            if (err) return res.status(500).json({ message: "Error following club" })

            res.json({ message: "Followed club successfully" })
          }
        )
      }
    )
  })
})


// UNFOLLOW A CLUB
router.delete("/unfollow/:clubId", verifyToken, (req, res) => {
  const club_id = req.params.clubId
  const user_id = req.user.id

  db.query(
    "SELECT * FROM followers WHERE club_id = ? AND user_id = ?",
    [club_id, user_id],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Error checking follow" })

      if (result.length === 0) {
        return res.status(400).json({ message: "You are not following this club" })
      }

      db.query(
        "DELETE FROM followers WHERE club_id = ? AND user_id = ?",
        [club_id, user_id],
        (err) => {
          if (err) return res.status(500).json({ message: "Error unfollowing club" })

          res.json({ message: "Unfollowed club successfully" })
        }
      )
    }
  )
})


// TOGGLE FOLLOW / UNFOLLOW
router.post("/toggle", verifyToken, (req, res) => {
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

    db.query(
      "SELECT * FROM followers WHERE club_id = ? AND user_id = ?",
      [club_id, user_id],
      (err, result) => {
        if (err) return res.status(500).json({ message: "Error checking follow" })

        if (result.length > 0) {
          db.query(
            "DELETE FROM followers WHERE club_id = ? AND user_id = ?",
            [club_id, user_id],
            (err) => {
              if (err) return res.status(500).json({ message: "Error unfollowing" })

              return res.json({ message: "Unfollowed club" })
            }
          )
        } else {
          db.query(
            "INSERT INTO followers (club_id, user_id) VALUES (?, ?)",
            [club_id, user_id],
            (err) => {
              if (err) return res.status(500).json({ message: "Error following" })

              return res.json({ message: "Followed club" })
            }
          )
        }
      }
    )
  })
})


// CHECK IF USER FOLLOWS A CLUB
router.get("/check/:clubId", verifyToken, (req, res) => {
  const club_id = req.params.clubId
  const user_id = req.user.id

  db.query(
    "SELECT * FROM followers WHERE club_id = ? AND user_id = ?",
    [club_id, user_id],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Error checking follow status" })

      res.json({
        isFollowing: result.length > 0
      })
    }
  )
})


// GET ALL FOLLOWERS OF A CLUB
router.get("/club/:clubId", (req, res) => {
  const club_id = req.params.clubId

  db.query(
    `SELECT users.id, users.name, users.email
     FROM followers
     JOIN users ON followers.user_id = users.id
     WHERE followers.club_id = ?`,
    [club_id],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Error fetching followers" })

      res.json(result)
    }
  )
})


// GET CLUBS FOLLOWED BY USER
router.get("/my", verifyToken, (req, res) => {
  const user_id = req.user.id

  db.query(
    `SELECT clubs.*
     FROM followers
     JOIN clubs ON followers.club_id = clubs.id
     WHERE followers.user_id = ?`,
    [user_id],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Error fetching following" })

      res.json(result)
    }
  )
})


// GET FOLLOWER COUNT
router.get("/count/:clubId", (req, res) => {
  const club_id = req.params.clubId

  db.query(
    "SELECT COUNT(*) AS total_followers FROM followers WHERE club_id = ?",
    [club_id],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Error counting followers" })

      res.json(result[0])
    }
  )
})

module.exports = router
