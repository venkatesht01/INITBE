const jwt = require("jsonwebtoken");

const authMiddleware = (requiredRoles) => {
  return (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).send("Access Denied: No Token Provided");
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

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
