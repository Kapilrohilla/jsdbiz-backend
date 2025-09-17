const { ApplicationDocuments, VisaApplications, Users } = require("../models");
const { FileStorageService } = require("../utils/file_storage_service");
const { sendEmail } = require("../utils/email");
const VALID_TYPES = ["passport", "photo", "supporting_doc", "visa_approval"];

async function ensureOwnership(userId, visaApplicationId) {
  const app = await VisaApplications.findOne({
    where: { id: visaApplicationId, user_id: userId },
  });
  if (!app) {
    const err = new Error("Visa application not found");
    err.status = 404;
    throw err;
  }
  return app;
}

async function createApplicationDocument(
  userId,
  visaApplicationId,
  type,
  file,
  baseUrl
) {
  if (!VALID_TYPES.includes(type)) {
    const err = new Error("Invalid document type");
    err.status = 400;
    throw err;
  }
  await ensureOwnership(userId, visaApplicationId);

  const saved = await FileStorageService.saveFile(
    file,
    type,
    userId,
    visaApplicationId
  );
  const resolvedBaseUrl = baseUrl || process.env.BASE_URL || '';
  const fileUrl = FileStorageService.getFileUrl(saved.relativePath, resolvedBaseUrl);

  const created = await ApplicationDocuments.create({
    visa_application_id: visaApplicationId,
    type,
    file_url: fileUrl,
    uploaded_by: userId,
  });

  return created;
}


async function listApplicationDocuments(userId, visaApplicationId) {
  await ensureOwnership(userId, visaApplicationId);
  const docs = await ApplicationDocuments.findAll({
    where: { visa_application_id: visaApplicationId },
    order: [["createdAt", "DESC"]],
  });
  return docs;
}

module.exports = {
  createApplicationDocument,
  listApplicationDocuments,
};
