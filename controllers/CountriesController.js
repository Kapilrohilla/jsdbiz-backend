const Joi = require("joi");
const service = require("../services/countries_service");
const { FileStorageService } = require('../utils/file_storage_service');

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

async function listCountries(req, res) {
  try {
    const countries = await service.listCountries();
    return res.json({ type: "success", data: countries });
  } catch (err) {
    return res.status(err.status || 500).json({
      type: "error",
      message: err.message || "Failed to load countries",
    });
  }
}

async function seed(req, res) {
  try {
    console.log("Seeding countries");
    const count = await service.seedCountries();
    console.log(`Seeded ${count} countries`);
    return res.json({ type: "success", message: `Seeded ${count} countries` });
  } catch (err) {
    return res.status(err.status || 500).json({
      type: "error",
      message: err.message || "Failed to seed countries",
    });
  }
}

async function create(req, res) {
  try {
    const body = validate(
      {
        code: Joi.string().max(10).required(),
        name: Joi.string().required(),
        iso_code: Joi.string().max(10).optional().allow(null),
        flag_url: Joi.string().uri().optional().allow(null),
        language: Joi.string().optional().allow(null),
      },
      req.body
    );
    // If image uploaded, save it and set flag_url
    if (req.file) {
      try {
        const saved = await FileStorageService.saveFile(
          {
            originalName: req.file.originalname,
            buffer: req.file.buffer,
            mimetype: req.file.mimetype,
            size: req.file.size,
          },
          'photo',
          'countries'
        );
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        body.flag_url = FileStorageService.getFileUrl(saved.relativePath, baseUrl);
      } catch (e) {
        e.status = e.status || 400;
        throw e;
      }
    }
    const row = await service.createCountry(body);
    return res.status(201).json({ type: "success", data: row });
  } catch (err) {
    return res
      .status(err.status || 500)
      .json({
        type: "error",
        message: err.message || "Failed to create country",
      });
  }
}

async function update(req, res) {
  try {
    const params = validate({ id: Joi.string().guid().required() }, req.params);
    const body = validate(
      {
        code: Joi.string().max(10).optional(),
        name: Joi.string().optional(),
        iso_code: Joi.string().max(10).optional().allow(null),
        flag_url: Joi.string().uri().optional().allow(null),
        language: Joi.string().optional().allow(null),
      },
      req.body
    );
    console.log("body", body);
    console.log("req.file", req.file);
    // If image uploaded, save it and set flag_url
    if (req.file) {
      try {
        const saved = await FileStorageService.saveFile(
          {
            originalName: req.file.originalname,
            buffer: req.file.buffer,
            mimetype: req.file.mimetype,
            size: req.file.size,
          },
          'photo',
          'countries'
        );
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        body.flag_url = FileStorageService.getFileUrl(saved.relativePath, baseUrl);
      } catch (e) {
        e.status = e.status || 400;
        throw e;
      }
    }
    const row = await service.updateCountry(params.id, body);
    return res.json({ type: "success", data: row });
  } catch (err) {
    return res
      .status(err.status || 500)
      .json({
        type: "error",
        message: err.message || "Failed to update country",
      });
  }
}

async function remove(req, res) {
  try {
    const params = validate({ id: Joi.string().guid().required() }, req.params);
    await service.deleteCountry(params.id);
    return res.json({ type: "success", message: "Deleted" });
  } catch (err) {
    return res
      .status(err.status || 500)
      .json({
        type: "error",
        message: err.message || "Failed to delete country",
      });
  }
}

module.exports = { listCountries, seed, create, update, remove };
