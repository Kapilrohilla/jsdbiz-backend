const Joi = require("joi");
const service = require("../services/travel_infos_service");

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

async function create(req, res) {
  try {
    const userId = req.user && req.user.id;
    if (!userId) {
      return res.status(401).json({ type: "error", message: "Not authorized" });
    }
    const payload = validate(
      {
        visa_application_id: Joi.string().guid().required(),
        first_name: Joi.string().optional(),
        last_name: Joi.string().optional(),
        nationality: Joi.string().optional(),
        gender: Joi.string().optional(),
        date_of_birth: Joi.string().optional(),
        country_of_birth: Joi.string().optional(),
        country_of_residence: Joi.string().optional(),
        passport_number: Joi.string().required(),
        passport_expiration_date: Joi.date().iso().required(),
        passport_issue_date: Joi.date().iso().required(),
      },
      req.body
    );

    const created = await service.createTravelInfo(userId, payload);
    return res.status(201).json({ type: "success", data: created });
  } catch (err) {
    return res
      .status(err.status || 500)
      .json({ type: "error", message: err.message || "Internal Server Error" });
  }
}

async function update(req, res) {
  try {
    const userId = req.user && req.user.id;
    if (!userId) {
      return res.status(401).json({ type: "error", message: "Not authorized" });
    }
    const { id } = req.params;
    const existing = null; // handled in service
    const updates = validate(
      {
        first_name: Joi.string().optional(),
        last_name: Joi.string().optional(),
        nationality: Joi.string().optional(),
        gender: Joi.string().optional(),
        date_of_birth: Joi.string().optional(),
        country_of_birth: Joi.string().optional(),
        country_of_residence: Joi.string().optional(),
        passport_number: Joi.string().optional(),
        passport_expiration_date: Joi.date().iso().optional(),
        passport_issue_date: Joi.date().iso().optional(),
      },
      req.body
    );
    const updated = await service.updateTravelInfo(userId, id, updates);
    return res.json({ type: "success", data: updated });
  } catch (err) {
    return res
      .status(err.status || 500)
      .json({ type: "error", message: err.message || "Internal Server Error" });
  }
}

async function remove(req, res) {
  try {
    const userId = req.user && req.user.id;
    if (!userId) {
      return res.status(401).json({ type: "error", message: "Not authorized" });
    }
    const { id } = req.params;
    await service.deleteTravelInfo(userId, id);
    return res.json({ type: "success", message: "Deleted" });
  } catch (err) {
    return res
      .status(err.status || 500)
      .json({ type: "error", message: err.message || "Internal Server Error" });
  }
}

async function getAllTravelInfos(req, res) {
  try {
    const applicationId = req.query.applicationId;
    if (!applicationId) {
      return res.status(401).json({ type: "error", message: "Not authorized" });
    }
    const travelInfos = await service.getAllTravelInfos(applicationId);
    return res.json({ type: "success", data: travelInfos });
  } catch (err) {
    return res
      .status(err.status || 500)
      .json({ type: "error", message: err.message || "Internal Server Error" });
  }
}
module.exports = { create, update, remove, getAllTravelInfos  };
