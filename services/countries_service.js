const { Countries } = require("../models");
const { getNames, getCode } = require("country-list");
const { Op } = require("sequelize");

async function listCountries() {
  const countries = await Countries.findAll({ order: [["name", "ASC"]] });
  return countries;
}

async function seedCountries() {
  const names = getNames();
  const rows = names
    .map((name) => ({ name, code: getCode(name) }))
    .filter((c) => Boolean(c.code));
  if (!rows.length) return 0;
  // Upsert by unique code
  await Countries.bulkCreate(rows, {
    updateOnDuplicate: ["name"],
  });
  return rows.length;
}
async function createCountry(payload) {
  const { code, name, iso_code, flag_url, language } = payload;

  const orConditions = [{ code }];
  if (iso_code) orConditions.push({ iso_code });

  const existing = await Countries.findOne({
    where: { [Op.or]: orConditions },
  });
  if (existing) {
    const err = new Error("Country with same code or iso_code already exists");
    err.status = 400;
    throw err;
  }

  const row = await Countries.create({
    code,
    name,
    iso_code,
    flag_url,
    language,
  });
  return row;
}

async function updateCountry(id, payload) {
  const allowed = ["code", "name", "iso_code", "flag_url", "language"];
  const update = {};
  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(payload, key)) {
      update[key] = payload[key];
    }
  }

  const existing = await Countries.findByPk(id);
  if (!existing) {
    const err = new Error("Country not found");
    err.status = 404;
    throw err;
  }

  const orConditions = [];
  if (update.code) orConditions.push({ code: update.code });
  if (update.iso_code) orConditions.push({ iso_code: update.iso_code });
  if (orConditions.length) {
    const conflict = await Countries.findOne({
      where: {
        [Op.and]: [{ id: { [Op.ne]: id } }, { [Op.or]: orConditions }],
      },
    });
    if (conflict) {
      const err = new Error(
        "Country with same code or iso_code already exists"
      );
      err.status = 400;
      throw err;
    }
  }

  await existing.update(update);
  return existing;
}

async function deleteCountry(id) {
  const existing = await Countries.findByPk(id);
  if (!existing) {
    const err = new Error("Country not found");
    err.status = 404;
    throw err;
  }
  await existing.destroy();
}

module.exports = {
  listCountries,
  seedCountries,
  createCountry,
  updateCountry,
  deleteCountry,
};
