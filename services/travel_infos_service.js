const { TravelInfos, VisaApplications } = require("../models");

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
  const created = await TravelInfos.create(payload);
  return created;
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
  await existing.update(updates);
  return existing;
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
  const travelInfos = await TravelInfos.findAll({ where: { visa_application_id: applicationId } });
  console.log("travelInfos", travelInfos);
  return travelInfos;
}
module.exports = {
  createTravelInfo,
  updateTravelInfo,
  deleteTravelInfo,
  getAllTravelInfos,
};
