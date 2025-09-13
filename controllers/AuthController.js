const Joi = require("joi");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const config = require("../config/appconfig");
const userService = require("../services/user_service");

function validate(schema, payload) {
  const { error, value } = Joi.validate(payload, schema);
  if (error) {
    const message =
      error && error.details && error.details[0] && error.details[0].message
        ? error.details[0].message
        : "Validation error";
    const err = new Error(message);
    err.status = 400;
    throw err;
  }
  return value;
}

function signJwt(payload) {
  return jwt.sign({ payload }, config.auth.jwt_secret, {
    expiresIn: config.auth.jwt_expiresin,
    algorithm: "HS512",
  });
}

async function signUp(req, res) {
  try {
    const { first_name, last_name, email, phone_number, password } = validate(
      {
        first_name: Joi.string().min(2).max(120).required(),
        last_name: Joi.string().min(2).max(120).optional(),
        email: Joi.string().email().required(),
        phone_number: Joi.string().optional(),
        password: Joi.string().min(6).max(128).required(),
      },
      req.body
    );

    const existing = await userService.findByEmail(email);
    if (existing) {
      return res
        .status(409)
        .json({ type: "error", message: "Email already registered" });
    }
    const user = await userService.createUser({
      first_name,
      last_name,
      email,
      phone_number,
      password,
    });
    const payload = _.omit(user.toJSON(), ["password"]);
    const token = signJwt(payload);
    return res
      .status(201)
      .json({
        type: "success",
        message: "User created",
        token,
        user: payload,
      });
  } catch (err) {
    return res
      .status(err.status || 500)
      .json({
        type: "error",
        message: err.message || "Internal Server Error",
      });
  }
}

async function login(req, res) {
  try {
    const { email, password } = validate(
      {
        email: Joi.string().email().required(),
        password: Joi.string().required(),
      },
      req.body
    );
    const user = await userService.findByEmail(email);
    if (!user) {
      return res
        .status(401)
        .json({ type: "error", message: "Invalid credentials" });
    }
    const ok = await userService.verifyPassword(password, user.password);
    if (!ok) {
      return res
        .status(401)
        .json({ type: "error", message: "Invalid credentials" });
    }
    await userService.updateLastLogin(user.id);
    const payload = _.omit(user.toJSON(), ["password"]);
    const token = signJwt(payload);
    return res.json({
      type: "success",
      message: "Logged in",
      token,
      user: payload,
    });
  } catch (err) {
    return res
      .status(err.status || 500)
      .json({
        type: "error",
        message: err.message || "Internal Server Error",
      });
  }
}

async function logOut(req, res) {
  try {
    const header = req.headers.authorization || "";
    const parts = header.split(" ");
    if (parts[0] !== "Bearer" || !parts[1]) {
      return res
        .status(400)
        .json({ type: "error", message: "Missing Authorization header" });
    }
    return res.json({ type: "success", message: "Logged out" });
  } catch (err) {
    return res
      .status(500)
      .json({ type: "error", message: "Internal Server Error" });
  }
}

module.exports = { signUp, login, logOut };
