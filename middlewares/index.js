const jwt = require("jsonwebtoken");
const { Users } = require("../models/users");

function validateBody(schema) {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        if (error) {
            res.status(404).json({ message: "Missing required  field" });
        }
        return next();
    }
};

async function auth(req, res, next) {
    const authHeader = req.headers.authorization || "";
    const [type, token] = authHeader.split(" ");
    if (type !== "Bearer") {
        return res.status(401).json({ message: "Token type is not valid" })
    }
  
    if (!token) {
        return res.status(401).json({ message: "No token provided" })
    }
  
    try {
      const { id } = jwt.verify(token, process.env.JWT_SECRET);
      const user = await Users.findById(id);
      if (!user) {
        return res.status(401).json({ message: "Not authorized" })
      }
      req.user = user;
    } catch (error) {
      if (error.name === "TokenExpiredError" || error.name === "JsonWebTokenError") {
        return res.status(401).json({ message: "jwt token is not valid" });
      }
      throw error;
    }
    next();
  }
  
module.exports = {
    validateBody,
    auth,
}