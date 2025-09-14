const Joi = require("joi");
const service = require("../services/visa_applications_service");

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

const statusEnum = [
  "draft",
  "submitted",
  "under_review",
  "approved",
  "rejected",
];

async function create(req, res) {
  try {
    const userId = req.user && req.user.id;
    if (!userId) {
      return res.status(401).json({ type: "error", message: "Not authorized" });
    }

    const payload = validate(
      {
        from_country: Joi.string().optional(),
        to_country: Joi.string().optional(),
        arrival_date: Joi.date().iso().required(),
        departure_date: Joi.date().iso().required(),
        destination_country: Joi.string().optional(),
        contact_number: Joi.string().optional(),
        email: Joi.string().email().optional(),
        duration_of_stay: Joi.number().integer().min(0).optional(),
        visa_type: Joi.string().optional(),
        flight_number: Joi.string().optional(),
        airline: Joi.string().optional(),
        itinerary_number: Joi.string().optional(),
        purpose: Joi.string().optional(),
        status: Joi.string().valid(statusEnum).optional(),
      },
      req.body
    );

    if (new Date(payload.departure_date) < new Date(payload.arrival_date)) {
      return res
        .status(400)
        .json({
          type: "error",
          message: "departure_date cannot be before arrival_date",
        });
    }

    const created = await service.createVisaApplication(userId, payload);
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
    const updates = validate(
      {
        from_country: Joi.string().optional(),
        to_country: Joi.string().optional(),
        arrival_date: Joi.date().iso().optional(),
        departure_date: Joi.date().iso().optional(),
        destination_country: Joi.string().optional(),
        contact_number: Joi.string().optional(),
        email: Joi.string().email().optional(),
        duration_of_stay: Joi.number().integer().min(0).optional(),
        visa_type: Joi.string().optional(),
        flight_number: Joi.string().optional(),
        airline: Joi.string().optional(),
        itinerary_number: Joi.string().optional(),
        purpose: Joi.string().optional(),
        status: Joi.string().valid(statusEnum).optional(),
      },
      req.body
    );

    const updated = await service.updateVisaApplication(userId, id, updates);
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
    await service.deleteVisaApplication(userId, id);
    return res.json({ type: "success", message: "Deleted" });
  } catch (err) {
    return res
      .status(err.status || 500)
      .json({ type: "error", message: err.message || "Internal Server Error" });
  }
}

async function getAllVisaApplications(req, res) {
  try {
    const userId = req.user && req.user.id;
    if (!userId) {
      return res.status(401).json({ type: "error", message: "Not authorized" });
    }
    const visaApplications = await service.getAllVisaApplications(userId);
    return res.json({ type: "success", data: visaApplications });
  } catch (err) {
    return res
      .status(err.status || 500)
      .json({ type: "error", message: err.message || "Internal Server Error" });
  }
}
module.exports = { create, update, remove, getAllVisaApplications };
