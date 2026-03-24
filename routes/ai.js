const express = require("express")
const verifyToken = require("../middleware/authMiddleware")

const router = express.Router()

router.post("/chat", verifyToken, async (req, res) => {
  const { question } = req.body

  if (!question) {
    return res.status(400).json({ message: "Question required" })
  }

  res.json({
    answer: `You asked: "${question}". AI will be enabled soon.`
  })
})

module.exports = router
