const { VisaApplications, Countries ,ApplicationDocuments} = require('../models');

function ensureDateOrder(arrivalDate, departureDate) {
  if (!arrivalDate || !departureDate) return;
  if (new Date(departureDate) < new Date(arrivalDate)) {
    const err = new Error('departure_date cannot be before arrival_date');
    err.status = 400;
    throw err;
  }
}

async function createVisaApplication(userId, attrs) {
  ensureDateOrder(attrs.arrival_date, attrs.departure_date);
  const created = await VisaApplications.create({
    ...attrs,
    user_id: userId,
  });
  const withIncludes = await VisaApplications.findOne({
    where: { id: created.id },
    include: [
      { model: Countries, as: 'from_country', attributes: ['id', 'code', 'name'] },
      { model: Countries, as: 'to_country', attributes: ['id', 'code', 'name'] },
      { model: Countries, as: 'destination_country', attributes: ['id', 'code', 'name'] },
      { model: Countries, as: 'own_country', attributes: ['id', 'code', 'name'] },
    ],
  });
  return withIncludes;
}

async function updateVisaApplication(userId, visaApplicationId, updates) {
  const existing = await VisaApplications.findOne({ where: { id: visaApplicationId, user_id: userId } });
  if (!existing) {
    const err = new Error('Visa application not found');
    err.status = 404;
    throw err;
  }

  const arrival = updates.arrival_date || existing.arrival_date;
  const departure = updates.departure_date || existing.departure_date;
  ensureDateOrder(arrival, departure);

  await existing.update(updates);
  const reloaded = await VisaApplications.findOne({
    where: { id: existing.id },
    include: [
      { model: Countries, as: 'from_country', attributes: ['id', 'code', 'name'] },
      { model: Countries, as: 'to_country', attributes: ['id', 'code', 'name'] },
      { model: Countries, as: 'destination_country', attributes: ['id', 'code', 'name'] },
      { model: Countries, as: 'own_country', attributes: ['id', 'code', 'name'] },
    ],
  });
  return reloaded;
}

async function deleteVisaApplication(userId, visaApplicationId) {
  const count = await VisaApplications.destroy({ where: { id: visaApplicationId, user_id: userId } });
  if (!count) {
    const err = new Error('Visa application not found');
    err.status = 404;
    throw err;
  }
  return true;
}
async function getAllVisaApplications(userId) {
  const visaApplications = await VisaApplications.findAll({
    where: { user_id: userId },
    include: [
      { model: Countries, as: 'from_country', attributes: ['id', 'code', 'name'] },
      { model: Countries, as: 'to_country', attributes: ['id', 'code', 'name'] },
      { model: Countries, as: 'destination_country', attributes: ['id', 'code', 'name'] },
      { model: Countries, as: 'own_country', attributes: ['id', 'code', 'name'] },
      { model: ApplicationDocuments, as: 'application_documents', attributes: ['id', 'type', 'file_url'] },
    ],
    order: [['createdAt', 'DESC']],
  });
  return visaApplications;
}
module.exports = {
  createVisaApplication,
  updateVisaApplication,
  deleteVisaApplication,
  getAllVisaApplications,
};


