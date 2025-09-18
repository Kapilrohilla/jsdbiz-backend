const { Countries, CountryVisaEligibilities } = require("../models");

async function listEligibilities({ from_country_id, to_country_id }) {
  const where = {};
  const include = [
    { model: Countries, as: "to_country", attributes: ["id", "code", "name",'flag_url'] },
  ];
  if (from_country_id) {
    where.from_country_id = from_country_id;
  }
  if (to_country_id) {
    where.to_country_id = to_country_id;
  }
  const rows = await CountryVisaEligibilities.findAll({
    where,
    include,
    order: [["updatedAt", "DESC"]],
  });
  console.log('rows', rows);
  return rows;
}

async function upsertEligibility({
  from_country_id,
  to_country_id,
  is_eligible,
}) {
  await CountryVisaEligibilities.upsert({
    from_country_id,
    to_country_id,
    is_eligible: Boolean(is_eligible),
  });
  const row = await CountryVisaEligibilities.findOne({
    where: { from_country_id, to_country_id },
    include: [
      {
        model: Countries,
        as: "from_country",
        attributes: ["id", "code", "name"],
      },
      {
        model: Countries,
        as: "to_country",
        attributes: ["id", "code", "name"],
      },
    ],
  });
  return row;
}

async function removeEligibility({ from_country_id, to_country_id }) {
  const existing = await CountryVisaEligibilities.findOne({
    where: { from_country_id, to_country_id },
  });
  if (!existing) {
    const err = new Error("Eligibility mapping not found");
    err.status = 404;
    throw err;
  }
  await existing.destroy();
  return true;
}

module.exports = { listEligibilities, upsertEligibility, removeEligibility };
