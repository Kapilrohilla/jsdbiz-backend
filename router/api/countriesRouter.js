const router = require('express').Router();
const CountriesController = require('../../controllers/CountriesController');

router.get('/', CountriesController.listCountries);

module.exports = router;


