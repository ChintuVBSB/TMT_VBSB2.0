export const allowRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(403).json({ message: "Unauthorized user" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied: Role not allowed" });
    }

    next();
  };
};
