const router = require('express').Router();
const controller = require('../../controllers/TravelInfosController');
const auth = require('../../utils/auth');

router.post('/', auth.isAuthunticated, controller.create);
router.put('/:id', auth.isAuthunticated, controller.update);
router.delete('/:id', auth.isAuthunticated, controller.remove);

module.exports = router;


