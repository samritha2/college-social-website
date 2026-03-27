const express = require("express")
const db = require("../config/db")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const router = express.Router()

// REGISTER
router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields required" })
  }

  const hashed = await bcrypt.hash(password, 10)

  db.query("SELECT * FROM users WHERE email=?", [email], (err, existing) => {
    if (existing.length > 0) {
      return res.status(400).json({ message: "Email exists ❌" })
    }

    db.query(
      "INSERT INTO users (name, email, password, role, created_at) VALUES (?, ?, ?, ?, NOW())",
      [name, email, hashed, role || "user"],
      () => res.json({ message: "Registered ✅" })
    )
  })
})

// LOGIN
router.post("/login", (req, res) => {
  const { email, password } = req.body

  db.query("SELECT * FROM users WHERE email=?", [email], async (err, user) => {

    if (!user.length) {
      return res.status(400).json({ message: "User not found" })
    }

    const match = await bcrypt.compare(password, user[0].password)

    if (!match) {
      return res.status(400).json({ message: "Wrong password" })
    }

    const token = jwt.sign(
      { id: user[0].id, role: user[0].role },
      "secret",
      { expiresIn: "1d" }
    )

    res.json({ token, user: user[0] })
  })
})

// GET CURRENT USER
router.get("/me", (req, res) => {
  res.json({ message: "Protected route (use middleware)" })
})

module.exports = router
