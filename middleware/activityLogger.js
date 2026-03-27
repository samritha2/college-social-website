const db = require("../config/db")

module.exports = (action) => {
  return (req, res, next) => {
    db.query(
      "INSERT INTO activity_logs (user_id, action) VALUES (?, ?)",
      [req.user?.id || null, action],
      () => {}
    )
    next()
  }
}