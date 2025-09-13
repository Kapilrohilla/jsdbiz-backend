const bcrypt = require("bcrypt");
const { Users } = require("../models");
const config = require("../config/appconfig");

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

module.exports = {
  hashPassword,
  createUser,
  findByEmail,
  verifyPassword,
  updateLastLogin,
};
