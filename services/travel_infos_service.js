const { TravelInfos, VisaApplications, Countries } = require("../models");
const { Op } = require("sequelize");

async function assertCountryIdsExist(ids) {
  const uniqueIds = Array.from(new Set((ids || []).filter(Boolean)));
  if (!uniqueIds.length) return;
  const found = await Countries.findAll({
    where: { id: { [Op.in]: uniqueIds } },
    attributes: ["id"],
    paranoid: false,
  });
  const foundIds = new Set(found.map((c) => c.id));
  const missing = uniqueIds.filter((id) => !foundIds.has(id));
  if (missing.length) {
    const err = new Error(`Invalid country id(s): ${missing.join(", ")}`);
    err.status = 400;
    throw err;
  }
}

const countryIncludes = [
  { model: Countries, as: "nationality_country", attributes: ["id", "name", "code", "iso_code"] },
  { model: Countries, as: "country_of_birth", attributes: ["id", "name", "code", "iso_code"] },
  { model: Countries, as: "country_of_residence", attributes: ["id", "name", "code", "iso_code"] },
];

async function ownsVisaApplication(userId, visaApplicationId) {
  const va = await VisaApplications.findOne({
    where: { id: visaApplicationId, user_id: userId },
  });
  return Boolean(va);
}

async function createTravelInfo(userId, payload) {
  const VisaApplicationExists = await ownsVisaApplication(userId, payload.visa_application_id);
  if (!VisaApplicationExists) {
    const err = new Error("Visa Application not found");
    err.status = 403;
    throw err;
  }
  await assertCountryIdsExist([
    payload.nationality_country_id,
    payload.country_of_birth_id,
    payload.country_of_residence_id,
  ]);
  const created = await TravelInfos.create(payload);
  const withIncludes = await TravelInfos.findByPk(created.id, { include: countryIncludes });
  return withIncludes || created;
}

async function updateTravelInfo(userId, travelInfoId, updates) {
  const existing = await TravelInfos.findOne({ where: { id: travelInfoId } });
  if (!existing) {
    const err = new Error("Travel info not found");
    err.status = 404;
    throw err;
  }
  const VisaApplicationExists = await ownsVisaApplication(userId, existing.visa_application_id);
  if (!VisaApplicationExists) {
    const err = new Error("Visa Application not found");
    err.status = 403;
    throw err;
  }
  await assertCountryIdsExist([
    updates.nationality_country_id,
    updates.country_of_birth_id,
    updates.country_of_residence_id,
  ]);
  await existing.update(updates);
  const withIncludes = await TravelInfos.findByPk(existing.id, { include: countryIncludes });
  return withIncludes || existing;
}

async function deleteTravelInfo(userId, travelInfoId) {
  const existing = await TravelInfos.findOne({ where: { id: travelInfoId } });
  if (!existing) {
    const err = new Error("Travel info not found");
    err.status = 404;
    throw err;
  }
  const VisaApplicationExists = await ownsVisaApplication(userId, existing.visa_application_id);
  if (!VisaApplicationExists) {
    const err = new Error("Visa Application not found");
    err.status = 403;
    throw err;
  }
  await existing.destroy();
  return true;
}

  // getAllTravelInfos  
async function getAllTravelInfos(applicationId) {
console.log("applicationId", applicationId);
  const travelInfos = await TravelInfos.findAll({ where: { visa_application_id: applicationId }, include: countryIncludes });
  console.log("travelInfos", travelInfos);
  return travelInfos;
}
module.exports = {
  createTravelInfo,
  updateTravelInfo,
  deleteTravelInfo,
  getAllTravelInfos,
};
