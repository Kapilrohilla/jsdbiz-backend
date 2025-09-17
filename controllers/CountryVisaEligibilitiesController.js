const Joi = require('joi');
const service = require('../services/country_visa_eligibilities_service');

function validate(schema, payload) {
  const { error, value } = Joi.validate(payload, schema);
  if (error) {
    const message =
      error && error.details && error.details[0] && error.details[0].message
        ? error.details[0].message
        : 'Validation error';
    const err = new Error(message);
    err.status = 400;
    throw err;
  }
  return value;
}

async function list(req, res) {
  try {
    const query = validate(
      {
        from_country_id: Joi.string().guid().optional(),
        to_country_id: Joi.string().guid().optional(),
      },
      req.query
    );
    const rows = await service.listEligibilities(query);
    return res.json({ type: 'success', data: rows });
  } catch (err) {
    return res.status(err.status || 500).json({ type: 'error', message: err.message || 'Failed to list eligibilities' });
  }
}

async function upsert(req, res) {
  try {
    const body = validate(
      {
        from_country_id: Joi.string().guid().required(),
        to_country_id: Joi.string().guid().required(),
        is_eligible: Joi.boolean().required(),
      },
      req.body
    );
    const row = await service.upsertEligibility(body);
    return res.status(201).json({ type: 'success', data: row });
  } catch (err) {
    return res.status(err.status || 500).json({ type: 'error', message: err.message || 'Failed to upsert eligibility' });
  }
}

async function remove(req, res) {
  try {
    const body = validate(
      {
        from_country_id: Joi.string().guid().required(),
        to_country_id: Joi.string().guid().required(),
      },
      req.body
    );
    await service.removeEligibility(body);
    return res.json({ type: 'success', message: 'Deleted' });
  } catch (err) {
    return res.status(err.status || 500).json({ type: 'error', message: err.message || 'Failed to delete eligibility' });
  }
}

module.exports = { list, upsert, remove };


