const jwt = require("jsonwebtoken");

const JWT_SECRET = "5tB$RFV@4rDc*3Qaz";

function generateToken(userid) {
  return jwt.sign({ userid }, JWT_SECRET, { expiresIn: "1h" });
}

function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
      return res.status(401).json({ error: "Missing Authorization header" });
    }

    const token = jwt.verify(authHeader, JWT_SECRET);

    req.userid = token.userid;
    
    next();
  } catch (error) {
    logger.error("Authentication failure:" + error);
    res.status(403).json({ error: error });
  }
}

module.exports = { authenticateToken, generateToken };
