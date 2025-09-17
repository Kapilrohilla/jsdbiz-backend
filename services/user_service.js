const bcrypt = require("bcrypt");
const { Users } = require("../models");
const config = require("../config/appconfig");
const { Op } = require("sequelize");

async function hashPassword(plainPassword) {
  const saltRounds = Number(config.auth.saltRounds) || 10;
  return bcrypt.hash(plainPassword, saltRounds);
}

async function createUser({
  first_name,
  last_name,
  email,
  phone_number,
  password,
}) {
  const normalizedEmail = String(email).toLowerCase();
  const passwordHash = await hashPassword(password);
  const created = await Users.create({
    first_name,
    last_name,
    phone_number: phone_number || null,
    email: normalizedEmail,
    password: passwordHash,
  });
  return created;
}

async function findByEmail(email) {
  if (!email) return null;
  return Users.findOne({ where: { email: String(email).toLowerCase() } });
}

async function verifyPassword(plainPassword, passwordHash) {
  return bcrypt.compare(plainPassword, passwordHash);
}

async function updateLastLogin(userId) {
  return Users.update(
    { last_login_date: new Date() },
    { where: { id: userId } }
  );
}
async function updateUser(userId, updates) {
  const allowed = [
    "first_name",
    "last_name",
    "email",
    "phone_number",
    "password",
  ];
  const toUpdate = {};
  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(updates, key)) {
      toUpdate[key] = updates[key];
    }
  }

  const user = await Users.findByPk(userId);
  if (!user) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }

  if (toUpdate.email) {
    const normalizedEmail = String(toUpdate.email).toLowerCase();
    const exists = await Users.findOne({
      where: { id: { [Op.ne]: userId }, email: normalizedEmail },
    });
    if (exists) {
      const err = new Error("Email already registered");
      err.status = 409;
      throw err;
    }
    toUpdate.email = normalizedEmail;
  }

  if (toUpdate.password) {
    toUpdate.password = await hashPassword(toUpdate.password);
  }

  await user.update(toUpdate);
  return user;
}


module.exports = {
  hashPassword,
  createUser,
  findByEmail,
  verifyPassword,
  updateLastLogin,
  updateUser
};
