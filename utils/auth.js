const jwt = require("jsonwebtoken");
const config = require("../config/appconfig");

function getTokenFromHeader(req) {
  if (
    (req.headers.authorization &&
      req.headers.authorization.split(" ")[0] === "Token") ||
    (req.headers.authorization &&
      req.headers.authorization.split(" ")[0] === "Bearer")
  ) {
    return req.headers.authorization.split(" ")[1];
  }
  return null;
}

function sendUnauthorized(res, message) {
  return res
    .status(401)
    .json({ type: "error", message: message || "Not authorized" });
}

function verifyToken(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");
    if (scheme !== "Bearer" || !token) {
      return sendUnauthorized(res, "Missing or invalid Authorization header");
    }
    jwt.verify(
      token,
      config.auth.jwt_secret,
      { algorithms: ["HS512", "HS256"] },
      (err, decoded) => {
        if (err) {
          return sendUnauthorized(res, "Invalid or expired token");
        }
        req.user = decoded && (decoded.payload || decoded.user || decoded);
        req.token = token;
        return next();
      }
    );
  } catch (err) {
    return sendUnauthorized(res);
  }
}

module.exports = {
  getJwtToken: getTokenFromHeader,
  isAuthunticated: verifyToken,
};
