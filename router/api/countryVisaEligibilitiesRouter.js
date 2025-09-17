const router = require('express').Router();
const EligibilitiesController = require('../../controllers/CountryVisaEligibilitiesController');

router.get('/', EligibilitiesController.list);
router.post('/', EligibilitiesController.upsert);
router.delete('/', EligibilitiesController.remove);

module.exports = router;


