const router = require('express').Router();

router.use('/auth', require('./authRouter'));
router.use('/countries', require('./countriesRouter'));
router.use('/visa-applications', require('./visaApplicationsRouter'));
router.use('/travel-infos', require('./travelInfosRouter'));

module.exports = router;

