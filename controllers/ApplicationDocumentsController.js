const Joi = require('joi');
const service = require('../services/application_documents_service');

function validate(schema, payload) {
  const { error, value } = Joi.validate(payload, schema);
  if (error) {
    const message = error && error.details && error.details[0] && error.details[0].message ? error.details[0].message : 'Validation error';
    const err = new Error(message);
    err.status = 400;
    throw err;
  }
  return value;
}

async function upload(req, res) {
  try {
    const userId = req.user && req.user.id;
    if (!userId) {
      return res.status(401).json({ type: 'error', message: 'Not authorized' });
    }
    const { visaApplicationId } = req.params;
    const { type } = validate({ type: Joi.string().valid('passport', 'photo', 'supporting_doc', 'visa_approval').required() }, req.body);
    const file = req.file;
    if (!file) {
      return res.status(400).json({ type: 'error', message: 'File is required' });
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const created = await service.createApplicationDocument(userId, visaApplicationId, type, file, baseUrl);
    return res.status(201).json({ type: 'success', data: created });
  } catch (err) {
    return res.status(err.status || 500).json({ type: 'error', message: err.message || 'Internal Server Error' });
  }
}

async function list(req, res) {
  try {
    const userId = req.user && req.user.id;
    if (!userId) {
      return res.status(401).json({ type: 'error', message: 'Not authorized' });
    }
    const { visaApplicationId } = req.params;
    const docs = await service.listApplicationDocuments(userId, visaApplicationId);
    return res.json({ type: 'success', data: docs });
  } catch (err) {
    return res.status(err.status || 500).json({ type: 'error', message: err.message || 'Internal Server Error' });
  }
}

module.exports = { upload, list };


