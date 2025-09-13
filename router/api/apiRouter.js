const router = require('express').Router();

router.use('/auth', require('./authRouter'));
router.use('/countries', require('./countriesRouter'));

module.exports = router;

