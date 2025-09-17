const router = require('express').Router();
const testEmailRouter = require('./emailTestRouter');

router.use('/auth', require('./authRouter'));
router.use('/countries', require('./countriesRouter'));
router.use('/visa-applications', require('./visaApplicationsRouter'));
router.use('/travel-infos', require('./travelInfosRouter'));
router.use('/country-visa-eligibilities', require('./countryVisaEligibilitiesRouter'));

module.exports = router;

