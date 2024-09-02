// Middleware to verify JWT and restrict access based on role
const jwt = require("jsonwebtoken");

const authMiddleware = (requiredRoles) => {
  return (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).send("Access Denied: No Token Provided");
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log(decoded);
      // Check if the user's role matches one of the required roles
      if (!requiredRoles.includes(decoded.role)) {
        return res.status(403).send("Access Denied: Insufficient Permissions");
      }

      req.user = decoded;
      next();
    } catch (err) {
      console.error(err.message);
      res.status(401).send("Invalid Token");
    }
  };
};

module.exports = authMiddleware;
