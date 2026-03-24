const express = require("express")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const db = require("../config/db")
const verifyToken = require("../middleware/authMiddleware")

const router = express.Router()

router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "All fields are required" })
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  db.query("SELECT * FROM users WHERE email = ?", [email], (err, result) => {
    if (result.length > 0) {
      return res.status(400).json({ message: "Email already exists" })
    }

    db.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, role],
      (err) => {
        if (err) return res.status(500).json({ message: "Something went wrong" })
        res.json({ message: "User Registered Successfully" })
      }
    )
  })
})

router.post("/login", (req, res) => {
  const { email, password } = req.body

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
    if (result.length === 0) {
      return res.status(404).json({ message: "User not found" })
    }

    const validPassword = await bcrypt.compare(password, result[0].password)

    if (!validPassword) {
      return res.status(401).json({ message: "Wrong password" })
    }

    const token = jwt.sign(
      { id: result[0].id, role: result[0].role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    )

    res.json({ message: "Login successful", token })
  })
})

router.put("/update", verifyToken, (req, res) => {
  const { name } = req.body

  db.query(
    "UPDATE users SET name = ? WHERE id = ?",
    [name, req.user.id],
    (err) => {
      if (err) return res.status(500).json({ message: "Something went wrong" })
      res.json({ message: "Profile updated successfully" })
    }
  )
})

module.exports = router
