const jwt = require('jsonwebtoken');

// Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[2];

  if (!token) {
    return res.status(401).json({ message: 'Access token not provided' });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired access token' });
    }

    req.user = user;
    next();
  });
}

module.exports = { authenticateToken };
